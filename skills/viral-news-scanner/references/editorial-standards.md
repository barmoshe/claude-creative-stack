# Editorial Standards & Verification Framework

Reference guide for verification levels, source trust scores, hoax patterns, and legal constraints for V1 Telegram channel.

---

## Verification Levels (V-Level)

Every item gets exactly one verification level. This determines how to frame the caption and whether to publish at all.

### V1: VERIFIED
**Use when:** 2+ independent reliable sources OR single Tier-1 wire with primary evidence

**Framing:** Definite, present tense. You can assert facts.

**Examples:**
```
Caption style: "פיל תקף חנות בדורבן"
(No hedging, confident framing)

Caption style: "רעידת אדמה 6.8 בטורקיה - מבנים קרסו"
(Direct statement, based on USGS + Reuters confirmation)
```

**Sources that grant V1 alone:**
- USGS (earthquakes, volcanoes)
- EMSC (earthquake data)
- Reuters (hard news with primary source)
- AP News (AP dispatch with own reporting)
- BBC News (confirmed world events)
- Official government statements (with cautious framing: "לדברי הממשלה")

**When combining sources for V1:**
- Reddit video + Daily Mail article covering same incident = V1
- Multiple subreddits independently posting same clip = V1
- Security cam footage + local news = V1

---

### V2: SINGLE-SOURCE / ENTERTAINMENT
**Use when:** Pure viral entertainment from one platform (Reddit video, TikTok clip, tweet thread)

**Framing:** Described in terms of what's *visible*, not factual claims. Use attributed framing.

**Format:**
```
"בסרטון שעולה לרשת:" (In a video going viral:)
"בתיעוד שצולם כנראה:" (In footage apparently filmed:)
"בתגובה שהשתוללה:" (In a reply that went viral:)
```

**Examples:**
```
Caption: "בסרטון שעולה לרשת: כלב מחליק בקרח כמו אולמפיוני!"
(We describe what we see, not that this *is* an Olympic-level slide)

Caption: "בתיעוד מרדיט: בן אדם קפץ מגג וחזר בחי בקפיצה אחרת!"
(We say what's visible: the jump. Not: "He defies physics.")

Caption: "בסרטון שנתפס לפני שעה: פיל שימונח במים - כמה יפה!"
(We frame around the visible moment, not claims about the elephant's state)
```

**Typical sources for V2:**
- Reddit (r/PublicFreakout, r/nextfuckinglevel, r/AnimalsBeingDerps)
- Instagram / TikTok viral clips (single source)
- Twitter/X viral threads (single account)
- BoredPanda galleries (entertainment, not reporting)
- Cute animal compilations

---

### V3: UNVERIFIED CLAIM
**Use when:** Single-source claim about real-world events or identifiable people

**Framing:** MUST hedge with "טוענים" (they claim), "לפי הדיווח" (according to reports), "כביכול" (allegedly).

**Format:**
```
"טוענים כי:" (They claim:)
"לפי דיווחים ראשוניים:" (According to initial reports:)
"דיווח לא מאומת:" (Unconfirmed report:)
```

**Critical:** If the story involves **identifiable Israeli individuals** (name + place, or clear context), **DROP INSTEAD** of V3.

**Why:** Israeli defamation law (לשון הרע) is plaintiff-friendly. A false claim about a named Israeli person = legal liability.

**Examples:**
```
SAFE V3: "טוענים כי רעידת אדמה 5.0 פגעה בדרום מקסיקו"
(No Israeli people, geographical event, low harm)

SAFE V3: "דיווח לא מאומת: מתחנת החלל בשל לבעיה טכנית"
(Neutral factual claim, no people affected)

❌ DROP: "טוענים כי דוד כהן מעיר כפר סבא מעל לדין"
(Named Israeli person + accusation = RISK. Drop instead.)

❌ DROP: "טוענים כי בן אדם מרמת גן זכה בלוטו של $10M"
(Named + location + specific claim = RISK even if innocent. Drop.)

SAFE V3: "דיווח לא מאומת: טייס בטרם זיהוי פגע במטרה"
(No name, no Israeli context, military context clear)
```

**Common V3 scenarios:**
- Initial earthquake reports (before USGS confirms magnitude)
- "Scientists say..." claims (single research institute, not peer-reviewed)
- Police reports (single department, no independent confirmation)
- Accident reports (before official investigation)
- Claims about specific people's achievements / crimes (unless verified)

---

## Source Trust Scores (Tier System)

Use this table to weight sources when deciding V-Level:

