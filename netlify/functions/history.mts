import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";

export default async () => {
  const data = (await getStore("radcore").get("history", { type: "json" })) ?? { samples: [] };
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=30" },
  });
};

export const config: Config = { path: "/api/history" };
