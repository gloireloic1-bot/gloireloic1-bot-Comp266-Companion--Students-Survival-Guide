/**
 * form-assistant.js — inline validation + autosave + live counters
 * - Live errors for name, email, message
 * - Combined error list (deduped)
 * - Visual invalid states via aria-invalid
 * - Draft autosave
 */
import { storage, debounce } from './utils.js';

const DRAFT_KEY = 'u5_contact_draft';
const MSGS = {
  nameMissing: 'Please enter your name.',
  nameLooksWrong: 'Please enter your real name (at least two letters).',
  emailInvalid: 'Please enter a valid email address.',
  msgTooShort: 'Please enter a longer message (at least 10 characters).'
};

// Basic "has letters" for many Latin names (covers accents); avoids \p{L}
const LETTER_RE = /[A-Za-zÀ-ÖØ-öø-ÿ]/g;

class FormAssistant {
  constructor(form) {
    this.form = form;
    this.errorsEl = document.getElementById('form-errors');
    this.clearBtn = document.getElementById('clear-draft');
    this.messageId = form?.querySelector('#message') ? 'message' : 'msg';
    this.fields = ['name', 'email', 'topic', this.messageId];

    this.errors = new Set();
  }

  init() {
    if (!this.form) return;
    this.loadDraft();
    this.bindEvents();
    this.initCounters();
    // reflect current values (including restored drafts)
    this.validateAll();
    this.updateErrorView();
  }

  bindEvents() {
    // Save draft (debounced)
    this.form.addEventListener('input', debounce(() => this.saveDraft(), 400));

    // Submit: final gate
    this.form.addEventListener('submit', (e) => {
      const ok = this.validateAll();
      this.updateErrorView();
      if (!ok) {
        e.preventDefault();
        for (const id of ['name', 'email', this.messageId]) {
          const el = this.q('#' + id);
          if (el?.getAttribute('aria-invalid') === 'true') { el.focus(); break; }
        }
      } else {
        this.clearDraft();
      }
    });

    // Reset/clear draft
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => {
        this.form.reset();
        this.clearDraft();
        this.clearInvalids();
        this.errors.clear();
        this.updateErrorView();
        this.updateCounter();
      });
    }

    // Live validation hooks
    this.q('#name')?.addEventListener('input', () => { this.validateName(); this.updateErrorView(); });
    this.q('#name')?.addEventListener('blur',  () => { this.validateName(); this.updateErrorView(); });

    this.q('#email')?.addEventListener('input', () => { this.validateEmail(); this.updateErrorView(); });
    this.q('#email')?.addEventListener('blur',  () => { this.validateEmail(); this.updateErrorView(); });

    const msgEl = this.q('#' + this.messageId);
    msgEl?.addEventListener('input', () => { this.validateMessage(); this.updateErrorView(); });
    msgEl?.addEventListener('blur',  () => { this.validateMessage(); this.updateErrorView(); });
  }

  /* ---------- Field validators ---------- */
  validateName() {
    const el = this.q('#name');
    if (!el) return;
    const val = (el.value || '').trim();

    this.toggleInvalid('name', !val, MSGS.nameMissing);

    // require at least two letters overall
    const letters = (val.match(LETTER_RE) || []).length;
    this.toggleInvalid('name', val && letters < 2, MSGS.nameLooksWrong);
  }

  validateEmail() {
    const el = this.q('#email');
    if (!el) return;
    const val = (el.value || '').trim();
    const ok = !!val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    this.toggleInvalid('email', !ok, MSGS.emailInvalid);
  }

  validateMessage() {
    const el = this.q('#' + this.messageId);
    if (!el) return;
    const text = (el.value || '').trim();
    this.toggleInvalid(this.messageId, text.length < 10, MSGS.msgTooShort);
  }

  validateAll() {
    this.errors.clear();
    this.validateName();
    this.validateEmail();
    this.validateMessage();
    return this.errors.size === 0;
  }

  /* ---------- UI helpers ---------- */
  q(sel) { return this.form.querySelector(sel); }
  toggleInvalid(id, isInvalid, msg) {
    const el = this.q('#' + id);
    if (!el) return;
    if (isInvalid) {
      el.setAttribute('aria-invalid', 'true');
      this.errors.add(msg);
    } else {
      el.removeAttribute('aria-invalid');
      this.errors.delete(msg);
    }
  }
  clearInvalids() {
    this.form.querySelectorAll('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'));
  }
  updateErrorView() {
    if (!this.errorsEl) return;
    if (this.errors.size === 0) { this.errorsEl.innerHTML = ''; return; }
    const items = [...this.errors].map(m => `<li>${m}</li>`).join('');
    this.errorsEl.innerHTML = `<ul class="errors">${items}</ul>`;
  }

  /* ---------- Drafts ---------- */
  getValue(id) { const el = this.q('#' + id); return el ? String(el.value || '') : ''; }
  setValue(id, val) { const el = this.q('#' + id); if (el) el.value = val || ''; }
  saveDraft() {
    const draft = {};
    this.fields.forEach(f => draft[f] = this.getValue(f));
    storage.set(DRAFT_KEY, draft);
  }
  loadDraft() {
    const draft = storage.get(DRAFT_KEY);
    if (!draft) return;
    this.fields.forEach(f => this.setValue(f, draft[f]));
  }
  clearDraft() { storage.remove(DRAFT_KEY); }

  /* ---------- Counters ---------- */
  initCounters() {
    const msgEl = this.q('#' + this.messageId);
    const countEl = document.getElementById('char-count');
    if (!msgEl || !countEl) return;
    msgEl.addEventListener('input', () => this.updateCounter());
    this.updateCounter();
  }
  updateCounter() {
    const msgEl = this.q('#' + this.messageId);
    const countEl = document.getElementById('char-count');
    if (!msgEl || !countEl) return;
    const max = parseInt(msgEl.getAttribute('maxlength') || '300', 10);
    const len = (msgEl.value || '').length;
    countEl.textContent = `${len}/${max} characters`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const assistant = new FormAssistant(document.getElementById('contact-form'));
  assistant.init();
});

