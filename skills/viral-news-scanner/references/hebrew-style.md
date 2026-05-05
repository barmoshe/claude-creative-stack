# Hebrew Caption Styles — V1 / Mako idiom

Reference patterns for Hebrew captions in the V1 / Mako / Ynet tone. Audience: Israelis 18–50, mobile-first, seconds to grab attention.

**Primary platform: Instagram + TikTok.** Telegram is secondary.

---

## Real V1 headline + hook examples (gold standard)

These are actual V1 headlines. Match this register — concrete + 4–8 words, hook adds the curiosity gap or the Israeli/Jewish angle.

| Title | Hook |
|---|---|
| `סידני סוויני והמפיק היהודי סקוטר בראון בתמונות זוגיות ראשונות` | `היא משלנו` |
| `במקום הירצחו של דסטאו צ'קול ז"ל: מאות בני נוער התאספו` | `"די לאלימות"` |
| `הסוף לעישון הג'וינטים?` | `משרד הבריאות ממליץ לאסור קנאביס לעישון` |
| `שאקירה הופיעה מול 2 מיליון איש בברזיל` | `פחד במה יצא מהקבוצה` |
| `דיילה סיים את תפקידו במכבי ת"א` | `אחרי תלונה על הטרדה` |

**Pattern observations:**
- Title is concrete + visual + 4–8 words. No filler.
- Hook is **never** a duplicate of the title — always adds new info or angle.
- Hook is sub-headline length (4–8 words).
- Israeli/Jewish angle goes in the hook when the headline is global ("היא משלנו").

---

## Instagram / TikTok caption format (PRIMARY)

The `instagramCaption` field gets pasted into IG/TikTok. Compared to Telegram, IG users scroll past short captions — there's room for 2–3 short body sentences.

### Structure

```
[Emoji] [Hook headline that stops the scroll]

[1–2 short body sentences with the payoff and attribution]

[CTA / curiosity question] [closing emoji]
```

### Real worked example (Daila / Maccabi)

```
💥 רוני דיילה מסיים את תפקידו במכבי ת"א

המאמן הנורווגי נחקר במשטרה אחרי תלונה על הטרדה מינית של נהגת מונית. קני מילר ימונה כמחליף.

מה יקרה עכשיו עם הצהובים? 🟡⚫
```

### Structure decision tree

**Visual drama (caught-on-camera, security cam):**
```
📹 [What's happening]

[Where, what, who, when]

[CTA] 🎬
```

**Shocking / WTF / ביזאר:**
```
😱 [The impossible thing]

[Why it's unbelievable + attribution]

[CTA] 🤯
```

**Feel-good / rescue:**
```
❤️ [The rescue/heroic moment]

[Who did it, how they helped]

[CTA] 💚
```

**Animal:**
```
🐶 [Adorable/funny action]

[Context: where, why]

[CTA] 🥰
```

**Natural disaster:**
```
⚡ [Event type: earthquake/eruption]

[Where, scale, status]

[CTA] 🌍
```

**Celebs:**
```
⭐ [Headline with celeb name]

[The angle — Jewish/Israeli connection if any]

[CTA] 💫
```

**Sports:**
```
⚽ [Player/team] [action]

[The Israeli angle / context]

[CTA] 🟡⚫ (or team colors)
```

---

## Telegram alt format (when explicitly requested)

If Bar asks for "תכתוב לטלגרם" / "כיתוב לטלגרם", use the shorter two-line format:

```
[Emoji] [Hook in present tense, dramatic]!

[Detail that makes you tap] [Closing emoji]
```

**Example (Daila):**
```
💥 רוני דיילה מסיים את תפקידו במכבי ת"א!

המאמן נחקר במשטרה אחרי תלונה על הטרדה. קני מילר מחליף 🟡⚫
```

Telegram caps the visible text in feed — keep it tighter.

---

## Opener words (use variety)

Rotate these across the scan so the page doesn't feel repetitive:

### Action / Documentation
- **צפו:** "Watch" — universal opener for any video/footage. e.g. `צפו: פיל ענק תוקף חנות במיאמי`
- **תיעוד:** "Footage" — emphasizes authenticity. e.g. `תיעוד: קרח ענק נשבר ממפל ניאגרה`
- **הקלטה:** "Recording" — for audio / dashcam. e.g. `הקלטה: התנגשות דרמטית ביד"ש`
- **המתח שעצר נשימות:** "The breath-stopping tension" — short thriller

### Reaction / Emotional
- **וואלה:** "Whoa" — pure disbelief, ביזאר category
- **שימו לב:** "Pay attention" — important realization
- **לא יאומן:** "Unbelievable" — emphasizes shock

### Animal-specific
- **אתם חייבים לראות:** "You have to see" — surprise payoff
- **זה מצחיק עכשיו:** "This is hilarious right now" — playful

### News / Emergency
- **פרוץ עכשיו:** "Breaking now" — real-time, active event
- **לחץ מיידי:** "Immediate update" — situation developing

