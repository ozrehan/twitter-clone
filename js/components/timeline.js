/* components/timeline.js — home view: For you / Following tabs + composer + feed. */
(function (App) {
  "use strict";

  App.renderHome = function (root) {
    var S = App.store;
    root.innerHTML =
      '<div class="tabs">' +
        '<div class="tab' + (S.homeTab === "foryou" ? " active" : "") + '" data-htab="foryou"><span>For you</span></div>' +
        '<div class="tab' + (S.homeTab === "following" ? " active" : "") + '" data-htab="following"><span>Following</span></div>' +
      "</div>" +
      '<div id="composerSlot"></div>' +
      '<div id="timeline"></div>';

    App.renderComposer(App.$("#composerSlot", root));

    App.on(root, "click", "[data-htab]", async function (e, tab) {
      S.homeTab = tab.getAttribute("data-htab");
      try { await App.loadTimeline(); } catch (err) { /* keep old list */ }
      App.render();
    });

    renderList(App.$("#timeline", root));
    App.wireTweetActions(root);
  };

  function renderList(slot) {
    var list = App.visibleTweets();
    slot.innerHTML = list.length
      ? list.map(function (t) { return App.tweetCard(t); }).join("")
      : '<div class="empty-state"><h3>No posts yet</h3><p>Follow more accounts to fill your timeline.</p></div>';
  }
})(window.App);
