/* components/tweetDetail.js — click a tweet -> full thread view with back button. */
(function (App) {
  "use strict";

  App.renderTweetDetail = function (root) {
    var t = App.tweetById(App.store.detailTweet);
    if (!t) { App.navigate("home"); return; }

    /* thread = other tweets by same author around it (simple context) */
    var context = App.tweetsByUser(t.userId).filter(function (x) { return x.id !== t.id; }).slice(0, 2);

    root.innerHTML =
      '<div class="view-head"><button class="back-btn" data-back>' + App.icon("back") + "</button>" +
        '<div class="titles"><b>Post</b></div></div>' +
      '<div id="threadCtx">' + context.map(function (x) { return App.tweetCard(x); }).join("") + "</div>" +
      App.tweetCard(t, { big: true }) +
      '<div style="padding:12px 16px;color:var(--text-dim);font-size:14px;border-bottom:1px solid var(--border)">' +
        "Replies</div>" +
      '<div id="detailReplies">' + (t.nested.length ? t.nested.map(function (n) {
        var nu = App.userById(n.userId);
        return '<article class="tweet"><img class="avatar" data-user-link="' + nu.id + '" src="' + App.avatar(nu.seed) + '" alt="">' +
          '<div class="tweet-body"><div class="tweet-head"><b data-user-link="' + nu.id + '">' + App.esc(nu.name) + "</b>" +
          (nu.verified ? App.vbadge() : "") +
          '<span class="handle">@' + nu.handle + " ·</span>" +
          '<span class="time">' + App.esc(n.time) + "</span></div>" +
          '<div class="tweet-text">' + App.nl2br(App.linkify(n.text)) + "</div></div></article>";
      }).join("") : '<div class="empty-state"><h3>No replies yet</h3><p>Be the first to reply.</p></div>') + "</div>";

    App.on(root, "click", "[data-back]", function () { App.navigate("home"); });
    App.wireTweetActions(root);
  };
})(window.App);
