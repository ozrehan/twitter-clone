/* components/notifications.js — notifications view with All / Mentions filter tabs (API-backed). */
(function (App) {
  "use strict";

  var ICONS = { like: "like", repost: "repost", follow: "user", mention: "reply" };
  var VERBS = {
    like: "liked your post",
    repost: "reposted your post",
    follow: "followed you",
    mention: "mentioned you",
  };

  App.renderNotifications = function (root) {
    var tab = App.store.notifTab;
    root.innerHTML =
      '<div class="view-head"><div class="titles"><b>Notifications</b></div></div>' +
      '<div class="tabs">' +
        '<div class="tab' + (tab === "all" ? " active" : "") + '" data-ntab="all"><span>All</span></div>' +
        '<div class="tab' + (tab === "mentions" ? " active" : "") + '" data-ntab="mentions"><span>Mentions</span></div>' +
      "</div>" +
      '<div id="notifList"><div class="ob-loading">Loading…</div></div>';

    App.on(root, "click", "[data-ntab]", function (e, el) {
      App.store.notifTab = el.getAttribute("data-ntab");
      App.render();
    });

    App.loadNotifs().then(function () { draw(); }).catch(function () {
      var slot = App.$("#notifList", root);
      if (slot) slot.innerHTML = '<div class="empty-state"><h3>Could not load notifications</h3></div>';
    });

    function draw() {
      var slot = App.$("#notifList", root);
      if (!slot) return;
      var list = App.NOTIFS.filter(function (n) {
        return tab === "all" || n.type === "mention";
      });

      slot.innerHTML = list.length ? list.map(function (n) {
        var u = n.actor || App.userById(n.userId);
        var snippet = "";
        if (n.refText) snippet = '<div class="n-snippet">' + App.esc(n.refText) + "</div>";
        else if (n.text) snippet = '<div class="n-snippet">' + App.esc(n.text) + "</div>";
        var uname = u.username || u.id;
        return '<div class="notif ' + n.type + '" data-notif="' + n.id + '" data-ref="' + (n.ref || "") + '">' +
          '<div class="n-icon">' + App.icon(ICONS[n.type] || "reply") + "</div>" +
          '<div><img class="avatar" src="' + App.avatar(u.seed) + '" alt="">' +
          '<div class="n-text"><b data-user-link="' + uname + '">' + App.esc(u.name) + "</b> " +
            '<span class="tag">' + (VERBS[n.type] || n.type) + " · " + App.esc(n.time) + "</span></div>" +
          snippet + "</div></div>";
      }).join("") : '<div class="empty-state"><h3>Nothing here yet</h3><p>When someone likes, reposts or mentions your posts, you\'ll see it here.</p></div>';

      App.on(root, "click", "[data-notif]", function (e, el) {
        if (e.target.closest("[data-user-link]")) return;
        var ref = el.getAttribute("data-ref");
        if (ref) App.navigate("tweet", +ref);
      });
      App.on(root, "click", "[data-user-link]", function (e, el) {
        e.stopPropagation();
        App.navigate("profile", el.getAttribute("data-user-link"));
      });
    }
  };
})(window.App);
