# Output Schema — JSON contract

This is the binding contract for the JSON output produced by the viral-news-scanner skill. The V1 SCANNER tool parses this format directly. Deviations break the tool's UI.

---

## When to use JSON vs prose

| Trigger | Format |
|---|---|
| Invoked from V1 SCANNER tool | **JSON only** — no preamble, no markdown fences, no explanation |
| User asks "DAILY SCAN — JSON" / "תן לי JSON" | JSON |
| User asks "תן לי רשימה" / "טקסט" / "פרסום" | Prose (numbered list — see SKILL.md) |
| Default in chat (no explicit format request) | Prose, BUT mention JSON is available |

When invoked from the tool, **return JSON only**. Wrap caveats in the `note` field. Do not write "Here is the JSON:" or any other preamble — the tool's parser is robust but cleaner output is faster and more reliable.

---

## Top-level shape

```json
{
  "items": [ /* 5-10 item objects */ ],
  "note": "optional — editorial caveat about the scan as a whole"
}
```

If you found nothing publishable: `{ "items": [], "note": "explanation here" }`.

---

## Item schema (field-by-field)

```json
{
  "id": "deila-out-20260504",
  "title": "דיילה סיים את תפקידו במכבי ת\"א",
  "hook": "אחרי תלונה על הטרדה מינית",
  "description": "המאמן הנורווגי של מכבי ת\"א הודיע על פסק זמן מתפקידו לאחר שנחקר במשטרה. קני מילר ימונה למחליף הזמני.",
  "category": "ספורט",
  "viralityScore": 92,
  "israelScore": 98,
  "publishedHoursAgo": 4,
  "source": "ynet.co.il",
  "url": "https://www.ynet.co.il/sport/israelisoccer/article/rkkorovaze",
  "instagramCaption": "💥 רוני דיילה מסיים את תפקידו במכבי ת\"א\n\nהמאמן הנורווגי נחקר במשטרה אחרי תלונה על הטרדה מינית של נהגת מונית. קני מילר ימונה כמחליף.\n\nמה יקרה עכשיו עם הצהובים? 🟡⚫",
  "hasVideo": false
}
```

### `id` (string)

- **Hard rule:** unique within the scan; lowercase ASCII slug + date suffix (`YYYYMMDD`)
- **Soft rule:** descriptive (`deila-out-20260504`, not `item1`)
- **Common mistakes:** non-unique IDs across scans (use date suffix); Hebrew characters; spaces

### `title` (string, Hebrew)

- **Hard rule:** 4–8 Hebrew words, V1 idiom, present tense, concrete
- **Soft rule:** match the registers in `hebrew-style.md` real-V1 examples
- **Common mistakes:**
  - Title too long (>10 words → too wordy for IG card)
  - Title too vague (`"חדשות חדשות"` → unusable)
  - Past tense when story is still happening
  - Title duplicates the hook (they should be complementary)

### `hook` (string, Hebrew)

- **Hard rule:** 4–8 Hebrew words, sub-headline that adds info; **never** duplicates the title
- **Soft rule:** for global stories — hook holds the Israeli/Jewish angle (`"היא משלנו"`); for Israeli stories — hook holds the consequence/twist (`"אחרי תלונה על הטרדה"`)
- **Common mistakes:**
  - Hook is a synonym for the title
  - Hook is too long (>10 words)
  - Hook is generic clickbait (`"חייבים לראות"` is OK as opener but weak as standalone hook)

### `description` (string, Hebrew)

- **Hard rule:** 1–2 Hebrew sentences. Includes attribution when relevant. Hedge words ("טוענים", "לפי הדיווח") for V3 items.
- **Soft rule:** factual paraphrase, not the caption. Keep it functional — this is what the editor reads to decide whether to publish.
- **Common mistakes:**
  - Quoting >15 words from source (copyright)
  - Reframing speculation as fact
  - Naming Israeli private individuals with negative claims (defamation — DROP item instead)
  - Inventing view counts ("מיליוני צפיות" without seeing a number)

### `category` (string, closed list)

**One of, exactly:**

| Value | Meaning |
|---|---|
| `חדשות` | Hard breaking news, government, war, disaster |
| `ויראלי` | Caught-on-camera, dashcam, rescues, generic viral video |
| `סלבס` | Celebrities (especially Jewish/Israeli angle) |
| `ביזאר` | Shocking, "וואלה?!", unbelievable |
| `ספורט` | Athletes, teams, games, transfers |
| `חיות` | Animals (cute, funny, rescues) |
| `טכנולוגיה` | Tech, gadgets, AI, apps |

- **Hard rule:** never invent new categories (`"בידור"`, `"כלכלה"`, etc. → not allowed)
- **Soft rule:** if a story straddles two, pick the one closer to the V1 audience's primary interest
- **Common mistakes:**
  - Using English (`"sports"` instead of `"ספורט"`)
  - Inventing categories (`"חינוך"`, `"בריאות"` — these go under `חדשות`)
  - HOT/WTF/NEW (those were the old badge system — replaced by closed list)

### `viralityScore` (number, 0–100)

- **Hard rule:** integer 0–100, grounded in observed evidence per the rubric in `editorial-standards.md`
- **Hard rule:** for V3 (unverified single-source claim) items, cap at **65**
- **Soft rule:** if uncertain, pick the lower band (under-promise)
- **Common mistakes:**
  - `95` on a hunch with no observed signal
  - Same score across very different items (lazy scoring)
  - Going above 100 or below 0

### `israelScore` (number, 0–100)

