/* store.js — central app state. Views re-render from this on every mutation. */
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
    activeConvo: "c1",

    liked: {},             // tweetId -> true
    reposted: {},
    bookmarked: {},
    following: { levelsio: true, memelord: true, ada_builds: true, showerthoughts: true },

    currentUserId: "you",
    nextTweetId: 1000,
  };

  var S = App.store;

  /* ----- tweet mutations ----- */
  App.toggleLike = function (id) {
    var t = App.tweetById(id); if (!t) return false;
    S.liked[id] = !S.liked[id];
    t.likes += S.liked[id] ? 1 : -1;
    return S.liked[id];
  };
  App.toggleRepost = function (id) {
    var t = App.tweetById(id); if (!t) return false;
    S.reposted[id] = !S.reposted[id];
    t.reposts += S.reposted[id] ? 1 : -1;
    return S.reposted[id];
  };
  App.toggleBookmark = function (id) {
    S.bookmarked[id] = !S.bookmarked[id];
    return S.bookmarked[id];
  };

  /* ----- follows ----- */
  App.isFollowing = function (userId) { return !!S.following[userId]; };
  App.toggleFollow = function (userId) {
    var u = App.userById(userId);
    if (S.following[userId]) { delete S.following[userId]; u.followers--; return false; }
    S.following[userId] = true; u.followers++; return true;
  };

  /* ----- posting ----- */
  App.postTweet = function (text) {
    var t = {
      id: S.nextTweetId++, userId: S.currentUserId, time: "now", text: text,
      img: null, replies: 0, reposts: 0, likes: 0, views: 12, nested: [],
    };
    App.TWEETS.unshift(t);
    return t;
  };

  App.addReply = function (tweetId, text) {
    var t = App.tweetById(tweetId); if (!t) return;
    t.nested.push({ userId: S.currentUserId, time: "now", text: text });
    t.replies++;
  };

  /* ----- navigation (called by sidebar; app.js re-renders) ----- */
  App.navigate = function (view, param) {
    S.view = view;
    if (view === "profile") { S.profileUser = param || "you"; S.profileTab = "posts"; }
    if (view === "tweet") S.detailTweet = param;
    if (view === "explore") S.exploreTrend = (param == null ? null : param);
    App.render();
  };

  App.visibleTweets = function () {
    if (S.homeTab === "following") {
      return App.TWEETS.filter(function (t) {
        return t.userId === S.currentUserId || S.following[t.userId];
      });
    }
    return App.TWEETS;
  };

  App.bookmarkedTweets = function () {
    return App.TWEETS.filter(function (t) { return S.bookmarked[t.id]; });
  };
})(window.App);