### Entertainment / Viral
- **הרשת משוגעת:** "The internet is going crazy" — trending cultural moment
- **טוב לדעת:** "Good to know" — uplifting, educational edge

### Celeb
- **היא משלנו / הוא משלנו:** "She/he is one of ours" — Jewish/Israeli angle
- **לא שכחנו את:** "Remember when" — throwback / context

---

## `hook` field guidance

The `hook` field is a **separate one-line teaser** shown above the title in the V1 SCANNER UI. It's NOT the first line of the caption — it's structurally different.

**Rules:**
- 4–8 Hebrew words
- Never duplicate the title
- Adds the angle / hook / curiosity gap
- For global stories with an Israeli/Jewish connection: hook is where you say it ("היא משלנו", "המפיק היהודי")
- For Israeli stories: hook is the consequence or twist ("אחרי תלונה על הטרדה", "המתחרים בהלם")

**Bad hook:** `"דיילה עזב את מכבי"` (just rephrases title)
**Good hook:** `"אחרי תלונה על הטרדה"` (gives the why)

---

## Emoji guidance by tone

### Visual drama / action
- Dominant: 📹 😲 🎬
- Supporting: ⚡ 🔥 💥
- Closing: 🎥 🤯 ⚠️

```
📹 מכונית התפנתה בקפיצה יצירתית!
מנוע מלא כוח וחוקים? לא צריך. 🔥
```

### WTF / shocking
- Dominant: 😱 🤯 😵
- Supporting: ❓ 🚨 💀
- Closing: 🤯 😱 😵‍💫

```
😱 חתול קפץ 4 מטרים מגג וחזר בחי!
מה קרה? הפיזיקה לא יודעת. 🤯
```

### Feel-good / rescue
- Dominant: ❤️ 😭 🙏
- Supporting: 💪 👏 🌟
- Closing: 💚 🥹 👏

```
❤️ כלב שנשכח בשלג למשך שעות — הצלה דרמטית!
הגבר הקטן חזר הביתה. 💚
```

### Animals
- Dominant: 🐶 🐱 🦁 (specific animal) + 😂 🥰
- Supporting: 😆 🎪 🐾
- Closing: 🥰 😂 🐾

### News / emergency
- Dominant: 🌍 ⚡ 🔴
- Supporting: 📡 🚨 ⛓️
- Closing: 🌍 🚨 📡

### Celebs
- Dominant: ⭐ 💫 🎬
- Supporting: 📸 🎤 ✨
- Closing: ⭐ 💫 ✨

### Sports
- Dominant: ⚽ 🏀 🏆 (sport-specific)
- Supporting: 🔥 💪 🏟️
- Closing: 🟡⚫ 🟢⚪ 🔵⚪ (team colors)

### Avoid
- ❌ Overuse of 😂 (disrespectful on serious topics)
- ❌ Political flag emojis (🇮🇱, 🇺🇸) unless directly relevant
- ❌ Stacked decorative emojis (`✨✨✨`) — looks cheap
- ❌ Hand gestures on serious topics (`👏 for tragedy`)

---

## Headline patterns (Mako / Ynet style)

### Caught-on-camera / security footage
**Pattern:** [Subject] + [dramatic verb] + [context]

- `צפו: מכונית התפנתה בקפיצה יצירתית מחניון שקוע`
- `תיעוד: פיל ענק תקף חנות ודורך על הכל`
- `הקלטה: אדם כמעט נהרס מקרח שנפל מגג`

### Shocking / unbelievable
**Pattern:** [Result] + [contradiction/impossibility]

- `לא יאומן: חתול קפץ 4 מטרים מגג — וחזר בחי`
- `וואלה: בן 80 זוכה בלוטו אחרי 40 שנה של הימור על אותו מספר`
- `חוקי הפיזיקה לא חלים: חייל הציל 5 אנשים מים קופאים`

### Feel-good / rescue
**Pattern:** [Victim/hero] + [challenge] + [resolution]

- `צפו: הצלה דרמטית של אנשי כיבוי אש בבניין שרוף`
- `טוב לדעת: גבר חירש קיבל את השמיעה חזרה`
- `לב טוב: ילדה בת 7 אספה כסף להצלת חיות רחוב`

### Animal / cute
**Pattern:** [Animal] + [funny/adorable action] + [reaction context]

- `אתם חייבים לראות: כלב רוקד לצליל מוזיקה — נכון?!`
- `זה מצחיק עכשיו: חתול גזל מעדן מהמקרר בחצי שנייה`
- `תראו את זה: תרנגול שיצא טיול ברחוב הפך לחבר של תייר`

### News / emergency
**Pattern:** [Event type] + [scale/location] + [status]

- `פרוץ עכשיו: רעידת אדמה 6.8 במקסיקו — מבנים קרסו`
- `עדכון חירום: הברקן התפרץ בקוסטה ריקה — אין נפגעים`
- `לחץ מיידי: דליפת קיטור בתחנת הכוח בצרפת`

