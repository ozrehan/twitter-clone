/* utils/dom.js — shared DOM helpers. Creates the global App namespace. */
window.App = window.App || {};
(function (App) {
  "use strict";

  /** <svg class="icon ..."><use href="assets/icons.svg#i-NAME"/></svg> */
  App.icon = function (name, cls) {
    return '<svg class="icon' + (cls ? " " + cls : "") + '" aria-hidden="true">' +
      '<use href="assets/icons.svg#i-' + name + '"></use></svg>';
  };

  /** picsum avatar url for a seed */
  App.avatar = function (seed, size) {
    size = size || 80;
    return "https://picsum.photos/seed/" + seed + "/" + size + "/" + size;
  };

  /** escape user text for safe HTML injection */
  App.esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  /** verified badge markup */
  App.vbadge = function () {
    return '<svg class="vbadge" aria-label="Verified"><use href="assets/icons.svg#i-verified"/></svg>';
  };

  /** query helper */
  App.$ = function (sel, root) { return (root || document).querySelector(sel); };
  App.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /** delegate clicks: root.addEventListener via App.on(root, "click", ".sel", fn) */
  App.on = function (root, evt, sel, fn) {
    root.addEventListener(evt, function (e) {
      var t = e.target.closest(sel);
      if (t && root.contains(t)) fn(e, t);
    });
  };
})(window.App);
