/* ==========================================================================
   eSaleAgreement.in Global Interactive Logic
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initPageLoader();
  initStickyHeader();
  initBackToTop();
  initActiveNavLink();
  initMobileMenu();
  initButtonRipple();
  initScrollReveal();
  initCountersCountUp();
  initTimelineProgress();
  initCardHoverEffect();
  initFaqAccordion();
  initContactFormValidation();
});

/**
 * Page loading screen transition
 */
function initPageLoader() {
  const loader = document.querySelector('.page-loader');
  if (!loader) return;

  // Add delay to prevent screen flicker and show premium feel
  setTimeout(() => {
    loader.classList.add('fade-out');
  }, 250);
}

/**
 * Sticky Header Transition on Scroll
 */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });
}

/**
 * Back to Top Button Actions
 */
function initBackToTop() {
  const backBtn = document.querySelector('.back-to-top');
  if (!backBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backBtn.classList.add('visible');
    } else {
      backBtn.classList.remove('visible');
    }
  }, { passive: true });

  backBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * Highlight active link in navigation menu
 */
function initActiveNavLink() {
  const path = window.location.pathname;
  let page = path.split('/').pop();
  
  // Fallback for directory roots
  if (!page || page === '') {
    page = 'index.html';
  }

  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const baseHref = href.split('#')[0];
    if (baseHref === page || (page === 'index.html' && (href === '#' || href === './'))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Mobile Navigation Burger Toggle
 */
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!menuToggle || !navMenu) return;

  const toggleMenu = () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', !isExpanded);
    navMenu.classList.toggle('is-active');
    
    // Lock background scrolling on active menu
    document.body.style.overflow = !isExpanded ? 'hidden' : '';
  };

  menuToggle.addEventListener('click', toggleMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('is-active')) {
        toggleMenu();
      }
    });
  });
}

/**
 * Click Ripple Effect for Primary Action Buttons
 */
