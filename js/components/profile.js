/* components/profile.js — per-user profile (API-backed): banner, stats, follow, tabs. */
(function (App) {
  "use strict";

  App.renderProfile = function (root) {
    var username = App.store.profileUser;
    root.innerHTML = '<div class="view-head"><div class="titles"><b>Profile</b></div></div>' +
      '<div class="ob-loading" style="padding:40px;text-align:center;color:var(--text-dim)">Loading…</div>';

    App.api.get("/api/users/" + username).then(function (prof) {
      App.cacheUser(prof.user);
      App.cacheTweets(prof.tweets);
      App.markFollowing(prof.user.username, prof.following);
      drawProfile(root, prof);
    }).catch(function () {
      root.innerHTML = '<div class="view-head"><button class="back-btn" data-back>' + App.icon("back") +
        '</button><div class="titles"><b>Profile</b></div></div>' +
        '<div class="empty-state"><h3>User not found</h3></div>';
      App.on(root, "click", "[data-back]", function () { App.navigate("home"); });
    });
  };

  function drawProfile(root, prof) {
    var u = prof.user;
    var tab = App.store.profileTab;
    var isMe = prof.isMe;
    var following = prof.following;

    root.innerHTML =
      '<div class="view-head"><button class="back-btn" data-back>' + App.icon("back") + "</button>" +
        '<div class="titles"><b>' + App.esc(u.name) + "</b><span>" +
          App.fmt(prof.counts.tweets) + " posts</span></div></div>" +
      '<div class="profile-banner" style="background-image:url(https://picsum.photos/seed/' + u.seed + "banner/600/200)\"></div>" +
      '<div class="profile-top">' +
        '<div class="profile-ava-row">' +
          '<img src="' + App.avatar(u.seed, 160) + '" alt="' + App.esc(u.name) + '">' +
          (isMe
            ? '<button class="follow-btn following" data-logout>Log out</button>'
            : '<button class="follow-btn' + (following ? " following" : "") + '" data-follow="' + u.username + '">' +
              (following ? "Following" : "Follow") + "</button>") +
        "</div>" +
        '<div class="profile-name">' + App.esc(u.name) + " " + (u.verified ? App.vbadge() : "") + "</div>" +
        '<div class="profile-handle">@' + u.handle + "</div>" +
        (u.bio ? '<div class="profile-bio">' + App.nl2br(App.linkify(u.bio)) + "</div>" : "") +
        '<div class="profile-meta">' +
          (u.location ? "<span>" + App.icon("location", "xs") + " " + App.esc(u.location) + "</span>" : "") +
          (u.joined ? "<span>" + App.icon("calendar", "xs") + " Joined " + App.esc(u.joined) + "</span>" : "") +
        "</div>" +
        '<div class="profile-stats"><span><b>' + App.fmtFull(prof.counts.following) + "</b> Following</span>" +
          '<span><b id="followerCount">' + App.fmtFull(prof.counts.followers) + "</b> Followers</span></div>" +
      "</div>" +
      '<div class="tabs">' +
        [["posts", "Posts"], ["replies", "Replies"], ["media", "Media"], ["likes", "Likes"]].map(function (p) {
          return '<div class="tab' + (tab === p[0] ? " active" : "") + '" data-ptab="' + p[0] + '"><span>' + p[1] + "</span></div>";
        }).join("") +
      "</div>" +
      '<div id="profileList"><div class="ob-loading" style="padding:24px;text-align:center;color:var(--text-dim)">Loading…</div></div>';

    App.on(root, "click", "[data-back]", function () { App.navigate("home"); });
    App.on(root, "click", "[data-logout]", function () { App.logout(); });
    App.on(root, "click", "[data-follow]", async function (e, btn) {
      btn.disabled = true;
      try {
        var now = await App.toggleFollow(u.username);
        btn.classList.toggle("following", now);
        btn.textContent = now ? "Following" : "Follow";
        var fc = App.$("#followerCount", root);
        if (fc) fc.textContent = App.fmtFull(App.userById(u.username).followers);
      } catch (err) { /* noop */ }
      btn.disabled = false;
    });
    App.on(root, "click", "[data-ptab]", function (e, el) {
      App.store.profileTab = el.getAttribute("data-ptab");
      drawProfile(root, prof);
    });

    drawList(App.$("#profileList", root), prof, tab);
    App.wireTweetActions(root);
  }

  function drawList(slot, prof, tab) {
    var done = function (list) {
      slot.innerHTML = list.length
        ? list.map(function (t) { return App.tweetCard(t); }).join("")
        : '<div class="empty-state"><h3>Nothing here yet</h3></div>';
      App.wireTweetActions(slot);
    };
    if (tab === "posts") done(prof.tweets);
    else if (tab === "media") done(prof.tweets.filter(function (t) { return t.img; }));
    else if (tab === "likes") {
      if (!prof.isMe) { done([]); return; }
      App.api.get("/api/timeline?tab=likes").then(function (list) {
        App.cacheTweets(list); done(list);
      }).catch(function () { done([]); });
    }
    else if (tab === "replies") {
      App.api.get("/api/users/" + prof.user.username + "/replies").then(function (list) {
        App.cacheTweets(list); done(list);
      }).catch(function () { done([]); });
    }
  }
})(window.App);
