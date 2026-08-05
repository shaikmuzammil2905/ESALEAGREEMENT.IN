/* ==========================================================================
   eSaleAgreement.in Global Interactive Logic
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  checkAdminHashMode();
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
  initAppDownloadInteractions();
  fetchDynamicSupabaseWebsiteData();
});

window.addEventListener('hashchange', checkAdminHashMode);

function checkAdminHashMode() {
  const hash = window.location.hash.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();
  
  // STRICT ADMIN MODE: Only trigger if hash is #admin / #/admin or pathname is /admin
  const isAdminMode = hash === '#admin' || 
                      hash.startsWith('#/admin') || 
                      hash.startsWith('#admin/') || 
                      pathname === '/admin' || 
                      pathname === '/admin/';

  if (hash === '#admin') {
    window.location.hash = '#/admin/dashboard';
  }

  const header = document.querySelector('.site-header');
  const main = document.querySelector('main');
  const footer = document.querySelector('footer');
  const pageLoader = document.querySelector('.page-loader');
  const adminRoot = document.getElementById('admin-root');

  if (isAdminMode) {
    document.body.classList.add('admin-mode');
    if (header) header.style.setProperty('display', 'none', 'important');
    if (main) main.style.setProperty('display', 'none', 'important');
    if (footer) footer.style.setProperty('display', 'none', 'important');
    if (pageLoader) {
      pageLoader.style.setProperty('display', 'none', 'important');
      pageLoader.classList.add('fade-out');
    }
    if (adminRoot) {
      adminRoot.style.setProperty('display', 'block', 'important');
      adminRoot.style.setProperty('opacity', '1', 'important');
      adminRoot.style.setProperty('visibility', 'visible', 'important');
      adminRoot.style.setProperty('position', 'fixed', 'important');
      adminRoot.style.setProperty('inset', '0', 'important');
      adminRoot.style.setProperty('z-index', '999999', 'important');
      adminRoot.style.setProperty('background-color', '#0f172a', 'important');
      adminRoot.style.setProperty('overflow-y', 'auto', 'important');
    }
  } else {
    document.body.classList.remove('admin-mode');
    if (header) header.style.display = '';
    if (main) main.style.display = '';
    if (footer) footer.style.display = '';
    if (adminRoot) {
      adminRoot.style.setProperty('display', 'none', 'important');
      adminRoot.style.setProperty('opacity', '0', 'important');
      adminRoot.style.setProperty('visibility', 'hidden', 'important');
      adminRoot.style.setProperty('pointer-events', 'none', 'important');
      adminRoot.style.setProperty('z-index', '-9999', 'important');
    }
  }
}

/**
 * Dynamically fetch dynamic CMS and Services data from Supabase if configured
 */
