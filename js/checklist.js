/**
 * checklist.js — Guided Checklist Navigator
 * Demonstrates: arrays/objects, classes, iteration/selection, events, a11y, localStorage
 */
import { storage, debounce } from './utils.js';

const COMPLETION_KEY = 'u5_checklist_completion';

const units = [
  { id: 'u1', title: 'Unit 1 — Design & Personas' },
  { id: 'u2', title: 'Unit 2 — HTML Structure' },
  { id: 'u3', title: 'Unit 3 — CSS Styling' },
  { id: 'u4', title: 'Unit 4 — Script Use & Critique' },
  { id: 'u5', title: 'Unit 5 — Write JavaScript' },
  { id: 'u6', title: 'Unit 6 — jQuery Enhancements' },
  { id: 'u7', title: 'Unit 7 — External Services' },
  { id: 'pf', title: 'Portfolio — Package & Submit' },
];

const steps = [
  // ===== Unit 1 (kept)
  { id:'u1-s1', unit:'u1', text:'Draft personas and scenarios', link:'#' },
  { id:'u1-s2', unit:'u1', text:'Write Unit 1 reflective diary', link:'#' },

  // ===== Unit 2 — HTML site building (short bullets)
  { id:'u2-s1', unit:'u2', text:'Finish Unit 1 + diary first', link:'#' },
  { id:'u2-s2', unit:'u2', text:'Refactor sample1/2 into valid, maintainable HTML', link:'#' },
  { id:'u2-s3', unit:'u2', text:'Create a 3rd page; interlink all pages (relative URLs)', link:'#' },
  { id:'u2-s4', unit:'u2', text:'Add ≥1 image with meaningful alt text', link:'#' },
  { id:'u2-s5', unit:'u2', text:'Include ≥1 external link', link:'#' },
  { id:'u2-s6', unit:'u2', text:'Use ≥2 heading levels; include at least one list', link:'#' },
  { id:'u2-s7', unit:'u2', text:'Include a real data table (not for layout)', link:'#' },
  { id:'u2-s8', unit:'u2', text:'Add a form (mailto or service) to contact you', link:'#' },
  { id:'u2-s9', unit:'u2', text:'Use at least one <div> and one <span> with IDs/classes', link:'#' },
  { id:'u2-s10', unit:'u2', text:'Show author + last modified; organize /images folder', link:'#' },
  { id:'u2-s11', unit:'u2', text:'More info on D2L → Unit 2 → Problem & Process Guide', link:'#' },

  // ===== Unit 3 — CSS site styling
  { id:'u3-s1', unit:'u3', text:'Move all styling to external CSS (no inline styles)', link:'#' },
  { id:'u3-s2', unit:'u3', text:'Add classes/IDs as hooks only; keep HTML semantic', link:'#' },
  { id:'u3-s3', unit:'u3', text:'Improve readability: typography, spacing, contrast', link:'#' },
  { id:'u3-s4', unit:'u3', text:'Build responsive layout (mobile → desktop)', link:'#' },
  { id:'u3-s5', unit:'u3', text:'Style nav states and focus-visible; ensure skip link', link:'#' },
  { id:'u3-s6', unit:'u3', text:'Test in multiple browsers; fix obvious issues', link:'#' },
  { id:'u3-s7', unit:'u3', text:'Comment and organize CSS; remove dead rules', link:'#' },
  { id:'u3-s8', unit:'u3', text:'Link the stylesheet on all pages', link:'#' },
  { id:'u3-s9', unit:'u3', text:'More info on D2L → Unit 3 → Problem & Process Guide', link:'#' },

  // ===== Unit 4 — Script use & augmentation
  { id:'u4-s1', unit:'u4', text:'Choose small, relevant third-party JS (license OK)', link:'#' },
  { id:'u4-s2', unit:'u4', text:'Attribute source: author, URL, license (in code + page)', link:'#' },
  { id:'u4-s3', unit:'u4', text:'Explain what it does and why it fits personas/scenarios', link:'#' },
  { id:'u4-s4', unit:'u4', text:'Critique code quality (structure, naming, comments)', link:'#' },
  { id:'u4-s5', unit:'u4', text:'Modify/extend code to better fit your site', link:'#' },
  { id:'u4-s6', unit:'u4', text:'Keep progressive enhancement (works without JS)', link:'#' },
  { id:'u4-s7', unit:'u4', text:'Cross-browser test; accessibility check', link:'#' },
  { id:'u4-s8', unit:'u4', text:'More info on D2L → Unit 4 → Problem & Process Guide', link:'#' },

  // ===== Unit 5 — Writing JavaScript
  { id:'u5-s1', unit:'u5', text:'Post 3 JS ideas in diary; notify tutor; await feedback', link:'#' },
  { id:'u5-s2', unit:'u5', text:'Design first: data, functions/objects, flow/pseudo-code', link:'#' },
  { id:'u5-s3', unit:'u5', text:'Implement ~200–300 lines (can be in modules)', link:'#' },
  { id:'u5-s4', unit:'u5', text:'Use sequence/selection/iteration; variables & arrays', link:'#' },
  { id:'u5-s5', unit:'u5', text:'Include functions, classes/objects, DOM events', link:'#' },
  { id:'u5-s6', unit:'u5', text:'Add error handling (try/catch) + graceful fallbacks', link:'#' },
  { id:'u5-s7', unit:'u5', text:'Comment clearly; good names; avoid proprietary APIs', link:'#' },
  { id:'u5-s8', unit:'u5', text:'Diary: explain persona/scenario benefits', link:'#' },
  { id:'u5-s9', unit:'u5', text:'Upload and attach a ZIP snapshot (no images)', link:'#' },
  { id:'u5-s10', unit:'u5', text:'More info on D2L → Unit 5 → Problem & Process Guide', link:'#' },

  // ===== Unit 6 — Using libraries (jQuery)
  { id:'u6-s1', unit:'u6', text:'Add local jQuery; plan ~6+ meaningful enhancements', link:'#' },
  { id:'u6-s2', unit:'u6', text:'Write a short proposal; get tutor review', link:'#' },
  { id:'u6-s3', unit:'u6', text:'Implement UI features (tabs/accordions/back-to-top)', link:'#' },
  { id:'u6-s4', unit:'u6', text:'Ensure accessibility (keyboard, focus, ARIA)', link:'#' },
  { id:'u6-s5', unit:'u6', text:'Keep progressive enhancement; defer/optimize', link:'#' },
  { id:'u6-s6', unit:'u6', text:'Attribute any plugins; organize in main-jq.js', link:'#' },
  { id:'u6-s7', unit:'u6', text:'Attach ZIP snapshot; diary reflection (CDN vs local)', link:'#' },
  { id:'u6-s8', unit:'u6', text:'More info on D2L → Unit 6 → Problem & Process Guide', link:'#' },

  // ===== Unit 7 — Using external data/services
  { id:'u7-s1', unit:'u7', text:'Pick 2–10 services that clearly help your personas', link:'#' },
  { id:'u7-s2', unit:'u7', text:'Draft proposal (what/why/how); get tutor feedback', link:'#' },
  { id:'u7-s3', unit:'u7', text:'Integrate via API/AJAX; do light post-processing', link:'#' },
  { id:'u7-s4', unit:'u7', text:'Handle failures (offline, blocked, no account)', link:'#' },
  { id:'u7-s5', unit:'u7', text:'Protect keys; follow ToS/privacy; document needs', link:'#' },
  { id:'u7-s6', unit:'u7', text:'Serve over HTTP(S) (not file://) for XHR; test', link:'#' },
  { id:'u7-s7', unit:'u7', text:'Diary reflection; attach ZIP snapshot', link:'#' },
  { id:'u7-s8', unit:'u7', text:'More info on D2L → Unit 7 → Problem & Process Guide', link:'#' },

  // ===== Portfolio — Final submission
  { id:'pf-s1', unit:'pf', text:'Zip your website (full tree)', link:'#' },
  { id:'pf-s2', unit:'pf', text:'Export reflective diary as one PDF', link:'#' },
  { id:'pf-s3', unit:'pf', text:'Compile supporting evidence as one PDF', link:'#' },
  { id:'pf-s4', unit:'pf', text:'Complete Learning Outcomes Mapping file', link:'#' },
  { id:'pf-s5', unit:'pf', text:'Verify attributions/licenses (images/code)', link:'#' },
  { id:'pf-s6', unit:'pf', text:'Final a11y + cross-browser sweep; graceful failures', link:'#' },
  { id:'pf-s7', unit:'pf', text:'Upload single archive; ensure site is live', link:'#' },
  { id:'pf-s8', unit:'pf', text:'More info on D2L → Portfolio → Final Submission', link:'#' },
];

