/* data/users.js — user directory. id is the canonical key; handle used for avatars. */
(function (App) {
  "use strict";

  App.USERS = [
    { id: "you", name: "Builder Dev", handle: "builder_dev", seed: "youavatar", verified: false,
      bio: "shipping side projects · learning in public", location: "Bengaluru, India",
      joined: "March 2021", followers: 1284, following: 342 },
    { id: "levelsio", name: "Pieter Levels", handle: "levelsio", seed: "levelsio", verified: true,
      bio: "founder @nomadlist @remoteok — 3 startups, $3M ARR, 0 employees", location: "Nomad",
      joined: "February 2010", followers: 512000, following: 891 },
    { id: "techwire", name: "TechWire", handle: "techwire", seed: "techwire", verified: true,
      bio: "breaking tech news, 24/7", location: "San Francisco",
      joined: "June 2015", followers: 2400000, following: 312 },
    { id: "memelord", name: "memelord", handle: "memelord", seed: "memelord", verified: false,
      bio: "professional poster", location: "",
      joined: "August 2019", followers: 89300, following: 1204 },
    { id: "cricketfeed", name: "Cricket Feed", handle: "cricketfeed", seed: "cricketfeed", verified: true,
      bio: "ball-by-ball cricket updates 🏏", location: "Mumbai",
      joined: "January 2016", followers: 1800000, following: 204 },
    { id: "ada_builds", name: "Dr. Ada Chen", handle: "ada_builds", seed: "adachen", verified: true,
      bio: "ML researcher · running 7B models on consumer GPUs", location: "Toronto",
      joined: "May 2018", followers: 234000, following: 567 },
    { id: "startupgrind", name: "Startup Grind", handle: "startupgrind", seed: "startupgrind", verified: false,
      bio: "unfiltered startup takes", location: "",
      joined: "November 2020", followers: 45200, following: 89 },
    { id: "spacefeed", name: "Space Feed", handle: "spacefeed", seed: "spacefeed", verified: true,
      bio: "rockets, rovers, and everything beyond", location: "Cape Canaveral",
      joined: "July 2017", followers: 3100000, following: 145 },
    { id: "showerthoughts", name: "shower thoughts", handle: "showerthoughts", verified: false,
      seed: "showerthoughts", bio: "thoughts from the shower", location: "",
      joined: "April 2014", followers: 670000, following: 3 },
    { id: "footballdaily", name: "Football Daily", handle: "footballdaily", seed: "footballdaily", verified: true,
      bio: "the beautiful game, every day ⚽", location: "London",
      joined: "September 2015", followers: 2900000, following: 421 },
    { id: "mlpapers", name: "ML Papers", handle: "mlpapers", seed: "mlpapers", verified: false,
      bio: "summarizing the papers so you don't have to", location: "",
      joined: "February 2022", followers: 156000, following: 231 },
    { id: "karpathy", name: "Andrej Karpathy", handle: "karpathy", seed: "karpathy", verified: true,
      bio: "ex-OpenAI, ex-Tesla AI. building @eureka_labs", location: "San Francisco",
      joined: "December 2012", followers: 1900000, following: 412 },
    { id: "github", name: "GitHub", handle: "github", seed: "githuborg", verified: true,
      bio: "how people build software", location: "San Francisco",
      joined: "February 2009", followers: 3900000, following: 118 },
    { id: "nasa", name: "NASA", handle: "NASA", seed: "nasaorg", verified: true,
      bio: "there's space for everybody ✨", location: "Washington, DC",
      joined: "December 2007", followers: 78000000, following: 231 },
    { id: "vercel", name: "Vercel", handle: "vercel", seed: "vercelorg", verified: true,
      bio: "develop. preview. ship.", location: "San Francisco",
      joined: "April 2020", followers: 890000, following: 96 },
    { id: "sama", name: "Sam Altman", handle: "sama", seed: "sama", verified: true,
      bio: "CEO, OpenAI", location: "San Francisco",
      joined: "March 2008", followers: 5200000, following: 301 },
  ];

  App.userById = function (id) {
    return App.USERS.find(function (u) { return u.id === id; }) || App.USERS[0];
  };
  App.userByHandle = function (handle) {
    return App.USERS.find(function (u) { return u.handle === handle; }) || App.USERS[0];
  };
})(window.App);
