/* components/composer.js — compose box with 280-char progress ring. */
(function (App) {
  "use strict";

  var LIMIT = 280;

  App.renderComposer = function (root) {
    var me = App.userById(App.store.currentUserId);
    root.innerHTML =
      '<div class="compose">' +
        '<img class="avatar" src="' + App.avatar(me.seed) + '" alt="' + App.esc(me.name) + '">' +
        '<div class="compose-body">' +
          '<div class="compose-input" id="composeInput" contenteditable="true"></div>' +
          '<div class="compose-tools">' +
            '<div class="compose-icons">' +
              ["image", "gif", "poll", "emoji", "calendar", "location"].map(function (ic) {
                return '<button class="icon-btn" title="' + ic + '">' + App.icon(ic) + "</button>";
              }).join("") +
            "</div>" +
            '<div class="compose-submit">' +
              '<svg class="char-ring" id="charRing" viewBox="0 0 28 28">' +
                '<circle class="track" cx="14" cy="14" r="11" fill="none" stroke-width="2"/>' +
                '<circle class="prog" id="charProg" cx="14" cy="14" r="11" fill="none" stroke-width="2" ' +
                  'stroke-dasharray="69.1" stroke-dashoffset="69.1"/>' +
              "</svg>" +
              '<span class="char-count" id="charCount"></span>' +
              '<button class="post-btn" id="postBtn" disabled>Post</button>' +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>";

    var input = App.$("#composeInput", root);
    var postBtn = App.$("#postBtn", root);
    var ring = App.$("#charRing", root);
    var prog = App.$("#charProg", root);
    var count = App.$("#charCount", root);
    var CIRC = 69.1;

    function refresh() {
      var len = input.textContent.length;
      postBtn.disabled = len === 0 || len > LIMIT;
      if (len === 0) { ring.classList.remove("show"); count.classList.remove("show"); return; }
      ring.classList.add("show");
      var frac = Math.min(len / LIMIT, 1);
      prog.style.strokeDashoffset = String(CIRC * (1 - frac));
      ring.classList.toggle("warn", len > LIMIT - 20 && len <= LIMIT);
      ring.classList.toggle("over", len > LIMIT);
      if (len > LIMIT - 20 || len > LIMIT) {
        count.classList.add("show");
        count.textContent = String(LIMIT - len);
      } else count.classList.remove("show");
    }

    input.addEventListener("input", refresh);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); postBtn.click(); }
    });
    postBtn.addEventListener("click", function () {
      var text = input.textContent.trim();
      if (!text || text.length > LIMIT) return;
      App.postTweet(text);
      input.textContent = "";
      refresh();
      if (App.store.view !== "home" || App.store.homeTab !== "foryou") {
        App.store.homeTab = "foryou";
        App.navigate("home");
      } else App.render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };
})(window.App);
