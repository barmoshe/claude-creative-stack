# Interaction patterns

The skin's named components are necessary but not sufficient. The *feel* comes from these recipes. Each section is a copy-pasteable JS snippet plus the rationale for why it's done this way.

---

## 1. Two-step plan-then-execute

When the user gives a vague focus ("רק על ספורט ישראלי", "only Trump", "viral animals"), don't pass it raw to the scan call. Run a cheap Haiku call first that translates it into 5–7 concrete search queries plus a category list and an avoid-list. Show the result in `plan-preview` while the main scan with `web_search` runs.

Why: the planner is small (~800 tokens, no tools) and turns under-specified intent into structured queries the main call can act on. It also gives the user visible "show your work."

```js
async function planFromKeywords(apikey, keywords, signal) {
  const planPrompt = `המשתמש כתב פוקוס: "${keywords}"
החזר JSON תקין בלבד:
{
  "searchQueries": ["5–7 concrete Google queries, mostly English, with 'today'/date for freshness"],
  "categories": ["מהרשימה הסגורה שלך"],
  "focusInterpretation": "single English sentence summarizing intent",
  "avoidTopics": ["…"] /* may be [] */
}`;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', signal,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apikey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: planPrompt }]
    })
  });
  if (!r.ok) {
    if (r.status === 429) throw new Error('RATE_LIMIT');
    throw new Error(`Plan call failed: ${r.status}`);
  }
  const data = await r.json();
  const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('Plan call returned no JSON');
  const plan = JSON.parse(m[0]);
  plan._tokens = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
  return plan;
}
```

Inside `runScan`, fall through to raw keywords if the plan call throws (except for `RATE_LIMIT`, which should bail and start the cooldown).

---

## 2. Rate-limit cooldown

Track the last successful scan time in storage. Before every scan, if the gap is under 75 s, disable `scan-btn` and count down inside its label. On HTTP 429, use the `Retry-After` header.

```js
function startCooldownTimer(seconds) {
  const btn = document.getElementById('scanbtn');
  btn.disabled = true;
  if (cooldownInterval) clearInterval(cooldownInterval);
  let remaining = seconds;
  const update = () => {
    btn.textContent = `⏳ המתן ${remaining}s לסריקה הבאה (rate limit)`;
    setStatus(`⏳ Rate limit cooldown: ${remaining} שניות.`);
    if (--remaining < 0) {
      clearInterval(cooldownInterval);
      cooldownInterval = null;
      btn.disabled = false;
      btn.textContent = '▼ SCAN שוב';
      setStatus('מוכן לסריקה');
    }
  };
  update();
  cooldownInterval = setInterval(update, 1000);
}
```

Save `lastScanTime` even on parse failure / soft refusal — the API call still consumed budget.

---

## 3. Inline spinner via `innerHTML`

Compose the spinner and its label as one string so they share a flex line and can't drift apart:

```js
function setStatus(msg, loading = false) {
  document.getElementById('statusbox').innerHTML = loading
    ? `<div class="spinner"></div><span>${msg}</span>`
    : `<span>${msg}</span>`;
}
```

Don't keep a permanent `.spinner` element and toggle a class — that fights the flex layout when the message changes width.

---

## 4. Multi-step synthetic progress

Real progress isn't reportable when the API blocks until done. Estimate per-step durations, advance on a `setTimeout` chain, and let the last step say "ממתין לתשובה" indefinitely if the API hasn't returned.