### Celebs (V1 specialty)
**Pattern:** [Celeb] + [verb] + [context], hook adds the IL/Jewish angle

- Title: `סידני סוויני והמפיק היהודי סקוטר בראון בתמונות זוגיות ראשונות` / Hook: `היא משלנו`
- Title: `שאקירה הופיעה מול 2 מיליון איש בברזיל` / Hook: `פחד במה יצא מהקבוצה`

### Sports
**Pattern:** [Player/team] + [action] + [context], hook adds the consequence

- Title: `דיילה סיים את תפקידו במכבי ת"א` / Hook: `אחרי תלונה על הטרדה`

---

## Article-style output (Optional: כותרת + פתיח, Mako/Ynet feature)

**Trigger:** "תכתוב את זה כמו במאקו" / "כותרת + פתיח" / "סגנון מאקו"

### Headline structure
**Pattern:** [Dramatic verb, present tense] + [subject] + [context]

- Ynet style (shorter): `צפו: פיל ענק תקף חנות ודרך מחסן`
- Mako style (slightly longer): `צפו: רגע ההצלה — כיצד פעולה דרמטית בים הצילה 5 אנשים`

### Lead paragraph
**Formula:** Where + What + Who + When + Source attribution

**Example 1 (news):**
```
צפו: פיל ענק תקף חנות בדורבן, דרום אפריקה

רעם, פיל בן 25 טון, נכנס לרחוב מרכזי וזרק כל מה שבדרכו.
לפחות 20 אנשים פונו מהחנות לפני שהוא הגיע.
המשטרה הרחיקה אותו חזרה ליער במבצע מורכב.
(מקור: Daily Mail, וידאו מ-TikTok)
```

**Example 2 (entertainment):**
```
אתם חייבים לראות: כלב רוקד לצליל מוזיקה — נכון?!

בוב, כלב בגודל בינוני מסן פרנסיסקו, מזנק וקופץ כל פעם שהמוזיקה מתחילה.
הסרטון שלו באינסטגרם צבר 5 מיליון צפיות ב-48 שעות.
מלכה חדשה של TikTok — זה כבר ברור.
(מקור: Instagram @BobTheDancingDog)
```

### Embed formats (don't host images yourself)

| Platform | Embed | Notes |
|---|---|---|
| YouTube | `<iframe>` widget | Official, copyright-safe |
| TikTok | oEmbed: `https://www.tiktok.com/oembed?url=[VIDEO_URL]` | Official API |
| Reddit | Screenshot + link to original post | Link to original |
| Instagram | `<iframe>` embed widget | Official |
| Twitter/X | `<blockquote>` Tweet embed | Official widget |
| Daily Mail / BBC | Article link only | Don't embed, link only |

---

## Common mistakes to avoid

| ❌ Mistake | ✅ Fix | Why |
|---|---|---|
| `צפו: אדם כמעט מת בתאונה נוראה!` | `צפו: רגע ההצלה הדרמטי בתאונה` | Focus on rescue, not the danger |
| `המון צפיות מיליונים לסרטון!` | `טרנדינג ברדיט בעמוד ראשי` | Don't invent numbers |
| `פיל תקף אדם — בן 45` | `פיל תקף אדם בדורבן` | Don't identify private people |
| `😂😂😂😂` | Single closing emoji | Looks cheap |
| `סרטון מפחיד — אל תראו אם אתם חלשי לב` | Just post the content | Trust the audience |
| `וואלה מה שקרה כאן הוא חוקי!` | `וואלה: רגע שעצר נשימות` | Be specific |
| Hook duplicates title | Hook adds angle/twist | Hook is sub-headline, not echo |
| Using English brand names with no translation | Hebrew transliteration: `מכבי ת"א`, `מנצ'סטר יונייטד` | Audience reads Hebrew |

---

## Rhythm & variety checklist (per scan of 5–10 items)

- [ ] No more than 2 items in a row with the same opener (`צפו`, `תיעוד`)
- [ ] Mix categories — not 5 in a row of the same category
- [ ] At least 3 different closing emojis used
- [ ] No repeated subjects (2 animals in a row max, not 3)
- [ ] At least 1 item with `❤️` / `💚` (feel-good factor) if scan has 5+ items
- [ ] No category dominates >50% of the scan unless user requested a focus
- [ ] Each `hook` is unique (no duplicated hooks across items)

**Example good rhythm (8-item scan):**
```
01. 📹 (ויראלי — caught on camera)
02. ⭐ (סלבס — Jewish angle)
03. 🤯 (ביזאר)
04. ❤️ (חיות — rescue)
05. ⚡ (חדשות)
06. 😂 (חיות — funny)
07. ⚽ (ספורט — Israeli team)
08. 💥 (חדשות — breaking)
```

---

**Last updated:** 2026-05-05
**Maintained by:** V1 Viral News Team
