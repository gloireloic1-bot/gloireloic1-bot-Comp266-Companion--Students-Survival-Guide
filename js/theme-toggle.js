/**
 * Theme Toggle — adapted from MDN Web Docs code samples (CC0 / Public Domain)
 * Source reference: https://developer.mozilla.org/docs/Web/CSS/@media/prefers-color-scheme
 * (MDN code examples are released under CC0; reused and expanded here.)
 * Date integrated: 2025-08-17
 *
 * What this does:
 * - Reads saved theme from localStorage ("light" | "dark" | null)
 * - If none saved, falls back to OS preference via prefers-color-scheme
 * - Applies theme to <html data-theme="...">
 * - Updates the toggle button label and aria-pressed state
 * - Saves the user’s choice so the preference persists across reloads
 */

(function () {
  const STORAGE_KEY = 'site-theme';
  const btn = document.getElementById('toggle-theme');
  const root = document.documentElement;

  if (!btn) return;

  /** Get persisted theme, or null if not set */
  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  /** Detect OS preference when no explicit choice saved */
  function getOsPref() {
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  /** Set theme attribute and persist choice */
  function applyTheme(theme, persist = true) {
    root.setAttribute('data-theme', theme);
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        /* localStorage may be unavailable (private mode, etc.) */
      }
    }
    updateButton(theme);
  }

  /** Update button label & state for screen readers */
  function updateButton(theme) {
    const isDark = theme === 'dark';
    btn.setAttribute('aria-pressed', String(isDark));
    btn.textContent = isDark ? '☀️ Light mode' : '🌙 Dark mode';
  }

  // Initialize on load
  const stored = getStoredTheme();
  const initial = stored || getOsPref();
  applyTheme(initial, false);

  // Listen for OS preference changes (optional nice touch)
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  if (mq && mq.addEventListener) {
    mq.addEventListener('change', (e) => {
      const currentlyStored = getStoredTheme();
      // Only auto-switch if user hasn’t explicitly chosen
      if (!currentlyStored) {
        applyTheme(e.matches ? 'dark' : 'light', false);
      }
    });
  }

  // Toggle on click
  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || getOsPref();
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });
})();
