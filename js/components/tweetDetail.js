/* components/tweetDetail.js — click a tweet -> full thread view (API-backed). */
(function (App) {
  "use strict";

  App.renderTweetDetail = function (root) {
    var id = App.store.detailTweet;
    root.innerHTML = '<div class="view-head"><div class="titles"><b>Post</b></div></div>' +
      '<div class="ob-loading" style="padding:40px;text-align:center;color:var(--text-dim)">Loading…</div>';

    App.api.get("/api/tweets/" + id).then(function (res) {
      App.cacheTweet(res.tweet);
      App.cacheTweets(res.context);
      draw(root, res.tweet, res.context);
    }).catch(function () {
      root.innerHTML = '<div class="view-head"><button class="back-btn" data-back>' + App.icon("back") +
        '</button><div class="titles"><b>Post</b></div></div>' +
        '<div class="empty-state"><h3>Post not found</h3></div>';
      App.on(root, "click", "[data-back]", function () { App.navigate("home"); });
    });
  };

  function draw(root, t, context) {
    root.innerHTML =
      '<div class="view-head"><button class="back-btn" data-back>' + App.icon("back") + "</button>" +
        '<div class="titles"><b>Post</b></div></div>' +
      '<div id="threadCtx">' + context.map(function (x) { return App.tweetCard(x); }).join("") + "</div>" +
      App.tweetCard(t, { big: true }) +
      '<div style="padding:12px 16px;color:var(--text-dim);font-size:14px;border-bottom:1px solid var(--border)">' +
        "Replies</div>" +
      '<div id="detailReplies">' + (t.nested.length ? t.nested.map(function (n) {
        var nu = App.userById(n.userId);
        return '<article class="tweet"><img class="avatar" data-user-link="' + nu.username + '" src="' + App.avatar(nu.seed) + '" alt="">' +
          '<div class="tweet-body"><div class="tweet-head"><b data-user-link="' + nu.username + '">' + App.esc(nu.name) + "</b>" +
          (nu.verified ? App.vbadge() : "") +
          '<span class="handle">@' + nu.handle + " ·</span>" +
          '<span class="time">' + App.esc(n.time) + "</span></div>" +
          '<div class="tweet-text">' + App.nl2br(App.linkify(n.text)) + "</div></div></article>";
      }).join("") : '<div class="empty-state"><h3>No replies yet</h3><p>Be the first to reply.</p></div>') + "</div>";

    App.on(root, "click", "[data-back]", function () { App.navigate("home"); });
    App.wireTweetActions(root);
  }
})(window.App);
