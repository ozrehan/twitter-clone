/* data/tweets.js — 32 realistic seed tweets. img is a picsum seed (or null). */
(function (App) {
  "use strict";

  var T = function (id, userId, time, text, img, replies, reposts, likes, views, nested) {
    return { id: id, userId: userId, time: time, text: text,
      img: img ? "https://picsum.photos/seed/" + img + "/600/340" : null,
      replies: replies, reposts: reposts, likes: likes, views: views, nested: nested || [] };
  };
  var N = function (userId, time, text) { return { userId: userId, time: time, text: text }; };

  App.TWEETS = [
    /* ---- original 10, preserved ---- */
    T(1, "levelsio", "2h", "shipped a new feature to 2M users from a cabin in the woods. no meetings. no standup. just code. #buildinpublic #indiehacker",
      null, 892, 4500, 45200, 1200000, [N("you", "1h", "this is the dream setup honestly")]),
    T(2, "techwire", "45m", "BREAKING: OpenAI announces GPT-6 with native video reasoning, rolling out to Plus users today. Live demo at 10am PT. #AI #OpenAI",
      "ainews", 2100, 12800, 89400, 8400000),
    T(3, "memelord", "1h", "me: i'll just check one notification\nmy screen time at 3am:",
      "memephone", 3400, 21000, 156000, 12000000),
    T(4, "cricketfeed", "3h", "KOHLI DOES IT AGAIN. 82* off 51 balls as India chase down 189 with 2 balls to spare. What a finish at the Wankhede! #INDvAUS #Cricket",
      null, 5600, 18400, 203000, 15000000),
    T(5, "ada_builds", "5h", "trained a 7B parameter model on a single 4090 in my bedroom. loss curves are beautiful. the future is gloriously decentralized. #MachineLearning #opensource",
      "gpumodel", 1200, 9800, 67200, 3100000,
      [N("mlpapers", "4h", "what was your batch size? 👀"), N("ada_builds", "4h", "@mlpapers 512 with grad accumulation, fp8")]),
    T(6, "startupgrind", "7h", "hot take: the best pitch deck is 10 slides and a working demo. everything else is decoration. investors fund traction, not fonts.",
      null, 445, 3200, 18900, 890000),
    T(7, "spacefeed", "9h", "Starship Flight 9: successful splashdown in the Indian Ocean. All 33 engines nominal. Mars is officially on the calendar. #SpaceX #Starship",
      "starship", 8900, 45200, 389000, 28000000),
    T(8, "showerthoughts", "12h", "a group chat where nobody replies is just a diary with extra steps",
      null, 2100, 15600, 98400, 6700000),
    T(9, "footballdaily", "14h", "BELLINGHAM. 93RD MINUTE. El Clásico decided at the death — absolute scenes at the Bernabéu! #ElClasico #RealMadrid",
      null, 7300, 28900, 245000, 19000000),
    T(10, "mlpapers", "1d", "new paper: linear-time attention with no approximation loss. benchmarks show 40x speedup on 128k context. code drops Friday. #MachineLearning #LLM",
      null, 678, 5400, 31200, 1400000),

    /* ---- tech ---- */
    T(11, "karpathy", "3h", "the hottest new programming language is english",
      null, 3400, 18900, 142000, 9100000),
    T(12, "vercel", "6h", "v0 just got 10x faster. describe it, ship it. what are you building this weekend? #webdev",
      "vercelship", 890, 6700, 42100, 2300000),
    T(13, "github", "8h", "🎉 GitHub Copilot is now free for all developers. 55M+ devs, one very tired autocomplete.",
      null, 5600, 23400, 187000, 12400000),
    T(14, "sama", "10h", "intelligence too cheap to meter is the whole ballgame",
      null, 4100, 15200, 98300, 7800000),
    T(15, "ada_builds", "1d", "day 47 of training on one GPU: the model just wrote a haiku about gradient descent. we're so back. #MachineLearning",
      null, 567, 4300, 28900, 1100000),
    T(16, "techwire", "1d", "Apple unveils M5 Ultra: 32-core CPU, 80-core GPU, and it still doesn't have a fan. #AppleEvent",
      "applechip", 2800, 11400, 76200, 6900000),
    T(17, "levelsio", "1d", "revenue update: $312k MRR. expenses: $4k/mo server + $200 coffee. the indie math keeps mathing. #buildinpublic",
      null, 1200, 8900, 67800, 3400000),
    T(18, "mlpapers", "2d", "transformers are just really expensive autocomplete and yet here we are, rebuilding civilization on them",
      null, 1890, 12300, 89400, 5600000),

    /* ---- startups / build in public ---- */
    T(19, "startupgrind", "2d", "founder tip: if your landing page needs a 3-minute explainer video, your product needs a redesign",
      null, 334, 2100, 12400, 456000),
    T(20, "you", "4h", "day 12 of rebuilding X from scratch in vanilla JS. no frameworks, no build step. the timeline renders, likes work, and i only cried twice. #buildinpublic",
      null, 12, 45, 312, 8900,
      [N("levelsio", "3h", "vanilla JS respect 🫡"), N("you", "3h", "@levelsio cabin arc when")]),
    T(21, "levelsio", "2d", "unpopular opinion: you don't need product-market fit, you need 10 people who would riot if you shut down",
      null, 2100, 15600, 112000, 6700000),

    /* ---- sports ---- */
    T(22, "cricketfeed", "5h", "BUMRAH. YORKER. MIDDLE STUMP OUT OF THE GROUND. Australia 9 down, India need 12 off 18. I can't breathe. #INDvAUS",
      null, 4200, 16700, 156000, 11200000),
    T(23, "footballdaily", "1d", "transfer exclusive: the saga ends. medical booked for Monday morning. here we go confirmed ✍️",
      null, 9100, 34500, 287000, 21000000),
    T(24, "spacefeed", "2d", "photo of the day: Earth rising over the lunar horizon, captured by the Artemis crew. zoom in. that's home. 🌍",
      "earthrise", 6700, 38900, 312000, 18900000),

    /* ---- memes / fun ---- */
    T(25, "memelord", "6h", "my code works on the first try\nnobody:\nabsolutely nobody:\nme: what did i break",
      "codememe", 1800, 13400, 87600, 5400000),
    T(26, "showerthoughts", "1d", "your keyboard's spacebar has seen things",
      null, 1500, 11200, 76500, 4300000),
    T(27, "memelord", "2d", "POV: you said 'quick call?' and it's been 47 minutes",
      null, 2900, 19800, 134000, 9800000),

    /* ---- NASA / science ---- */
    T(28, "nasa", "7h", "we're going back. Artemis II crew is suited up and the countdown is on. next stop: the Moon. 🌙 #Artemis",
      "artemis", 12400, 67800, 892000, 45000000),
    T(29, "nasa", "2d", "this is what 4.5 billion years of practice looks like. Webb's newest deep field just dropped ✨ #JWST",
      "webbdeep", 8900, 54300, 654000, 38000000),

    /* ---- more tech talk ---- */
    T(30, "karpathy", "1d", "wrote a tiny autodiff engine from scratch this weekend. 100 lines. backprop finally clicked for 3 of my neurons",
      null, 2300, 14500, 98700, 4500000,
      [N("ada_builds", "20h", "micrograd arc never ends")]),
    T(31, "startupgrind", "3d", "VCs in 2021: 'what's your TAM?'\nVCs in 2026: 'but does it have agents?'",
      null, 1890, 16700, 123000, 7800000),
    T(32, "techwire", "3d", "the cloud is just someone else's computer until the bill arrives 💸",
      null, 1200, 8900, 56700, 3200000),
  ];

  App.tweetById = function (id) {
    return App.TWEETS.find(function (t) { return t.id === id; });
  };
  App.tweetsByUser = function (userId) {
    return App.TWEETS.filter(function (t) { return t.userId === userId; });
  };
  App.tweetImg = function (t, w, h) { return t.img; };
})(window.App);