class ChecklistApp {
  constructor(rootEl) {
    this.root = rootEl;
    this.searchInput = document.getElementById('checklist-search');
    this.resetBtn = document.getElementById('checklist-reset');
    this.state = {
      units,
      steps,
      completion: storage.get(COMPLETION_KEY, {}), // { [stepId]: true }
      query: ''
    };
  }

  init() {
    if (!this.root) return;
    this.render();
    this.bindEvents();
  }

  bindEvents() {
    this.root.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-step-id]');
      if (!btn) return;
      const stepId = btn.getAttribute('data-step-id');
      this.toggleStep(stepId);
    });

    if (this.searchInput) {
      this.searchInput.addEventListener('input', debounce((e) => {
        this.state.query = e.target.value.trim().toLowerCase();
        this.render();
      }, 200));
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        this.state.query = '';
        if (this.searchInput) this.searchInput.value = '';
        this.render();
      });
    }
  }

  toggleStep(stepId) {
    const next = !this.state.completion[stepId];
    this.state.completion[stepId] = next;
    storage.set(COMPLETION_KEY, this.state.completion);
    this.render();
  }

  filteredSteps(unitId) {
    const q = this.state.query;
    return this.state.steps.filter(s => {
      if (s.unit !== unitId) return false;
      if (!q) return true;
      return s.text.toLowerCase().includes(q);
    });
  }

  render() {
    const frag = document.createDocumentFragment();

    this.state.units.forEach(u => {
      const card = document.createElement('article');
      card.className = 'card';
      card.setAttribute('aria-labelledby', `unit-${u.id}`);

      const h3 = document.createElement('h3');
      h3.id = `unit-${u.id}`;
      h3.textContent = u.title;

      const list = document.createElement('ul');
      list.className = 'checklist';

      const steps = this.filteredSteps(u.id);
      steps.forEach(s => {
        const li = document.createElement('li');

        const done = !!this.state.completion[s.id];
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('data-step-id', s.id);
        btn.setAttribute('aria-pressed', String(done));
        btn.className = done ? 'btn small' : 'btn small secondary';
        btn.textContent = done ? '✓ Done' : 'Mark done';

        const link = document.createElement('a');
        link.href = s.link || '#';
        link.textContent = s.text;
        link.className = 'step-link';

        li.append(btn, ' ', link);
        list.appendChild(li);
      });

      if (steps.length === 0) {
        const p = document.createElement('p');
        p.className = 'muted';
        p.textContent = 'No matching steps.';
        card.append(h3, p);
      } else {
        card.append(h3, list);
      }

      frag.appendChild(card);
    });

    this.root.innerHTML = '';
    this.root.appendChild(frag);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new ChecklistApp(document.getElementById('checklist-app'));
  app.init();
});

