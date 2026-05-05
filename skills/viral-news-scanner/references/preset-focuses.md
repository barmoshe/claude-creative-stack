# Preset Focuses & Two-Step Planning

The V1 SCANNER tool offers 8 preset focus chips plus a free-text focus field. When a focus is provided, the scanner uses a **two-step plan→scan workflow** to translate the user's vague Hebrew focus into concrete search queries before running the main scan.

---

## The two-step workflow

### Step 1: Plan call (Haiku)

When the user provides focus text, run a quick Haiku call to translate it into:

1. **`searchQueries`** — 5–7 concrete search queries (mostly English for global freshness, 1–2 Hebrew if Israel-specific)
2. **`categories`** — relevant categories from the closed list
3. **`focusInterpretation`** — one English sentence summarizing what the user wants
4. **`avoidTopics`** — explicit anti-topics if relevant

**Plan output JSON:**

```json
{
  "searchQueries": [
    "Maccabi Tel Aviv news today",
    "Israeli football breaking",
    "Hapoel Jerusalem latest",
    "Israel basketball today",
    "ספורט ישראלי היום"
  ],
  "categories": ["ספורט"],
  "focusInterpretation": "User wants only Israeli sports news from today",
  "avoidTopics": ["US-only sports without Israeli angle"]
}
```

### Step 2: Main scan (with focus)

Run the queries from step 1, then apply the full SKILL.md workflow (dedup, score, gate, categorize, caption). Items must match the focus — return fewer items if the focus is narrow rather than padding.

### When running manually in chat (no tool harness)

When the skill is invoked from chat (not via the tool), there's no automated Haiku call. Instead:

1. Write the search queries explicitly to the user before searching ("אני אחפש את:" + numbered list)
2. The user can override / adjust before you run them
3. Then run the searches and proceed with the scan

This keeps the user in the loop and matches what the tool does behind the scenes.

---

## The 8 preset chips

These are the quick-action chips in the V1 SCANNER tool. Each maps to a focus phrase that drives the plan call.

### 🔥 הכל הכי חם

- **Focus phrase:** None — full broad scan
- **Categories:** All
- **Search bias:** Mix across all categories
- **Sample queries:**
  - `viral world news today`
  - `breaking news today`
  - `reddit publicfreakout top week` (signal)
  - `dailymail viral this week`
  - `mako breaking today`

This is the default scan — no narrowing, just the highest-composite items across all categories.

### 🇮🇱 רק תוכן ישראלי

- **Focus phrase:** "רק תוכן ישראלי"
- **Categories:** All but bias away from US-only
- **Search bias:** Hebrew + Israeli sites
- **Sample queries:**
  - `ynet breaking today`
  - `mako news today`
  - `walla viral today`
  - `Israel breaking news today`
  - `כותרות חדשות היום`
  - `ויראלי בישראל`

Items must have direct Israeli involvement OR strong Jewish/diaspora angle. `israelScore` ≥ 70 minimum.

### 🌍 רק תוכן גלובלי

- **Focus phrase:** "רק תוכן גלובלי"
- **Categories:** All
- **Search bias:** English wires + Daily Mail
- **Sample queries:**
  - `BBC viral world news today`
  - `Reuters breaking today`
  - `Daily Mail viral this week`
  - `CNN breaking news`
  - `viral video today worldwide`

International news, not Israeli-focused. `israelScore` typically 30–60 (universal appeal).

### 🐶 חיות וטבע ויראלי

- **Focus phrase:** "חיות וטבע ויראלי"
- **Categories:** `חיות`, `ויראלי`
- **Search bias:** Reddit (signal) → Daily Mail / N12 viral pickups
- **Sample queries:**
  - `viral animal video today`
  - `cute animal news this week`
  - `animal rescue caught on camera`
  - `reddit animalsbeingderps top week` (signal)
  - `reddit eyebleach top week` (signal)
  - `wildlife viral encounter today`

Bias toward `hasVideo: true` items. Wholesome > shocking for this category.

### ⭐ סלבס יהודיים וישראלים

- **Focus phrase:** "סלבס יהודיים וישראלים"
- **Categories:** `סלבס`
- **Search bias:** TMZ + PageSix + Variety + IL entertainment
- **Sample queries:**
  - `Jewish celebrity news today`
  - `Israeli celebrity viral`
  - `Scooter Braun latest`
  - `Gal Gadot news`
  - `Sidney Sweeney news`
  - `Drake celebrity gossip today`
  - `mako entertainment today`

For global celeb stories, hook should hold the Jewish/Israeli angle (`"הוא משלנו"`).

### 🚨 ביטחון וברייקינג ישראלי