```js
function startProgress() {
  document.getElementById('progressbox').classList.add('active');
  document.getElementById('statusbox').style.display = 'none';
  progressStartTime = Date.now();
  document.querySelectorAll('.progress-step').forEach(s => s.classList.remove('done', 'active'));
  document.getElementById('progress-fill').style.width = '0%';

  progressTimer = setInterval(() => {
    const sec = Math.floor((Date.now() - progressStartTime) / 1000);
    document.getElementById('progress-timer').textContent = sec + 's';
  }, 200);

  const stepDurations = [6000, 8000, 7000, 6000, 8000, 10000];  // ~50s total
  let i = 0;
  const advance = () => {
    if (i > 0) {
      const prev = document.querySelector(`.progress-step[data-step="${i-1}"]`);
      if (prev) { prev.classList.remove('active'); prev.classList.add('done'); }
    }
    if (i < stepDurations.length) {
      const cur = document.querySelector(`.progress-step[data-step="${i}"]`);
      if (cur) cur.classList.add('active');
      document.getElementById('progress-msg').textContent = cur ? cur.textContent.trim() : 'עובד…';
      document.getElementById('progress-fill').style.width = `${((i + 0.5) / stepDurations.length) * 100}%`;
      progressStepInterval = setTimeout(advance, stepDurations[i]);
      i++;
    } else {
      document.getElementById('progress-msg').textContent = 'מסיים… (ממתין לתשובה)';
    }
  };
  advance();
}

function finishProgress(success = true) {
  if (progressTimer) clearInterval(progressTimer);
  if (progressStepInterval) clearTimeout(progressStepInterval);
  if (success) {
    document.querySelectorAll('.progress-step').forEach(s => {
      s.classList.remove('active'); s.classList.add('done');
    });
    document.getElementById('progress-fill').style.width = '100%';
  }
  setTimeout(() => {
    document.getElementById('progressbox').classList.remove('active');
    document.getElementById('statusbox').style.display = 'flex';
  }, success ? 400 : 0);
}
```

---

## 5. Soft-refusal recovery (`claude-msg-box`)

If `tryParseJSON` returns nothing, Claude probably wrote prose. Render it. Don't crash, don't show a red error — the user wants to see what Claude said.

```js
function showClaudeMessage(text) {
  const div = document.createElement('div');
  div.className = 'claude-msg-box';
  const formatted = esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
  const isHaiku = (localStorage.getItem('v1_model') || '').includes('haiku');
  const swap = isHaiku
    ? `<button class="btn" onclick="document.getElementById('modelselect').value='claude-sonnet-4-5-20250929';saveModel();">↑ עבור ל-Sonnet</button>`
    : '';
  div.innerHTML = `
    <div class="claude-msg-head">💬 הודעה מ-Claude (לא הצליח להחזיר JSON תקין)</div>
    <div class="claude-msg-body">${formatted}</div>
    <div class="claude-msg-actions">
      <button class="btn" onclick="runScan()">🔄 נסה שוב</button>
      ${swap}
      <button class="btn" onclick="document.getElementById('keywords').focus()">✏️ שנה פוקוס</button>
    </div>`;
  const results = document.getElementById('results');
  results.innerHTML = '';
  results.appendChild(div);
}
```

---

## 6. Sparse-results broaden-and-retry

When `items.length < 4` and a focus was set, the focus is probably too narrow. Offer to broaden by stripping restrictive Hebrew/English particles and rescanning.

```js
function showSparseResultsFallback(keywords, count) {
  const div = document.createElement('div');
  div.className = 'sparse-box';
  const reason = count === 0
    ? `לא נמצא תוכן עבור "<strong>${esc(keywords)}</strong>"`
    : `נמצאו רק ${count} פריטים עבור "<strong>${esc(keywords)}</strong>"`;
  div.innerHTML = `
    <div class="sparse-head">⚠️ פוקוס מצומצם</div>
    <div class="sparse-body">${reason}. ייתכן שהפוקוס מצומצם מדי, או שזה פשוט יום שקט.<br><br>רוצה להרחיב?</div>
    <div class="sparse-actions">
      <button class="sparse-action primary" onclick="broadenAndRescan()">🔄 הרחב ונסה שוב</button>
      <button class="sparse-action" onclick="clearKeywords();runScan()">🌐 סרוק בלי פוקוס</button>
      <button class="sparse-action" onclick="this.parentElement.parentElement.remove()">סגור</button>
    </div>`;
  document.getElementById('results').insertBefore(div, document.getElementById('results').firstChild);
}

function broadenAndRescan() {
  const cur = document.getElementById('keywords').value.trim();
  if (!cur) return runScan();
  let broadened = cur
    .replace(/^רק\s+/, '')
    .replace(/^only\s+/i, '')
    .replace(/בלבד/g, '')
    .replace(/^אך ורק\s+/, '')
    .trim();
  if (broadened.split(/\s+/).length <= 2) broadened += ' או נושאים קשורים';
  document.getElementById('keywords').value = broadened;
  localStorage.setItem('v1_last_keywords', broadened);
  syncChipActive();
  runScan();
}
```