async function fetchDynamicSupabaseWebsiteData() {
  try {
    const supabaseUrl = 'https://gfvrrhqsqofcflrvxlmk.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmdnJyaHFzcW9mY2ZscnZ4bG1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MDgwNjksImV4cCI6MjEwMTQ4NDA2OX0.ne3ZkXMYiG-eeFUf3681akAk85O3J9wT3apjpugepXg';

    const res = await fetch(`${supabaseUrl}/rest/v1/website_content?select=*`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    if (res.ok) {
      const data = await res.json();
      data.forEach(item => {
        if (item.section_key === 'hero' && item.content_json) {
          const heroTitle = document.querySelector('.hero-title');
          const heroSub = document.querySelector('.hero-subtitle');
          if (heroTitle && item.content_json.title) heroTitle.innerHTML = item.content_json.title;
          if (heroSub && item.content_json.subtitle) heroSub.innerText = item.content_json.subtitle;
        }
      });
    }
  } catch (e) {
    // Graceful fallback to static HTML content
  }
}

/**
 * Page loading screen transition
 */
function initPageLoader() {
  const loader = document.querySelector('.page-loader');
  if (!loader) return;

  const hideLoader = () => {
    loader.classList.add('fade-out');
    loader.style.setProperty('display', 'none', 'important');
    loader.style.setProperty('opacity', '0', 'important');
    loader.style.setProperty('pointer-events', 'none', 'important');
  };

  const hash = window.location.hash.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();
  const isAdminMode = hash === '#admin' || hash.startsWith('#/admin') || hash.startsWith('#admin/') || pathname === '/admin' || pathname === '/admin/';
  if (isAdminMode) {
    hideLoader();
    return;
  }

  setTimeout(hideLoader, 150);
  window.addEventListener('load', hideLoader);
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
  document.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('#menu-toggle, .menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (toggleBtn && navMenu) {
      e.preventDefault();
      e.stopPropagation();
      const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('is-active');
      document.body.style.overflow = !isExpanded ? 'hidden' : '';
    } else {
      const activeNavMenu = document.querySelector('#nav-menu.is-active');
      if (activeNavMenu && !e.target.closest('#nav-menu')) {
        activeNavMenu.classList.remove('is-active');
        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    }
  });

  // Close drawer when any nav link is tapped
  const navLinks = document.querySelectorAll('.nav-link, .nav-btn');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const navMenu = document.getElementById('nav-menu');
      const menuToggle = document.getElementById('menu-toggle');
      if (navMenu && navMenu.classList.contains('is-active')) {
        navMenu.classList.remove('is-active');
        if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
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
    document.querySelector('.comparison-table-wrapper'),
    document.querySelector('.app-download-section'),
    document.querySelector('.app-banner-compact')
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
 * Mobile App Section Interactive Effects
 */
function initAppDownloadInteractions() {
  const storeBtns = document.querySelectorAll('.store-btn');
  storeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Optional analytics or notification toast can go here
      const storeName = btn.classList.contains('google-play-btn') ? 'Google Play' : 'App Store';
      console.log(`Redirecting to eSaleAgreement ${storeName} listing...`);
    });
  });

  const phoneBack = document.querySelector('.phone-mockup-back');
  const phoneFront = document.querySelector('.phone-mockup-front');

  if (phoneBack && phoneFront) {
    phoneBack.addEventListener('click', (e) => {
      e.stopPropagation();
      phoneBack.classList.add('active-front');
      phoneFront.classList.add('active-back');
    });

    phoneFront.addEventListener('click', (e) => {
      e.stopPropagation();
      phoneBack.classList.remove('active-front');
      phoneFront.classList.remove('active-back');
    });

    // Reset when clicking outside
    document.addEventListener('click', () => {
      phoneBack.classList.remove('active-front');
      phoneFront.classList.remove('active-back');
    });
  }
}

/**
 * Statistics Count-up Animations
 */
function initCountersCountUp() {
  const counters = document.querySelectorAll('.metric-number');
  if (counters.length === 0) return;

  const animateCount = (el) => {
    if (el.dataset.animated) return;
    el.dataset.animated = 'true';

    const countTo = parseFloat(el.getAttribute('data-count')) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const decimals = parseInt(el.getAttribute('data-decimals')) || 0;
    const duration = 1600; // ms
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

  counters.forEach(counter => {
    const rect = counter.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      animateCount(counter);
    }
  });

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

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
  document.addEventListener('click', (e) => {
    const header = e.target.closest('.faq-header');
    if (!header) return;

    e.preventDefault();
    e.stopPropagation();

    const item = header.closest('.faq-item');
    if (!item) return;

    const isActive = item.classList.contains('active');

    // Close all other FAQ items
    document.querySelectorAll('.faq-item').forEach(otherItem => {
      if (otherItem !== item) {
        otherItem.classList.remove('active');
      }
    });

    // Toggle current item active class
    if (isActive) {
      item.classList.remove('active');
    } else {
      item.classList.add('active');
    }
  });

  // Ensure first FAQ item is active by default
  const firstItem = document.querySelector('.faq-item');
  if (firstItem) {
    firstItem.classList.add('active');
  }
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
