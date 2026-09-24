/* store.js — central app state, now backed by the Netlify Functions API.
 * View state stays local; all data (users, tweets, likes, follows, DMs)
 * is loaded from / persisted to the backend. Views re-render from this. */
(function (App) {
  "use strict";

  App.store = {
    view: "home",          // home | explore | notifications | messages | bookmarks | communities | profile | tweet
    homeTab: "foryou",     // foryou | following
    notifTab: "all",       // all | mentions
    profileTab: "posts",   // posts | replies | media | likes
    profileUser: "you",
    detailTweet: null,     // tweet id for tweet-detail view
    exploreTrend: null,    // trend index for explore detail
    activeConvo: null,     // DM username

    me: null,              // logged-in user (from /api/me)
    currentUserId: null,
  };

  /* server-loaded collections */
  App.USERS = [];
  App.TWEETS = [];
  App.TRENDS = [];
  App.NOTIFS = [];
  App.CONVOS = [];

  /* lookup caches */
  App._userCache = {};
  App._tweetCache = {};

  App.cacheUser = function (u) {
    if (u && (u.username || u.id)) App._userCache[u.username || u.id] = u;
  };
  App.cacheUsers = function (list) { (list || []).forEach(App.cacheUser); };
  App.cacheTweet = function (t) {
    if (!t) return;
    App._tweetCache[t.id] = t;
    if (t.user) App.cacheUser(t.user);
    (t.nested || []).forEach(function (n) {
      /* nested replies carry only userId; user resolved via cache */
    });
  };
  App.cacheTweets = function (list) { (list || []).forEach(App.cacheTweet); };

  var FALLBACK = function (id) {
    return { id: id, username: id, name: id, handle: id, seed: id, verified: false,
      bio: "", location: "", joined: "", followers: 0, following: 0 };
  };

  App.userById = function (id) { return App._userCache[id] || FALLBACK(id); };
  App.userByHandle = function (handle) {
    var keys = Object.keys(App._userCache);
    for (var i = 0; i < keys.length; i++) {
      if (App._userCache[keys[i]].handle === handle) return App._userCache[keys[i]];
    }
    return FALLBACK(handle);
  };
  App.tweetById = function (id) { return App._tweetCache[id] || null; };
  App.tweetsByUser = function (userId) {
    return Object.keys(App._tweetCache)
      .map(function (k) { return App._tweetCache[k]; })
      .filter(function (t) { return t.userId === userId; })
      .sort(function (a, b) { return b.id - a.id; });
  };

  App.fmtPosts = function (n) { return App.fmt(n) + " posts"; };

  /* ----- loaders ----- */
  App.loadDirectory = async function () {
    var users = await App.api.get("/api/users");
    App.USERS = users;
    App.cacheUsers(users);
  };

  App.loadTimeline = async function () {
    var tweets = await App.api.get("/api/timeline?tab=" + App.store.homeTab);
    App.TWEETS = tweets;
    App.cacheTweets(tweets);
  };

  App.loadNotifs = async function () {
    App.NOTIFS = await App.api.get("/api/notifications");
    App.NOTIFS.forEach(function (n) { if (n.actor) App.cacheUser(n.actor); });
  };

  App.loadConvos = async function () {
    App.CONVOS = await App.api.get("/api/dm");
    App.CONVOS.forEach(function (c) {
      App.cacheUser({ username: c.username, id: c.username, name: c.name, handle: c.username,
        seed: c.seed, verified: c.verified });
    });
    if (!App.store.activeConvo && App.CONVOS.length) App.store.activeConvo = App.CONVOS[0].username;
  };

  /* ----- tweet mutations (optimistic, then reconcile) ----- */
  function applyToggle(id, kind, on, count) {
    var t = App.tweetById(id);
    if (!t) return;
    t[kind] = on;
    if (kind === "liked") t.likes = count;
    if (kind === "reposted") t.reposts = count;
  }

  App.toggleLike = async function (id) {
    var t = App.tweetById(id);
    var want = !(t && t.liked);
    if (t) { t.liked = want; t.likes += want ? 1 : -1; }
    try {
      var r = await App.api.post("/api/tweets/" + id + "/like");
      applyToggle(id, "liked", r.on, r.count);
      return r.on;
    } catch (e) { if (t) { t.liked = !want; t.likes += want ? -1 : 1; } throw e; }
  };

  App.toggleRepost = async function (id) {
    var t = App.tweetById(id);
    var want = !(t && t.reposted);
    if (t) { t.reposted = want; t.reposts += want ? 1 : -1; }
    try {
      var r = await App.api.post("/api/tweets/" + id + "/repost");
      applyToggle(id, "reposted", r.on, r.count);
      return r.on;
    } catch (e) { if (t) { t.reposted = !want; t.reposts += want ? -1 : 1; } throw e; }
  };

  App.toggleBookmark = async function (id) {
    var t = App.tweetById(id);
    var want = !(t && t.bookmarked);
    if (t) t.bookmarked = want;
    try {
      var r = await App.api.post("/api/tweets/" + id + "/bookmark");
      if (t) t.bookmarked = r.on;
      return r.on;
    } catch (e) { if (t) t.bookmarked = !want; throw e; }
  };

  /* ----- follows ----- */
  App.isFollowing = function (userId) { return !!App._following[userId]; };
  App._following = {};

  App.loadFollows = async function () {
    App._following = {};
    var list = await App.api.get("/api/follows");
    list.forEach(function (u) { App._following[u] = true; });
  };

  App.toggleFollow = async function (userId) {
    var r = await App.api.post("/api/users/" + userId + "/follow");
    App._following[userId] = r.following;
    var u = App.userById(userId);
    if (u) u.followers = r.followers;
    return r.following;
  };

  App.markFollowing = function (userId, on) { App._following[userId] = !!on; };

  /* ----- posting ----- */
  App.postTweet = async function (text) {
    var t = await App.api.post("/api/tweets", { text: text });
    App.cacheTweet(t);
    App.TWEETS.unshift(t);
    return t;
  };

  App.addReply = async function (tweetId, text) {
    var t = await App.api.post("/api/tweets", { text: text, replyTo: tweetId });
    App.cacheTweet(t);
    return t;
  };

  App.deleteTweet = async function (id) {
    await App.api.del("/api/tweets/" + id);
    delete App._tweetCache[id];
    App.TWEETS = App.TWEETS.filter(function (t) { return String(t.id) !== String(id); });
  };

  /* ----- navigation ----- */
  App.navigate = function (view, param) {
    var S = App.store;
    S.view = view;
    if (view === "profile") { S.profileUser = param || S.currentUserId; S.profileTab = "posts"; }
    if (view === "tweet") S.detailTweet = param;
    if (view === "explore") S.exploreTrend = (param == null ? null : param);
    if (view === "messages" && param) S.activeConvo = param;
    App.render();
  };

  App.visibleTweets = function () { return App.TWEETS; };

  App.bookmarkedTweets = function () {
    return App.TWEETS.filter(function (t) { return t.bookmarked; });
  };

  /* ----- boot ----- */
  App.boot = async function () {
    var tok = App.api.token();
    if (!tok) { App.renderAuth(); return; }
    var me;
    try {
      me = await App.api.get("/api/me");
    } catch (e) {
      App.api.setToken(null);
      App.renderAuth();
      return;
    }
    App.store.me = me;
    App.store.currentUserId = me.username;
    App.cacheUser(me);
    App.bootApp();
  };

  /* entered after login/signup (auth.js calls this too) */
  App.bootApp = async function () {
    document.body.innerHTML =
      '<div class="layout">' +
        '<nav class="nav" id="sidebar"></nav>' +
        '<main class="center" id="view"></main>' +
        '<aside class="right" id="widgets"></aside>' +
      "</div>";
    try {
      await App.loadDirectory();
      await App.loadFollows();
      await App.loadTimeline();
      try { App.TRENDS = await App.api.get("/api/trends"); } catch (e) { App.TRENDS = []; }
      await App.loadNotifs();
      await App.loadConvos();
    } catch (e) {
      document.body.innerHTML =
        '<div class="onboard"><div class="onboard-card"><div class="ob-head">' +
        "<h1>Couldn't load your timeline</h1><p>" + App.esc(e.message) + "</p></div>" +
        '<button class="auth-submit" onclick="location.reload()">Retry</button></div></div>';
      return;
    }
    App.render();
  };
})(window.App);
