/* data/notifications.js — 15 notifications: like / repost / follow / mention. */
(function (App) {
  "use strict";

  /* type: like | repost | follow | mention ; ref: tweet id for like/repost/mention */
  App.NOTIFS = [
    { id: 1, type: "like", userId: "levelsio", time: "2m", ref: 20 },
    { id: 2, type: "follow", userId: "karpathy", time: "18m" },
    { id: 3, type: "mention", userId: "ada_builds", time: "44m", ref: 5, text: "cc @builder_dev you'd love this setup" },
    { id: 4, type: "like", userId: "memelord", time: "1h", ref: 20 },
    { id: 5, type: "repost", userId: "startupgrind", time: "2h", ref: 20 },
    { id: 6, type: "like", userId: "mlpapers", time: "3h", ref: 20 },
    { id: 7, type: "follow", userId: "vercel", time: "5h" },
    { id: 8, type: "mention", userId: "levelsio", time: "6h", ref: 1, text: "@builder_dev cabin arc when" },
    { id: 9, type: "like", userId: "showerthoughts", time: "8h", ref: 20 },
    { id: 10, type: "follow", userId: "nasa", time: "12h" },
    { id: 11, type: "repost", userId: "techwire", time: "14h", ref: 20 },
    { id: 12, type: "like", userId: "footballdaily", time: "1d", ref: 20 },
    { id: 13, type: "mention", userId: "karpathy", time: "1d", ref: 30, text: "@builder_dev backprop arc continues" },
    { id: 14, type: "follow", userId: "github", time: "2d" },
    { id: 15, type: "like", userId: "cricketfeed", time: "2d", ref: 20 },
  ];
})(window.App);
