# Capsule Closet Tracker

A wardrobe management app for IS 542 (BYU). Track your clothing across 16 categories, record replacement targets, and fetch real-time prices from Google Shopping via SerpApi. A stats page shows spending breakdowns with Recharts charts.

## Running the Project

```bash
npm install
npm run dev
```

For local development with the price-fetching serverless function, install the Vercel CLI and run:

```bash
npm i -g vercel
vercel dev
```

Set `SERPAPI_KEY` as an environment variable (Vercel dashboard or `.env.local` for local dev).

## Running Tests

```bash
npm test
```

## API Used

**SerpApi — Google Shopping**

- Endpoint: `https://serpapi.com/search.json?engine=google_shopping&q=<query>`
- Proxied through a Vercel serverless function at `/api/fetch-price` so the API key stays server-side and never reaches the browser.
- Prices are fetched on-demand only (user clicks "Fetch Price"). The free SerpApi tier gives 250 searches total — no auto-fetching.
- The lowest price from the returned results is stored in `Replacement.fetchedPrice`. All data persists in `localStorage`.

## Features

- **Closet view** — list of all clothing items with category filter, name/brand search, archive toggle, and per-row click to view/edit details.
- **Item detail modal** — view all fields, switch to edit mode, archive/unarchive, delete (with confirmation). Each item can have one linked replacement.
- **Replacements view** — two tabs: *Linked* (tied to a closet item) and *Wishlist* (standalone). Each row has a live "Fetch Price" button, inline editing, and a "Link to Item" action for wishlist entries.
- **Stats view** — summary numbers (wardrobe value, replacement cost, item counts), pie chart of value by category, bar chart of items per category, and a comparison bar chart of purchase vs. replacement cost.
- **Light / dark mode** — toggle in the navbar. Preference persists in `localStorage`.
- **Fully offline-capable** — all data lives in `localStorage`. No login required.

## Deployed Version

[https://capsule-closet-tracker.vercel.app](https://capsule-closet-tracker.vercel.app)
