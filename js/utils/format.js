/* utils/format.js — number + text formatting, X-style. */
(function (App) {
  "use strict";

  /** format counts like X: 892 -> "892", 1200 -> "1.2K", 45000 -> "45K", 1.2M */
  App.fmt = function (n) {
    n = Number(n) || 0;
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return String(n);
  };

  /** full count with commas for detail views: 12800 -> "12,800" */
  App.fmtFull = function (n) { return (Number(n) || 0).toLocaleString("en-US"); };

  /** turn #hashtags and @mentions into blue spans (text is escaped first) */
  App.linkify = function (text) {
    return App.esc(text)
      .replace(/(#[\p{L}\p{N}_]+)/gu, '<span class="tag" data-tag="$1">$1</span>')
      .replace(/(@[\w]+)/g, '<span class="tag" data-mention="$1">$1</span>');
  };

  /** line breaks */
  App.nl2br = function (html) { return html.replace(/\n/g, "<br>"); };
})(window.App);
