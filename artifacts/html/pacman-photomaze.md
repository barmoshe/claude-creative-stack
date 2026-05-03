# Photo Maze — Campaign Handoff

A one-stage Pac-Man-style mini-game for the PR teaser.
Single HTML file, no build step, works on phone + desktop.

**Source:** `artifacts/html/pacman-photomaze.html`
**Branch:** `claude/create-pacman-game-vl6m8`

---

## ההמשחק במשפט אחד

צלמו את כל הפלאשים במבוך לפני שצוות המעצבים — פיקסל, סריף, קרנינג ופנטון —
יתפסו אתכם. בסוף: מסך עם פרטי המתנה.

---

## How to view it

| Where | What you do |
|---|---|
| **Locally — quickest** | Open `artifacts/html/pacman-photomaze.html` in any browser. Audio may be muted on `file://`; if so, use the next option. |
| **Locally — with audio** | From the repo root, run `python3 -m http.server 8765` then visit `http://127.0.0.1:8765/artifacts/html/pacman-photomaze.html`. |
| **As a Claude artifact** | Open [claude.ai](https://claude.ai), paste the file contents into a chat with "create an HTML artifact from this", get a shareable artifact URL. |
| **Hosted (production)** | Drop the single file on any static host — Netlify, Vercel, GitHub Pages, S3+CloudFront. No backend, no env vars, no build. |

---

## Send-to-customer flow

1. Host the file (any of the options above).
2. Wrap the URL in your campaign comms (SMS / WhatsApp / email / QR code).
3. Customer plays → win screen → taps the phone number → calls Anabel directly (one tap on mobile, thanks to the `tel:` link).

QR-code reminder: 21×22 grid is mobile-friendly portrait — landscape works too.

---

## Editing the copy (no code knowledge needed)

All the campaign-specific text lives in two spots:

### 1. The contact line (top of the script)

In `<script>`, find the `CONFIG` block (~line 254):

```js
const CONFIG = {
  contactName:  "ענבל",
  contactPhone: "052-368-8321",
  contactTel:   "+972523688321",
  ...
};
```

Swap these for your next campaign owner. `contactTel` must be in international format (`+972…`) for the one-tap dial.

### 2. The end-screen gift card

In the HTML, find the `<!-- WIN -->` section (~line 217):

```html
<div class="gift">
  <h2>🎁 יש לכם מתנה פיזית</h2>
  <p>פרטים על איסוף — דרך ענבל:</p>
  <a class="phone" href="tel:+972523688321">052-368-8321</a>
</div>
```

Replace the `<h2>` with whatever the gift is, the `<p>` with the call-to-action, and the `<a>` with the contact link. Keep the `tel:` prefix if you want one-tap dial.

### 3. (Optional) The intro and lose-screen text

Search the HTML for `<!-- INTRO -->` and `<!-- LOSE -->` sections — all copy is plain text, edit freely. Keep `dir="rtl"` on these sections so Hebrew renders right-to-left.

---

## Difficulty knobs (also in `CONFIG`)

| Knob | Default | What it does |
|---|---|---|
| `lives` | `5` | More = easier. Drop to 3 for a real challenge. |
| `ghostSpeedFrac` | `0.72` | Ghost speed as a fraction of player speed. Lower = easier. |
| `frightenedMs` | `9000` | How long ghosts are blue/edible after a power pellet (ms). |
| `playerCellsPerSecond` | `7` | Overall game pace. |
| `releaseMsPerGhost` | `2500` | Stagger between ghost releases from the house. |

The defaults are tuned for "easy and fun" — most first-time players win.

---

## What's in the box (gameplay)

- **Maze:** 21×22, classic-Pac-Man silhouette with a side tunnel and central ghost house.
- **Pellets** = "camera flashes" (170 total, including 4 power-ups).
- **Designer ghosts:**
  - 🔴 פיקסל — pixel-perfectionist, chases you directly
  - 🩷 סריף — typography snob, ambushes 4 tiles ahead
  - 🔵 קרנינג — kerning-obsessed, flanks via Pixel's position
  - 🟠 פנטון — color theorist, gives chase from far / gives up close
- **Controls:** swipe on mobile, arrows or WASD on desktop.
- **HUD:** photo-progress bar, lives counter, mute button.
- **End screens:** win → gift card with one-tap-dial phone, lose → random designer roast + retry.

---

## Sandbox / hosting compatibility

Already verified against the Claude artifact sandbox:

- ✅ Single self-contained HTML file
- ✅ No `localStorage` / `sessionStorage` / `indexedDB`
- ✅ No external CDNs (no Google Fonts, no script tags pointing outside the file)
- ✅ No `<form type="submit">`
- ✅ Audio uses Web Audio (no audio file fetches)
- ✅ Respects `prefers-reduced-motion` (no shake / flash / scanlines for that audience)
- ✅ Mobile-safe: `viewport-fit=cover`, `env(safe-area-inset-*)`, large tap targets, no iOS zoom

---

## Smoke-tested with

- Headless Chrome at iPhone 14 Pro (390×844) and 1280×800 desktop
- Zero console errors / warnings
- All four overlays toggle correctly
- Mute toggles 🔊 / 🔇
- `prefers-reduced-motion` correctly disables motion juice
- Hebrew RTL renders right-to-left on intro/win/lose
- `tel:` link is tappable and dials in international format

---

## Questions / changes

Open an issue or ping the build owner. The file is ~1,135 lines, well-commented, and the `CONFIG` block at the top covers ~90% of the customizations a campaign owner would need.
