import type { Config } from "@netlify/functions";

export default async function handler() {
  const baseUrl = process.env.URL || "http://localhost:3000";
  const secret = process.env.CRON_SECRET;

  try {
    const res = await fetch(`${baseUrl}/api/sync`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    console.log("Sync completed:", JSON.stringify(data, null, 2));

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("Sync failed:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}

export const config: Config = {
  schedule: "0 6 * * *", // Daily at 6 AM UTC
};
