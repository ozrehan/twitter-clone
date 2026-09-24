/* data/trends.js — 8 trends, each linking to related tweet ids. */
(function (App) {
  "use strict";

  App.TRENDS = [
    { cat: "Technology · Trending", topic: "GPT-6", posts: 128400, desc: "OpenAI's new model with native video reasoning is rolling out.", tweets: [2, 14] },
    { cat: "Sports · Trending", topic: "Kohli", posts: 89400, desc: "82* off 51 balls — India chase down 189 at the Wankhede.", tweets: [4, 22] },
    { cat: "Science · Live", topic: "Starship Flight 9", posts: 45200, desc: "Successful splashdown in the Indian Ocean, all 33 engines nominal.", tweets: [7] },
    { cat: "Trending in India", topic: "#BuildInPublic", posts: 12100, desc: "Founders sharing revenue, code, and lessons in the open.", tweets: [1, 17, 20] },
    { cat: "Sports · Trending", topic: "El Clásico", posts: 210000, desc: "Bellingham's 93rd-minute winner decides it at the Bernabéu.", tweets: [9] },
    { cat: "Technology · Trending", topic: "#MachineLearning", posts: 67300, desc: "Linear-time attention, bedroom GPUs, and micrograd weekends.", tweets: [5, 10, 15, 30] },
    { cat: "Space · Trending", topic: "Artemis", posts: 38900, desc: "NASA's crew is suited up — next stop: the Moon.", tweets: [28] },
    { cat: "Trending", topic: "here we go", posts: 54200, desc: "Transfer saga ends — medical booked for Monday morning.", tweets: [23] },
  ];

  App.fmtPosts = function (n) { return App.fmt(n) + " posts"; };
})(window.App);
