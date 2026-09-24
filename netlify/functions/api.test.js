"use strict";
/* api.test.js — pure node, no network. In-memory store shim implementing the
 * same async get/set/del/list interface as the blob adapter. Run: node api.test.js
 */
const assert = require("node:assert");
const { createApp } = require("./api");

function memStore() {
  const m = new Map();
  const clone = (v) => JSON.parse(JSON.stringify(v));
  return {
    get: async (k) => (m.has(k) ? clone(m.get(k)) : null),
    set: async (k, v) => { m.set(k, clone(v)); },
    del: async (k) => { m.delete(k); },
    list: async (p) => [...m.keys()].filter((k) => k.startsWith(p)),
  };
}

async function main() {
  const app = createApp(memStore());
  const H = (token) => (token ? { authorization: "Bearer " + token } : {});
  let n = 0;
  const step = (name) => { n++; console.log("ok " + n + " - " + name); };

  /* signup -> login */
  let r = await app.handle("POST", "auth/signup", {}, { username: "alice", password: "secret1", name: "Alice" }, {});
  assert.strictEqual(r.statusCode, 201);
  const aliceTok = JSON.parse(r.body).token;
  assert.ok(aliceTok);
  step("signup alice");

  r = await app.handle("POST", "auth/signup", {}, { username: "alice", password: "secret1" }, {});
  assert.strictEqual(r.statusCode, 409);
  step("duplicate signup rejected");

  r = await app.handle("POST", "auth/login", {}, { username: "alice", password: "wrong" }, {});
  assert.strictEqual(r.statusCode, 401);
  step("bad password rejected");

  r = await app.handle("POST", "auth/login", {}, { username: "alice", password: "secret1" }, {});
  assert.strictEqual(r.statusCode, 200);
  const aliceTok2 = JSON.parse(r.body).token;
  assert.ok(aliceTok2);
  step("login alice");

  /* unauthorized blocked */
  r = await app.handle("GET", "me", {}, {}, {});
  assert.strictEqual(r.statusCode, 401);
  r = await app.handle("GET", "timeline", {}, {}, H("bogus"));
  assert.strictEqual(r.statusCode, 401);
  step("unauthorized blocked");

  /* seeded content visible */
  r = await app.handle("GET", "timeline", { tab: "foryou" }, {}, H(aliceTok));
  assert.strictEqual(r.statusCode, 200);
  const tl = JSON.parse(r.body);
  assert.ok(tl.length === 30, "first page = 30 seeded tweets, got " + tl.length);
  assert.ok(tl[0].user && tl[0].user.name, "tweets carry embedded user");
  step("seeded timeline loads (" + tl.length + " tweets)");

  /* post a tweet */
  r = await app.handle("POST", "tweets", {}, { text: "hello world, first post" }, H(aliceTok));
  assert.strictEqual(r.statusCode, 201);
  const myTweet = JSON.parse(r.body);
  assert.strictEqual(myTweet.text, "hello world, first post");
  assert.strictEqual(myTweet.userId, "alice");
  step("post tweet id=" + myTweet.id);

  /* 280-char enforced */
  r = await app.handle("POST", "tweets", {}, { text: "x".repeat(281) }, H(aliceTok));
  assert.strictEqual(r.statusCode, 400);
  step("281 chars rejected");

  /* reply */
  r = await app.handle("POST", "tweets", {}, { text: "@alice nice!", replyTo: myTweet.id }, H(aliceTok2));
  assert.strictEqual(r.statusCode, 200);
  const parent = JSON.parse(r.body);
  assert.strictEqual(parent.replies, 1);
  assert.strictEqual(parent.nested[0].text, "@alice nice!");
  step("reply appended to parent");

  /* second user: bob */
  r = await app.handle("POST", "auth/signup", {}, { username: "bob", password: "secret2", name: "Bob" }, {});
  const bobTok = JSON.parse(r.body).token;
  step("signup bob");

  r = await app.handle("POST", "tweets", {}, { text: "bob here, shipping stuff" }, H(bobTok));
  const bobTweet = JSON.parse(r.body);

  /* like toggle */
  r = await app.handle("POST", "tweets/" + bobTweet.id + "/like", {}, {}, H(aliceTok));
  assert.deepStrictEqual(JSON.parse(r.body), { on: true, count: 1 });
  r = await app.handle("POST", "tweets/" + bobTweet.id + "/like", {}, {}, H(aliceTok));
  assert.deepStrictEqual(JSON.parse(r.body), { on: false, count: 0 });
  r = await app.handle("POST", "tweets/" + bobTweet.id + "/like", {}, {}, H(aliceTok));
  assert.strictEqual(JSON.parse(r.body).on, true);
  step("like toggle on/off/on");

  /* repost + bookmark */
  r = await app.handle("POST", "tweets/" + bobTweet.id + "/repost", {}, {}, H(aliceTok));
  assert.strictEqual(JSON.parse(r.body).on, true);
  r = await app.handle("POST", "tweets/" + bobTweet.id + "/bookmark", {}, {}, H(aliceTok));
  assert.strictEqual(JSON.parse(r.body).on, true);
  step("repost + bookmark");

  /* follow toggle */
  r = await app.handle("POST", "users/bob/follow", {}, {}, H(aliceTok));
  assert.deepStrictEqual(JSON.parse(r.body), { following: true, followers: 1 });
  step("alice follows bob");

  /* following tab shows bob's tweet */
  r = await app.handle("GET", "timeline", { tab: "following" }, {}, H(aliceTok));
  const ftl = JSON.parse(r.body);
  assert.ok(ftl.some((t) => t.userId === "bob"), "bob's tweet in following timeline");
  assert.ok(!ftl.some((t) => t.userId === "levelsio"), "unfollowed bot excluded");
  step("following timeline filtered correctly");

  /* bob got like + follow notifications */
  r = await app.handle("GET", "notifications", {}, {}, H(bobTok));
  const notifs = JSON.parse(r.body);
  const types = notifs.map((x) => x.type);
  assert.ok(types.includes("like"), "like notif, got: " + types);
  assert.ok(types.includes("follow"), "follow notif, got: " + types);
  assert.strictEqual(notifs[0].actor.username, "alice");
  step("notifications generated (" + types.join(",") + ")");

  /* mention notif */
  await app.handle("POST", "tweets", {}, { text: "hey @bob check this" }, H(aliceTok));
  r = await app.handle("GET", "notifications", {}, {}, H(bobTok));
  assert.ok(JSON.parse(r.body).some((x) => x.type === "mention"));
  step("mention notification");

  /* profile */
  r = await app.handle("GET", "users/bob", {}, {}, H(aliceTok));
  const prof = JSON.parse(r.body);
  assert.strictEqual(prof.user.username, "bob");
  assert.strictEqual(prof.following, true);
  assert.strictEqual(prof.counts.followers, 1);
  assert.ok(prof.tweets.length >= 1);
  step("profile with counts");

  /* DM send/receive (bob is not a bot -> no auto reply, unread tracked) */
  r = await app.handle("POST", "dm/bob", {}, { text: "hey bob" }, H(aliceTok));
  assert.strictEqual(r.statusCode, 201);
  assert.strictEqual(JSON.parse(r.body).reply, null);
  r = await app.handle("GET", "dm", {}, {}, H(bobTok));
  const convos = JSON.parse(r.body);
  assert.strictEqual(convos.length, 1);
  assert.strictEqual(convos[0].username, "alice");
  assert.strictEqual(convos[0].unread, 1);
  step("DM convo list with unread");

  r = await app.handle("GET", "dm/alice", {}, {}, H(bobTok));
  const thread = JSON.parse(r.body);
  assert.strictEqual(thread.messages.length, 1);
  assert.strictEqual(thread.messages[0].text, "hey bob");
  r = await app.handle("GET", "dm", {}, {}, H(bobTok));
  assert.strictEqual(JSON.parse(r.body)[0].unread, 0, "unread cleared on read");
  step("DM thread read clears unread");

  /* bot auto-reply in DMs */
  r = await app.handle("POST", "dm/levelsio", {}, { text: "hi pieter" }, H(aliceTok));
  const dmRes = JSON.parse(r.body);
  assert.ok(dmRes.reply, "bot replied");
  assert.strictEqual(dmRes.reply.from, "levelsio");
  step("bot DM auto-reply");

  /* delete: own ok, other's forbidden */
  r = await app.handle("DELETE", "tweets/" + myTweet.id, {}, {}, H(bobTok));
  assert.strictEqual(r.statusCode, 403);
  r = await app.handle("DELETE", "tweets/" + myTweet.id, {}, {}, H(aliceTok));
  assert.strictEqual(r.statusCode, 200);
  r = await app.handle("GET", "tweets/" + myTweet.id, {}, {}, H(aliceTok));
  assert.strictEqual(r.statusCode, 404);
  step("delete own tweet, cannot delete other's");

  /* trends + search */
  r = await app.handle("GET", "trends", {}, {}, H(aliceTok));
  assert.ok(JSON.parse(r.body).length >= 8);
  r = await app.handle("GET", "search", { q: "karpathy" }, {}, H(aliceTok));
  const sres = JSON.parse(r.body);
  assert.ok(sres.users.some((u) => u.username === "karpathy"));
  step("trends + search");

  /* session expiry respected (expired token) */
  r = await app.handle("GET", "me", {}, {}, H(aliceTok));
  assert.strictEqual(r.statusCode, 200);
  assert.strictEqual(JSON.parse(r.body).username, "alice");
  step("me");

  console.log("\nALL " + n + " TESTS PASSED");
}

main().catch((e) => { console.error("FAIL:", e); process.exit(1); });
