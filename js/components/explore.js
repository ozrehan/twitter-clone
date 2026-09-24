/* components/explore.js — trends detail view + single-trend thread view. */
(function (App) {
  "use strict";

  App.renderExplore = function (root) {
    var idx = App.store.exploreTrend;

    if (idx == null) {
      /* trends list */
      root.innerHTML =
        '<div class="view-head"><b style="font-size:20px;font-weight:800">Explore</b></div>' +
        '<div class="explore-search"><div class="search-box">' + App.icon("search") +
          '<input type="text" id="exSearch" placeholder="Search X"></div></div>' +
        '<div id="exTrends"></div>';

      var draw = function (q) {
        var list = App.TRENDS.map(function (t, i) { return { t: t, i: i }; });
        if (q) list = list.filter(function (x) {
          return x.t.topic.toLowerCase().indexOf(q) > -1 || x.t.cat.toLowerCase().indexOf(q) > -1;
        });
        App.$("#exTrends", root).innerHTML = list.map(function (x) {
          return '<div class="trend-row" data-trend="' + x.i + '">' +
            '<div class="t-main"><div class="cat">' + App.esc(x.t.cat) + "</div>" +
            '<div class="topic">' + App.esc(x.t.topic) + "</div>" +
            '<div class="posts">' + App.fmtPosts(x.t.posts) + "</div></div>" +
            App.icon("more", "sm") + "</div>";
        }).join("");
      };
      draw("");
      App.$("#exSearch", root).addEventListener("input", function (e) {
        draw(e.target.value.trim().toLowerCase());
      });
      App.on(root, "click", "[data-trend]", function (e, el) {
        App.navigate("explore", +el.getAttribute("data-trend"));
      });
    } else {
      /* single trend: description + related tweets */
      var t = App.TRENDS[idx];
      var tweets = t.tweets.map(App.tweetById).filter(Boolean);
      root.innerHTML =
        '<div class="view-head"><button class="back-btn" data-back>' + App.icon("back") + "</button>" +
          '<div class="titles"><b>' + App.esc(t.topic) + "</b><span>" + App.fmtPosts(t.posts) + "</span></div></div>" +
        '<div style="padding:16px;border-bottom:1px solid var(--border);color:var(--text-dim)">' +
          App.esc(t.desc) + "</div>" +
        '<div id="exList">' + tweets.map(function (tw) { return App.tweetCard(tw); }).join("") + "</div>";
      App.on(root, "click", "[data-back]", function () { App.navigate("explore"); });
      App.wireTweetActions(root);
    }
  };
})(window.App);
