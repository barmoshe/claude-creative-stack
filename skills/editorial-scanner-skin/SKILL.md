---
name: editorial-scanner-skin
description: Apply the editorial-scanner skin — dark #0a0a0a surfaces, red #E8412A accent, Space Mono + DM Sans, RTL-first layout, and a 17-component vocabulary (brand-header, keybar, kwbar with quick-chips and recent-pills, action-bar, scan-btn, status-box, progress-box, plan-preview, filter pills, content card, sparse-box, history-panel, toast, error-box, claude-msg-box). Use whenever the user wants a Claude-API-powered scanner, monitor, news/trend tracker, editorial dashboard, curation tool, research console, "agent that scans X and shows cards", Hebrew/Arabic/RTL UI, or any single-file HTML tool that loops web_search + messages and renders results as cards. Pairs with palette-generator, ui-design-kit, animation-composer. Do NOT use for shadcn/React component kits (use ui-design-kit) or game UIs (use artifact-game-builder).
license: MIT
---

# Editorial Scanner Skin

Editorial dark skin for Claude-powered scanner / monitor / curation tools. RTL-first, mono+sans, red-accent, plan-then-execute.

## When to trigger

Clear triggers:
- "Build a news scanner / trend monitor / content curator"
- "Tool that loops `web_search` and shows cards"
- "Editorial dashboard / research console / curation queue"
- "Hebrew / Arabic / RTL UI for a Claude-powered tool"
- "Agent that watches X and surfaces results"
- Any single-file HTML that calls `api.anthropic.com/v1/messages` and renders an article-card list

Not this skill:
- Shadcn / React primitive kits → `ui-design-kit`.
- Pure color-token generation → `palette-generator`.
- Game HUDs / playable artifacts → `artifact-game-builder`.
- Animation-only requests → `animation-composer`.

## Design philosophy

- **Editorial > dashboard.** It feels like a newsroom tool, not a SaaS console.
- **Mono carries authority.** Space Mono = labels, badges, brand, technical. DM Sans = body, buttons, headlines.
- **Red is the only saturated brand color.** Other hues earn their place by carrying meaning (purple = AI thought, green = success/fresh, orange = warning/sparse, yellow = stale).
- **RTL is default, not a retrofit.** `<html dir="rtl">` from the start; logical properties everywhere; never `padding-right`.
- **Soft refusal beats hard error.** When Claude returns prose instead of JSON, render it; when results are sparse, offer to broaden.
- **Show your work.** Before scanning, render `plan-preview` so the user sees the AI's translated search queries.

## Tokens

### Surfaces

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#0a0a0a` | Page background |
| `--s` | `#141414` | Cards, bars, panels |
| `--s2` | `#1c1c1c` | Caption block, nested surface |
| `--b` | `#262626` | Default border |
| `--b2` | `#333` | Stronger border, input border |

### Alert hues

| Token | Hex | Role |
|---|---|---|
| `--red` | `#E8412A` | Brand, primary CTA, error |
| `--orange` | `#FF6B35` | Warning, sparse-box, progress gradient |
| `--purple` | `#8B5CF6` | AI thought (`plan-preview`, `claude-msg-box`) |
| `--green` | `#22C55E` | Success, fresh, "used" confirm |
| `--blue` | `#3B82F6` | Reserved (link / market badge) |
| `--yellow` | `#EAB308` | Stale freshness warning |

### Text scale

| Token | Hex | Use |
|---|---|---|
| `--t` | `#fff` | Primary text, titles |
| `--t2` | `#cfcfcf` | Body text, descriptions |
| `--m` | `#888` | Muted labels |
| `--m2` | `#555` | Placeholders, disabled |
| `--m3` | `#333` | Inactive dots, idle tracks |

### Type pairing

| Family | Weights | Role |
|---|---|---|
| Space Mono | 400, 700 | Brand `<h1>`, labels, badges, status, monospace inputs (API key), timer |
| DM Sans | 400, 500, 600, 700 | Body, buttons, titles, captions |

Load both from Google Fonts: `family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;600;700`.

## Component vocabulary

Full CSS for every component is in `references/components.css`. Wire them in this layout order:

