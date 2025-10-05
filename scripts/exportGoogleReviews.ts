// scripts/exportGoogleReviews.ts
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

async function getAccessToken() {
  // If you have a refresh_token (recommended):
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: 'refresh_token',
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
    }),
  });
  const json = await res.json() as { access_token?: string };
  if (!res.ok) throw new Error(`OAuth error: ${res.status} ${JSON.stringify(json)}`);
  return json.access_token as string;
}

async function listReviews(accessToken: string, pageToken?: string) {
  const qs = new URLSearchParams({ pageSize: '50', ...(pageToken ? { pageToken } : {}) });
  const url = `https://mybusiness.googleapis.com/v4/accounts/${process.env.GBP_ACCOUNT_ID}/locations/${process.env.GBP_LOCATION_ID}/reviews?${qs}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  const json = await res.json();
  if (!res.ok) throw new Error(`GBP error: ${res.status} ${JSON.stringify(json)}`);
  return json as { reviews?: any[]; nextPageToken?: string };
}

(async () => {
  const token = await getAccessToken();
  const all: any[] = [];
  let pageToken: string | undefined;

  do {
    const { reviews = [], nextPageToken } = await listReviews(token, pageToken);
    all.push(...reviews.map(r => ({
      review_id: r.reviewId,
      author: r.reviewer?.displayName ?? 'Google user',
      rating: r.starRating,                 // 1..5
      text: r.comment ?? '',
      create_time: r.createTime,            // RFC3339
      profile_photo_url: r.reviewer?.profilePhotoUrl ?? null,
      reviewer_url: r.reviewer?.profileUrl ?? null,
      source: 'google'
    })));
    pageToken = nextPageToken;
  } while (pageToken);

  // Ensure public/ exists
  const outDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Write pretty JSON for easy diffing
  const outPath = path.join(outDir, 'reviews.json');
  fs.writeFileSync(outPath, JSON.stringify({ reviews: all }, null, 2), 'utf-8');
  console.log(`Exported ${all.length} reviews → ${outPath}`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});