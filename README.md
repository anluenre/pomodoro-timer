# Pomodoro Timer

A minimal Pomodoro timer website. Built as plain HTML/CSS/JS — no build step, deploys directly to Vercel.

## Local setup

```bash
# Serve locally (any static server works)
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

> **Do not open index.html directly as a file:// URL** — the browser will block audio and image loading. Always use a local server.

## Adding images

Place your `.webp` image files in `public/images/`. The filenames must match exactly what's listed at the top of `app.js`:

```
public/images/Image 1 - Tomato.webp
public/images/Image 2 - Fig.webp
...
public/images/Imsge 23 - candy.webp   ← original filename has a typo, keep it
```

To swap an image: replace the file and update the matching entry in the `IMAGES` array in `app.js`.

To add more images: drop the file in `public/images/` and add the filename to the `IMAGES` array.

## Replacing the alarm sound

The alarm loads from GitHub at runtime:

```js
// app.js line ~14
const SOUND_URL = "https://raw.githubusercontent.com/anluenre/Pomodoro-timer/main/timer-finished.mp3";
```

To use a local file instead, place `timer-finished.mp3` in the project root and change the line to:

```js
const SOUND_URL = "./timer-finished.mp3";
```

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. Framework Preset: **Other** (no framework).
4. Leave all build settings blank — Vercel will serve `index.html` as-is.
5. Click **Deploy**.

No `vercel.json` needed for a pure static site.

## Timer presets & settings

- Click **···** (top-right) to open the settings sheet.
- Adjust the three preset durations (1–99 min each) using the **−/+** steppers.
- Drag the volume slider to set alarm loudness.
- The **▾** dropdown (top-right) picks which preset the timer uses.

## Keyboard shortcuts

| Key   | Action           |
|-------|------------------|
| Space | Start / Pause    |
| Esc   | Close settings   |
