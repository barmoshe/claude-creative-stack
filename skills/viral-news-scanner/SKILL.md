---
name: viral-news-scanner
description: Use this skill whenever the user wants to scan the web for viral world news and trending content for a Hebrew-language Instagram/TikTok page (V1) — also reusable for Telegram. Trigger on phrases like "סרוק ויראלי", "מה ויראלי היום", "DAILY SCAN", "scan viral", or "what's trending today", or any ask to prepare ready-to-post content about world news, viral videos, rescues, animal incidents, natural disasters, weird crime, celeb gossip, sports, or rare phenomena. Knows the Israeli media landscape (Mako, Ynet, Walla, N12, Sport5, Calcalist, Daily Mail, TMZ, Reuters), uses a strict source whitelist, dedupes against Israeli portals, applies V1/Mako verification levels, and outputs structured JSON with categories from a closed list (חדשות / ויראלי / סלבס / ביזאר / ספורט / חיות / טכנולוגיה), numerical scores (viralityScore, israelScore), freshness (publishedHoursAgo), and ready-to-post Hebrew Instagram/TikTok captions. When user provides a focus ("רק על טראמפ", "סלבס יהודיים"), runs a two-step plan→scan workflow.

---

# Viral News Scanner — סורק חדשות ויראליות (V1 / Mako / Ynet style)

Daily scan of viral world content for a **Hebrew-language Instagram/TikTok page** (V1) that publishes 4–6 posts/day in the V1/Mako/Ynet idiom. Audience: Israelis 18–50, mobile-first, scroll-killing attention spans. Content lane: world news + general viral, family-safe-but-bizarre-OK.

The user's editorial bar is V1/Mako-class: punchy, attribution-aware, dual-source for hard news, single-source acceptable for pure entertainment with proper framing.

## What you produce

