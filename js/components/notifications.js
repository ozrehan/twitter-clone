/* components/notifications.js — notifications view with All / Mentions filter tabs. */
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
      '<div id="notifList"></div>';

    App.on(root, "click", "[data-ntab]", function (e, el) {
      App.store.notifTab = el.getAttribute("data-ntab");
      App.render();
    });

    var list = App.NOTIFS.filter(function (n) {
      return tab === "all" || n.type === "mention";
    });

    App.$("#notifList", root).innerHTML = list.length ? list.map(function (n) {
      var u = App.userById(n.userId);
      var snippet = "";
      if (n.ref) {
        var tw = App.tweetById(n.ref);
        if (tw) snippet = '<div class="n-snippet">' + App.esc(tw.text.slice(0, 120)) + "</div>";
      }
      if (n.text) snippet = '<div class="n-snippet">' + App.esc(n.text) + "</div>";
      return '<div class="notif ' + n.type + '" data-notif="' + n.id + '">' +
        '<div class="n-icon">' + App.icon(ICONS[n.type]) + "</div>" +
        '<div><img class="avatar" src="' + App.avatar(u.seed) + '" alt="">' +
        '<div class="n-text"><b data-user-link="' + u.id + '">' + App.esc(u.name) + "</b> " +
          '<span class="tag">' + VERBS[n.type] + " · " + App.esc(n.time) + "</span></div>" +
        snippet + "</div></div>";
    }).join("") : '<div class="empty-state"><h3>Nothing here yet</h3></div>';

    App.on(root, "click", "[data-notif]", function (e, el) {
      if (e.target.closest("[data-user-link]")) return;
      var n = App.NOTIFS.find(function (x) { return x.id === +el.getAttribute("data-notif"); });
      if (n && n.ref) App.navigate("tweet", n.ref);
    });
    App.on(root, "click", "[data-user-link]", function (e, el) {
      e.stopPropagation();
      App.navigate("profile", el.getAttribute("data-user-link"));
    });
  };
})(window.App);
