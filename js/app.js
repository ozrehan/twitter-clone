/* app.js — boot + view router. Plain scripts, global App namespace, no build step. */
(function (App) {
  "use strict";

  /** render current view into #view, sidebar into #sidebar, widgets into #widgets.
   *  Fire-and-forget async: views that need data fetch it themselves. */
  App.render = function () {
    if (!App.store.me) return; /* auth screen owns the body until login */
    var view = App.store.view;
    var vEl = App.$("#view");
    if (!vEl) return;

    App.renderSidebar(App.$("#sidebar"));

    if (view === "home") App.renderHome(vEl);
    else if (view === "explore") App.renderExplore(vEl);
    else if (view === "notifications") App.renderNotifications(vEl);
    else if (view === "messages") App.renderMessages(vEl);
    else if (view === "bookmarks") App.renderBookmarks(vEl);
    else if (view === "communities") App.renderCommunities(vEl);
    else if (view === "profile") App.renderProfile(vEl);
    else if (view === "tweet") App.renderTweetDetail(vEl);
    else App.renderHome(vEl);

    App.renderWidgets(App.$("#widgets"));
    document.title = titleFor(view) + " / X";
    window.scrollTo(0, 0);
  };

  function titleFor(view) {
    return { home: "Home", explore: "Explore", notifications: "Notifications",
      messages: "Messages", bookmarks: "Bookmarks", communities: "Communities",
      profile: "Profile", tweet: "Post" }[view] || "Home";
  }

  /* bookmarks view — loaded from the API */
  App.renderBookmarks = function (root) {
    var me = App.userById(App.store.currentUserId);
    root.innerHTML = '<div class="view-head"><div class="titles"><b>Bookmarks</b><div style="color:var(--text-dim);font-size:13px">@' +
      App.esc(me.handle) + '</div></div></div><div id="bmList"><div class="ob-loading">Loading…</div></div>';
    App.api.get("/api/timeline?tab=bookmarks").then(function (list) {
      App.cacheTweets(list);
      var slot = App.$("#bmList", root);
      if (!slot) return;
      slot.innerHTML = list.length
        ? list.map(function (t) { return App.tweetCard(t); }).join("")
        : '<div class="empty-state"><h3>Save posts for later</h3><p>Bookmark posts to easily find them again.</p></div>';
      App.wireTweetActions(root);
    }).catch(function () {
      var slot = App.$("#bmList", root);
      if (slot) slot.innerHTML = '<div class="empty-state"><h3>Could not load bookmarks</h3></div>';
    });
  };

  /* communities view (simple) */
  App.renderCommunities = function (root) {
    var comms = [
      { name: "Build in Public", seed: "commbuild", members: "128K" },
      { name: "Machine Learning", seed: "commml", members: "342K" },
      { name: "Cricket Fans", seed: "commcricket", members: "89K" },
      { name: "Space Enthusiasts", seed: "commspace", members: "210K" },
    ];
    root.innerHTML = '<div class="view-head"><div class="titles"><b>Communities</b></div></div>' +
      comms.map(function (c) {
        return '<div class="comm"><img src="' + App.avatar(c.seed, 112) + '" alt="">' +
          '<div class="c-info"><b>' + c.name + "</b><span>" + c.members + " members</span></div>" +
          '<button class="follow-btn">Join</button></div>';
      }).join("");
    App.on(root, "click", ".follow-btn", function (e, btn) {
      var on = btn.classList.toggle("following");
      btn.textContent = on ? "Joined" : "Join";
    });
  };

  /* boot: auth gate, then load server state */
  document.addEventListener("DOMContentLoaded", function () { App.boot(); });
})(window.App);
