/**
 * main-jq.js — Unit 6 jQuery enhancements
 * Progressive sugar layered on top of the existing vanilla modules.
 * If jQuery isn't present, nothing breaks; users still get the vanilla experience.
 *
 * Enhancements:
 * 1) Smooth scroll for in-page anchors.
 * 2) Back-to-top button that appears after scrolling.
 * 3) Checklist progress bar (reads our existing localStorage completion).
 * 4) "Hide completed" toggle for the checklist.
 * 5) Resource results counter that updates live.
 * 6) "Copy link" buttons on each resource item + tiny toast.
 * 7) Unit 7 external services (Share, Hypothes.is, Giscus, Formspree).
 * 8) Milestones disclosures: animate existing <details> in the table (no injection).
 *
 * A11y notes:
 * - We don't steal focus except for deliberate actions (e.g., smooth scroll target).
 * - Progress bar includes a text label for screen readers.
 * - Back-to-top has aria-label and uses a button element.
 */

(function () {
  if (!window.jQuery) return;
  const $ = window.jQuery;

  $(function () {
    /* -----------------------------
       1) Smooth scroll for anchors
       ----------------------------- */
    $('a[href^="#"]').not('[href="#"]').on('click', function (e) {
      const href = this.getAttribute('href');
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = Math.max(0, $(target).offset().top - 12);
      $('html, body').animate({ scrollTop: top }, 300, () => {
        // Maintain focus for keyboard/screen reader users
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        setTimeout(() => target.removeAttribute('tabindex'), 0);
      });
    });

    /* -----------------------------
       2) Back-to-top button
       ----------------------------- */
    const $toTop = $('<button id="back-to-top" type="button" aria-label="Back to top">↑</button>');
    $('body').append($toTop);
    $(window).on('scroll', () => {
      $toTop.toggle($(window).scrollTop() > 400);
    });
    $toTop.on('click', () => $('html, body').animate({ scrollTop: 0 }, 400));

    /* ----------------------------------
       Helpers for checklist & resources
       ---------------------------------- */
    const $checklistApp = $('#checklist-app');
    const $resourceList = $('#resource-list');

    // Mutation observer utility
    const observe = (el, cb) => {
      if (!el) return;
      new MutationObserver(() => cb()).observe(el, { childList: true, subtree: true });
    };

    /* -----------------------------
       3) Checklist progress bar
       ----------------------------- */
    function ensureProgressBar() {
      if ($('#checklist-progress').length) return;
      const $bar = $(`
        <div id="checklist-progress" role="group" aria-label="Checklist progress">
          <div class="bar" aria-hidden="true"></div>
          <span class="label"></span>
        </div>
      `);
      $('#checklist-h2').after($bar);
    }

    function updateChecklistProgress() {
      const $lis = $('#checklist-app li');
      if ($lis.length === 0) return;
      ensureProgressBar();

      // Count "done" by checking the button state in each <li>
      const done = $lis.filter((_, li) =>
        $(li).find('button[aria-pressed="true"]').length > 0
      ).length;

      const total = $lis.length;
      const pct = total ? Math.round((done / total) * 100) : 0;

      $('#checklist-progress .bar').css('width', pct + '%');
      $('#checklist-progress .label').text(`${done}/${total} done (${pct}%)`);
    }

    // Recompute after the vanilla checklist renders or changes
    updateChecklistProgress();
    observe($checklistApp.get(0), updateChecklistProgress);

    // Also update on button clicks (delegate)
    $checklistApp.on('click', '[data-step-id]', () => {
      // wait a tick for the vanilla handler to toggle aria-pressed & storage
      setTimeout(updateChecklistProgress, 0);
    });

    /* -----------------------------
       4) Hide completed toggle
       ----------------------------- */
    const HIDE_KEY = 'u6_hide_completed';
    function ensureHideToggle() {
      if ($('#hide-completed').length) return;
      const $wrap = $(`
        <label id="hide-completed-wrap">
          <input type="checkbox" id="hide-completed"> Hide completed
        </label>
      `);
      $('#checklist-section .toolbar').append($wrap);

      // Restore saved preference
      const saved = localStorage.getItem(HIDE_KEY) === 'true';
      $('#hide-completed').prop('checked', saved);
      applyHide(saved);

      $('#hide-completed').on('change', function () {
        const val = $(this).is(':checked');
        localStorage.setItem(HIDE_KEY, String(val));
        applyHide(val);
        updateChecklistProgress();
      });
    }

    function applyHide(hide = $('#hide-completed').is(':checked')) {
      $('#checklist-app li').each(function () {
        const isDone = $(this).find('button[aria-pressed="true"]').length > 0;
        $(this).toggle(!(hide && isDone));
      });
    }

    ensureHideToggle();
    observe($checklistApp.get(0), () => {
      ensureHideToggle();
      applyHide();
    });

    /* -----------------------------
       5) Resource results counter
       ----------------------------- */
    function updateResourceCount() {
      const $items = $('#resource-list > li');
      if ($items.length === 0) {
        $('#resource-count').text('0');
        return;
      }
      const onlyEmpty =
        $items.length === 1 && $items.first().text().trim() === 'No matching resources.';
      $('#resource-count').text(onlyEmpty ? '0' : String($items.length));
    }

    updateResourceCount();
    observe($resourceList.get(0), updateResourceCount);
    // Also hook into user actions that trigger re-renders in your vanilla code
    $('#resource-search, #tag-chips, #resource-reset').on('input click', () => {
      // a tiny delay lets the vanilla renderer finish
      setTimeout(updateResourceCount, 0);
    });

    /* -----------------------------
       6) Copy-link buttons + toast
       ----------------------------- */
    function ensureToast() {
      if (!$('#toast').length) $('body').append('<div id="toast" role="status" aria-live="polite" />');
    }
    function toast(msg) {
      ensureToast();
      $('#toast').stop(true, true).text(msg).fadeIn(120).delay(900).fadeOut(250);
    }

    function enhanceResourceItems() {
      $('#resource-list > li').each(function () {
        const $li = $(this);
        if ($li.find('.copy-link').length) return;         // already enhanced
        const $a = $li.find('a').first();
        if (!$a.length) return;                             // "No matching..." item

        const $btn = $('<button type="button" class="copy-link">Copy link</button>');
        $btn.on('click', async () => {
          try {
            await navigator.clipboard.writeText($a.attr('href'));
            toast('Link copied');
          } catch {
            toast('Copy failed');
          }
        });
        $li.append($btn);
      });
    }

    enhanceResourceItems();
    observe($resourceList.get(0), enhanceResourceItems);

    /* ============================
       7) Unit 7: external services
       ============================ */

    // A) Web Share API (with clipboard fallback)
    $('#share-btn').on('click', async function () {
      const data = {
        title: document.title,
        text: 'Check this out:',
        url: location.href
      };
      try {
        if (navigator.share) {
          await navigator.share(data);
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(location.href);
          toast('Link copied');
        } else {
          alert(location.href); // ultra-fallback
        }
      } catch (_) {
        // user canceled or not allowed; no-op
      }
    });

    // B) Hypothes.is (privacy-friendly opt-in)
    $('#enable-hypothesis').one('click', function () {
      const s = document.createElement('script');
      s.src = 'https://hypothes.is/embed.js';
      s.async = true;
      document.body.appendChild(s);
      $(this).prop('disabled', true).text('Annotations enabled');
      toast('Annotations enabled');
    });

    // C) Giscus comments (lazy load; fill data-* in HTML)
    $('#load-comments').one('click', function () {
      const $btn = $(this);
      const ds = $btn.get(0).dataset;
      // required: repo, repoId, category, categoryId
      const sc = document.createElement('script');
      sc.src = 'https://giscus.app/client.js';
      sc.async = true;
      sc.crossOrigin = 'anonymous';
      sc.setAttribute('data-repo', ds.repo || '');
      sc.setAttribute('data-repo-id', ds.repoId || '');
      sc.setAttribute('data-category', ds.category || '');
      sc.setAttribute('data-category-id', ds.categoryId || '');
      sc.setAttribute('data-mapping', ds.mapping || 'pathname');
      sc.setAttribute('data-strict', ds.strict || '0');
      sc.setAttribute('data-reactions-enabled', ds.reactionsEnabled || '1');
      sc.setAttribute('data-emit-metadata', ds.emitMetadata || '0');
      sc.setAttribute('data-input-position', ds.inputPosition || 'bottom');
      sc.setAttribute('data-theme', ds.theme || (document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'));
      sc.setAttribute('data-lang', ds.lang || 'en');
      sc.setAttribute('data-loading', 'lazy');
      sc.setAttribute('crossorigin', 'anonymous');

      document.querySelector('#giscus-thread').appendChild(sc);
      $btn.prop('disabled', true).text('Comments loaded');
      toast('Comments loaded');
    });

    // D) Formspree (progressive enhancement)
    // If the form has a data-formspree attribute, hijack submit and POST via fetch.
    const $form = $('#contact-form[data-formspree]');
    if ($form.length) {
      $form.on('submit', async function (e) {
        const endpoint = $form.data('formspree');
        if (!endpoint) return; // nothing to do
        e.preventDefault();

        const formData = Object.fromEntries(new FormData(this).entries());
        try {
          const res = await fetch(String(endpoint), {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
          if (res.ok) {
            toast('Thanks! Message sent.');
            (this).reset();
            $('#char-count').text('0/300 characters');
          } else {
            toast('Send failed. Try again.');
          }
        } catch {
          toast('Network error.');
        }
      });
    }

    /* -------------------------------------------------------------------
       8) Milestones disclosures: enhance existing <details>
       - Wrap content for slide animation.
       - Sync aria-expanded on the <summary>.
       - Works with native details/toggle.
       ------------------------------------------------------------------- */
    const $schedule = $('section#schedule');
    function enhanceMilestones() {
      $schedule.find('details').each(function () {
        const $details = $(this);
        if ($details.data('enhanced')) return;

        const $summary = $details.children('summary').first();

        // Wrap all non-summary children into a body wrapper for sliding
        const $contentKids = $details.children(':not(summary)');
        const $body = $('<div class="details-body"></div>');
        $body.append($contentKids);
        $details.append($body);

        // Initial visibility matches native open state
        if ($details.prop('open')) {
          $body.show();
          $summary.attr('aria-expanded', 'true');
        } else {
          $body.hide();
          $summary.attr('aria-expanded', 'false');
        }

        // Animate on toggle (native event)
        $details.on('toggle', function () {
          const isOpen = $details.prop('open');
          $summary.attr('aria-expanded', String(isOpen));
          if (isOpen) {
            $body.stop(true, true).slideDown(180);
          } else {
            $body.stop(true, true).slideUp(180);
          }
        });

        $details.data('enhanced', true);
      });
    }

    enhanceMilestones();
  });
})();