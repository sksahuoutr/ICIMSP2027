/* js/main.js
   ICIMSP 2027 — small site interaction script
   - Dropdown mobile toggle / accessibility
   - Escape to close / outside click handling
   - Responsive cleanup on resize
*/

(function () {
  'use strict';

  console.log('ICIMSP 2027 Website Loaded');

  // Utilities
  const isMobileView = () => window.innerWidth <= 700;
  const KEY_ENTER = 'Enter';
  const KEY_SPACE = ' ';
  const KEY_ESCAPE = 'Escape';

  // Manage dropdowns
  const dropdowns = Array.from(document.querySelectorAll('.main-nav .dropdown'));

  function closeDropdown(drop) {
    if (!drop) return;
    drop.classList.remove('open');
    drop.setAttribute('aria-expanded', 'false');
  }

  function openDropdown(drop) {
    if (!drop) return;
    drop.classList.add('open');
    drop.setAttribute('aria-expanded', 'true');
  }

  function toggleDropdown(drop) {
    if (!drop) return;
    const isOpen = drop.classList.toggle('open');
    drop.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    return isOpen;
  }

  function closeAllDropdowns(except = null) {
    dropdowns.forEach(d => {
      if (d !== except) closeDropdown(d);
    });
  }

  // Initialize ARIA and listeners
  function initDropdown(drop) {
    const trigger = drop.querySelector('a');
    const submenu = drop.querySelector('.submenu');
    // Ensure attributes exist
    drop.setAttribute('aria-expanded', 'false');
    drop.setAttribute('role', 'presentation');
    if (trigger) {
      trigger.setAttribute('aria-haspopup', 'true');
      trigger.setAttribute('aria-controls', submenu ? (submenu.id || '') : '');
    }

    // If there's a caret node inside the link (recommended), make it toggle-only
    const caret = trigger ? trigger.querySelector('.caret') : null;

    // Click on trigger:
    // - On mobile view: prevent navigation and toggle submenu
    // - On desktop: allow navigation (but hover/focus will open submenu via CSS)
    function onTriggerClick(e) {
      if (isMobileView()) {
        e.preventDefault();
        // toggle this dropdown, close others
        const isOpen = toggleDropdown(drop);
        if (isOpen) closeAllDropdowns(drop);
      } else {
        // Desktop: let it navigate to the parent link if user clicks it
        // but also ensure ARIA is correct
        closeAllDropdowns();
        closeDropdown(drop);
      }
    }

    // If caret exists, clicking it should toggle even on desktop — optional behavior.
    // We only treat caret specially on small screens to avoid surprising desktop users.
    if (caret) {
      caret.setAttribute('role', 'button');
      caret.setAttribute('tabindex', '0');
      caret.addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        const isOpen = toggleDropdown(drop);
        if (isOpen) closeAllDropdowns(drop);
      });
      caret.addEventListener('keydown', function (ev) {
        if (ev.key === KEY_ENTER || ev.key === KEY_SPACE) {
          ev.preventDefault();
          const isOpen = toggleDropdown(drop);
          if (isOpen) closeAllDropdowns(drop);
        }
      });
    }

    if (trigger) {
      trigger.addEventListener('click', onTriggerClick);

      // Keyboard support: Enter / Space toggles on mobile (or when user focuses)
      trigger.addEventListener('keydown', function (ev) {
        if (ev.key === KEY_ENTER || ev.key === KEY_SPACE) {
          // On desktop, Enter on a link should still follow it; only intercept for mobile.
          if (isMobileView()) {
            ev.preventDefault();
            const isOpen = toggleDropdown(drop);
            if (isOpen) closeAllDropdowns(drop);
          }
        } else if (ev.key === KEY_ESCAPE) {
          closeDropdown(drop);
          trigger.blur();
        }
      });
    }

    // Ensure focus-within closes others (keyboard users)
    drop.addEventListener('focusin', function () {
      // keep this dropdown open for keyboard navigation
      drop.setAttribute('aria-expanded', drop.classList.contains('open') ? 'true' : 'false');
      closeAllDropdowns(drop);
    });
  }

  // Initialize each dropdown
  dropdowns.forEach(initDropdown);

  // Click outside: close any open dropdowns
  document.addEventListener('click', function (ev) {
    // if click is inside any dropdown, ignore
    const insideAny = dropdowns.some(d => d.contains(ev.target));
    if (!insideAny) closeAllDropdowns();
  });

  // Close on Escape
  document.addEventListener('keydown', function (ev) {
    if (ev.key === KEY_ESCAPE) {
      closeAllDropdowns();
    }
  });

  // Responsive cleanup: when switching to desktop view, ensure dropdowns are closed
  let resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (!isMobileView()) {
        // Close all dropdowns when returning to desktop
        closeAllDropdowns();
      }
    }, 120);
  });

  // Accessibility note: if your parent nav link uses the caret pattern, ensure HTML has:
  // <li class="dropdown"><a href="organizing-committee.html">Committee <span class="caret">▾</span></a>
  //   <ul class="submenu">...</ul></li>
})();
