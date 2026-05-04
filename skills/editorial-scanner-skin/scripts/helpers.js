/* ============================================================
   editorial-scanner-skin — helpers.js
   Pure, DOM-free utilities. Safe to use in standalone HTML and
   inside Claude artifacts (no localStorage / fetch / DOM coupling here).
   The skeleton.html wires UI handlers; this file holds the logic.
   ============================================================ */

/* ---------- HTML escape (DOM-free) ---------- */
export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ---------- Freshness bucketing ----------
   News decays fast (a 12h-old "breaking" headline is dead).
   Viral content decays slow (a 12h-old meme can still hit).
   Returns a 0–100 freshness score. Unknown age → neutral 50. */
export function computeFreshness(item) {
  const h = item.publishedHoursAgo;
  if (h == null) return 50;
  if (item.category === 'חדשות' || item.category === 'news') {
    if (h < 2)  return 100;
    if (h < 4)  return 85;
    if (h < 8)  return 60;
    if (h < 12) return 30;
    return 10;
  }
  if (h < 6)  return 100;
  if (h < 12) return 80;
  if (h < 18) return 60;
  return 40;
}

/* ---------- Composite virality / fit score ----------
   35% virality + 25% market relevance + 20% media (video boosts) + 20% freshness.
   Tweak weights at the top to adapt to your domain. */
export function compositeScore(item, weights = { vir: 0.35, market: 0.25, media: 0.2, fresh: 0.2 }) {
  const fresh = computeFreshness(item);
  const media = item.hasVideo ? 100 : 60;
  return (item.viralityScore || 0) * weights.vir
       + (item.israelScore   || 0) * weights.market
       + media * weights.media
       + fresh * weights.fresh;
}

export function sortByFit(items) {
  return [...items].sort((a, b) => compositeScore(b) - compositeScore(a));
}

/* ---------- Robust JSON parsing (4 strategies) ----------
   When asking Claude for JSON, expect:
     A. raw JSON
     B. ```json fences```
     C. JSON mixed with prose
     D. truncated output (cut mid-array)
   Strategy D returns { items: [...], _truncated: true } so callers can warn. */
export function tryParseJSON(text) {
  // A. whole-text
  try { return JSON.parse(text); } catch {}

  // B. fenced block
  const fence = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (fence) { try { return JSON.parse(fence[1]); } catch {} }

  // C. brace-balanced extraction starting at first {"items"
  const startIdx = text.indexOf('{"items"');
  const startIdxAlt = text.search(/\{\s*"items"/);
  const start = startIdx >= 0 ? startIdx : startIdxAlt;
  if (start < 0) return null;

  let depth = 0, inStr = false, escape = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (escape) { escape = false; continue; }
    if (c === '\\') { escape = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) {
        try { return JSON.parse(text.slice(start, i + 1)); } catch {}
      }
    }
  }

  // D. truncation recovery — walk the items array, keep balanced item objects
  const itemsStart = text.indexOf('"items"', start);
  if (itemsStart < 0) return null;
  const arrStart = text.indexOf('[', itemsStart);
  if (arrStart < 0) return null;

  let sDepth = 0, sInStr = false, sEsc = false, itemStart = -1;
  const completedItems = [];
  for (let i = arrStart + 1; i < text.length; i++) {
    const c = text[i];
    if (sEsc) { sEsc = false; continue; }
    if (c === '\\') { sEsc = true; continue; }
    if (c === '"') { sInStr = !sInStr; continue; }
    if (sInStr) continue;
    if (c === '{') {
      if (sDepth === 0) itemStart = i;
      sDepth++;
    } else if (c === '}') {
      sDepth--;
      if (sDepth === 0 && itemStart >= 0) {
        try { completedItems.push(JSON.parse(text.slice(itemStart, i + 1))); } catch {}
        itemStart = -1;
      }
    } else if (c === ']' && sDepth === 0) break;
  }
  return completedItems.length ? { items: completedItems, _truncated: true } : null;
}

/* ---------- Recent-keywords helpers ----------
   Pure functions; the storage layer (localStorage / window.storage)
   is the caller's job. */
export function addRecent(list, kw, cap = 6) {
  if (!kw || !kw.trim()) return list;
  kw = kw.trim();
  const filtered = list.filter(k => k.toLowerCase() !== kw.toLowerCase());
  filtered.unshift(kw);
  return filtered.slice(0, cap);
}

export function removeRecent(list, idx) {
  const next = [...list];
  next.splice(idx, 1);
  return next;
}

/* ---------- Restrictive-word stripping for broaden-and-retry ----------
   Used by sparse-box's "broaden" action. Add particles for your locale. */
export function broadenFocus(focus) {
  if (!focus) return '';
  let out = focus
    .replace(/^רק\s+/, '')
    .replace(/^only\s+/i, '')
    .replace(/בלבד/g, '')
    .replace(/^אך ורק\s+/, '')
    .trim();
  if (out.split(/\s+/).length <= 2) out += ' או נושאים קשורים';
  return out;
}

/* ---------- History grouping ----------
   Group an array of { timestamp, ... } into { 'day label': [...] }. */
export function groupByDay(scans, locale = 'he-IL') {
  const out = {};
  for (const scan of scans) {
    const key = new Date(scan.timestamp).toLocaleDateString(locale, {
      weekday: 'long', day: 'numeric', month: 'long'
    });
    (out[key] ||= []).push(scan);
  }
  return out;
}

/* ---------- History persistence shim ----------
   Saves with a 7-day window and a 50-scan hard cap.
   Pass your own storage adapter (localStorage by default; swap to window.storage in artifacts). */
export function saveHistory(scans, scan, storage = (typeof localStorage !== 'undefined' ? localStorage : null), key = 'v1_scan_history') {
  let list = [scan, ...scans];
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  list = list.filter(s => s.timestamp > cutoff);
  if (list.length > 50) list = list.slice(0, 50);
  if (!storage) return list;
  try {
    storage.setItem(key, JSON.stringify(list));
  } catch {
    // storage full → drop oldest until it fits
    while (list.length > 5) {
      list.pop();
      try { storage.setItem(key, JSON.stringify(list)); break; } catch {}
    }
  }
  return list;
}

/* ---------- Freshness label (UI string for the badge) ---------- */
export function freshLabel(hoursAgo, locale = 'he') {
  if (hoursAgo == null) return '';
  if (locale === 'he') {
    if (hoursAgo < 1) return 'עכשיו';
    if (hoursAgo < 2) return 'לפני שעה';
    return `לפני ${Math.round(hoursAgo)}ש'`;
  }
  if (hoursAgo < 1) return 'now';
  if (hoursAgo < 2) return '1h ago';
  return `${Math.round(hoursAgo)}h ago`;
}