- **Focus phrase:** "ביטחון וברייקינג ישראלי"
- **Categories:** `חדשות`
- **Search bias:** Ynet/Mako/Walla + Reuters Middle East + Abu Ali Express
- **Sample queries:**
  - `Israel security today`
  - `IDF breaking news`
  - `Israel Iran latest`
  - `Israeli forces today`
  - `ynet ביטחון היום`
  - `מאקו חדשות עכשיו`

**Trigger active-incident protocol** if results show a live escalation (rocket alerts, terror events, war updates). Stop and ask Bar before publishing entertainment content. See `editorial-standards.md`.

### ⚽ ספורט עם דגש על ישראל

- **Focus phrase:** "ספורט עם דגש על ישראל"
- **Categories:** `ספורט`
- **Search bias:** Sport5 + One + Sports.walla + global wires
- **Sample queries:**
  - `Maccabi Tel Aviv news today`
  - `Hapoel Jerusalem latest`
  - `Israeli football breaking`
  - `Israel basketball today`
  - `sport5 חדשות היום`
  - `one ספורט`
  - `Israeli athlete international today`

Lead with Israeli teams/athletes. Global sports only if there's an Israeli angle (Israeli player abroad, Israel hosting, etc.).

### 📱 טכנולוגיה וגאדג'טים

- **Focus phrase:** "טכנולוגיה וגאדג'טים"
- **Categories:** `טכנולוגיה`
- **Search bias:** Calcalist + Reuters tech + Guardian tech
- **Sample queries:**
  - `tech news today`
  - `gadget launch this week`
  - `AI breakthrough today`
  - `Israeli startup news`
  - `calcalist טכנולוגיה`
  - `Apple Google launch today`

Israeli tech/startups bump `israelScore`. AI news is high-traffic — usually high `viralityScore`.

---

## Free-text focus (custom)

If the user types a custom focus instead of using a chip, the plan call should:

1. **Identify the intent** — is it about a specific person? Topic? Time window? Country?
2. **Generate 5–7 queries** — concrete, English-leaning, with "today"/"this week"
3. **Pick categories** — from the closed list
4. **Set `avoidTopics`** if the focus implies excluding things

### Examples of free-text focus

| User typed | Plan output (queries) | Categories |
|---|---|---|
| `"רק על טראמפ"` | `Trump news today`, `Trump latest statement`, `White House announcement today`, `Trump breaking` | `חדשות` |
| `"רק חיות מצחיקות"` | `funny animal video today`, `cute animal viral`, `r/AnimalsBeingDerps top`, `pet fail viral` | `חיות`, `ויראלי` |
| `"אסונות טבע"` | `earthquake today USGS`, `volcano eruption this week`, `tsunami breaking`, `wildfire viral` | `חדשות`, `ויראלי` |
| `"רק על אילון מאסק"` | `Elon Musk news today`, `Tesla announcement`, `SpaceX latest`, `X platform news` | `טכנולוגיה`, `סלבס` |
| `"אוכל"` | `food viral today`, `restaurant trend this week`, `food challenge viral`, `chef news today` | `ויראלי` |

### Sparse focus handling

If the focus is very narrow and the scan returns <4 items:

1. Surface a "broaden?" suggestion to the user (the tool does this in UI)
2. Offer alternatives: drop restrictive words ("רק", "only", "בלבד"), broaden by category, or scan unrestricted
3. Don't pad with off-focus items just to hit 5–10. Quality > quantity.

---

## Plan call prompt template

When implementing the plan call (Haiku), use this prompt template:

```
המשתמש כתב פוקוס: "{user_focus_text}"

החזר JSON עם:
1. searchQueries: 5–7 שאילתות חיפוש קונקרטיות. רובן באנגלית, 1–2 בעברית אם רלוונטי לישראל. כל שאילתה ממוקדת ב-3–6 מילים. הוסף "today" / "this week" כדי להבטיח טריות.
2. categories: רשימת קטגוריות מהרשימה הסגורה (חדשות / ויראלי / סלבס / ביזאר / ספורט / חיות / טכנולוגיה).
3. focusInterpretation: משפט אחד באנגלית שמסכם מה המשתמש מחפש.
4. avoidTopics: דברים שהמשתמש כנראה לא רוצה לראות (אופציונלי).

החזר JSON תקין בלבד.
```

The tool's HTML implementation calls Haiku 4.5 with this prompt and a 800-token budget. When running manually in chat, just write the same JSON output by hand and run the queries.

---

## Known limitations

- **Plan call cost:** adds ~1K tokens to each focused scan. Skip the plan step if focus is one of the 8 known chips — use the canned queries from the tables above directly.
- **Stale Hebrew search:** Hebrew search queries return fewer fresh results than English — that's why most queries are English even for IL-focused scans. Israeli portals are then reached via the dedup step.
- **Active conflict periods:** all preset focuses must respect the active-incident protocol — even `🐶 חיות` should pause if sirens are active. See `editorial-standards.md`.

---

**Last updated:** 2026-05-05
**Maintained by:** V1 Viral News Team
