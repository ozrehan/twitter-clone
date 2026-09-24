# X Clone

A pixel-faithful **X (Twitter) dark-mode clone** in a single self-contained file.
Vanilla HTML + CSS + JS — no frameworks, no build step, no external JS libraries.
Images come only from `picsum.photos`.

## Features

- **3-column layout** (max-width 1265px): left nav, 600px center feed, 350px right sidebar
- **Left nav**: X logo + inline SVG icons — Home (active), Explore, Notifications,
  Messages, Bookmarks, Communities, Profile, More — big white **Post** pill button
- **Center**: sticky **For you / Following** tabs with underline indicator,
  compose box ("What is happening?!" placeholder, icon row, Post button that
  enables only when you type), 10 realistic tweets (AI, startups, memes, sports)
- **Tweet cards**: avatars + optional images from picsum, verified blue badges,
  `#hashtags` in blue, reply/repost/like/views counts formatted like `1.2K`, `45K`
- **Working interactions**:
  - Like → pink heart toggle with live count
  - Repost → green toggle with live count
  - Reply icon → inline reply box; submitting adds a nested reply under the tweet
  - Follow buttons toggle to "Following"
  - Following tab filters the timeline to followed accounts
  - Posting prepends your tweet to the top of the feed
- **Right sidebar**: search pill, Subscribe to Premium card, What's happening
  trends (5 rows), Who to follow (3 rows)
- Responsive: right sidebar hides under 1100px, nav collapses to icons under 700px

## Run

Just open it — works from `file://` and any static host:

```bash
open ~/workspace/twitter-clone/index.html
# or
python3 -m http.server 8000   # then visit http://localhost:8000 in the folder
```

## Files

- `index.html` — everything (CSS + JS inline), commented
- `README.md` — this file