- **Hard rule:** integer 0–100, per the rubric in `editorial-standards.md`
- **Soft rule:** Israeli/Jewish angle = high; universally appealing = mid; US-specific = low
- **Common mistakes:**
  - `100` for any earthquake (only 90+ if Israel/region directly involved; 50–60 otherwise)
  - Forgetting Jewish-diaspora angle bumps a story up

### `publishedHoursAgo` (number)

- **Hard rule:** honest estimate from source date metadata. Never guess.
- **Hard rule:** if `category: חדשות` and `publishedHoursAgo > 12` → don't include
- **Hard rule:** if other category and `publishedHoursAgo > 24` → don't include
- **Soft rule:** for aggregator republications, use the original event time, not the aggregator's date
- **Common mistakes:**
  - Using the article's "last updated" timestamp for an older story (use original publish time)
  - Picking `0` when the source date is unclear (too aggressive — pick a conservative estimate)

### `source` (string, domain)

- **Hard rule:** must be on the whitelist in `sources.md` OR an official primary source (USGS, EMSC, government)
- **Hard rule:** lowercase domain, no protocol, no path (e.g. `ynet.co.il`, not `https://www.ynet.co.il/...`)
- **Common mistakes:**
  - Citing Reddit/TikTok/Twitter as `source` (those are context-only — find a whitelist source)
  - Citing a non-whitelisted blog
  - Including `https://`

### `url` (string, full URL)

- **Hard rule:** direct article URL, opens to the story
- **Soft rule:** prefer URLs with video/photo embedded over plain-text articles
- **Common mistakes:**
  - Homepage URL (`https://ynet.co.il/`) instead of article URL
  - Search-results URL
  - URLs with tracking params that break (strip `?utm_*` if possible)

### `instagramCaption` (string, multi-line Hebrew)

- **Hard rule:** uses `\n` for line breaks (it's a JSON string)
- **Hard rule:** structure = hook line → blank → 1–2 body sentences → blank → CTA + closing emoji
- **Soft rule:** punchy present tense, "you have to see this" energy
- **Soft rule:** vary opener and emoji across the scan (no 3 captions in a row starting with `📹`)
- **Common mistakes:**
  - Single-line caption (no `\n`)
  - Forgetting closing emoji
  - Same emoji as opener and closing (boring)
  - Too long (>5 sentences feels like an article, not a caption)
  - Telegram-style two-line format (use Instagram-style 3-block format)

### `hasVideo` (boolean)

- **Hard rule:** `true` only if primary video footage exists (security cam, dashcam, official footage, viral clip)
- **Hard rule:** `false` for image-only or static-graphic stories
- **Common mistakes:**
  - `true` for stories that just embed a generic news B-roll
  - `false` for stories where the source article embeds a TikTok/YouTube of the actual event (those count — set `true`)

### `note` (top-level, optional)

- **When to use:** scan-wide editorial caveat
- **Examples:**
  - `"sparse — only found 4 strong items in this focus area"`
  - `"during active security incident — recommend pause before publishing entertainment"`
  - `"all candidates were already on Mako/Ynet — recommend skipping today"`
- **Common mistakes:**
  - Using `note` for per-item caveats (those go in the item's `description`)
  - Long explanations (`note` should be one short sentence)

---

## Canonical worked example

Story: Roni Daila resigns from Maccabi Tel Aviv after harassment complaint.

| Field | Value | Why |
|---|---|---|
| `id` | `deila-out-20260504` | unique slug + date |
| `title` | `דיילה סיים את תפקידו במכבי ת"א` | 6 words, V1 idiom |
| `hook` | `אחרי תלונה על הטרדה מינית` | Adds the why; doesn't repeat title |
| `description` | `המאמן הנורווגי של מכבי ת"א הודיע על פסק זמן מתפקידו לאחר שנחקר במשטרה. קני מילר ימונה למחליף הזמני.` | 2 sentences, factual, attribution implicit |
| `category` | `ספורט` | Athlete/team news |
| `viralityScore` | `92` | Multi-outlet (ynet + sport5 + walla); breaking |
| `israelScore` | `98` | Named Israeli team, Israeli context |
| `publishedHoursAgo` | `4` | Recent breaking |
| `source` | `ynet.co.il` | Whitelist + canonical URL |
| `url` | `https://www.ynet.co.il/sport/israelisoccer/article/rkkorovaze` | Direct article |
| `instagramCaption` | `💥 רוני דיילה מסיים את תפקידו במכבי ת"א\n\nהמאמן הנורווגי נחקר במשטרה אחרי תלונה על הטרדה מינית של נהגת מונית. קני מילר ימונה כמחליף.\n\nמה יקרה עכשיו עם הצהובים? 🟡⚫` | Three-block IG structure |
| `hasVideo` | `false` | Article only, no security cam |

Composite score:
- 0.35 × 92 + 0.25 × 98 + 0.20 × 60 + 0.20 × 60 = 32.2 + 24.5 + 12 + 12 = **80.7**
- High composite → top of the scan list.

---

## Output rules summary

When invoked from the V1 SCANNER tool:

1. **Return JSON only.** No preamble. No markdown fences. No explanation outside the `note` field.
2. **Closed-list categories.** Never invent new ones.
3. **Whitelist sources.** Skip items from non-whitelisted blogs.
4. **Honest scores.** Grounded in observed evidence.
5. **Honest freshness.** No guessing `publishedHoursAgo`.
6. **5–10 items.** Quality > quantity. If the scan was sparse, return fewer items + a `note` explaining.

If output as prose (chat default), use the numbered-list format documented in `SKILL.md` — same field content, different wrapper.
