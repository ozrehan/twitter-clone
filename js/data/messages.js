/* data/messages.js — 6 conversations with realistic histories. */
(function (App) {
  "use strict";

  /* dir: "in" | "out" */
  App.CONVOS = [
    { id: "c1", userId: "levelsio", unread: 2, online: "Active now",
      messages: [
        { dir: "in", text: "saw your X clone — vanilla JS, respect", time: "10:24" },
        { dir: "out", text: "thanks! day 12, still no frameworks", time: "10:31" },
        { dir: "in", text: "ship it to 2M users from a cabin next", time: "10:33" },
        { dir: "in", text: "that's the whole roadmap", time: "10:33" },
      ] },
    { id: "c2", userId: "ada_builds", unread: 0, online: "Active 1h ago",
      messages: [
        { dir: "out", text: "what batch size did you use for the 7B run?", time: "Yesterday" },
        { dir: "in", text: "512 with grad accumulation, fp8", time: "Yesterday" },
        { dir: "in", text: "single 4090, can you believe it", time: "Yesterday" },
        { dir: "out", text: "the future is gloriously decentralized indeed", time: "Yesterday" },
      ] },
    { id: "c3", userId: "memelord", unread: 0, online: "Active now",
      messages: [
        { dir: "in", text: "new meme just dropped", time: "09:12" },
        { dir: "in", text: "POV: you said 'quick call?' and it's been 47 minutes", time: "09:12" },
        { dir: "out", text: "💀 posting this immediately", time: "09:20" },
      ] },
    { id: "c4", userId: "karpathy", unread: 1, online: "Active 5m ago",
      messages: [
        { dir: "in", text: "the hottest new programming language is english", time: "12:04" },
        { dir: "out", text: "so my prompt engineering degree finally pays off", time: "12:09" },
        { dir: "in", text: "micrograd in 100 lines next, I believe in you", time: "12:11" },
      ] },
    { id: "c5", userId: "startupgrind", unread: 0, online: "Active 3h ago",
      messages: [
        { dir: "out", text: "is 10 slides really enough for a deck?", time: "Monday" },
        { dir: "in", text: "10 slides + a working demo beats 40 slides of fonts, every time", time: "Monday" },
        { dir: "out", text: "noted. building the demo first", time: "Monday" },
      ] },
    { id: "c6", userId: "techwire", unread: 0, online: "Active yesterday",
      messages: [
        { dir: "in", text: "want an early peek at the GPT-6 demo notes?", time: "Yesterday" },
        { dir: "out", text: "absolutely. embargo respected 🤝", time: "Yesterday" },
        { dir: "in", text: "sending the doc now", time: "Yesterday" },
      ] },
  ];

  /* canned auto-replies for the demo chat bot */
  App.BOT_REPLIES = [
    "haha exactly",
    "ok that's actually a great point",
    "wait, tell me more",
    "🔥🔥🔥",
    "shipping it",
    "lol true",
    "let's sync on this tomorrow?",
  ];
})(window.App);
