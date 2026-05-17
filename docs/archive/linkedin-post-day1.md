# LinkedIn Post — Day 1: SpriteSynth

> Hebrew, ~210 words. Reflective opener → what it is → what's under the hood → soft CTA, matching your "COSMIC SYNTH" post style. Closing: "מוזמנים להציץ" + 4 hashtags.

---

יום 1 לאתגר חדש: **פלאגין ייחודי כל יום** 🌱

יש לי המון רעיונות מוזיקליים, והבעיה הקבועה היא הפער בין "ראיתי את זה בראש שלי" לבין משהו שבאמת רץ אצלי באייבלטון.
בדרך כלל זה נגמר בעוד דמו HTML שלא חוזרים אליו אחרי שבוע.

הפעם לקחתי פיסת אמנות גנרטיבית שחקרתי בדפדפן, ויחד עם קלוד הפכתי אותה לפלאגין VST3/AU אמיתי לאייבלטון:

🐌 **SpriteSynth** — לוחצים על הבד וצומח עץ. לוחצים "+ Snail" וחלזון יוצא לטייל על הענפים, ובכל פעם שהוא חוצה צומת — מתנגן תו. הסקייל (Pent, Dorian, Phrygian, Lydian, Major, Minor, Chromatic), המפתח, האוקטבה והמהירות הם שלך. מה שצומח על המסך — זה מה שמתנגן.

מתחת למכסה:
🔧 JUCE 8 + WebView, פורמטים VST3 / AU / Standalone
🔧 לוגיקת המשחק רצה ב־JS, ה־MIDI יוצא סמפל-מדויק מ־C++ עם quantize ל־host tempo
🔧 סינת' פנימי אופציונלי, או רוטינג לכל track אחר באייבלטון

זה עוד גס סביב הקצוות, אבל הוא רץ אצלי בפרויקט אמיתי ויש בזה משהו שגורם לי לחזור. אהבתי את הזרימה הזו: ארטיפקט בדפדפן → פלאגין שיושב על ה־track.

מוזמנים להציץ 👇

#claude #abletonlive #juce #buildinpublic

---

## Variants

**Punchier opener (less reflection, more hook):**
> "פלאגין ייחודי כל יום — אתגר חדש. יום 1: 🐌 SpriteSynth, סינת' שצומח כשמלחיצים."

**Tech-forward closer (for a dev-heavier audience):**
> "Bridge בין WebView ל־AudioProcessor, EventQueue lock-free, סקדולינג של תווים ב־PPQ של ה־host, וטבלאות סקייל ב־C++ שעודכנות מה־UI."

**Bilingual hashtag set you can swap in:**
> `#GenerativeMusic #VST3 #AbletonLive #JUCE #BuildInPublic #ClaudeCode`

---

## Notes for posting
- A 5–10s screen-capture of seeding a tree, spawning a snail, and watching it walk while Live's clock ticks would carry this much further than a static image — your last post leaned on the COSMIC SYNTH video and it worked.
- Drop a repo / demo link after "מוזמנים להציץ 👇" before posting (your last post used `https://lnkd.in/...`).
- 🐌 + 🌱 emojis hint at the concept without spelling it out — keep one or both depending on mood.
- Hashtags trimmed to 4 to match your style.
