/* components/profile.js — per-user profile: banner, stats, follow, tabs Posts/Replies/Media/Likes. */
(function (App) {
  "use strict";

  App.renderProfile = function (root) {
    var u = App.userById(App.store.profileUser);
    var tab = App.store.profileTab;
    var isMe = u.id === App.store.currentUserId;
    var following = App.isFollowing(u.id);

    root.innerHTML =
      '<div class="view-head"><button class="back-btn" data-back>' + App.icon("back") + "</button>" +
        '<div class="titles"><b>' + App.esc(u.name) + "</b><span>" +
          App.fmt(App.tweetsByUser(u.id).length) + " posts</span></div></div>" +
      '<div class="profile-banner" style="background-image:url(https://picsum.photos/seed/' + u.seed + "banner/600/200)\"></div>" +
      '<div class="profile-top">' +
        '<div class="profile-ava-row">' +
          '<img src="' + App.avatar(u.seed, 160) + '" alt="' + App.esc(u.name) + '">' +
          (isMe
            ? '<button class="follow-btn following">Edit profile</button>'
            : '<button class="follow-btn' + (following ? " following" : "") + '" data-follow="' + u.id + '">' +
              (following ? "Following" : "Follow") + "</button>") +
        "</div>" +
        '<div class="profile-name">' + App.esc(u.name) + " " + (u.verified ? App.vbadge() : "") + "</div>" +
        '<div class="profile-handle">@' + u.handle + "</div>" +
        (u.bio ? '<div class="profile-bio">' + App.nl2br(App.linkify(u.bio)) + "</div>" : "") +
        '<div class="profile-meta">' +
          (u.location ? "<span>" + App.icon("location", "xs") + " " + App.esc(u.location) + "</span>" : "") +
          "<span>" + App.icon("calendar", "xs") + " Joined " + App.esc(u.joined) + "</span>" +
        "</div>" +
        '<div class="profile-stats"><span><b>' + App.fmtFull(u.following) + "</b> Following</span>" +
          '<span><b id="followerCount">' + App.fmtFull(u.followers) + "</b> Followers</span></div>" +
      "</div>" +
      '<div class="tabs">' +
        [["posts", "Posts"], ["replies", "Replies"], ["media", "Media"], ["likes", "Likes"]].map(function (p) {
          return '<div class="tab' + (tab === p[0] ? " active" : "") + '" data-ptab="' + p[0] + '"><span>' + p[1] + "</span></div>";
        }).join("") +
      "</div>" +
      '<div id="profileList"></div>';

    App.on(root, "click", "[data-back]", function () { App.navigate("home"); });
    App.on(root, "click", "[data-follow]", function (e, btn) {
      var now = App.toggleFollow(u.id);
      btn.classList.toggle("following", now);
      btn.textContent = now ? "Following" : "Follow";
      App.$("#followerCount", root).textContent = App.fmtFull(u.followers);
    });
    App.on(root, "click", "[data-ptab]", function (e, el) {
      App.store.profileTab = el.getAttribute("data-ptab");
      App.render();
    });

    drawList(App.$("#profileList", root), u, tab);
    App.wireTweetActions(root);
  };

  function drawList(slot, u, tab) {
    var list;
    if (tab === "posts") list = App.tweetsByUser(u.id);
    else if (tab === "media") list = App.tweetsByUser(u.id).filter(function (t) { return t.img; });
    else if (tab === "likes") list = App.TWEETS.filter(function (t) { return App.store.liked[t.id]; });
    else if (tab === "replies") {
      /* tweets this user replied to + own tweets with nested replies */
      list = App.TWEETS.filter(function (t) {
        return t.nested.some(function (n) { return n.userId === u.id; }) || t.userId === u.id;
      });
    }
    slot.innerHTML = list.length
      ? list.map(function (t) { return App.tweetCard(t); }).join("")
      : '<div class="empty-state"><h3>Nothing here yet</h3></div>';
  }
})(window.App);
