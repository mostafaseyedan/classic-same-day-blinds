import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

type SignupPromoIssueResponse = {
  issued: true;
  email: string;
  phone: string;
};

export const POST = async (req: MedusaRequest, res: MedusaResponse<SignupPromoIssueResponse>) => {
  const body = ((req as unknown as { validatedBody?: Record<string, unknown>; body?: Record<string, unknown> })
    .validatedBody ??
    (req as unknown as { body?: Record<string, unknown> }).body ??
    {}) as Record<string, unknown>;

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalizedPhone = phone.replace(/[^\d]/g, "").replace(/^1/, "");

  if (!emailPattern.test(email)) {
    res.status(400).json({
      type: "invalid_data",
      message: "A valid email is required.",
    } as never);
    return;
  }

  if (normalizedPhone.length !== 10) {
    res.status(400).json({
      type: "invalid_data",
      message: "A valid US phone number is required.",
    } as never);
    return;
  }

  res.status(200).json({
    issued: true,
    email,
    phone,
  });
};