**Default output: JSON** (machine-parseable, drives the V1 SCANNER tool's UI). Each item has:

- `id` — slug-with-date
- `title` — 4–8 word Hebrew V1-style headline
- `hook` — sub-headline / one-line teaser (4–8 words)
- `description` — 1–2 Hebrew sentences with attribution
- `category` — **closed list, never invent**: `חדשות` · `ויראלי` · `סלבס` · `ביזאר` · `ספורט` · `חיות` · `טכנולוגיה`
- `viralityScore` (0–100) — see scoring rubric in `references/editorial-standards.md`
- `israelScore` (0–100) — same
- `publishedHoursAgo` — honest estimate from source date
- `source` — must be on the whitelist in `references/sources.md`
- `url` — direct article URL
- `instagramCaption` — multi-line Hebrew caption ready to paste
- `hasVideo` — boolean

Full schema with field-by-field rules: **`references/output-schema.md`**.

**Alt output: prose / numbered list** — only when the user asks for it explicitly ("תן לי רשימה", "כתוב במקום JSON", "בפורמט טקסט"). Same item content, different wrapper. Telegram-style two-line captions are also available as an alt — see `references/hebrew-style.md`.

Output 5–10 items. Quality > quantity — 5 strong items beat 10 mediocre ones.

## Reference files

Before writing captions, scoring, or applying verification, skim:

- **`references/output-schema.md`** — JSON contract, field-by-field rules, canonical worked example. Read first when outputting JSON.
- **`references/sources.md`** — strict source whitelist (Israeli, global wires, tabloids), Reddit-as-context-only rule, source-routing matrix by category.
- **`references/hebrew-style.md`** — Instagram caption patterns (primary), real V1 headline examples, opener words ("צפו:", "תיעוד:"), emoji guidance, Telegram alt format.
- **`references/editorial-standards.md`** — verification levels (V1/V2/V3), source trust scores, scoring rubrics for `viralityScore` and `israelScore`, hoax patterns, defamation/privacy rules, active-incident protocol.
- **`references/preset-focuses.md`** — 8 preset focus chips (🔥 הכל הכי חם, 🇮🇱 רק ישראלי, etc.) and the two-step plan→scan workflow.

## Real V1 headline examples (gold standard)

These are actual V1 headlines — match this register:

| Title | Hook |
|---|---|
| סידני סוויני והמפיק היהודי סקוטר בראון בתמונות זוגיות ראשונות | היא משלנו |
| במקום הירצחו של דסטאו צ'קול ז"ל: מאות בני נוער התאספו | "די לאלימות" |
| הסוף לעישון הג'וינטים? | משרד הבריאות ממליץ לאסור קנאביס לעישון |
| שאקירה הופיעה מול 2 מיליון איש בברזיל | פחד במה יצא מהקבוצה |
| דיילה סיים את תפקידו במכבי ת"א | אחרי תלונה על הטרדה |

Common pattern: title is concrete + visual + 4–8 words; hook adds the curiosity gap or the Israeli/Jewish angle. Hook is **never** a duplicate of the title — it's a sub-headline.

## The workflow

### 0. Plan (only if user gave a focus)

If the user provided focus text ("רק על טראמפ", "סלבס יהודיים", "ביטחון"), first translate it into 5–7 concrete search queries before any web search. State them explicitly to the user, then run them. See `references/preset-focuses.md` for the full plan→scan two-step workflow and per-preset query patterns.

If no focus, skip directly to step 1 with a broad daily scan.

### 1. Search broadly

Run several `web_search` calls in parallel. A typical broad scan uses 6–10 searches plus targeted follow-ups. Always include the year or "today" / "this week" — viral content rots fast and stale results are the main failure mode.

**Use only whitelisted sources** (full list in `references/sources.md`):
- Israeli portals: ynet, mako, walla, sport5, one, sports.walla, timesofisrael, kan, n12, haaretz, israelhayom, kikar, calcalist
- Global wires: bbc, reuters, ap, cnn, nyt, guardian, aljazeera, skynews
- Tabloid (for celebs/viral): dailymail, nypost, tmz, people, eonline, pagesix, variety
- Reddit & social: **read for viral signal only, never cite as primary source**

Official primary sources (USGS, EMSC, government) are also allowed for hard-news items even though they're not on the journalist whitelist.

### 2. Dedup against Israeli portals (critical)

Before keeping any candidate, check whether Mako/Ynet/Walla already published it. If yes — Bar's audience already saw it, and it's stale.

```
[story keywords] site:mako.co.il OR site:ynet.co.il OR site:walla.co.il
```

- **2+ Israeli portals** → drop, or strongly demote
- **1 Israeli portal** → keep but flag in `description` ("כבר ב-Mako")
- **None** → keep, mark as fresh

This is the highest-leverage step the skill does — it's what separates the V1 page from generic translations of Daily Mail.

### 3. Cluster and pick canonical

Same story appears across 4–6 sources within hours. Cluster by canonical URL / shared image / uncommon proper noun. Pick the version with the best media (video > image > text-only) as the link to share.

### 4. Score every candidate

Assign `viralityScore` (0–100) and `israelScore` (0–100) using the rubrics in `references/editorial-standards.md`. Set `hasVideo` (boolean) based on whether the source has primary video footage. Estimate `publishedHoursAgo` honestly from source metadata — never guess.

**Composite ranking score** (used to sort the final list):

```
composite = 0.35 × viralityScore + 0.25 × israelScore + 0.20 × (hasVideo ? 100 : 60) + 0.20 × freshnessFactor
```

Where `freshnessFactor` decays by category:
- For `חדשות`: 100 if <2h, 85 if <4h, 60 if <8h, 30 if <12h, 10 if older
- For all others: 100 if <6h, 80 if <12h, 60 if <18h, 40 if <24h

**Worked example** (Daila/Maccabi):
- viralityScore: 92 (multi-outlet, breaking, named coach)
- israelScore: 98 (Israeli sports, named Israeli team)
- hasVideo: false (article, no security cam) → 60
- publishedHoursAgo: 4 → category חדשות → freshnessFactor 60
- composite = 0.35×92 + 0.25×98 + 0.20×60 + 0.20×60 = 32.2 + 24.5 + 12 + 12 = **80.7**

### 5. Apply freshness gates (drop)

Hard cutoffs:
- `category: חדשות` with `publishedHoursAgo > 12` → **drop** (stale news damages credibility)
- All other categories with `publishedHoursAgo > 24` → **drop**

Soft signals:
- News >8h ago: include only if still actively breaking
- Viral >18h ago: include only if still on the upswing

### 6. Apply editorial gates (drop / hedge)

Per `references/editorial-standards.md`:
- **Defamation risk** (named Israeli + negative claim, single source) → **drop**
- **Hoax pattern match** (shark in flooded street, Mars face, etc.) → **drop**
- **V3 single-source claim about real events** → publish only with hedging ("טוענים", "לפי הדיווח"); cap `viralityScore` at 65
- **Active Israeli security incident** → STOP and ask Bar how to proceed before continuing the scan

### 7. Categorize using the closed list

Pick exactly one of: `חדשות`, `ויראלי`, `סלבס`, `ביזאר`, `ספורט`, `חיות`, `טכנולוגיה`. **Never invent categories.** Rough guide:

| If... | Category |
|---|---|
| Hard breaking news, government, war, disaster | `חדשות` |
| Caught-on-camera, dashcam, rescues, generic viral video | `ויראלי` |
| Celebrities (especially Jewish/Israeli angle) | `סלבס` |
| Shocking, "וואלה?!", unbelievable | `ביזאר` |
| Athletes, teams, games, transfers | `ספורט` |
| Animals (cute, funny, rescues) | `חיות` |
| Tech, gadgets, AI, apps | `טכנולוגיה` |

If it could go in two, pick the one closer to the V1 audience's interest (Israeli angle wins).

### 8. Write the Hebrew Instagram caption

The `instagramCaption` field is what gets pasted into IG/TikTok. Multi-line, more room than Telegram (IG users scroll past short captions). Pattern:

```
[Emoji] [Hook headline that makes the reader stop]

[1–2 short body sentences with the payoff]

[CTA / curiosity question] [closing emoji]
```

Punchy, present tense, "you have to see this" energy. Earn the framing — only use heavy hooks when the content delivers.

For caption patterns, opener words ("צפו:", "תיעוד:", "המתח שעצר נשימות"), full examples, Telegram alt format, and emoji guidance, read **`references/hebrew-style.md`**.

**Vary across the scan.** Don't open three items in a row with the same emoji or hook word ("תועד", "צפו"). The page feels alive when each post has its own voice.

### 9. Output

Default: JSON conforming to `references/output-schema.md`. When invoked from the V1 SCANNER tool, return **JSON only** — no preamble, no markdown fences, no explanation. Wrap any caveats in the `note` field.

When the user asks for prose (chat), use the numbered-list format below.

## Output formats

### JSON (default — for the V1 SCANNER tool)

```json
{
  "items": [
    {
      "id": "deila-out-20260504",
      "title": "דיילה סיים את תפקידו במכבי ת\"א",
      "hook": "אחרי תלונה על הטרדה מינית",
      "description": "המאמן הנורווגי הודיע על פסק זמן לאחר חקירה במשטרה. קני מילר ימונה למחליף הזמני.",
      "category": "ספורט",
      "viralityScore": 92,
      "israelScore": 98,
      "publishedHoursAgo": 4,
      "source": "ynet.co.il",
      "url": "https://www.ynet.co.il/sport/israelisoccer/article/rkkorovaze",
      "instagramCaption": "💥 רוני דיילה מסיים את תפקידו במכבי ת\"א\n\nהמאמן הנורווגי נחקר במשטרה אחרי תלונה על הטרדה מינית של נהגת מונית. קני מילר ימונה כמחליף.\n\nמה יקרה עכשיו עם הצהובים? 🟡⚫",
      "hasVideo": false
    }
  ],
  "note": "optional editorial caveat — leave out if no caveat"
}
```

### Prose / numbered list (alt — only on request)

```
נמצאו [N] פריטים ויראליים · [תאריך בעברית]

────────────────
01. [Hebrew title]
hook: [Hebrew hook]
מקור: [domain · view/upvote count if known]
קישור: [URL]
קטגוריה: [closed-list category]
ציון ויראליות: [0–100]    ציון ישראליות: [0–100]    טריות: לפני [N] שעות
[סטטוס בישראל: כבר ב-Mako/Ynet]    ← only if relevant

תיאור:
[1–2 sentence Hebrew description with attribution if needed]

כיתוב לאינסטגרם:
[Emoji] [Hebrew hook]

[Hebrew body line]

[CTA] [closing emoji]

────────────────
02. ...
```

## Optional: article-style output (Mako/Ynet feature piece)

If Bar asks for "כותרת + פתיח" or "סגנון מאקו" or "תכתוב את זה כמו ב-V1" for any item, generate also:

- **Hebrew headline** in Mako/Ynet style
- **Lead paragraph** (2–3 sentences): where, what, who, when + attribution
- **Suggested embed**: which official platform widget — X widget, YouTube iframe, TikTok oEmbed, Reddit screenshot. Don't host images yourself; embedding via official widgets is the legally-safe path.

Templates and patterns: `references/hebrew-style.md`.

## Honesty constraints (Bar pastes straight to social — guard rails, not suggestions)

- **Don't invent view counts, upvote numbers, or "X million views" claims.** Use general phrasing ("טרנדינג ברדיט", "באז ברשת") only if you saw signs of high engagement, with no specific number.
- **Don't reframe speculation as fact.** "Officials are investigating" stays as that. "Scientists may have discovered" doesn't become "Scientists discovered".
- **Don't quote more than 15 words from any single source.** Always paraphrase to Hebrew. Copyright requirement.
- **Don't claim something was "filmed today" unless verified.** Use "לאחרונה" / "השבוע" when unsure.
- **Hoax-prone stories** — skip or flag explicitly. See `references/editorial-standards.md`.
- **Identifiable private individuals** — frame around the event without identifying them when possible. Israeli privacy law applies.
- **Abu Ali Express attribution** — first time per scan you cite him, briefly note the IDF-consultant context.
- **During active Israeli security incidents** — flag immediately and ask Bar how to proceed before generating entertainment content.
- **Categories are a closed list — never invent new ones.** Pick from `חדשות / ויראלי / סלבס / ביזאר / ספורט / חיות / טכנולוגיה`.
- **Sources must be on the whitelist** (or an official primary source like USGS/EMSC). If the only source is a non-whitelisted blog, drop the item.
- **Scores must be grounded in observed evidence.** Don't invent a `viralityScore: 95` because the story feels viral — see the rubric in `references/editorial-standards.md`.

## Follow-ups Bar may ask

- "תן לי 5 חלופות לכיתוב של פריט 3" — keep numbering stable across the conversation; generate 5 distinct hooks (different emoji + different hook pattern in each)
- "תחליף את הקטגוריה של 7 ל-ביזאר" — re-evaluate against the closed list, don't just relabel
- "תעשה עוד סריקה" — fresh searches; note overlap with previous batch
- "תכתוב את זה כמו במאקו" / "תן כותרת + פתיח" — switch to article-style output for that item
- "תוסיף 5 פריטים מעולם בעלי החיים" — targeted top-up search; use the 🐶 preset
- "מה כבר עלה במאקו היום?" — run the dedup check explicitly and report
- "JSON" / "תן לי בפורמט JSON" — switch to JSON output for the next/current scan
- "פרסום" / "טקסט" / "רשימה" — switch to prose output for the next/current scan
