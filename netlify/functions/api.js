"use strict";
/* api.js — X clone backend. ONE Netlify Function, manual routing.
 * Persistent storage: Netlify Blobs (store name "twitter").
 * Zero npm deps except @netlify/blobs (vendored in node_modules/).
 *
 * Exported: handler (Netlify), createApp (tests).
 */

const crypto = require("node:crypto");
const seed = require("./seed");

const TWEET_LIMIT = 280;
const SESSION_MS = 30 * 24 * 3600 * 1000;
const PAGE = 30;

/* ---------- small helpers ---------- */

function rel(ts) {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return m + "m";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h";
  const d = Math.floor(h / 24);
  return d < 7 ? d + "d" : new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function pubUser(u) {
  if (!u) return null;
  return {
    id: u.username, username: u.username, name: u.name, handle: u.handle,
    seed: u.seed, verified: !!u.verified, bio: u.bio || "", location: u.location || "",
    joined: u.joined || "", followers: u.followers || 0, following: u.following || 0,
  };
}

function hashPw(pw, salt) {
  return crypto.scryptSync(String(pw), salt, 64).toString("hex");
}

function ok(status, obj) {
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(obj),
  };
}
const err = (status, message) => ok(status, { error: message });

function validUsername(u) {
  return typeof u === "string" && /^[a-zA-Z0-9_]{1,15}$/.test(u);
}

/* ---------- app factory ---------- */

