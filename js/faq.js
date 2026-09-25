/**
 * WAYANAD DISTRICT POLICE CO-OPERATIVE SOCIETY LTD. NO. W 208
 * FAQ Accordion Interaction Handler
 */

document.addEventListener('DOMContentLoaded', () => {
  const faqButtons = document.querySelectorAll('.faq-header-btn');

  faqButtons.forEach(button => {
    button.addEventListener('click', () => {
      const parentItem = button.closest('.faq-item');
      const isExpanded = button.getAttribute('aria-expanded') === 'true';

      // Toggle current item
      button.setAttribute('aria-expanded', !isExpanded);
      if (parentItem) {
        parentItem.classList.toggle('active', !isExpanded);
      }
    });
  });
});
