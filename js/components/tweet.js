/* components/tweet.js — tweet card renderer + delegated action handlers + inline reply. */
(function (App) {
  "use strict";

  /** full tweet card HTML. opts.big renders the detail-style card. */
  App.tweetCard = function (t, opts) {
    opts = opts || {};
    var u = App.userById(t.userId);
    var S = App.store;
    var liked = !!S.liked[t.id], reposted = !!S.reposted[t.id], saved = !!S.bookmarked[t.id];

    var head =
      '<div class="tweet-head">' +
        '<b data-user-link="' + u.id + '">' + App.esc(u.name) + "</b>" +
        (u.verified ? App.vbadge() : "") +
        '<span class="handle">@' + u.handle + " ·</span>" +
        '<span class="time">' + App.esc(t.time) + "</span>" +
      "</div>";

    var body =
      '<div class="tweet-text">' + App.nl2br(App.linkify(t.text)) + "</div>" +
      (t.img ? '<img class="tweet-img" src="' + t.img + '" alt="tweet image" loading="lazy">' : "");

    var actions =
      '<div class="actions">' +
        act("reply", "reply", t.replies, "Reply") +
        act("repost", "repost" + (reposted ? " reposted" : ""), t.reposts, "Repost") +
        act("like", "like" + (liked ? " liked" : ""), t.likes, "Like") +
        act("views", "views", t.views, "Views") +
        '<span class="end-icons">' +
          act("bookmark", "reply" + (saved ? " bookmarked" : ""), null, "Bookmark", "bookmark") +
          act("share", "reply", null, "Share", "share") +
        "</span>" +
      "</div>";

    var nested =
      '<div class="reply-slot"></div>' +
      '<div class="nested">' + t.nested.map(function (n) {
        var nu = App.userById(n.userId);
        return '<div class="n"><b data-user-link="' + nu.id + '">' + App.esc(nu.name) + "</b>" +
          '<span class="h">@' + nu.handle + " · " + App.esc(n.time) + "</span><br>" +
          App.nl2br(App.linkify(n.text)) + "</div>";
      }).join("") + "</div>";

    if (opts.big) {
      return '<div class="tweet-big" data-tweet="' + t.id + '">' +
        '<div class="tweet-head"><img class="avatar" src="' + App.avatar(u.seed) + '" alt="">' +
          '<div><b data-user-link="' + u.id + '">' + App.esc(u.name) + "</b>" +
          (u.verified ? App.vbadge() : "") +
          '<div class="handle">@' + u.handle + "</div></div></div>" +
        '<div class="big-text">' + App.nl2br(App.linkify(t.text)) + "</div>" +
        (t.img ? '<img class="tweet-img" src="' + t.img + '" alt="tweet image">' : "") +
        '<div class="big-time">' + App.esc(t.time) + " · <b>" + App.fmtFull(t.views) + "</b> Views</div>" +
        '<div class="big-stats"><span><b>' + App.fmtFull(t.replies) + "</b> Replies</span>" +
          "<span><b>" + App.fmtFull(t.reposts) + "</b> Reposts</span>" +
          "<span><b>" + App.fmtFull(t.likes) + "</b> Likes</span>" +
          "<span><b>" + App.fmtFull(Object.keys(App.store.bookmarked).filter(function (k) { return App.store.bookmarked[k] && App.tweetById(+k) === t; }).length) + "</b> Bookmarks</span></div>" +
        actions + '<div class="reply-slot"></div>' + nested +
      "</div>";
    }

    return '<article class="tweet" data-tweet="' + t.id + '">' +
      '<img class="avatar" data-user-link="' + u.id + '" src="' + App.avatar(u.seed) + '" alt="' + App.esc(u.name) + '">' +
      '<div class="tweet-body">' + head + body + actions + nested + "</div>" +
    "</article>";

    function act(kind, cls, count, title, icon) {
      return '<button class="act ' + cls + '" data-act="' + kind + '" title="' + title + '">' +
        '<span class="circ">' + App.icon(icon || kind, "sm") + "</span>" +
        (count == null ? "" : '<span class="cnt">' + App.fmt(count) + "</span>") +
      "</button>";
    }
  };

  /** wire like/repost/bookmark/reply + open-detail on a container of tweet cards */
  App.wireTweetActions = function (root) {
    /* open tweet detail (but not when clicking a button, link, or reply input) */
    App.on(root, "click", "[data-tweet]", function (e, card) {
      if (e.target.closest(".act, .reply-box, [data-user-link], .tag")) return;
      App.navigate("tweet", +card.getAttribute("data-tweet"));
    });
    /* profile links */
    App.on(root, "click", "[data-user-link]", function (e, el) {
      e.stopPropagation();
      App.navigate("profile", el.getAttribute("data-user-link"));
    });

    App.on(root, "click", ".act", function (e, btn) {
      e.stopPropagation();
      var card = btn.closest("[data-tweet]");
      var id = +card.getAttribute("data-tweet");
      var kind = btn.getAttribute("data-act");

      if (kind === "like") {
        var tw = App.tweetById(id);
        if (!tw) return;
        var on = App.toggleLike(id);
        btn.classList.toggle("liked", on);
        btn.querySelector(".cnt").textContent = App.fmt(tw.likes);
      } else if (kind === "repost") {
        var tw2 = App.tweetById(id);
        if (!tw2) return;
        var rp = App.toggleRepost(id);
        btn.classList.toggle("reposted", rp);
        btn.querySelector(".cnt").textContent = App.fmt(tw2.reposts);
      } else if (kind === "bookmark") {
        var sv = App.toggleBookmark(id);
        btn.classList.toggle("bookmarked", sv);
      } else if (kind === "reply") {
        toggleReplyBox(card, id);
      } else if (kind === "share") {
        btn.querySelector(".circ").style.color = "var(--accent)";
        setTimeout(function () { btn.querySelector(".circ").style.color = ""; }, 600);
      }
    });

    function toggleReplyBox(card, id) {
      var slot = card.querySelector(".reply-slot");
      if (slot.innerHTML) { slot.innerHTML = ""; return; }
      var me = App.userById(App.store.currentUserId);
      slot.innerHTML =
        '<div class="reply-box">' +
          '<img class="avatar" src="' + App.avatar(me.seed) + '" alt="">' +
          '<input class="r-input" placeholder="Post your reply">' +
          '<button class="r-send">Reply</button>' +
        "</div>";
      var input = slot.querySelector(".r-input");
      input.focus();
      var send = function () {
        var text = input.value.trim();
        if (!text) return;
        App.addReply(id, text);
        App.render(); /* re-render to show nested reply */
      };
      slot.querySelector(".r-send").onclick = function (e) { e.stopPropagation(); send(); };
      input.onkeydown = function (ev) {
        ev.stopPropagation();
        if (ev.key === "Enter") send();
      };
      input.onclick = function (ev) { ev.stopPropagation(); };
    }
  };
})(window.App);