function createApp(store) {
  const get = (k) => store.get(k);
  const set = (k, v) => store.set(k, v);
  const del = (k) => store.del(k);
  const list = (p) => store.list(p);

  async function ensureSeeded() {
    if (!(await get("meta/seeded"))) {
      await seed.seedAll(store);
      await set("meta/seeded", { at: Date.now() });
    }
  }

  async function nextId(kind) {
    const seq = (await get("meta/seq")) || { tweet: 1000, notif: 100 };
    seq[kind] = (seq[kind] || 100) + 1;
    await set("meta/seq", seq);
    return seq[kind];
  }

  async function getUser(username) {
    return (await get("users/" + username)) || null;
  }

  async function sessionUser(headers) {
    const h = headers["authorization"] || headers["Authorization"] || "";
    const m = /^Bearer\s+(.+)$/.exec(h);
    if (!m) return null;
    const s = await get("sessions/" + m[1]);
    if (!s || s.exp < Date.now()) return null;
    return getUser(s.username);
  }

  async function loadUsers(ids) {
    const m = {};
    for (const id of ids) {
      if (id && !m[id]) {
        const u = await getUser(id);
        if (u) m[id] = u;
      }
    }
    return m;
  }

  async function addFlags(me, tweets) {
    for (const t of tweets) {
      const pre = me.username + "/" + t.id;
      t._liked = !!(await get("likes/" + pre));
      t._reposted = !!(await get("reposts/" + pre));
      t._bookmarked = !!(await get("bookmarks/" + pre));
    }
  }

  function enrich(t, me, users) {
    const u = users[t.userId];
    return {
      id: t.id, userId: t.userId, text: t.text, img: t.img || null, time: rel(t.ts),
      replies: t.replies || 0, reposts: t.reposts || 0, likes: t.likes || 0, views: t.views || 0,
      nested: (t.nested || []).map((n) => ({ userId: n.userId, text: n.text, time: rel(n.ts) })),
      liked: !!t._liked, reposted: !!t._reposted, bookmarked: !!t._bookmarked,
      user: u ? pubUser(u) : { id: t.userId, username: t.userId, name: t.userId, handle: t.userId, seed: t.userId, verified: false },
    };
  }

  async function enrichList(me, tweets) {
    const ids = new Set();
    tweets.forEach((t) => { ids.add(t.userId); (t.nested || []).forEach((n) => ids.add(n.userId)); });
    const users = await loadUsers([...ids]);
    await addFlags(me, tweets);
    return tweets.map((t) => enrich(t, me, users));
  }

  async function notify(target, type, actor, ref, text) {
    if (!target || target === actor) return;
    const id = await nextId("notif");
    await set("notifs/" + target + "/" + id, {
      id, type, userId: actor, ts: Date.now(), ref: ref || null, text: text || "",
    });
  }

  async function mentionNotifs(me, text, tweetId) {
    const seen = new Set();
    const re = /@(\w+)/g;
    let m;
    while ((m = re.exec(text))) {
      const name = m[1];
      if (seen.has(name) || name === me.username) continue;
      seen.add(name);
      const u = await getUser(name);
      if (u) await notify(name, "mention", me.username, tweetId, "@" + me.username + " " + text.slice(0, 100));
    }
  }

  /* ----- timeline ----- */
  async function getTimeline(me, tab, before) {
    const ids = (await get("tweetlist")) || [];
    let tweets = [];
    for (const id of ids) {
      if (before && id >= Number(before)) continue;
      const t = await get("tweets/" + id);
      if (!t) continue;
      tweets.push(t);
      if (tweets.length >= PAGE) break;
    }
    if (tab === "following") {
      const keys = await list("follows/" + me.username + "/");
      const following = new Set(keys.map((k) => k.split("/").pop()));
      tweets = tweets.filter((t) => t.userId === me.username || following.has(t.userId));
    } else if (tab === "bookmarks") {
      const keys = await list("bookmarks/" + me.username + "/");
      const ids2 = new Set(keys.map((k) => k.split("/").pop()));
      tweets = [];
      for (const k of keys) {
        const t = await get("tweets/" + k.split("/").pop());
        if (t) tweets.push(t);
        if (tweets.length >= PAGE) break;
      }
      tweets.sort((a, b) => b.ts - a.ts);
      void ids2;
    } else if (tab === "likes") {
      const keys = await list("likes/" + me.username + "/");
      tweets = [];
      for (const k of keys) {
        const t = await get("tweets/" + k.split("/").pop());
        if (t) tweets.push(t);
        if (tweets.length >= PAGE) break;
      }
      tweets.sort((a, b) => b.ts - a.ts);
    }
    return enrichList(me, tweets);
  }

  /* ----- DMs ----- */
  async function dmList(me) {
    const keys = await list("dms/");
    const convos = [];
    for (const k of keys) {
      const pair = k.slice(4).split("__");
      if (!pair.includes(me.username)) continue;
      const other = pair[0] === me.username ? pair[1] : pair[0];
      const d = await get(k);
      const msgs = (d && d.msgs) || [];
      const last = msgs[msgs.length - 1];
      const u = await getUser(other);
      convos.push({
        username: other,
        name: u ? u.name : other,
        seed: u ? u.seed : other,
        verified: !!(u && u.verified),
        lastText: last ? last.text : "",
        lastTs: last ? last.ts : 0,
        time: last ? rel(last.ts) : "",
        unread: (await get("dmunread/" + me.username + "/" + other)) || 0,
      });
    }
    convos.sort((a, b) => b.lastTs - a.lastTs);
    return convos;
  }

  /* ================= router ================= */

  async function handle(method, path, query, body, headers) {
    await ensureSeeded();
    query = query || {};
    body = body || {};
    headers = headers || {};
    const seg = String(path || "").split("/").filter(Boolean);

    /* ---- public: auth ---- */
    if (method === "POST" && seg[0] === "auth" && (seg[1] === "signup" || seg[1] === "login")) {
      const username = (body.username || "").trim();
      const password = body.password || "";
      if (!validUsername(username)) return err(400, "username must be 1-15 chars: letters, numbers, _");
      if (typeof password !== "string" || password.length < 4) return err(400, "password must be at least 4 characters");

      if (seg[1] === "signup") {
        if (await getUser(username)) return err(409, "username taken");
        const name = String(body.name || username).slice(0, 50) || username;
        const salt = crypto.randomBytes(16).toString("hex");
        const user = {
          username, name, handle: username, seed: username + "ava", verified: false,
          bio: "", location: "", joined: "September 2026", followers: 0, following: 0,
          bot: false, salt, hash: hashPw(password, salt),
        };
        await set("users/" + username, user);
        const token = crypto.randomBytes(32).toString("hex");
        await set("sessions/" + token, { username, exp: Date.now() + SESSION_MS });
        return ok(201, { token, user: pubUser(user), newUser: true });
      }

      /* login */
      const user = await getUser(username);
      if (!user) return err(401, "invalid username or password");
      const h = hashPw(password, user.salt);
      if (!crypto.timingSafeEqual(Buffer.from(h, "hex"), Buffer.from(user.hash, "hex")))
        return err(401, "invalid username or password");
      const token = crypto.randomBytes(32).toString("hex");
      await set("sessions/" + token, { username, exp: Date.now() + SESSION_MS });
      return ok(200, { token, user: pubUser(user) });
    }

    /* ---- everything below needs auth ---- */
    const me = await sessionUser(headers);
    if (!me) return err(401, "unauthorized");

    /* GET /follows — usernames I follow */
    if (method === "GET" && seg[0] === "follows" && seg.length === 1) {
      const keys = await list("follows/" + me.username + "/");
      return ok(200, keys.map((k) => k.split("/").pop()));
    }

    /* GET /me */
    if (method === "GET" && seg[0] === "me" && seg.length === 1) return ok(200, pubUser(me));

    /* GET /users (directory, for who-to-follow / onboarding) */
    if (method === "GET" && seg[0] === "users" && seg.length === 1) {
      const keys = await list("users/");
      const out = [];
      for (const k of keys) {
        const u = await get(k);
        if (u) out.push(pubUser(u));
      }
      out.sort((a, b) => b.followers - a.followers);
      return ok(200, out);
    }

    /* GET /users/:username */
    if (method === "GET" && seg[0] === "users" && seg.length === 2) {
      const u = await getUser(seg[1]);
      if (!u) return err(404, "user not found");
      const ids = (await get("tweetlist")) || [];
      const mine = [];
      for (const id of ids) {
        const t = await get("tweets/" + id);
        if (t && t.userId === u.username) { mine.push(t); if (mine.length >= PAGE) break; }
      }
      const following = !!(await get("follows/" + me.username + "/" + u.username));
      return ok(200, {
        user: pubUser(u),
        counts: { tweets: mine.length, followers: u.followers || 0, following: u.following || 0 },
        following,
        isMe: u.username === me.username,
        tweets: await enrichList(me, mine),
      });
    }

    /* GET /users/:username/replies — tweets this user replied to */
    if (method === "GET" && seg[0] === "users" && seg.length === 3 && seg[2] === "replies") {
      const u = await getUser(seg[1]);
      if (!u) return err(404, "user not found");
      const ids = (await get("tweetlist")) || [];
      const out = [];
      for (const id of ids) {
        const t = await get("tweets/" + id);
        if (t && (t.nested || []).some((n) => n.userId === u.username)) { out.push(t); if (out.length >= PAGE) break; }
      }
      return ok(200, await enrichList(me, out));
    }

    /* POST /users/:username/follow (toggle) */
    if (method === "POST" && seg[0] === "users" && seg.length === 3 && seg[2] === "follow") {
      const target = await getUser(seg[1]);
      if (!target) return err(404, "user not found");
      if (target.username === me.username) return err(400, "cannot follow yourself");
      const key = "follows/" + me.username + "/" + target.username;
      const existing = await get(key);
      if (existing) {
        await del(key);
        target.followers = Math.max(0, (target.followers || 0) - 1);
        me.following = Math.max(0, (me.following || 0) - 1);
        await set("users/" + target.username, target);
        await set("users/" + me.username, me);
        return ok(200, { following: false, followers: target.followers });
      }
      await set(key, { ts: Date.now() });
      target.followers = (target.followers || 0) + 1;
      me.following = (me.following || 0) + 1;
      await set("users/" + target.username, target);
      await set("users/" + me.username, me);
      await notify(target.username, "follow", me.username, null, "");
      return ok(200, { following: true, followers: target.followers });
    }

    /* GET /timeline */
    if (method === "GET" && seg[0] === "timeline" && seg.length === 1) {
      const tab = ["foryou", "following", "bookmarks", "likes"].includes(query.tab) ? query.tab : "foryou";
      return ok(200, await getTimeline(me, tab, query.before));
    }

    /* GET /tweets/:id */
    if (method === "GET" && seg[0] === "tweets" && seg.length === 2) {
      const t = await get("tweets/" + seg[1]);
      if (!t) return err(404, "tweet not found");
      const ids = (await get("tweetlist")) || [];
      const ctx = [];
      for (const id of ids) {
        if (String(id) === String(t.id)) continue;
        const x = await get("tweets/" + id);
        if (x && x.userId === t.userId) { ctx.push(x); if (ctx.length >= 2) break; }
      }
      const users = await loadUsers([t.userId]);
      await addFlags(me, [t]);
      return ok(200, { tweet: enrich(t, me, users), context: await enrichList(me, ctx) });
    }

    /* POST /tweets {text, replyTo?} */
    if (method === "POST" && seg[0] === "tweets" && seg.length === 1) {
      const text = String(body.text || "").trim();
      if (!text) return err(400, "tweet cannot be empty");
      if (text.length > TWEET_LIMIT) return err(400, "tweet is too long (280 max)");
      if (body.replyTo) {
        const parent = await get("tweets/" + body.replyTo);
        if (!parent) return err(404, "tweet not found");
        parent.nested = parent.nested || [];
        parent.nested.push({ userId: me.username, text, ts: Date.now() });
        parent.replies = (parent.replies || 0) + 1;
        await set("tweets/" + parent.id, parent);
        await mentionNotifs(me, text, parent.id);
        const users = await loadUsers([parent.userId, ...parent.nested.map((n) => n.userId)]);
        await addFlags(me, [parent]);
        return ok(200, enrich(parent, me, users));
      }
      const id = await nextId("tweet");
      const t = {
        id, userId: me.username, text, img: null, ts: Date.now(),
        replies: 0, reposts: 0, likes: 0, views: Math.floor(Math.random() * 40) + 8, nested: [],
      };
      await set("tweets/" + id, t);
      const ids = (await get("tweetlist")) || [];
      ids.unshift(id);
      await set("tweetlist", ids);
      await mentionNotifs(me, text, id);
      const users = await loadUsers([me.username]);
      await addFlags(me, [t]);
      return ok(201, enrich(t, me, users));
    }

    /* POST /tweets/:id/like|repost|bookmark (toggle) */
    if (method === "POST" && seg[0] === "tweets" && seg.length === 3 &&
        ["like", "repost", "bookmark"].includes(seg[2])) {
      const t = await get("tweets/" + seg[1]);
      if (!t) return err(404, "tweet not found");
      const kind = seg[2] + "s";
      const key = kind + "/" + me.username + "/" + t.id;
      const existing = await get(key);
      if (existing) {
        await del(key);
        if (kind !== "bookmarks") { t[kind] = Math.max(0, (t[kind] || 0) - 1); await set("tweets/" + t.id, t); }
        return ok(200, { on: false, count: t[kind] || 0 });
      }
      await set(key, { ts: Date.now() });
      if (kind !== "bookmarks") {
        t[kind] = (t[kind] || 0) + 1;
        await set("tweets/" + t.id, t);
        if (kind === "likes") await notify(t.userId, "like", me.username, t.id, "");
        if (kind === "reposts") await notify(t.userId, "repost", me.username, t.id, "");
      }
      return ok(200, { on: true, count: t[kind] || 0 });
    }

    /* DELETE /tweets/:id (own only) */
    if (method === "DELETE" && seg[0] === "tweets" && seg.length === 2) {
      const t = await get("tweets/" + seg[1]);
      if (!t) return err(404, "tweet not found");
      if (t.userId !== me.username) return err(403, "cannot delete someone else's tweet");
      await del("tweets/" + t.id);
      const ids = (await get("tweetlist")) || [];
      await set("tweetlist", ids.filter((x) => String(x) !== String(t.id)));
      return ok(200, { deleted: true });
    }

    /* GET /notifications */
    if (method === "GET" && seg[0] === "notifications" && seg.length === 1) {
      const keys = await list("notifs/" + me.username + "/");
      const items = [];
      for (const k of keys) {
        const n = await get(k);
        if (n) items.push(n);
      }
      items.sort((a, b) => b.ts - a.ts);
      const out = [];
      for (const n of items.slice(0, 50)) {
        const actor = await getUser(n.userId);
        let refText = "";
        if (n.ref) { const tw = await get("tweets/" + n.ref); if (tw) refText = tw.text.slice(0, 120); }
        out.push({ id: n.id, type: n.type, time: rel(n.ts), actor: pubUser(actor), ref: n.ref, refText, text: n.text || "" });
      }
      return ok(200, out);
    }

    /* GET /trends */
    if (method === "GET" && seg[0] === "trends" && seg.length === 1) {
      return ok(200, seed.TRENDS);
    }

    /* GET /search?q= */
    if (method === "GET" && seg[0] === "search" && seg.length === 1) {
      const q = String(query.q || "").trim().toLowerCase();
      if (!q) return ok(200, { users: [], tweets: [] });
      const ukeys = await list("users/");
      const users = [];
      for (const k of ukeys) {
        const u = await get(k);
        if (u && (u.name.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q))) users.push(pubUser(u));
        if (users.length >= 10) break;
      }
      const ids = (await get("tweetlist")) || [];
      const tweets = [];
      for (const id of ids) {
        const t = await get("tweets/" + id);
        if (t && t.text.toLowerCase().includes(q)) { tweets.push(t); if (tweets.length >= 20) break; }
      }
      return ok(200, { users: users.slice(0, 10), tweets: await enrichList(me, tweets) });
    }

    /* GET /dm — conversation list */
    if (method === "GET" && seg[0] === "dm" && seg.length === 1) {
      return ok(200, await dmList(me));
    }

    /* GET /dm/:username */
    if (method === "GET" && seg[0] === "dm" && seg.length === 2) {
      const other = await getUser(seg[1]);
      if (!other) return err(404, "user not found");
      const d = (await get(seed.dmKey(me.username, other.username))) || { msgs: [] };
      await del("dmunread/" + me.username + "/" + other.username);
      return ok(200, {
        user: pubUser(other),
        messages: d.msgs.map((m) => ({ from: m.from, text: m.text, ts: m.ts, time: rel(m.ts) })),
      });
    }

    /* POST /dm/:username {text} */
    if (method === "POST" && seg[0] === "dm" && seg.length === 2) {
      const other = await getUser(seg[1]);
      if (!other) return err(404, "user not found");
      const text = String(body.text || "").trim();
      if (!text) return err(400, "message cannot be empty");
      if (text.length > 1000) return err(400, "message too long");
      const key = seed.dmKey(me.username, other.username);
      const d = (await get(key)) || { msgs: [] };
      const msg = { from: me.username, text: text.slice(0, 1000), ts: Date.now() };
      d.msgs.push(msg);
      /* seeded bot users auto-reply so single-player feels alive */
      let reply = null;
      if (other.bot) {
        const pool = seed.botPoolFor(other.username);
        reply = { from: other.username, text: pool[d.msgs.length % pool.length], ts: Date.now() + 1 };
        d.msgs.push(reply);
      } else {
        const cur = (await get("dmunread/" + other.username + "/" + me.username)) || 0;
        await set("dmunread/" + other.username + "/" + me.username, cur + 1);
      }
      await set(key, d);
      return ok(201, { message: { from: msg.from, text: msg.text, ts: msg.ts, time: rel(msg.ts) },
        reply: reply ? { from: reply.from, text: reply.text, ts: reply.ts, time: rel(reply.ts) } : null });
    }

    return err(404, "not found");
  }

  return { handle };
}

/* ---------- Netlify handler ---------- */

async function blobStore() {
  const { getStore } = require("@netlify/blobs");
  const s = getStore({ name: "twitter", consistency: "strong" });
  return {
    get: (k) => s.get(k, { type: "json" }),
    set: (k, v) => s.setJSON(k, v),
    del: (k) => s.delete(k),
    list: async (prefix) => {
      const r = await s.list({ prefix });
      return (r.blobs || []).map((b) => b.key);
    },
  };
}

exports.handler = async (event) => {
  let path = event.path || "";
  /* support both /.netlify/functions/api/... and /api/... (via netlify.toml redirect) */
  path = path.replace(/^\/.netlify\/functions\/api\/?/, "").replace(/^\/api\/?/, "");
  let body = {};
  if (event.body) {
    try { body = JSON.parse(event.body); } catch (e) { return err(400, "invalid JSON"); }
  }
  if (event.httpMethod === "OPTIONS") return ok(204, {});
  try {
    const app = createApp(await blobStore());
    return await app.handle(event.httpMethod, path, event.queryStringParameters, body, event.headers || {});
  } catch (e) {
    console.error("api error", e);
    return err(500, "internal error");
  }
};

exports.createApp = createApp;
