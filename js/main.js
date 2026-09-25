/**
 * WAYANAD DISTRICT POLICE CO-OPERATIVE SOCIETY LTD. NO. W 208
 * Core JavaScript & Global Utilities
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initFontResizer();
  initModals();
  initPlaceholderAlerts();
  initHeaderSearch();
});

function initHeaderSearch() {
  const searchBtn = document.querySelector('.header-search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('headerSearchModal');
      const input = document.getElementById('headerSearchInput');
      if (input) setTimeout(() => input.focus(), 100);
    });
  }
}

/* ==========================================================================
   Mobile Navigation
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (!toggleBtn || !mainNav) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', !isExpanded);
    mainNav.classList.toggle('active');
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!mainNav.contains(e.target) && !toggleBtn.contains(e.target)) {
      mainNav.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('active')) {
      mainNav.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ==========================================================================
   Font Size Accessibility Resizer
   ========================================================================== */
function initFontResizer() {
  const buttons = document.querySelectorAll('.font-resizer button');
  const html = document.documentElement;

  // Load saved preference
  const savedSize = localStorage.getItem('wdpcs_font_size') || 'md';
  applyFontSize(savedSize);

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const size = btn.getAttribute('data-size');
      applyFontSize(size);
      localStorage.setItem('wdpcs_font_size', size);
    });
  });

  function applyFontSize(size) {
    html.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg');
    html.classList.add(`font-size-${size}`);

    buttons.forEach(b => {
      if (b.getAttribute('data-size') === size) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
  }
}

/* ==========================================================================
   Generic Modal Manager
   ========================================================================== */
function initModals() {
  const modalTriggers = document.querySelectorAll('[data-modal-target]');
  const closeButtons = document.querySelectorAll('.modal-close-btn, [data-modal-close]');

  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = trigger.getAttribute('data-modal-target');
      openModal(targetId);
    });
  });

  closeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = btn.closest('.site-modal');
      if (modal) closeModal(modal);
    });
  });

  // Close modal when clicking backdrop
  document.querySelectorAll('.site-modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  // Close modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.site-modal.active');
      if (activeModal) closeModal(activeModal);
    }
  });
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    const focusable = modal.querySelector('button, [href], input, select, textarea');
    if (focusable) focusable.focus();
  }
}

function closeModal(modal) {
  if (typeof modal === 'string') {
    modal = document.getElementById(modal);
  }
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   Placeholder & Download Notice Alert
   ========================================================================== */
function initPlaceholderAlerts() {
  document.querySelectorAll('.js-placeholder-download').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const docName = btn.getAttribute('data-doc-name') || 'Official Application Form';
      showPlaceholderModal(docName);
    });
  });

  document.querySelectorAll('.js-external-booking').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const url = btn.getAttribute('href');
      if (!url || url === '#' || url.includes('EXTERNAL')) {
        e.preventDefault();
        showExternalBookingModal(btn.getAttribute('data-service-name') || 'Accommodation');
      }
    });
  });
}

function showPlaceholderModal(docName) {
  let modal = document.getElementById('placeholderDocModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'placeholderDocModal';
    modal.className = 'site-modal active';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">Official Document Notice</h3>
          <button type="button" class="modal-close-btn" aria-label="Close dialog">&times;</button>
        </div>
        <div class="modal-body">
          <div class="alert-box alert-info">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            <div>
              <strong>Administrative Form Upload Slot</strong>
              <p id="placeholderDocText" style="margin-top:4px; font-size:0.875rem;">This official form is scheduled for upload by the Society Administrator.</p>
            </div>
          </div>
          <p style="font-size:0.9rem; color:var(--color-neutral-700);">
            To obtain an attested physical copy of this form immediately, please visit the Society's registered office during working hours or contact the helpdesk.
          </p>
        </div>
        <div class="modal-footer">
          <a href="contact.html" class="btn btn-primary btn-sm">Contact Society Office</a>
          <button type="button" class="btn btn-secondary btn-sm modal-close-btn">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.modal-close-btn').addEventListener('click', () => closeModal(modal));
    modal.querySelectorAll('.modal-close-btn').forEach(b => b.addEventListener('click', () => closeModal(modal)));
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });
  }

  const textElem = modal.querySelector('#placeholderDocText');
  if (textElem) {
    textElem.textContent = `The official document "${docName}" is configured as an administrative placeholder and will be available once the verified society PDF is uploaded.`;
  }
  openModal('placeholderDocModal');
}

function showExternalBookingModal(serviceName) {
  let modal = document.getElementById('placeholderBookingModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'placeholderBookingModal';
    modal.className = 'site-modal active';
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 class="modal-title">External Booking Notice</h3>
          <button type="button" class="modal-close-btn" aria-label="Close dialog">&times;</button>
        </div>
        <div class="modal-body">
          <div class="alert-box alert-info">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            <div>
              <strong>External Booking Portal Redirect</strong>
              <p style="margin-top:4px; font-size:0.875rem;">Booking for Society Rooms &amp; Dormitories is operated via an external authorised booking portal.</p>
            </div>
          </div>
          <p style="font-size:0.9rem; color:var(--color-neutral-700);">
            The official external booking portal URL is currently set as <span class="admin-placeholder">[EXTERNAL BOOKING URL]</span>.
            Please check back soon or contact the Society office for room availability.
          </p>
        </div>
        <div class="modal-footer">
          <a href="contact.html" class="btn btn-primary btn-sm">Contact Office for Bookings</a>
          <button type="button" class="btn btn-secondary btn-sm modal-close-btn">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelectorAll('.modal-close-btn').forEach(b => b.addEventListener('click', () => closeModal(modal)));
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });
  }
  openModal('placeholderBookingModal');
}