| # | Name | Role | Key elements |
|---|---|---|---|
| 1 | `brand-header` | Top of page | mono `<h1>` in red + sans subtitle + mono date badge |
| 2 | `keybar` | API key + model | label · password input · save button · status indicator · model `<select>` |
| 3 | `kwbar` | Focus/keyword container | wraps quick-chips + input row + recent-pills |
| 4 | `quick-chips` | Preset focus chips | row of icon+text pills; clicking same chip again clears the field; active = purple fill |
| 5 | `recent-pill` | Recent keywords | deduped case-insensitive, capped at 6, each has a `×` to remove |
| 6 | `action-bar` | Toggles + history | `toggle-fresh` (with status dot) + `history-btn` pushed to inline-end via `margin-inline-start:auto` |
| 7 | `scan-btn` | Hero CTA | full-width red mono uppercase, doubles as cooldown countdown |
| 8 | `status-box` | Status row | bordered, optional inline `spinner` composed via `innerHTML` |
| 9 | `progress-box` | Multi-step progress | header (current step + timer) · gradient progress-bar · step list (idle / active-pulse / done dots) · cancel button |
| 10 | `plan-preview` | AI's search plan | purple-bordered card with focus interpretation (italic) + numbered queries + category tags + avoid line; collapsible via `plan-toggle` |
| 11 | `filters` | Category pills | rounded with counts; active inverts to white-on-dark |
| 12 | `card` | Result card | number · hook · title · badges row [category, freshness ⏱/⚠, virality 🔥, market 🇮🇱, video ▶] · description · source link · caption block · actions (copy / mark used). `card.used` dims to `0.45` opacity |
| 13 | `sparse-box` | Too-few-results fallback | orange-bordered, primary "broaden & retry" + "scan without focus" + dismiss |
| 14 | `history-panel` | Slide-in 7-day log | overlay + panel from inline-end, sticky head, scans grouped by day |
| 15 | `toast` | Clipboard confirms | fixed bottom-center, slides up, green, auto-dismiss 1.8s |
| 16 | `error-box` | Hard errors | red-tinted bordered alert with `<code>` styling |
| 17 | `claude-msg-box` | Soft refusal | purple-bordered "Claude returned text we couldn't parse" with retry / swap-to-Sonnet / edit-focus actions |

## Layout skeleton

```
<html dir="rtl" lang="he">
└── <body>
    └── .wrap                          (max-width: 880px; padding: 20px → 12px @520)
        ├── .header                    [brand-header + date-badge]
        ├── .keybar
        ├── .kwbar                     [quick-chips · input row · recent-row]
        ├── .scan-btn
        ├── .status-box                (hidden while .progress-box.active)
        ├── .progress-box
        ├── .plan-preview              (only after plan call succeeds)
        ├── .actionbar                 (shown after first scan)
        ├── .filters                   (shown after first scan)
        └── .results                   [.sparse-box? · .claude-msg-box? · .error-box? · .card×N]
    └── .history-overlay > .history-panel
    └── .toast
```

See `references/skeleton.html` for the runnable scaffold.

## Interaction patterns

Each pattern below is summarized in one paragraph; full code is in `references/patterns.md` and `scripts/helpers.js`.

- **Two-step plan-then-execute.** When the user provides a non-empty focus, fire a cheap Haiku call (no tools, ~800 tokens) that translates the focus into 5–7 concrete search queries, a category list, and an avoid-list. Render the result in `plan-preview`. Then run the main scan with `web_search` enabled, passing the queries inline in the user message. If the plan call fails, fall through to raw keywords without aborting.
- **Rate-limit cooldown.** Track `lastScanTime` in storage; before every scan, if the gap is under 75 s, disable `scan-btn` and count down inside its label. On HTTP 429, parse the `Retry-After` header and start the same countdown.
- **Inline spinner.** `setStatus(msg, true)` rewrites `status-box.innerHTML` with a `.spinner` followed by the message — composed via string, not a separate child element.
- **Multi-step synthetic progress.** Steps advance on a `setTimeout` chain with per-step durations summing to ~50 s. The bar fills proportionally. If the API hasn't returned by the last step, the message switches to "מסיים… (ממתין לתשובה)" and stays.
- **Soft-refusal recovery.** If the parser can't find JSON, render `claude-msg-box` with the prose (lightly parsed: `**bold**` → `<strong>`, `\n` → `<br>`) plus actions: retry, swap-to-Sonnet, edit-focus. Save `lastScanTime` even on this failure to prevent hammering.
- **Sparse-results broaden-and-retry.** When `items.length < 4` *and* a focus was set, prepend `sparse-box` with a primary action that strips restrictive words (`רק`, `בלבד`, `only`, `אך ורק`) and rescans. If the focus is already 1–2 words, append "או נושאים קשורים".
- **Used = dim, don't delete.** Cards with IDs in `usedIds` get `.used` (opacity 0.45). Persist `usedIds` in storage. The toggle button reads `↺ ביטול` when used, `✓ השתמשתי` otherwise.
- **Recent keywords.** On scan submit, dedupe case-insensitive, `unshift`, cap at 6, persist. Clicking a recent-pill restores; the inner `×` removes that one.
- **Quick-chip toggle.** Clicking an active chip clears the field; clicking any other chip replaces it. Sync chip active state on every `input` event, not only on click.
- **Toast lifecycle.** 1.8 s green confirmation for clipboard ops; uses `transform` (composite-only) for slide-up.
- **Robust JSON parsing.** Four strategies in order: whole-text `JSON.parse` → fenced ```` ```json ```` block → brace-balanced extraction (string-aware) → truncation recovery (walk the items array and keep balanced objects). The full `tryParseJSON` lives in `scripts/helpers.js`.

## Animations

| Keyframe | Duration | Use |
|---|---|---|
| `fadeIn` | 0.2–0.3s | Cards, progress-box, plan-preview enter |
| `slideIn` | 0.25s ease | History-panel from `translateX(100%)` |
| `pulse` | 1s infinite | Active step dot |
| `spin` | 0.7s linear infinite | Loader |

Wrap all four:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
  }
}
```

