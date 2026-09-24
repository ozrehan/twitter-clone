/* components/tweet.js — tweet card renderer + delegated action handlers + inline reply. */
(function (App) {
  "use strict";

  /** full tweet card HTML. opts.big renders the detail-style card. */
  App.tweetCard = function (t, opts) {
    opts = opts || {};
    var u = App.userById(t.userId);
    var liked = !!t.liked, reposted = !!t.reposted, saved = !!t.bookmarked;

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
          "<span><b>" + App.fmtFull(t.likes) + "</b> Likes</span></div>" +
        actions + '<div class="reply-slot"></div>' + nested +
        (t.userId === App.store.currentUserId
          ? '<button class="del-tweet" data-del-tweet>Delete post</button>' : "") +
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

    /* delete own tweet (big view) */
    App.on(root, "click", "[data-del-tweet]", async function (e, btn) {
      e.stopPropagation();
      var id = +btn.closest("[data-tweet]").getAttribute("data-tweet");
      if (!window.confirm("Delete this post?")) return;
      try { await App.deleteTweet(id); App.navigate("home"); } catch (err) { /* noop */ }
    });

    App.on(root, "click", ".act", async function (e, btn) {
      e.stopPropagation();
      var card = btn.closest("[data-tweet]");
      var id = +card.getAttribute("data-tweet");
      var kind = btn.getAttribute("data-act");

      try {
        if (kind === "like") {
          var on = await App.toggleLike(id);
          btn.classList.toggle("liked", on);
          var tw = App.tweetById(id);
          if (tw) btn.querySelector(".cnt").textContent = App.fmt(tw.likes);
        } else if (kind === "repost") {
          var rp = await App.toggleRepost(id);
          btn.classList.toggle("reposted", rp);
          var tw2 = App.tweetById(id);
          if (tw2) btn.querySelector(".cnt").textContent = App.fmt(tw2.reposts);
        } else if (kind === "bookmark") {
          var sv = await App.toggleBookmark(id);
          btn.classList.toggle("bookmarked", sv);
        } else if (kind === "reply") {
          toggleReplyBox(card, id);
        } else if (kind === "share") {
          btn.querySelector(".circ").style.color = "var(--accent)";
          setTimeout(function () { btn.querySelector(".circ").style.color = ""; }, 600);
        }
      } catch (err) { /* optimistic state already rolled back */ }
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
        input.disabled = true;
        App.addReply(id, text).then(function () {
          App.render(); /* re-render to show nested reply */
        }).catch(function () {
          input.disabled = false;
        });
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
