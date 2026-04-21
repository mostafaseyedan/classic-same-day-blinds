export interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
  profile_photo_url: string;
  author_url?: string;
}

export interface GooglePlaceData {
  rating: number;
  user_ratings_total: number;
  reviews: GoogleReview[];
  url?: string;
}

const GOOGLE_PLACE_PUBLIC_URL =
  process.env.NEXT_PUBLIC_GOOGLE_PLACE_URL ?? "https://maps.app.goo.gl/dTcfaNbhL68RAY3a8";

export async function getGooglePlaceData(): Promise<GooglePlaceData | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) return null;

  const fields = "rating,user_ratings_total,reviews,url";
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;

  const res = await fetch(url, {
    next: { revalidate: 86400 }, // 24-hour ISR cache
  });

  if (!res.ok) return null;

  const json = await res.json();
  if (json.status !== "OK" || !json.result) return null;

  const result = json.result;
  return {
    rating: result.rating,
    user_ratings_total: result.user_ratings_total,
    url: GOOGLE_PLACE_PUBLIC_URL,
    reviews: (result.reviews as GoogleReview[]).filter((r) => r.rating >= 4),
  };
}