## Sandbox modes

### Standalone HTML (default)

Matches the source app. `localStorage` for state. Google Fonts via `<link>`. Direct `fetch` to `api.anthropic.com/v1/messages` with `anthropic-dangerous-direct-browser-access: true` and the user's own key from a password input.

### Artifact mode (delta)

Per `knowledge/03-artifacts.md`:

- `localStorage` → `window.storage` (with `{ shared: false }`).
- Keep Google Fonts CDN, but always declare fallbacks: `'Space Mono', ui-monospace, monospace` and `'DM Sans', system-ui, sans-serif`.
- Keep `fetch` to `api.anthropic.com/v1/messages` — it's key-less in artifacts and billed to the viewer. Drop the API-key input and the `anthropic-dangerous-direct-browser-access` header.
- The `keybar` collapses to just the model `<select>` in this mode.

## Output checklist

- [ ] `<html dir="rtl" lang="he">` (or `lang` matching content) on root.
- [ ] Space Mono (400/700) + DM Sans (400–700) loaded with fallback stacks.
- [ ] Token block matches the inline tables (5 surfaces, 6 alert hues, 5-step text scale, accent `#E8412A`).
- [ ] All 17 components present, named exactly as in the vocabulary.
- [ ] Freshness badge logic: news decays at 2 / 4 / 8 / 12 h; viral at 6 / 12 / 18 h.
- [ ] Multi-step `progress-box` with synthetic per-step durations + cancel.
- [ ] Two-step plan-then-execute wired when focus is non-empty; `plan-preview` rendered when plan succeeds.
- [ ] Rate-limit cooldown disables `scan-btn` and counts down inside its label.
- [ ] `toast` for clipboard confirmations, slides up from bottom-center.
- [ ] `error-box` (red), `claude-msg-box` (purple soft refusal), `sparse-box` (orange broaden) all wired.
- [ ] `tryParseJSON` 4-strategy parser including truncation recovery present.
- [ ] `prefers-reduced-motion` disables `pulse` / `spin` / `fadeIn` / `slideIn`.
- [ ] `card.used` dims to `0.45` opacity; never removed from DOM.
- [ ] Recent keywords deduped case-insensitive, capped at 6.
- [ ] Quick-chip click on already-active chip clears the field.

## Further reading

- `references/components.css` — full CSS body for all 17 components.
- `references/skeleton.html` — minimal RTL HTML scaffold.
- `references/patterns.md` — interaction recipes with code.
- `scripts/helpers.js` — pure helpers (freshness, scoring, JSON parser, history grouping).
- `knowledge/05-graphics-design.md` — editorial typography + color.
- `knowledge/03-artifacts.md` — sandbox rules.
- `knowledge/14-accessibility-performance.md` — RTL, reduced motion, contrast.
- `knowledge/01-claude-ecosystem.md` — `web_search_20250305` tool used by the scan call.
- `knowledge/02-skills-system.md` — meta.
- Sibling skills: `palette-generator`, `ui-design-kit`, `animation-composer`.
