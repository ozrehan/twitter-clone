# X (Twitter) Clone

A pixel-faithful, fully interactive X/Twitter web client — dark theme, vanilla
HTML/CSS/JS, **no frameworks, no build step**. Open `index.html` from `file://`
or serve the folder with any static host.

## Features

- **Home** — For you / Following tabs, composer with 280-char progress ring,
  like (pink) / repost (green) / bookmark toggles, inline replies with nested threads
- **Tweet detail** — click any tweet for the full view: big text, stats, replies, back button
- **Explore** — 8 trends with live search; click a trend for description + related tweets
- **Notifications** — 15 seeded items (likes, reposts, follows, mentions) with All/Mentions tabs
- **Messages** — 6 conversations, working chat threads, typing indicator + auto-replies
- **Profile** — per-user pages (click any name/avatar): banner, bio, follower counts,
  follow/unfollow (counts update everywhere), Posts / Replies / Media / Likes tabs
- **Bookmarks & Communities** views, "More" menu, live trend search in the right rail
- 16 users, 32 realistic tweets, responsive (right rail hides <1100px, icon nav <700px)

## Project structure

```
twitter-clone/
├── index.html               # markup skeleton: #sidebar / #view / #widgets roots + assets
├── assets/
│   └── icons.svg            # SVG sprite (<symbol> per icon, referenced via <use>)
├── css/
│   ├── variables.css        # design tokens (colors, spacing, radii)
│   ├── base.css             # reset, typography, scrollbars
│   ├── layout.css           # 3-column grid + responsive breakpoints
│   ├── sidebar.css          # nav, Post button, user chip, More menu
│   ├── composer.css         # compose box + character ring
│   ├── tweet.css            # tweet cards, action rows, nested replies, big tweet
│   ├── widgets.css          # search, premium, trends, who-to-follow cards
│   └── views.css            # profile, messages, notifications, explore styles
└── js/                      # plain scripts, one global `App` namespace
    ├── utils/
    │   ├── dom.js           # App.icon / avatar / esc / event delegation
    │   └── format.js        # count formatting (1.2K), hashtag linkify
    ├── data/
    │   ├── users.js         # 16 users with bios + follower counts
    │   ├── tweets.js        # 32 realistic tweets
    │   ├── trends.js        # 8 trends + related tweets
    │   ├── notifications.js # 15 notifications
    │   └── messages.js      # 6 conversations + bot replies
    ├── store.js             # state: view, likes, follows, bookmarks + mutations
    ├── components/
    │   ├── sidebar.js       # nav with view router + unread badge
    │   ├── composer.js      # 280-char composer
    │   ├── tweet.js         # tweet card renderer + actions + inline reply
    │   ├── timeline.js      # home view (tabs + feed)
    │   ├── widgets.js       # right rail
    │   ├── explore.js       # explore + trend detail
    │   ├── notifications.js # notifications view
    │   ├── messages.js      # chat threads
    │   ├── profile.js       # profile pages
    │   └── tweetDetail.js   # tweet thread view
    └── app.js               # boot + router (bookmarks / communities views)
```

## How to run

No build, no install — just open the file:

```bash
# option 1: open directly
open index.html            # or double-click it

# option 2: serve locally
python3 -m http.server 8000
# then visit http://localhost:8000
```

Images are served by [picsum.photos](https://picsum.photos) (free placeholder
photos), so an internet connection is needed for avatars/tweet images.

## Notes

- Icons load from `assets/icons.svg` via `<use href="assets/icons.svg#i-...">`.
  This works on any static host; for `file://` use, serve over http if icons
  don't render in your browser.
- All state is in-memory (`js/store.js`) — refresh resets the demo.