function initButtonRipple() {
  const rippleButtons = document.querySelectorAll('.btn-ripple');

  rippleButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      ripple.classList.add('btn-ripple-span');

      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      ripple.style.position = 'absolute';
      ripple.style.width = '100px';
      ripple.style.height = '100px';
      ripple.style.background = 'rgba(255, 255, 255, 0.4)';
      ripple.style.borderRadius = '50%';
      ripple.style.pointerEvents = 'none';
      ripple.style.transform = 'translate(-50%, -50%) scale(0)';
      ripple.style.animation = 'ripple-effect 0.6s ease-out';

      if (getComputedStyle(this).position === 'static') {
        this.style.position = 'relative';
      }

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  if (!document.getElementById('ripple-style-block')) {
    const style = document.createElement('style');
    style.id = 'ripple-style-block';
    style.innerHTML = `
      @keyframes ripple-effect {
        to {
          transform: translate(-50%, -50%) scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Staggered Scroll Reveal Animations
 */
function initScrollReveal() {
  const grids = [
    { container: '.features-grid-saas', items: '.feature-card-saas', cols: 3 },
    { container: '.benefits-saas-grid', items: '.benefit-saas-card', cols: 4 },
    { container: '.pricing-grid', items: '.pricing-card', cols: 3 }
  ];

  grids.forEach(grid => {
    const parent = document.querySelector(grid.container);
    if (!parent) return;

    const cards = parent.querySelectorAll(grid.items);
    cards.forEach((card, idx) => {
      card.classList.add('reveal-slide-up');
      const delay = (idx % grid.cols) * 0.12;
      card.style.transitionDelay = `${delay}s`;
    });
  });

  const otherReveals = [
    ...document.querySelectorAll('.section-header'),
    ...document.querySelectorAll('.contact-info-item'),
    document.querySelector('.contact-form-card'),
    document.querySelector('.comparison-table-wrapper')
  ].filter(Boolean);

  otherReveals.forEach(el => el.classList.add('reveal-slide-up'));

  const observerOptions = {
    root: null,
    threshold: 0.05,
    rootMargin: '0px 0px -40px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const items = document.querySelectorAll('.reveal-slide-up, .reveal-fade-in, .reveal-zoom-in');
  items.forEach(el => revealObserver.observe(el));
}

/**
 * Statistics Count-up Animations
 */
function initCountersCountUp() {
  const counters = document.querySelectorAll('.metric-number');
  if (counters.length === 0) return;

  const animateCount = (el) => {
    const countTo = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const decimals = parseInt(el.getAttribute('data-decimals')) || 0;
    const duration = 1500; // ms
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentVal = progress * countTo;
      
      el.textContent = currentVal.toFixed(decimals) + suffix;
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = countTo.toFixed(decimals) + suffix;
      }
    };
    window.requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  counters.forEach(counter => counterObserver.observe(counter));
}

/**
 * Timeline Scroll Tracker in 'how-it-works.html'
 */
function initTimelineProgress() {
  const timeline = document.querySelector('.timeline-container');
  if (!timeline) return;

  const handleTimelineProgress = () => {
    const rect = timeline.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    const centerPoint = window.scrollY + windowHeight / 2;
    const timelineTop = rect.top + window.scrollY;
    const timelineHeight = rect.height;
    
    let percent = (centerPoint - timelineTop) / timelineHeight;
    percent = Math.min(Math.max(percent, 0), 1) * 100;
    
    const progressBar = document.getElementById('timeline-progress-bar');
    if (progressBar) {
      progressBar.style.height = `${percent}%`;
    }

    const steps = document.querySelectorAll('.timeline-step');
    steps.forEach(step => {
      const stepRect = step.getBoundingClientRect();
      const stepTop = stepRect.top + window.scrollY;
      
      if (centerPoint >= stepTop - 80) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  };

  window.addEventListener('scroll', handleTimelineProgress, { passive: true });
  handleTimelineProgress();
}

/**
 * Mouse spotlight glow hover effect for card grids
 */
function initCardHoverEffect() {
  const cards = document.querySelectorAll('.feature-card-saas, .benefit-saas-card, .pricing-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--x', `${x}px`);
      card.style.setProperty('--y', `${y}px`);
    });
  });
}

/**
 * Accordion Expand/Collapse logic in 'faq.html'
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length === 0) return;

  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    const body = item.querySelector('.faq-body');

    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-body').style.maxHeight = null;
        }
      });

      // Toggle current item
      if (isActive) {
        item.classList.remove('active');
        body.style.maxHeight = null;
      } else {
        item.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
}

/**
 * Contact Validation with WhatsApp Redirect
 */
function initContactFormValidation() {
  const form = document.getElementById('saas-contact-form');
  if (!form) return;

  const nameInput = document.getElementById('form-name');
  const phoneInput = document.getElementById('form-phone');
  const emailInput = document.getElementById('form-email');
  const bizInput = document.getElementById('form-biz');
  const msgInput = document.getElementById('form-msg');
  const submitBtn = document.getElementById('form-submit-btn');

  const validators = {
    name: (val) => val.trim().length >= 2,
    phone: (val) => /^[6-9]\d{9}$/.test(val.trim()),
    email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
    biz: (val) => val.trim().length >= 2,
    msg: (val) => val.trim().length >= 5
  };

  const showValidation = (input, isValid, errorElId) => {
    const errorEl = document.getElementById(errorElId);
    if (isValid) {
      input.classList.remove('invalid');
      input.classList.add('valid');
      if (errorEl) errorEl.style.display = 'none';
    } else {
      input.classList.remove('valid');
      input.classList.add('invalid');
      if (errorEl) errorEl.style.display = 'block';
    }
  };

  nameInput.addEventListener('input', () => {
    showValidation(nameInput, validators.name(nameInput.value), 'name-error');
  });

  phoneInput.addEventListener('input', () => {
    showValidation(phoneInput, validators.phone(phoneInput.value), 'phone-error');
  });

  emailInput.addEventListener('input', () => {
    showValidation(emailInput, validators.email(emailInput.value), 'email-error');
  });

  bizInput.addEventListener('input', () => {
    showValidation(bizInput, validators.biz(bizInput.value), 'biz-error');
  });

  msgInput.addEventListener('input', () => {
    showValidation(msgInput, validators.msg(msgInput.value), 'msg-error');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const isNameValid = validators.name(nameInput.value);
    const isPhoneValid = validators.phone(phoneInput.value);
    const isEmailValid = validators.email(emailInput.value);
    const isBizValid = validators.biz(bizInput.value);
    const isMsgValid = validators.msg(msgInput.value);

    showValidation(nameInput, isNameValid, 'name-error');
    showValidation(phoneInput, isPhoneValid, 'phone-error');
    showValidation(emailInput, isEmailValid, 'email-error');
    showValidation(bizInput, isBizValid, 'biz-error');
    showValidation(msgInput, isMsgValid, 'msg-error');

    const formIsValid = isNameValid && isPhoneValid && isEmailValid && isBizValid && isMsgValid;

    if (!formIsValid) {
      const formCard = document.querySelector('.contact-form-card');
      if (formCard) {
        formCard.style.animation = 'shake 0.4s ease-in-out';
        setTimeout(() => {
          formCard.style.animation = '';
        }, 400);
      }
      return;
    }

    // Dynamic submit styling
    submitBtn.disabled = true;
    const btnText = submitBtn.querySelector('span');
    const originalText = btnText.textContent;
    btnText.textContent = 'Redirecting to WhatsApp...';

    // Format WhatsApp inquiry text
    const textMsg = `Hello,

New enquiry from eSaleAgreement Website.

Full Name: ${nameInput.value.trim()}
Mobile Number: ${phoneInput.value.trim()}
Email Address: ${emailInput.value.trim()}
Business Name: ${bizInput.value.trim()}
Message: ${msgInput.value.trim()}`;

    const encoded = encodeURIComponent(textMsg);
    const waUrl = `https://wa.me/918639833447?text=${encoded}`;

    // Reset button after slight delay and trigger redirection in new tab
    setTimeout(() => {
      submitBtn.disabled = false;
      btnText.textContent = originalText;
      
      // Open in a new tab
      window.open(waUrl, '_blank');
      
      form.reset();
      const inputs = [nameInput, phoneInput, emailInput, bizInput, msgInput];
      inputs.forEach(input => input.classList.remove('valid'));
    }, 1000);
  });
}
