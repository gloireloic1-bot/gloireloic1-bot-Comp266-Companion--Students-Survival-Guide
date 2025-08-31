/**
 * utils.js — shared helpers for Unit 5 features
 * - Safe localStorage (with try/catch)
 * - Debounce
 * - Simple highlight helper for search
 */

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { /* ignore if unavailable */ }
  },
  remove(key) {
    try { localStorage.removeItem(key); }
    catch { /* ignore */ }
  }
};

export const debounce = (fn, wait = 300) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(null, args), wait);
  };
};

export function highlight(text, query) {
  if (!query) return text;
  const esc = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${esc})`, "ig");
  return text.replace(re, "<mark>$1</mark>");
}
