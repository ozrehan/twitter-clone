/* components/explore.js — trends list + single-trend thread view (API-backed). */
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
        '<div id="exTrends"></div>' +
        '<div id="exResults"></div>';

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
      var deb = null;
      App.$("#exSearch", root).addEventListener("input", function (e) {
        var q = e.target.value.trim().toLowerCase();
        draw(q);
        /* live API search for posts/people as well */
        clearTimeout(deb);
        var slot = App.$("#exResults", root);
        if (!q) { slot.innerHTML = ""; return; }
        deb = setTimeout(function () {
          App.api.get("/api/search?q=" + encodeURIComponent(q)).then(function (res) {
            App.cacheUsers(res.users);
            App.cacheTweets(res.tweets);
            var html = "";
            if (res.users.length) {
              html += '<div class="view-head"><div class="titles"><b>People</b></div></div>' +
                res.users.map(function (u) {
                  return '<div class="row" data-suser="' + u.username + '">' +
                    '<img src="' + App.avatar(u.seed) + '" alt="">' +
                    '<div class="nm"><b>' + App.esc(u.name) + " " + (u.verified ? App.vbadge() : "") + "</b>" +
                    "<span>@" + u.handle + "</span></div></div>";
                }).join("");
            }
            if (res.tweets.length) {
              html += '<div class="view-head"><div class="titles"><b>Posts</b></div></div>' +
                res.tweets.map(function (t) { return App.tweetCard(t); }).join("");
            }
            slot.innerHTML = html || '<div class="empty-state"><h3>No results</h3></div>';
            App.wireTweetActions(slot);
          }).catch(function () { /* ignore */ });
        }, 300);
      });
      App.on(root, "click", "[data-trend]", function (e, el) {
        App.navigate("explore", +el.getAttribute("data-trend"));
      });
      App.on(root, "click", "[data-suser]", function (e, el) {
        App.navigate("profile", el.getAttribute("data-suser"));
      });
    } else {
      /* single trend: description + related tweets (fetched from API) */
      var t = App.TRENDS[idx];
      root.innerHTML =
        '<div class="view-head"><button class="back-btn" data-back>' + App.icon("back") + "</button>" +
          '<div class="titles"><b>' + App.esc(t.topic) + "</b><span>" + App.fmtPosts(t.posts) + "</span></div></div>" +
        '<div style="padding:16px;border-bottom:1px solid var(--border);color:var(--text-dim)">' +
          App.esc(t.desc) + "</div>" +
        '<div id="exList"><div class="ob-loading">Loading…</div></div>';
      App.on(root, "click", "[data-back]", function () { App.navigate("explore"); });

      Promise.all((t.tweets || []).map(function (id) {
        return App.api.get("/api/tweets/" + id).then(function (r) { return r.tweet; }).catch(function () { return null; });
      })).then(function (tweets) {
        App.cacheTweets(tweets.filter(Boolean));
        var slot = App.$("#exList", root);
        if (!slot) return;
        var list = tweets.filter(Boolean);
        slot.innerHTML = list.length
          ? list.map(function (tw) { return App.tweetCard(tw); }).join("")
          : '<div class="empty-state"><h3>No posts yet</h3></div>';
        App.wireTweetActions(root);
      });
    }
  };
})(window.App);
