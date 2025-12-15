# AiQMateTube — Clean UI + Vertical Reels (React + Vite)

A polished video app demo with **Home**, **Reels**, **History**, **Subscriptions**, and **Profile** — plus **Upload** and **Record**. Clean grid UI on Home and a TikTok/Shorts-style **vertical Reels feed** that auto-plays each video as you scroll.

## Highlights

- **No overlap**: Home uses a resilient CSS Grid (`minmax(320px, 1fr)`) and wrapped controls to avoid card overlap at any width.
- **Reels redesigned**: Full-height **vertical scroller** with `scroll-snap`, auto-play/pause on visibility, loop, mute/unmute overlay, and quick subscribe actions.
- **Upload or Record**: Choose file or record from camera/mic, then pick **Regular** or **Reel**.
- **Home & Reels**: New videos appear in both tabs. Reels page has a toggle to show **Only Reels** if you want filtering.
- **History**: Added when you watch ~5s or ≥50% of a video (works in both the player and the reels feed).
- **Subscriptions**: Subscribe to channels and see them in the Subscriptions tab.
- **Local persistence** only (`localStorage` + `IndexedDB`).

## Run

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

> Recording via MediaRecorder works on secure contexts; `localhost` is OK.

## Structure

```
AiQMatetube-vertical-reels/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── styles.css
    ├── assets/
    │   └── AiQMatetube-logo.svg
    ├── components/
    │   ├── AddVideoModal.jsx
    │   ├── Header.jsx
    │   ├── Recorder.jsx
    │   ├── ReelsViewer.jsx
    │   ├── Sidebar.jsx
    │   ├── VideoCard.jsx
    │   ├── VideoGrid.jsx
    │   └── VideoPlayer.jsx
    ├── pages/
    │   ├── History.jsx
    │   ├── Home.jsx
    │   ├── Profile.jsx
    │   ├── Reels.jsx
    │   └── Subscriptions.jsx
    └── utils/
        ├── idb.js
        └── storage.js
```

## Sample clip

App seeds the same hosted test video twice (once as **Regular**, once as **Reel**) so you can test both flows immediately.
