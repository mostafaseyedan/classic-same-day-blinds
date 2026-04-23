import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

interface MatchRequest {
  productName: string;
  category: string;
  ourPrice: number;
  competitor: "blinds" | "lowes";
}

interface MatchResult {
  competitorProductName: string;
  competitorUrl: string;
  estimatedPrice: number;
  confidence: "high" | "medium" | "low";
  reasoning: string;
  matchNotes: string;
  alternativeMatches?: { name: string; url: string; price: number }[];
}

const COMPETITOR_CONFIG = {
  blinds: {
    name: "Blinds.com",
    baseUrl: "https://www.blinds.com",
    searchUrl: "https://www.blinds.com/search#q=",
    context: `Blinds.com is the leading online retailer of custom window blinds. 
Their catalog includes: vinyl mini blinds (1"), faux wood blinds (2"), aluminum blinds (1"), 
vertical blinds, cellular shades, roller shades, roman shades, wood blinds.
Key product lines: "Blinds.com Value", "Blinds.com Premium", "Bali", "SelectBlinds", "Levolor".
URL patterns: https://www.blinds.com/p/[product-slug]/[product-id]`,
  },
  lowes: {
    name: "Lowe's",
    baseUrl: "https://www.lowes.com",
    searchUrl: "https://www.lowes.com/search?searchTerm=",
    context: `Lowe's is a major home improvement retailer. 
Their blind brands: "Allen + Roth" (premium), "Project Source" (budget), "Levolor", "Hampton Bay".
Categories: mini blinds 1", faux wood 2", aluminum blinds, vertical blinds, cellular shades.
URL patterns: https://www.lowes.com/pd/[product-name]/[product-id] or https://www.lowes.com/search?searchTerm=[query]`,
  },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  if (!ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured in Supabase secrets" }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }

  let body: MatchRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }

  const { productName, category, ourPrice, competitor } = body;
  if (!productName || !category || !competitor) {
    return new Response(
      JSON.stringify({ error: "Missing required fields: productName, category, competitor" }),
      { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }

  const comp = COMPETITOR_CONFIG[competitor];
  const competitorPrice = Math.round((ourPrice / 0.85) * 100) / 100;

  const prompt = `You are a competitive pricing analyst for a window blinds retailer. 
Your task is to find the EXACT matching product on ${comp.name} for our product.

CONTEXT about ${comp.name}:
${comp.context}

OUR PRODUCT:
- Name: ${productName}
- Category: ${category}
- Our Price (starting): $${ourPrice.toFixed(2)}
- Implied ${comp.name} Price (our price ÷ 0.85): ~$${competitorPrice.toFixed(2)}

YOUR TASK:
Find the best matching product on ${comp.name} that is essentially the same product category and type as ours.

Respond ONLY with a valid JSON object in this exact format:
{
  "competitorProductName": "exact product name as it appears on ${comp.name}",
  "competitorUrl": "full URL to the specific product page (use search URL format if needed: ${comp.searchUrl}[query])",
  "estimatedPrice": [number - starting price in dollars],
  "confidence": "high" | "medium" | "low",
  "reasoning": "1-2 sentence explanation of why this is the best match",
  "matchNotes": "any important differences or caveats between our product and their product",
  "alternativeMatches": [
    {
      "name": "alternative product name",
      "url": "alternative product URL",
      "price": [alternative price number]
    }
  ]
}

Rules:
- competitorUrl must be a real, valid URL format for ${comp.name}
- estimatedPrice should be the starting/minimum price for the product
- alternativeMatches should have 1-2 alternatives if they exist
- Be specific about product names — use the actual brand/product line names
- Confidence: "high" = nearly identical product, "medium" = same category different spec, "low" = approximate match only`;

  try {
    const anthropicRes = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return new Response(
        JSON.stringify({ error: `Anthropic API error: ${anthropicRes.status}`, details: errText }),
        { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const anthropicData = await anthropicRes.json();
    const content = anthropicData.content?.[0]?.text ?? "";

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: "Could not parse Claude response as JSON", raw: content }),
        { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const result: MatchResult = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({ success: true, match: result, competitor: comp.name }),
      { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal error", details: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
});
