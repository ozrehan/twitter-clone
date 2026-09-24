"use strict";
// Seed data for the X clone demo — all fictional accounts.
// Demo login: username "you", password "password".
module.exports = {"USERS":[
{"id":"you","name":"Builder Dev","handle":"builder_dev","seed":"youavatar","verified":false,"bio":"shipping side projects · learning in public","location":"Bengaluru, India","joined":"March 2021","followers":1284,"following":342},
{"id":"pixelpete","name":"Pete Pixels","handle":"pixelpete","seed":"pixelpete","verified":true,"bio":"photographer · design nerd","location":"Lisbon","joined":"June 2018","followers":48200,"following":315},
{"id":"buildr","name":"Ada Builder","handle":"buildr","seed":"buildr","verified":true,"bio":"indie hacker · shipping tiny useful things","location":"Remote","joined":"January 2020","followers":96400,"following":402},
{"id":"novadev","name":"Nova Dev","handle":"novadev","seed":"novadev","verified":false,"bio":"ML tinkerer · open source enjoyer","location":"Toronto","joined":"May 2021","followers":23100,"following":518}
],"TWEETS":[
{"id":1,"userId":"pixelpete","time":"2h","text":"Just shipped a new photo preset pack. Golden hour has never looked this good.","img":null,"replies":48,"reposts":320,"likes":4100,"views":98000,"nested":[{"userId":"you","time":"1h","text":"these tones are unreal"}]},
{"id":2,"userId":"buildr","time":"45m","text":"day 47 of building in public: the auth system finally works. never underestimate a login form.","img":null,"replies":96,"reposts":890,"likes":9200,"views":210000,"nested":[]},
{"id":3,"userId":"novadev","time":"1h","text":"trained a tiny model on my laptop and it actually works. the future is local.","img":null,"replies":210,"reposts":2400,"likes":18700,"views":640000,"nested":[]},
{"id":4,"userId":"pixelpete","time":"5h","text":"design tip: whitespace is not empty space. it is breathing room for your ideas.","img":null,"replies":34,"reposts":1500,"likes":12300,"views":310000,"nested":[]},
{"id":5,"userId":"buildr","time":"3h","text":"refactored 2,000 lines into 200 today. deleting code is the best feeling.","img":null,"replies":188,"reposts":3100,"likes":27600,"views":720000,"nested":[{"userId":"novadev","time":"2h","text":"the best code is no code"}]},
{"id":6,"userId":"novadev","time":"7h","text":"hot take: AI will not replace developers. developers using AI will replace developers who do not.","img":null,"replies":340,"reposts":5200,"likes":38900,"views":1400000,"nested":[]},
{"id":7,"userId":"you","time":"4h","text":"day 12 of rebuilding X from scratch in vanilla JS. no frameworks, no build step. the timeline renders, likes work, and i only cried twice. #buildinpublic","img":null,"replies":12,"reposts":45,"likes":312,"views":8900,"nested":[{"userId":"buildr","time":"3h","text":"vanilla JS respect"},{"userId":"you","time":"3h","text":"@buildr shipping arc when"}]},
{"id":8,"userId":"pixelpete","time":"9h","text":"shot 400 photos today, kept 12. that is the job.","img":null,"replies":22,"reposts":640,"likes":5800,"views":142000,"nested":[]},
{"id":9,"userId":"buildr","time":"1d","text":"unpopular opinion: you do not need product-market fit, you need 10 people who would riot if you shut down.","img":null,"replies":410,"reposts":6800,"likes":54200,"views":1900000,"nested":[]},
{"id":10,"userId":"novadev","time":"1d","text":"just open-sourced my side project. stars are nice, but issues are where the love is.","img":null,"replies":150,"reposts":1900,"likes":16400,"views":480000,"nested":[{"userId":"buildr","time":"20h","text":"link? 👀"},{"userId":"novadev","time":"19h","text":"@buildr in the bio, go break it"}]},
{"id":11,"userId":"pixelpete","time":"1d","text":"a group chat where nobody replies is just a diary with extra steps.","img":null,"replies":96,"reposts":4200,"likes":31800,"views":890000,"nested":[]},
{"id":12,"userId":"buildr","time":"2d","text":"founder tip: if your landing page needs a 3-minute explainer video, your product needs a redesign.","img":null,"replies":88,"reposts":2100,"likes":15400,"views":402000,"nested":[]}
],"TRENDS":[
{"cat":"Technology · Trending","topic":"#BuildInPublic","posts":12100,"desc":"Founders sharing revenue, code, and lessons in the open.","tweets":[2,7]},
{"cat":"Design · Trending","topic":"Golden Hour","posts":8400,"desc":"Photographers sharing their best light.","tweets":[1]},
{"cat":"Technology · Trending","topic":"Local AI","posts":31200,"desc":"Small models running on laptops are having a moment.","tweets":[3,10]},
{"cat":"Startups · Trending","topic":"Indie Hacking","posts":15600,"desc":"Tiny teams, tiny tools, real revenue.","tweets":[5,9,12]}
],"NOTIFS":[
{"id":1,"type":"like","userId":"buildr","time":"2m","ref":7},
{"id":2,"type":"follow","userId":"novadev","time":"18m"},
{"id":3,"type":"mention","userId":"pixelpete","time":"44m","ref":1,"text":"cc @builder_dev you would love these tones"},
{"id":4,"type":"like","userId":"pixelpete","time":"1h","ref":7},
{"id":5,"type":"repost","userId":"novadev","time":"2h","ref":7},
{"id":6,"type":"follow","userId":"buildr","time":"5h"}
],"CONVOS":[
{"id":"c1","userId":"buildr","unread":1,"online":"Active now","messages":[{"dir":"in","text":"saw your X clone — vanilla JS, respect","time":"10:24"},{"dir":"out","text":"thanks! day 12, still no frameworks","time":"10:31"},{"dir":"in","text":"ship it, then write the postmortem","time":"10:33"}]},
{"id":"c2","userId":"novadev","unread":0,"online":"Active 1h ago","messages":[{"dir":"out","text":"what batch size for the tiny model?","time":"Yesterday"},{"dir":"in","text":"tiny batch, big patience","time":"Yesterday"},{"dir":"out","text":"the future is gloriously local indeed","time":"Yesterday"}]},
{"id":"c3","userId":"pixelpete","unread":0,"online":"Active 3h ago","messages":[{"dir":"in","text":"new preset pack just dropped","time":"09:12"},{"dir":"out","text":"golden hour pack? instant buy","time":"09:20"}]}
],"BOT_REPLIES":["haha exactly","ok that is actually a great point","wait, tell me more","shipping it","lol true","let us sync on this tomorrow?"]};
