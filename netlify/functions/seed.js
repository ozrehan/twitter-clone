"use strict";
/* seed.js — converts js/data/*.js content (via generated seed-data.js) into
 * blob-store objects. Runs once: when meta/seeded is missing. */

const crypto = require("node:crypto");
const data = require("./seed-data");

/* per-personality DM reply pools so single-player DMs feel alive */
const BOT_POOLS = {
  levelsio: [
    "ship it from a cabin next",
    "revenue > meetings. always.",
    "that's the whole roadmap",
    "indie math keeps mathing",
  ],
  ada_builds: [
    "512 with grad accumulation, fp8",
    "single 4090, can you believe it",
    "loss curves are beautiful",
    "the future is gloriously decentralized",
  ],
  memelord: ["💀 posting this immediately", "new meme just dropped", "lol true", "🔥🔥🔥"],
  karpathy: [
    "the hottest new programming language is english",
    "micrograd in 100 lines next, I believe in you",
    "backprop finally clicked for 3 of my neurons",
  ],
};
const GENERIC_POOL = data.BOT_REPLIES.concat([
  "haha exactly",
  "ok that's actually a great point",
  "wait, tell me more",
  "shipping it",
]);

function botPoolFor(username) {
  return BOT_POOLS[username] || GENERIC_POOL;
}

/* "2h" | "45m" | "1d" | "now" -> ms offset */
function parseAgo(s) {
  if (!s || s === "now") return 0;
  const m = /^(\d+)([mhd])$/.exec(String(s).trim());
  if (!m) return 0;
  const n = parseInt(m[1], 10);
  return n * (m[2] === "m" ? 60000 : m[2] === "h" ? 3600000 : 86400000);
}

function hashPw(pw, salt) {
  return crypto.scryptSync(String(pw), salt, 64).toString("hex");
}

function dmKey(a, b) {
  return "dms/" + [a, b].sort().join("__");
}

async function seedAll(store) {
  const now = Date.now();
  const set = (k, v) => store.set(k, v);

  /* ---- users (everyone is a bot except "you"; demo password for all) ---- */
  for (const u of data.USERS) {
    const salt = crypto.randomBytes(16).toString("hex");
    await set("users/" + u.id, {
      username: u.id,
      name: u.name,
      handle: u.handle,
      seed: u.seed,
      verified: !!u.verified,
      bio: u.bio || "",
      location: u.location || "",
      joined: u.joined || "",
      followers: u.followers || 0,
      following: u.following || 0,
      bot: u.id !== "you",
      salt,
      hash: hashPw("password", salt),
    });
  }

  /* ---- tweets ---- */
  const ids = [];
  for (const t of data.TWEETS) {
    const ts = now - parseAgo(t.time);
    await set("tweets/" + t.id, {
      id: t.id,
      userId: t.userId,
      text: t.text,
      img: t.img || null,
      ts,
      replies: t.replies || 0,
      reposts: t.reposts || 0,
      likes: t.likes || 0,
      views: t.views || 0,
      nested: (t.nested || []).map((n) => ({
        userId: n.userId,
        text: n.text,
        ts: now - parseAgo(n.time),
      })),
    });
    ids.push({ id: t.id, ts });
  }
  ids.sort((a, b) => b.ts - a.ts);
  await set("tweetlist", ids.map((x) => x.id));
  await set("meta/seq", { tweet: 1000, notif: 100 });

  /* ---- seed follows for "you" (mirrors the original demo state) ---- */
  for (const target of ["levelsio", "memelord", "ada_builds", "showerthoughts"]) {
    await set("follows/you/" + target, { ts: now });
  }

  /* ---- seed notifications for "you" (mirrors data/notifications.js) ---- */
  for (const n of data.NOTIFS) {
    await set("notifs/you/" + n.id, {
      id: n.id,
      type: n.type,
      userId: n.userId,
      ts: now - parseAgo(n.time),
      ref: n.ref || null,
      text: n.text || "",
    });
  }

  /* ---- seed DM histories for "you" (mirrors data/messages.js) ---- */
  let i = 0;
  for (const c of data.CONVOS) {
    const other = c.userId;
    const msgs = c.messages.map((m) => ({
      from: m.dir === "out" ? "you" : other,
      text: m.text,
      ts: now - (data.CONVOS.length - i) * 3600000 - Math.floor(Math.random() * 600000),
    }));
    await set(dmKey("you", other), { msgs });
    if (c.unread) await set("dmunread/you/" + other, c.unread);
    i++;
  }
}

module.exports = { seedAll, botPoolFor, dmKey, parseAgo, TRENDS: data.TRENDS };
