# X (Twitter) Clone — full-stack

A pixel-faithful X/Twitter web client **with a real backend**: accounts,
persistent tweets/likes/follows/bookmarks/DMs, notifications generated from
real events. Frontend is vanilla HTML/CSS/JS (no frameworks, no build step);
backend is one Netlify Function + Netlify Blobs.

## What works (for real now)

- **Accounts** — sign up / log in (passwords hashed with scrypt, 30-day
  session tokens). Demo login: username `you`, password `password`
  (any seeded account works with password `password`).
- **Post / reply / delete** — 280 chars enforced server-side; your posts
  survive refresh and appear for every account.
- **Like / repost / bookmark** — toggles persist across reloads and accounts.
- **Follow / unfollow** — follower counts update everywhere, instantly.
- **Notifications** — generated from real likes, reposts, follows and
  @mentions of your posts (All / Mentions tabs).
- **DMs** — persistent conversations; seeded bot accounts auto-reply so it
  feels alive; unread badges.
- **Onboarding** — new signups pick who to follow before entering the app.
- **Explore** — 8 trends + live API search across people and posts.
- Two accounts in two browsers can follow, like, mention and DM each other.

## Project structure

```
twitter-clone/
├── index.html               # markup skeleton: #sidebar / #view / #widgets roots + assets
├── netlify.toml             # routes /api/* -> the api function (no build step)
├── netlify/functions/
│   ├── api.js               # THE backend: one function, manual routing, JSON API
│   ├── api.test.js          # 23 backend tests (pure node, no network) — `node api.test.js`
│   ├── seed.js              # first-request seeder (users/tweets/follows/notifs/DMs)
│   ├── seed-data.js         # generated seed content (from the original demo data)
│   ├── package.json
│   └── node_modules/@netlify/blobs  # vendored — ships inside the deploy zip
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
│   ├── views.css            # profile, messages, notifications, explore styles
│   └── auth.css             # login/signup + onboarding screens
└── js/                      # plain scripts, one global `App` namespace
    ├── utils/
    │   ├── dom.js           # App.icon / avatar / esc / event delegation
    │   └── format.js        # count formatting (1.2K), hashtag linkify
    ├── api.js               # fetch wrapper (token from localStorage `x_token`)
    ├── store.js             # API-backed state: view + loaders + mutations
    ├── components/
    │   ├── auth.js          # login/signup split screen + who-to-follow onboarding
    │   ├── sidebar.js       # nav with view router + unread badge + log out
    │   ├── composer.js      # 280-char composer (posts via API)
    │   ├── tweet.js         # tweet card renderer + actions + inline reply + delete
    │   ├── timeline.js      # home view (tabs + feed)
    │   ├── widgets.js       # right rail
    │   ├── explore.js       # explore + trend detail + API search
    │   ├── notifications.js # notifications view (live from API)
    │   ├── messages.js      # persistent chat threads
    │   ├── profile.js       # profile pages (live counts, follow, tabs)
    │   └── tweetDetail.js   # tweet thread view
    └── app.js               # auth-gated boot + router
```

## API (all JSON, `Authorization: Bearer <token>` except auth)

| Method | Path | Notes |
|---|---|---|
| POST | /api/auth/signup `{username,password,name}` | → `{token, user, newUser}` |
| POST | /api/auth/login `{username,password}` | → `{token, user}` |
| GET | /api/me | current user |
| GET | /api/users | directory (who-to-follow) |
| GET | /api/users/:username | profile + counts + tweets |
| GET | /api/users/:username/replies | tweets they replied to |
| POST | /api/users/:username/follow | toggle |
| GET | /api/follows | usernames I follow |
| GET | /api/timeline?tab=foryou\|following\|bookmarks\|likes&before=<id> | enriched tweets |
| GET | /api/tweets/:id | tweet + author context |
| POST | /api/tweets `{text, replyTo?}` | 280 enforced |
| POST | /api/tweets/:id/like\|repost\|bookmark | toggle → `{on, count}` |
| DELETE | /api/tweets/:id | own only |
| GET | /api/notifications | likes/reposts/follows/mentions |
| GET | /api/trends | static trends |
| GET | /api/search?q= | users + tweets |
| GET | /api/dm | conversation list + unread |
| GET | /api/dm/:username | thread (clears unread) |
| POST | /api/dm/:username `{text}` | bot users auto-reply |

Storage keys in the `twitter` blob store: `users/*`, `tweets/*`, `tweetlist`,
`likes|reposts|bookmarks|follows/*/*`, `notifs/*/*`, `dms/*`, `dmunread/*/*`,
`sessions/*`, `meta/seeded`, `meta/seq`.

## How to run

**Deployed (full experience):** the site must be served from Netlify (or any
host that runs the function) — the frontend calls `/api/*`, which
`netlify.toml` rewrites to the function. Deploy the folder as-is (functions
directory is `netlify/functions`; `node_modules` is vendored, no build needed).

```bash
# run the backend tests
cd netlify/functions && node api.test.js

# local frontend-only preview (API calls will fail gracefully to the login screen)
python3 -m http.server 8000
```

Images are served by [picsum.photos](https://picsum.photos) (free placeholder
photos), so an internet connection is needed for avatars/tweet images.

## Notes

- Icons load from `assets/icons.svg` via `<use href="assets/icons.svg#i-...">`.
  This works on any static host; for `file://` use, serve over http if icons
  don't render in your browser.
- First API request seeds the blob store (16 users, 32 tweets, follows,
  notifications, DM histories). Seeded accounts log in with password `password`.
- Without a deployed backend the app shows the login screen with a
  "cannot reach server" message — the UI is unchanged otherwise.