| Tier | Sources | Trust | Caveats |
|---|---|---|---|
| **T1** | USGS, EMSC, Reuters, AP, BBC, Guardian | 🟢 High | Verify date; Reuters/AP must have named sources |
| **T2** | Daily Mail, NY Post, Walla, Ynet | 🟡 Medium | These outlets do real reporting but also sensationalize. Check if follow-up exists on T1 sources |
| **T3** | Reddit (subreddit communities), Instagram, TikTok | 🟠 Low | Visual/entertainment only. V2 framing required. Original poster may be anonymous. |
| **T4** | Twitter/X single tweets, user comments, unattributed claims | 🔴 Very Low | Entertainment/entertainment only. Consider V3 if claim about real events. |

### Reading a Source Tier Decision

**Scenario 1: Daily Mail reports a viral animal video**
- Source: Daily Mail (T2)
- Subject: cute puppy video (entertainment, no real-world facts)
- V-Level: V2 (single-source entertainment, even though T2 outlet)
- Framing: "בתיעוד שפרסמה טבלויד: הכלב הכי מצחיק בעולם!"

**Scenario 2: Reuters reports earthquake, USGS hasn't updated yet**
- Source: Reuters (T1)
- Subject: real-world event (earthquake)
- V-Level: V1 (T1 source + primary event)
- Framing: "רעידת אדמה 5.8 בציוני לפי רויטרס"

**Scenario 3: TikTok video of person doing impossible stunt**
- Source: TikTok (T3)
- Subject: visual / performance (no real-world fact claim)
- V-Level: V2 (entertainment, visual only)
- Framing: "בסרטון שעולה לרשת: גבר קפץ 3 קומות וחזר בחי!"

