import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";

const HOST = "rc.trick-game.net";
const KEEP_DAYS = 30;

export default async () => {
  let online = 0;
  try {
    const r = await fetch("https://api.mcsrvstat.us/3/" + HOST, {
      headers: { "User-Agent": "radcore-history" },
      signal: AbortSignal.timeout(15000),
    });
    const d = await r.json();
    online = d && d.online ? Number(d.players?.online ?? 0) : 0;
  } catch {
    return; // API не ответил — пропускаем минуту
  }

  const store = getStore("radcore");
  const data: { samples: number[][] } =
    (await store.get("history", { type: "json" })) ?? { samples: [] };

  const ts = Math.floor(Date.now() / 60000) * 60;
  const last = data.samples[data.samples.length - 1];
  if (last && last[0] === ts) last[1] = Math.max(last[1], online);
  else data.samples.push([ts, online]);

  const limit = ts - KEEP_DAYS * 86400;
  data.samples = data.samples.filter((s) => s[0] >= limit);
  await store.setJSON("history", data);
};

export const config: Config = { schedule: "* * * * *" };
