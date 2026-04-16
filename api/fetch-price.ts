import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const query =
    typeof req.query.query === "string" ? req.query.query : Array.isArray(req.query.query) ? req.query.query[0] : null;

  if (!query || !query.trim()) {
    return res.status(400).json({ error: "Missing required parameter: query" });
  }

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "SerpApi key not configured" });
  }

  const params = new URLSearchParams({
    engine: "google_shopping_light",
    q: query.trim(),
    api_key: apiKey,
  });

  try {
    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
    if (!response.ok) {
      const body = await response.text();
      console.error("SerpApi error:", response.status, body);
      return res.status(500).json({ error: `SerpApi returned ${response.status}` });
    }
    const data = await response.json() as { shopping_results?: unknown[] };
    return res.status(200).json(data.shopping_results ?? []);
  } catch (err) {
    console.error("fetch-price error:", err);
    return res.status(500).json({ error: "Failed to fetch prices" });
  }
}
