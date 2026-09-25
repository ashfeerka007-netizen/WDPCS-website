/**
 * WAYANAD DISTRICT POLICE CO-OPERATIVE SOCIETY LTD. NO. W 208
 * Contact & Enquiry Form Validation & Submission Handler
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('societyEnquiryForm');
  const captchaQuestion = document.getElementById('captchaQuestion');
  const captchaAnswerInput = document.getElementById('captchaAnswer');
  const formAlert = document.getElementById('formStatusAlert');
  const submitBtn = document.getElementById('enquirySubmitBtn');

  // Generate dynamic anti-spam math challenge
  let num1 = Math.floor(Math.random() * 8) + 2;
  let num2 = Math.floor(Math.random() * 8) + 1;
  let expectedCaptcha = num1 + num2;

  if (captchaQuestion) {
    captchaQuestion.textContent = `Security verification: What is ${num1} + ${num2}?`;
  }

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset alert
    if (formAlert) {
      formAlert.style.display = 'none';
      formAlert.className = 'alert-box';
      formAlert.innerHTML = '';
    }

    const fullName = form.fullName.value.trim();
    const phone = form.phone.value.trim();
    const email = form.email.value.trim();
    const enquiryType = form.enquiryType.value;
    const message = form.message.value.trim();
    const consent = form.privacyConsent.checked;
    const captchaVal = captchaAnswerInput ? parseInt(captchaAnswerInput.value.trim(), 10) : expectedCaptcha;

    // 1. Validate Required Fields
    if (!fullName || !phone || !email || !enquiryType || !message) {
      showFormError('Please fill in all mandatory fields marked with an asterisk (*).');
      return;
    }

    // 2. Validate Phone Number (Indian 10-digit format)
    const phoneClean = phone.replace(/[\s\-\+]/g, '');
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneClean) && !/^\d{10,12}$/.test(phoneClean)) {
      showFormError('Please enter a valid 10-digit mobile contact number.');
      return;
    }

    // 3. Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showFormError('Please provide a valid email address.');
      return;
    }

    // 4. Validate Captcha
    if (captchaVal !== expectedCaptcha) {
      showFormError('Security verification failed. Please enter the correct sum.');
      // Refresh captcha
      num1 = Math.floor(Math.random() * 8) + 2;
      num2 = Math.floor(Math.random() * 8) + 1;
      expectedCaptcha = num1 + num2;
      if (captchaQuestion) captchaQuestion.textContent = `Security verification: What is ${num1} + ${num2}?`;
      if (captchaAnswerInput) captchaAnswerInput.value = '';
      return;
    }

    // 5. Validate Privacy Consent
    if (!consent) {
      showFormError('You must agree to the data privacy and processing terms before submitting.');
      return;
    }

    // Disable button & show spinner
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg style="animation:spin 1s linear infinite; width:16px; height:16px; margin-right:8px; vertical-align:middle;" viewBox="0 0 24 24"><path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/></svg>
        Transmitting Enquiry...
      `;
    }

    // Simulate reliable form submission
    setTimeout(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit Enquiry';
      }

      form.reset();

      // Regenerate captcha
      num1 = Math.floor(Math.random() * 8) + 2;
      num2 = Math.floor(Math.random() * 8) + 1;
      expectedCaptcha = num1 + num2;
      if (captchaQuestion) captchaQuestion.textContent = `Security verification: What is ${num1} + ${num2}?`;

      showSuccessModal(fullName);
    }, 900);
  });

  function showFormError(msg) {
    if (!formAlert) return;
    formAlert.className = 'alert-box alert-warning';
    formAlert.innerHTML = `
      <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
      <div><strong>Validation Notice:</strong> ${msg}</div>
    `;
    formAlert.style.display = 'flex';
    formAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function showSuccessModal(name) {
    let modal = document.getElementById('enquirySuccessModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'enquirySuccessModal';
      modal.className = 'site-modal active';
      modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-header" style="background:#f0fdf4; border-bottom:1px solid #bbf7d0;">
            <h3 class="modal-title" style="color:#166534; display:flex; align-items:center; gap:8px;">
              <svg style="width:24px; height:24px; fill:#16a34a;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              Enquiry Submitted Successfully
            </h3>
            <button type="button" class="modal-close-btn" aria-label="Close modal">&times;</button>
          </div>
          <div class="modal-body">
            <p id="enquirySuccessMsg" style="font-size:0.95rem; color:var(--color-neutral-800); line-height:1.6;">
              Thank you. Your official enquiry has been recorded. The society administrative desk will review your submission and contact you during office working hours.
            </p>
            <div class="admin-placeholder-box" style="margin-top:1rem;">
              <strong>Society Desk Reference:</strong>
              <p style="margin:0; font-size:0.85rem;">Enquiry Ref: WDPCS-${Date.now().toString().slice(-6)} | Expected response: 1–2 official working days.</p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary btn-sm modal-close-btn">Acknowledge &amp; Close</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      modal.querySelectorAll('.modal-close-btn').forEach(b => {
        b.addEventListener('click', () => {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        });
      });
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }

    const msgElem = modal.querySelector('#enquirySuccessMsg');
    if (msgElem && name) {
      msgElem.innerHTML = `Thank you, <strong>${name}</strong>. Your enquiry has been received by the <strong>Wayanad District Police Co-operative Society Ltd. No. W 208</strong>. Society staff will respond via your provided telephone or email.`;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
});
