/* components/sidebar.js — left nav: logo, view-switching items, Post button, user chip, More menu. */
(function (App) {
  "use strict";

  var NAV = [
    { view: "home", icon: "home", label: "Home" },
    { view: "explore", icon: "explore", label: "Explore" },
    { view: "notifications", icon: "bell", label: "Notifications", badge: true },
    { view: "messages", icon: "mail", label: "Messages" },
    { view: "bookmarks", icon: "bookmark", label: "Bookmarks" },
    { view: "communities", icon: "people", label: "Communities" },
    { view: "profile", icon: "user", label: "Profile" },
    { view: "more", icon: "more", label: "More" },
  ];

  App.renderSidebar = function (root) {
    var me = App.userById(App.store.currentUserId);
    var unread = App.CONVOS.reduce(function (a, c) { return a + (c.unread || 0); }, 0);

    root.innerHTML =
      '<div class="logo" title="X" data-nav="home">' + App.icon("logo", "logo-fill") + "</div>" +
      NAV.map(function (n) {
        var active = App.store.view === n.view ||
          (n.view === "profile" && App.store.view === "profile") ? " active" : "";
        var badge = (n.badge && unread) ? '<span class="badge">' + unread + "</span>" : "";
        return '<div class="nav-item' + active + '" data-nav="' + n.view + '">' +
          App.icon(n.icon) + '<span class="lbl">' + n.label + "</span>" + badge + "</div>";
      }).join("") +
      '<button class="nav-post" data-nav-post>Post</button>' +
      '<div class="more-menu" id="moreMenu" style="display:none">' +
        '<div class="mi" data-more="settings">' + App.icon("settings", "sm") + "Settings</div>" +
        '<div class="mi" data-more="bookmarks">' + App.icon("bookmark", "sm") + "Bookmarks</div>" +
        '<div class="mi" data-more="communities">' + App.icon("people", "sm") + "Communities</div>" +
      "</div>" +
      '<div class="nav-user" data-nav="profile" data-user="' + me.id + '">' +
        '<img src="' + App.avatar(me.seed) + '" alt="' + App.esc(me.name) + '">' +
        '<div class="who"><b>' + App.esc(me.name) + "</b><span>@" + me.handle + "</span></div>" +
        '<span class="dots">···</span>' +
      "</div>";

    /* nav clicks */
    App.on(root, "click", "[data-nav]", function (e, el) {
      var view = el.getAttribute("data-nav");
      if (view === "more") {
        var m = App.$("#moreMenu", root);
        m.style.display = m.style.display === "none" ? "block" : "none";
        return;
      }
      if (view === "profile") App.navigate("profile", el.getAttribute("data-user") || "you");
      else App.navigate(view);
    });
    App.on(root, "click", "[data-more]", function (e, el) {
      App.$("#moreMenu", root).style.display = "none";
      App.navigate(el.getAttribute("data-more"));
    });
    /* Post button focuses the home composer */
    App.on(root, "click", "[data-nav-post]", function () {
      App.navigate("home");
      setTimeout(function () {
        var input = App.$("#composeInput");
        if (input) input.focus();
      }, 50);
    });
  };
})(window.App);
