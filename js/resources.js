/**
 * resources.js — Resource Finder
 * (keeps logic simple; jQuery file adds copy buttons & counts)
 */
import { debounce, highlight } from './utils.js';

const data = [
  // Core specs & docs
  {
    id:'mdn-html', title:'MDN — HTML', url:'https://developer.mozilla.org/docs/Web/HTML',
    description:'Authoritative HTML documentation from Mozilla.',
    tags:['Unit 2','HTML','Reference']
  },
  {
    id:'w3c-validator', title:'W3C HTML Validator', url:'https://validator.w3.org/',
    description:'Validate your HTML and catch structural errors.',
    tags:['Unit 2','Validation','Tools']
  },
  {
    id:'mdn-a11y', title:'MDN — Accessibility Guide', url:'https://developer.mozilla.org/docs/Web/Accessibility',
    description:'Foundations of accessible web design (a11y).',
    tags:['Unit 3','Accessibility','Reference']
  },
  {
    id:'mdn-prefers', title:'MDN — prefers-color-scheme', url:'https://developer.mozilla.org/docs/Web/CSS/@media/prefers-color-scheme',
    description:'System color scheme detection and theming strategies.',
    tags:['Unit 4','CSS','JS']
  },

  // Unit 6 / jQuery & polish
  {
    id:'jquery-docs', title:'jQuery API Docs', url:'https://api.jquery.com/',
    description:'Official jQuery API reference for selectors, events, animation, and utilities.',
    tags:['Unit 6','JavaScript','Reference']
  },
  {
    id:'aria-authoring', title:'WAI-ARIA Authoring Practices — Disclosure', url:'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/',
    description:'Disclosure (show/hide) pattern used for the milestones rows: expected keyboard and ARIA behavior.',
    tags:['Unit 6','Accessibility','Reference']
  },

  // Unit 7 / External services
  {
    id:'mdn-web-share', title:'MDN — Web Share API', url:'https://developer.mozilla.org/docs/Web/API/Navigator/share',
    description:'Share links natively on supported devices with a clipboard fallback.',
    tags:['Unit 7','JavaScript','APIs']
  },
  {
    id:'hypothesis', title:'Hypothes.is — Embed', url:'https://web.hypothes.is/help/embedding-the-client/',
    description:'How to load the Hypothes.is annotation client, configuration options, and privacy notes.',
    tags:['Unit 7','Annotations','Docs']
  },
  {
    id:'giscus', title:'Giscus — GitHub Discussions Comments', url:'https://giscus.app/',
    description:'Add comments powered by GitHub Discussions. Use your repo, repo ID, category, and category ID.',
    tags:['Unit 7','Comments','Docs']
  },
  {
    id:'formspree', title:'Formspree — Forms without a backend', url:'https://formspree.io/',
    description:'Receive form submissions via POST; shows how to configure your form endpoint.',
    tags:['Unit 7','Forms','Service']
  }
];

class ResourceFinder {
  constructor(listEl, searchEl, chipsEl) {
    this.listEl = listEl;
    this.searchEl = searchEl;
    this.chipsEl = chipsEl;
    this.resetBtn = document.getElementById('resource-reset');
    this.state = { query:'', tags: new Set(), resources: data };
    this.allTags = [...new Set(data.flatMap(r => r.tags))].sort();
  }

  init() {
    if (!this.listEl) return;
    this.renderChips();
    this.renderList(this.state.resources);
    this.bindEvents();
  }

  bindEvents() {
    if (this.searchEl) {
      this.searchEl.addEventListener('input', debounce((e) => {
        this.state.query = e.target.value.trim();
        this.applyFilter();
      }, 200));
    }

    if (this.chipsEl) {
      this.chipsEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-tag]'); if (!btn) return;
        const tag = btn.getAttribute('data-tag');
        if (this.state.tags.has(tag)) this.state.tags.delete(tag);
        else this.state.tags.add(tag);
        btn.setAttribute('aria-pressed', String(this.state.tags.has(tag)));
        this.applyFilter();
      });
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => this.resetFilters());
    }
  }

  resetFilters() {
    this.state.query = '';
    this.state.tags.clear();
    if (this.searchEl) this.searchEl.value = '';
    if (this.chipsEl) {
      this.chipsEl.querySelectorAll('[data-tag]').forEach(b => b.setAttribute('aria-pressed', 'false'));
    }
    this.applyFilter();
  }

  matches(r) {
    for (const t of this.state.tags) if (!r.tags.includes(t)) return false;
    const q = this.state.query.toLowerCase();
    if (!q) return true;
    return r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
  }

  applyFilter() {
    const results = this.state.resources.filter(r => this.matches(r));
    this.renderList(results);
  }

  renderChips() {
    if (!this.chipsEl) return;
    const frag = document.createDocumentFragment();
    this.allTags.forEach(tag => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip';
      btn.setAttribute('data-tag', tag);
      btn.setAttribute('aria-pressed', 'false');
      btn.textContent = tag;
      frag.appendChild(btn);
    });
    this.chipsEl.innerHTML = '';
    this.chipsEl.appendChild(frag);
  }

  renderList(items) {
    const q = this.state.query;
    const frag = document.createDocumentFragment();

    items.forEach(r => {
      const li = document.createElement('li');
      li.className = 'resource-item';

      const a = document.createElement('a');
      a.href = r.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.innerHTML = highlight(r.title, q);

      const p = document.createElement('p');
      p.innerHTML = highlight(r.description, q);

      const tags = document.createElement('small');
      tags.textContent = r.tags.join(' · ');

      li.append(a, p, tags);
      frag.appendChild(li);
    });

    this.listEl.innerHTML = '';
    if (items.length === 0) {
      const li = document.createElement('li');
      li.className = 'resource-item';
      li.textContent = 'No matching resources.';
      this.listEl.appendChild(li);
    } else {
      this.listEl.appendChild(frag);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const finder = new ResourceFinder(
    document.getElementById('resource-list'),
    document.getElementById('resource-search'),
    document.getElementById('tag-chips')
  );
  finder.init();
});

