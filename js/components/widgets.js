/* components/widgets.js — right rail: search, premium card, trends, who-to-follow. */
(function (App) {
  "use strict";

  App.renderWidgets = function (root) {
    root.innerHTML =
      '<div class="search"><div class="search-box">' + App.icon("search") +
        '<input type="text" id="widgetSearch" placeholder="Search">' +
      "</div></div>" +

      '<div class="card premium"><h2>Subscribe to Premium</h2>' +
        "<p>Subscribe to unlock new features and if eligible, receive a share of revenue.</p>" +
        "<button>Subscribe</button></div>" +

      '<div class="card"><h2>What\'s happening</h2><div id="wTrends"></div></div>' +

      '<div class="card who"><h2>Who to follow</h2><div id="wFollows"></div>' +
        '<a class="more" data-more-follows>Show more</a></div>';

    renderTrends(App.$("#wTrends", root));
    renderFollows(App.$("#wFollows", root));

    /* search filters trends live */
    var input = App.$("#widgetSearch", root);
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      renderTrends(App.$("#wTrends", root), q);
    });

    App.on(root, "click", "[data-trend]", function (e, el) {
      App.navigate("explore", +el.getAttribute("data-trend"));
    });
    App.on(root, "click", "[data-follow]", function (e, btn) {
      e.stopPropagation();
      var now = App.toggleFollow(btn.getAttribute("data-follow"));
      btn.classList.toggle("following", now);
      btn.textContent = now ? "Following" : "Follow";
    });
    App.on(root, "click", "[data-more-follows]", function () { App.navigate("explore"); });
  };

  function renderTrends(slot, q) {
    var list = App.TRENDS.map(function (t, i) { return { t: t, i: i }; });
    if (q) list = list.filter(function (x) {
      return x.t.topic.toLowerCase().indexOf(q) > -1 || x.t.cat.toLowerCase().indexOf(q) > -1;
    });
    slot.innerHTML = list.length ? list.map(function (x) {
      return '<div class="row trend" data-trend="' + x.i + '">' +
        '<div class="cat">' + App.esc(x.t.cat) + "</div>" +
        '<div class="topic">' + App.esc(x.t.topic) + "</div>" +
        '<div class="posts">' + App.fmtPosts(x.t.posts) + "</div></div>";
    }).join("") : '<div class="row trend"><div class="posts">No trends match.</div></div>';
  }

  function renderFollows(slot) {
    var sug = App.USERS.filter(function (u) {
      return u.id !== App.store.currentUserId && !App.isFollowing(u.id) && u.verified;
    }).slice(0, 3);
    slot.innerHTML = sug.map(function (u) {
      return '<div class="row">' +
        '<img src="' + App.avatar(u.seed) + '" alt="' + App.esc(u.name) + '">' +
        '<div class="nm"><b>' + App.esc(u.name) + " " + (u.verified ? App.vbadge() : "") + "</b>" +
        "<span>@" + u.handle + "</span></div>" +
        '<button class="follow-btn" data-follow="' + u.id + '">Follow</button></div>';
    }).join("");
  }
})(window.App);
