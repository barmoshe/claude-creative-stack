# Sources — Strict Whitelist & Routing

Source-of-truth for which outlets the scanner cites, in what order to check them, and how to dedup against Israeli portals. **Reddit and other social platforms are context-only — never cite as primary source.**

---

## The whitelist (binding)

Items must come from one of these domains, OR an official primary source (USGS, EMSC, government press releases) for hard-news items. Anything else: skip.

### Israeli portals (14)

| Domain | Strength | Notes |
|---|---|---|
| `ynet.co.il` | All-around | Largest reach; includes ynet sport |
| `mako.co.il` | All-around + viral | N12; includes mako HIX/ביזאר section |
| `walla.co.il` | All-around | Includes walla sport |
| `n12.co.il` | News + investigative | Same group as Mako |
| `sport5.co.il` | Sports | Israeli sports primary |
| `one.co.il` | Sports | Israeli sports primary |
| `sports.walla.co.il` | Sports | Walla sports section |
| `timesofisrael.com` | English-language IL | Good for global-IL angle |
| `kan.org.il` | Public broadcaster | Slower but high credibility |
| `haaretz.co.il` | Serious news | Less viral, more analysis |
| `israelhayom.co.il` | News | Nationalist-leaning, different selection |
| `kikar.co.il` | Religious / haredi | Niche but useful for that community |
| `calcalist.co.il` | Tech / business | Primary for tech category |
| `ice.co.il` (calcalist celeb) | Celebs | Calcalist's celeb side |

### Global wires (8) — for hard news / international viral

| Domain | Strength | Notes |
|---|---|---|
| `bbc.com` / `bbc.co.uk` | World news | Conservative attribution |
| `reuters.com` | Wire | Tier-1 for breaking |
| `apnews.com` | Wire | Tier-1 for breaking |
| `cnn.com` | World + viral | Mixed quality, OK for breaking |
| `nytimes.com` | World news | Slow but authoritative |
| `theguardian.com` | World news | Solid international |
| `aljazeera.com` | Middle East / world | Strong on regional news |
| `skynews.com` | UK news / world | Real-time updates |

### Tabloid (6) — for celebs / viral / weird

| Domain | Strength | Notes |
|---|---|---|
| `dailymail.co.uk` | Viral / celebs | Israeli portals translate verbatim — goldmine. Watch for hoaxes. |
| `nypost.com` | Weird crime / celebs | NY tabloid. Good for "WTF" stories. |
| `tmz.com` | Celebs primary | First on celeb breaking |
| `people.com` | Celebs | More polished than TMZ |
| `eonline.com` | Celebs / pop culture | OK for entertainment |
| `pagesix.com` | Celeb gossip | NY Post's gossip arm |
| `variety.com` | Hollywood industry | More credible for industry stories |

### Reddit + social platforms — **context only**

Read these to detect viral signal (high upvotes, breakout videos, multiple subreddits picking up the same clip), then **find a whitelist source covering the same story** before publishing. **Never cite Reddit/TikTok/Twitter as the primary source.**

Useful subreddits for signal:
- `r/PublicFreakout` — caught-on-camera
- `r/nextfuckinglevel` — feats of skill
- `r/Damnthatsinteresting` — visual curiosities
- `r/oddlyterrifying` — uncanny / nature horror
- `r/Whatcouldgowrong`, `r/CatastrophicFailure` — disasters
- `r/MadeMeSmile` — feel-good
- `r/AnimalsBeingDerps`, `r/Eyebleach`, `r/IllegallySmolCats` — animals

---

## What to do when the best source isn't on the whitelist

**Default: skip.** A non-whitelisted blog or unknown news site, even if the story is great, doesn't go in.

**Exceptions (allowed even though not on the journalist whitelist):**

1. **Official primary sources** for hard news:
   - USGS (`usgs.gov`) — earthquakes, volcanoes
   - EMSC (`emsc-csem.org`) — earthquake monitoring
   - Government press offices (`whitehouse.gov`, `gov.il`, etc.) — official statements
   - Major university research releases (peer-reviewed announcements)
   - Police / fire department official statements
   - Court / legal filing documents

2. **Sports primaries** for the original athletic event:
   - Team / league official channels (FIFA, UEFA, NBA, etc.)
   - Athlete official accounts (verified)

For these, set `source` to the domain (e.g. `usgs.gov`) and treat as Tier-1 verified.

---

## Source-routing matrix by category

| Category | Primary | Secondary | Notes |
|---|---|---|---|
| **חדשות (news)** | ynet, mako, walla, reuters, ap, bbc | n12, haaretz, timesofisrael | For breaking, dual-source: 1 IL + 1 wire |
| **ויראלי (viral)** | dailymail, nypost, mako (HIX) | reddit (signal only) | Always find a whitelist source even if Reddit broke it |
| **סלבס (celebs)** | tmz, pagesix, people, variety | mako, walla, ynet entertainment | If Jewish/Israeli angle, lead with Israeli source |
| **ביזאר (bizarre)** | nypost, dailymail, mako (HIX) | reddit r/oddlyterrifying (signal) | Frame around the visible event |
| **ספורט (sports)** | sport5, one, sports.walla, ynet sport | reuters sport, bbc sport | Israeli teams = lead with IL source |
| **חיות (animals)** | dailymail, mako (HIX), boredpanda style on `dailymail` | reddit animal subs (signal) | Single-source entertainment OK |
| **טכנולוגיה (tech)** | calcalist, reuters tech, theguardian tech | timesofisrael tech, ynet tech | Israeli startups = lead with calcalist |

---

## Israeli portal dedup (critical step)

Before keeping any candidate, run:

```
[story keywords] site:mako.co.il OR site:ynet.co.il OR site:walla.co.il
```

Decision rules:
- **2+ Israeli portals** already covering it → drop (audience already saw it)
- **1 Israeli portal** → keep, but mention in `description` ("כבר ב-Mako")
- **0** → keep, mark as fresh

For sports specifically, also check `sport5.co.il` and `one.co.il`.
For tech, also check `calcalist.co.il`.
For celebs with Israeli angle, also check `mako.co.il` entertainment section.

---

## Search query templates

### Broad daily scan (no focus)

```
1. site:reuters.com OR site:bbc.com viral world news today
2. site:dailymail.co.uk viral this week
3. site:nypost.com weird OR unbelievable today
4. reddit publicfreakout top week  ← signal only
5. reddit nextfuckinglevel top week  ← signal only
6. site:mako.co.il OR site:ynet.co.il breaking today
7. site:tmz.com OR site:pagesix.com today
8. earthquake site:usgs.gov OR site:emsc-csem.org today
9. dashcam viral [current year]
10. reddit animalsbeingderps top week  ← signal only
```

### Targeted scan (with focus)

For per-preset query patterns, see **`preset-focuses.md`**.

---

## Technical notes

### RSS / JSON feeds (for direct fetch when search snippets are thin)

- BBC: `http://feeds.bbc.co.uk/news/rss.xml`
- Reuters: feeds available via Reuters Connect
- Subreddits: `https://reddit.com/r/[name].json` (no API key needed for research, 60 req/min/IP)
- USGS earthquakes: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson`
- EMSC: `https://www.emsc-csem.org/service/rss/`

### Rate limits to respect

- Reddit: 60 req/min/IP — fine for research
- Google search via web_search tool: respect tool budget
- Daily Mail: scrape responsibly

---

**Last updated:** 2026-05-05
**Maintained by:** V1 Viral News Team