---

## 7. Used = dim, don't delete

Cards with IDs in `usedIds` stay rendered but get `.used { opacity: 0.45 }`. Persist `usedIds` so the dim survives reloads.

```js
function toggleUsed(id, btn) {
  const i = usedIds.indexOf(id);
  if (i >= 0) usedIds.splice(i, 1); else usedIds.push(id);
  localStorage.setItem('v1_used_ids', JSON.stringify(usedIds));
  renderResults();
}
```

The button label is `↺ ביטול` when used, `✓ השתמשתי` otherwise. Never remove the card from the DOM — losing visual continuity is worse than seeing a dim card.

---

## 8. Recent keywords (dedupe + cap)

```js
function addToRecent(kw) {
  if (!kw || !kw.trim()) return;
  kw = kw.trim();
  recentKeywords = recentKeywords.filter(k => k.toLowerCase() !== kw.toLowerCase());
  recentKeywords.unshift(kw);
  if (recentKeywords.length > 6) recentKeywords = recentKeywords.slice(0, 6);
  localStorage.setItem('v1_recent_keywords', JSON.stringify(recentKeywords));
  renderRecentKeywords();
}
```

Each pill renders with an inner `×` whose click handler calls `event.stopPropagation()` before removing — otherwise the outer pill's "use this" handler fires.

---

## 9. Quick-chip toggle-to-clear

```js
function applyChip(btn) {
  const preset = btn.dataset.preset;
  const input = document.getElementById('keywords');
  if (input.value.trim() === preset) {
    input.value = '';
    localStorage.removeItem('v1_last_keywords');
  } else {
    input.value = preset;
    localStorage.setItem('v1_last_keywords', preset);
  }
  syncChipActive();
  input.focus();
}

function syncChipActive() {
  const value = document.getElementById('keywords').value.trim();
  document.querySelectorAll('.chip').forEach(c =>
    c.classList.toggle('active', c.dataset.preset === value)
  );
}
```

Hook `syncChipActive` to the input's `input` event too — typing should keep the chip in sync.

---

## 10. Toast lifecycle

```js
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}
```

Toast uses `transform` (composite-only), so it stays smooth even under heavy DOM work.

---

## 11. Robust JSON parsing (4 strategies)

When you ask Claude for JSON, anticipate four failure modes: prose wrapping, ```` ```json ```` fences, prose mixed with valid JSON, and truncation mid-output. The full implementation is in `scripts/helpers.js` as `tryParseJSON(text)`. Strategies in order:

1. **Whole-text parse.** `JSON.parse(text)`.
2. **Fenced block.** Match ```` ```(?:json)?\s*(\{[\s\S]*?\})\s*``` ```` and parse.
3. **Brace-balanced extraction.** Find `{"items"` (or `{\s*"items"`), walk forward counting `{`/`}` while respecting strings and escapes, parse the balanced slice.
4. **Truncation recovery.** Walk just the `items` array, keep every fully-balanced object, return `{ items: [...], _truncated: true }`. The UI logs a warning and shows whatever was recovered.

Always fall through gracefully — if all four fail, hand the text to `claude-msg-box` (pattern 5).