**Scenario 4: Social media claim that "Israeli person X did Y illegal thing"**
- Source: Twitter (T4)
- Subject: real-world claim about Israeli person
- V-Level: ❌ DROP (don't use V3 for named Israeli individuals)
- Action: Skip entirely, note overlap with previous scans

---

## Hoax Patterns & Red Flags

Known recurring fakes and misinformation patterns. **Auto-skip if you see these:**

### Recurring Fakes (High Confidence — Skip)

| Pattern | Frequency | Why | Action |
|---|---|---|---|
| **Shark/alligator in flooded street** | Monthly | Recycled image, often from Africa/Asia decade ago | Skip unless USGS + news confirm |
| **"Lost child reunited X years later"** | Weekly | Usually without specific names, emotional manipulation | Skip unless names + official sources |
| **"Found in attic: historical treasure worth $X"** | Monthly | Implausible discovery story, no documentation | Skip unless museum confirms |
| **"Mars rover found face / skull on Mars"** | Every few months | Pareidolia (humans see faces in rocks). NASA explains every time. | Skip entirely |
| **"Dog/cat saved from rubble X days later"** | After earthquakes | Often reused footage from different disasters | Only publish if official rescue org confirms |

### Red Flags (Check Further)

**If you see ANY of these, fetch the original source + verify:**

1. **No direct URL** — claim came from screenshot/retweet, no original link
   - Action: Skip or find original source
   
2. **Date mismatch** — "happened today" but image metadata says 2023
   - Action: Verify date with reverse image search
   
3. **Reframing of old news** — story from 2024 re-posted as "just happened"
   - Action: Cross-check against T1 sources for original date
   
4. **Emotional language on factual claim** — "HORRIFYING" + "police say" (contradictory frame)
   - Action: Read original source, remove emotional overlay
   
5. **"Sources say" with no named source** — claim attribution without specifics
   - Action: Skip unless you can find named official source
   
6. **Celebrity/famous person claim** — "Elon Musk bought X", "Dwayne Johnson rescued Y"
   - Action: Check official accounts + reputable news. Impersonators are common.

### Misinformation Indicators (Skip If Multiple Present)

- Missing source link
- Emotional language exceeds factual specificity
- Date unclear or contradictory to image/video metadata
- No verification by any T1/T2 outlet within 24 hours of claim
- Only appears on T4 sources (Twitter, Reddit, TikTok) with no T1 pickup

---

## Israeli Legal Constraints

### Defamation (לשון הרע)

**Israeli law is plaintiff-friendly. Err on the side of caution.**

**Never publish if:**
1. **Named Israeli person** + **Negative claim** about them (crime, unethical act, fraud, etc.)
   - Even if the claim seems TRUE, it needs 2+ independent sources to be V1
   - When in doubt: DROP
   
2. **Identifiable Israeli person** (name + recognizable context) + **Claim of fact** that *could* harm reputation
   - Example: "David Cohen from Ramat Gan was caught speeding" — DROP
   - Example: "Resident of Ramat Gan caught in viral speeding video" — OK (anonymized)
   
3. **Private individual in viral content** — frame around event, not identity
   - ❌ "This is Miriam, age 31, and she fell off a ladder"
   - ✅ "Someone fell off a ladder in a viral TikTok and survived"

**Safe categories:**
- Public figures (politicians, celebrities) — still need 2 sources for negative claims
- Anonymized descriptions ("A man in a red shirt...")
- Alleged crimes with police confirmation (official statement, not social media)
- Natural events with no personal attribution

### Privacy (Right to Privacy)

Israeli courts recognize privacy even in "public" online content.

**Don't:**
- Identify private individuals in viral videos (even if names appear in comments)
- Publish recognizable faces of minors in embarrassing situations
- Share location + name of identifiable person without consent

**Do:**
- Describe action without identifying the person
- Use generic descriptors ("A teenager...", "A homeowner...")
- Link to source where identity is already public (if needed)

### Copyright & Fair Use

**Don't:**
- Quote more than 15 words from any article
- Republish full photos without official embed widget
- Use platform embeds that remove attribution

**Do:**
- Paraphrase into Hebrew
- Use platform official embeds (YouTube iframe, TikTok oEmbed, X blockquote)
- Always link to original source

---

## Sensitive Sources & Attribution

### Abu Ali Express (אבו עלי אקספרס)

Israeli security analyst known for detailed intel reports.

**First mention in a scan:** Briefly note credibility context
```
"לפי אבו עלי אקספרס (אנליסט ביטחוני בעל היסטוריה של חיזויים מדויקים):..."
```

**Subsequent mentions:** Just cite normally
```
"לפי אבו עלי אקספרס: ..."
```

**When to use:**
- Military/security analysis where he has specific reporting
- NOT for entertainment or viral content (mismatch)

---

## Active Incident Protocol

### During Israeli Security Events

**If occurring while you scan:** Rocket alerts, terror attacks, mass casualty events, war escalations

**STOP and ask Bar:**
"קרה אירוע ביטחוני עכשיו (צלילי אזעקה / דיווח על אירוע). איך תרצה שנמשיך? הפוסטים המחנקים עלולים להיות לא רגישים."

(Translation: "There's a security event happening right now. How do you want me to proceed? Entertainment posts might feel insensitive.")

**Options (for Bar to decide):**
1. Pause scans entirely until "all clear"
2. Continue but shift tone (only V1 verified, feel-good stories, rescue content)
3. Proceed normally (audience expects the channel to keep going)

---

## Fact-Checking Workflow

**For any item you're unsure about:**

1. **Check source tier** — is it T1/T2 or T3/T4?
2. **If T3/T4:** does T1/T2 also report it? Wait 4–6 hours for pickup.
3. **Check date** — reverse image search (`images.google.com`) for original publication date
4. **Check dedup** — `[keywords] site:mako.co.il OR site:ynet.co.il`
5. **If Israeli person named:** consult defamation checklist above
6. **If hoax pattern match:** skip automatically

**Decision tree:**

```
Is it T1 source with primary evidence?
  YES → V1 (VERIFIED)
  NO → Continue

Is it single entertainment source (Reddit, TikTok, IG)?
  YES → V2 (SINGLE-SOURCE)
  NO → Continue

Is it claim about real event with single source?
  YES → Check: Is it about named Israeli person?
    YES → DROP (defamation risk)
    NO → V3 (UNVERIFIED, frame with "טוענים", "דיווח לא מאומת")
  NO → Unclear — SKIP

Does it match a known hoax pattern?
  YES → SKIP
  NO → Proceed with classification
```

---

## Publish / Hold / Drop Decision Matrix

| Verification | V1 | V2 | V3 | Hoax Pattern |
|---|---|---|---|---|
| **Israeli person named** | ✅ V1 (2+ sources) | ✅ OK | ❌ DROP | ❌ SKIP |
| **Entertainment only** | ✅ V1 | ✅ V2 | N/A | ❌ SKIP |
| **International news** | ✅ V1 (T1 source) | ✅ V2 | ✅ V3 (hedge) | ❌ SKIP |
| **Disaster / Emergency** | ✅ V1 (USGS/EMSC) | ❌ HOLD | ✅ V3 (wait for T1) | ❌ SKIP |

---

## Checklist Before Publishing

- [ ] Verification level assigned (V1, V2, or V3)
- [ ] If V3: uses hedging language ("טוענים", "דיווח לא מאומת")
- [ ] No named Israeli individuals with negative claims
- [ ] No hoax pattern match
- [ ] If visual content: credit source or embed officially
- [ ] No quotes >15 words from source articles
- [ ] Date verified (not recycled old content)
- [ ] Dedup check: not already on Mako/Ynet/Walla
- [ ] If during security incident: asked Bar how to proceed
- [ ] Hebrew caption tone fits V1/Mako idiom
- [ ] Emoji variety maintained across scan
- [ ] Source on whitelist (or official primary source like USGS/EMSC)
- [ ] Category from closed list (חדשות / ויראלי / סלבס / ביזאר / ספורט / חיות / טכנולוגיה)
- [ ] viralityScore and israelScore grounded in observed evidence (not invented)
- [ ] publishedHoursAgo within freshness gate (≤12h for חדשות, ≤24h others)

---

## Scoring Rubric (for JSON output)

The V1 SCANNER tool expects two numerical scores per item: `viralityScore` and `israelScore`, both 0–100. **Scores must be grounded in observed evidence** — never invent a number because the story "feels viral".

### `viralityScore` (0–100)

How much real viral momentum the story has *right now*:

| Range | Signal | Examples |
|---|---|---|
| **90–100** | Multi-million views OR multiple Tier-1 outlets covering OR breakout celebrity moment | Viral dashcam with 10M+ views; major celeb scandal on TMZ + People + PageSix |
| **80–89** | Top of subreddit week + at least one tabloid pickup OR breaking news on 2+ wires | r/PublicFreakout top-of-week clip picked up by Daily Mail; earthquake on Reuters + AP |
| **70–79** | Single mainstream outlet with strong engagement OR multiple subreddits independently posting | NY Post weird-crime story; clip cross-posted to 3+ subreddits |
| **60–69** | Single-platform breakout OR rising trend not yet at peak | TikTok video at 500K with rising engagement; emerging news story |
| **50–59** | Niche viral OR community-specific (e.g. specific subreddit only) | Specialty subreddit top post; localized news |
| **<50** | Slow burn / specialist content | Routine news, niche tech, low-engagement viral |

Cap rule: V3 (single-source unverified claim) items have `viralityScore` capped at **65** — uncertainty discount.

**Don't invent numbers.** If you can see "trending on Reddit" but no specific count, ground in qualitative signal ("top 10 of subreddit week") and pick the matching band. Do NOT write `viralityScore: 95` on a hunch.

### `israelScore` (0–100)

How relevant the story is to a Hebrew-speaking Israeli audience:

| Range | Signal | Examples |
|---|---|---|
| **90–100** | Direct Israeli involvement — Israeli people, places, companies, teams | Maccabi Tel Aviv news; Israeli politician; named Israeli citizen |
| **70–89** | Strong Jewish or diaspora angle | Jewish celebrity (Sidney Sweeney + Scooter Braun); diaspora news |
| **50–69** | Regional / Middle East / immediate neighbors | Egypt, Jordan, Syria, Iran, Lebanon stories |
| **40–55** | Universally appealing (works without local context) | Earthquakes, natural disasters, viral animals, global rescues |
| **20–40** | US-specific cultural context or politics | US domestic politics (unless directly affects Israel), US sports |
| **<20** | Requires cultural translation or specialist context | British cricket; UK royal minor news; non-translatable wordplay |

### `publishedHoursAgo`

- Estimate honestly from source date metadata
- If unsure, use the conservative (older) estimate
- For aggregator stories, use the original event time, not the aggregator's republication
- Never guess — if no date is visible, fetch the article

### `hasVideo`

- `true` only if a primary video exists (security cam, dashcam, official footage, viral clip)
- `false` for image-only stories OR if the "video" is just B-roll attached to a text article
- Static graphics, photo galleries → `false`
- Videos count even if hosted on a different platform than the source domain (e.g., Daily Mail article embedding a TikTok)

---

## How V-level interacts with scoring

The verification level (V1/V2/V3) is an **internal editorial classification** used to decide whether to publish and how to frame. The numerical scores reflect viral momentum and audience relevance — separately. Together:

| V-Level | Effect on scoring | Effect on framing |
|---|---|---|
| **V1 (Verified)** | No cap | Definite tense ("פיל תקף") |
| **V2 (Single-source entertainment)** | No cap | Visible-only framing ("בסרטון שעולה לרשת") |
| **V3 (Unverified claim)** | `viralityScore` capped at 65 | Hedged ("טוענים", "לפי דיווח") + clear `description` flag |
| **DROP** | Don't include | — |

The `description` field is where you signal V-level to readers. For V3 items, the description must contain hedging language even if the title and caption don't.

---

## Composite ranking score

Used to sort the final list (highest first). Computed downstream from the JSON, not an output field — but the scorer should apply this mental model when assigning scores so the ranking makes sense.

```
composite = 0.35 × viralityScore
          + 0.25 × israelScore
          + 0.20 × (hasVideo ? 100 : 60)
          + 0.20 × freshnessFactor
```

Where `freshnessFactor` decays by category (see SKILL.md, step 4). Items below `composite < 50` should usually be dropped — the page can't carry weak items.

---

**Last updated:** 2026-05-05
**Maintained by:** V1 Viral News Team
**Legal review:** Consult Israeli media lawyer on edge cases
