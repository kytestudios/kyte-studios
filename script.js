// Smooth scrolling initialization
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Anchor link smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();

    // Close mobile menu if open
    if (typeof isMobileMenuOpen !== 'undefined' && isMobileMenuOpen) {
      toggleMobileMenu();
    }

    const target = this.getAttribute('href');
    if (target === '#') {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      lenis.scrollTo(target, { duration: 1.2, offset: -80 });
    }
  });
});

// Mobile Menu Logic
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenuIcon = document.getElementById('mobile-menu-icon');
const mobileMenu = document.getElementById('mobile-menu');
let isMobileMenuOpen = false;

function toggleMobileMenu() {
  isMobileMenuOpen = !isMobileMenuOpen;
  if (isMobileMenuOpen) {
    mobileMenuIcon.innerText = 'close';
    mobileMenu.classList.remove('hidden');
    mobileMenuBtn.classList.remove('bg-ink', 'text-surface');
    mobileMenuBtn.classList.add('bg-electric', 'text-white');
  } else {
    mobileMenuIcon.innerText = 'menu';
    mobileMenu.classList.add('hidden');
    mobileMenuBtn.classList.add('bg-ink', 'text-surface');
    mobileMenuBtn.classList.remove('bg-electric', 'text-white');
  }
}

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', toggleMobileMenu);
}

document.addEventListener('click', (event) => {
  if (!isMobileMenuOpen) {
    return;
  }

  const clickedInsideNavbar = event.target.closest('header');
  if (!clickedInsideNavbar) {
    toggleMobileMenu();
  }
});

// Close mobile menu when nav link is clicked
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    if (isMobileMenuOpen) {
      toggleMobileMenu();
    }
  });
});

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

function enableMouseDragScroll(container) {
  if (!container) {
    return;
  }

  let isDragging = false;
  let didDrag = false;
  let startX = 0;
  let startScrollLeft = 0;
  let originalSnapType = '';

  const stopDragging = () => {
    if (!isDragging) {
      return;
    }

    isDragging = false;
    setTimeout(() => {
      didDrag = false;
    }, 0);
    container.style.scrollSnapType = originalSnapType;
    container.style.scrollBehavior = '';
    container.classList.remove('cursor-grabbing');
    container.classList.add('cursor-grab');
    container.dispatchEvent(new CustomEvent('drag-scroll-end'));
  };

  container.addEventListener('mousedown', (event) => {
    if (event.button !== 0) {
      return;
    }

    isDragging = true;
    didDrag = false;
    startX = event.clientX;
    startScrollLeft = container.scrollLeft;
    originalSnapType = getComputedStyle(container).scrollSnapType;
    container.style.scrollSnapType = 'none';
    container.style.scrollBehavior = 'auto';
    container.classList.remove('cursor-grab');
    container.classList.add('cursor-grabbing');
    container.dispatchEvent(new CustomEvent('drag-scroll-start'));
  });

  window.addEventListener('mousemove', (event) => {
    if (!isDragging) {
      return;
    }

    const deltaX = event.clientX - startX;
    if (Math.abs(deltaX) > 4) {
      didDrag = true;
    }

    event.preventDefault();
    container.scrollLeft = startScrollLeft - deltaX;
  });

  window.addEventListener('mouseup', stopDragging);
  window.addEventListener('blur', stopDragging);

  container.addEventListener('click', (event) => {
    if (didDrag) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

function scrollCarouselByCard(container, direction) {
  if (!container) {
    return;
  }

  const cards = Array.from(container.querySelectorAll(':scope > *'));
  if (cards.length === 0) {
    return;
  }

  const viewportCenter = container.scrollLeft + (container.clientWidth / 2);
  let activeIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  cards.forEach((card, index) => {
    const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
    const distance = Math.abs(cardCenter - viewportCenter);
    if (distance < closestDistance) {
      closestDistance = distance;
      activeIndex = index;
    }
  });

  const targetIndex = Math.max(0, Math.min(cards.length - 1, activeIndex + direction));
  cards[targetIndex].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

function initAutoMarquee(container, speed = 0.35) {
  if (!container || container.dataset.marqueeInitialized === 'true') {
    return;
  }

  container.dataset.marqueeInitialized = 'true';
  const originalCards = Array.from(container.children);
  if (originalCards.length < 2) {
    return;
  }

  originalCards.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.classList.add('marquee-clone');
    clone.setAttribute('aria-hidden', 'true');
    container.appendChild(clone);
  });

  let isPaused = false;
  let resumeTimer = null;

  const pause = () => {
    isPaused = true;
    if (resumeTimer) {
      clearTimeout(resumeTimer);
      resumeTimer = null;
    }
  };

  const resume = (delay = 700) => {
    if (resumeTimer) {
      clearTimeout(resumeTimer);
    }

    resumeTimer = setTimeout(() => {
      isPaused = false;
    }, delay);
  };

  const normalizeScroll = () => {
    const halfWidth = container.scrollWidth / 2;
    if (container.scrollLeft >= halfWidth) {
      container.scrollLeft -= halfWidth;
    }
    if (container.scrollLeft < 0) {
      container.scrollLeft += halfWidth;
    }
  };

  const tick = () => {
    if (!isPaused) {
      container.scrollLeft += speed;
      normalizeScroll();
    }
    requestAnimationFrame(tick);
  };

  container.addEventListener('mouseenter', pause);
  container.addEventListener('mouseleave', () => {
    isPaused = false;
  });
  container.addEventListener('touchstart', pause, { passive: true });
  container.addEventListener('touchend', () => resume(1200));
  container.addEventListener('wheel', () => resume(1200), { passive: true });
  container.addEventListener('drag-scroll-start', pause);
  container.addEventListener('drag-scroll-end', () => resume(1000));

  tick();
}

// Initial load animations
window.addEventListener('load', () => {
  // Slide up elements
  gsap.fromTo('.gsap-slide-up',
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
  );

  // Fade in elements
  gsap.fromTo('.gsap-fade-in',
    { scale: 0.95, opacity: 0 },
    { scale: 1, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.4 }
  );
});

// Capabilities Carousel Controls
const capabilitiesCarousel = document.getElementById('capabilities-carousel');
const prevCapBtn = document.getElementById('prev-capability');
const nextCapBtn = document.getElementById('next-capability');

if (capabilitiesCarousel && prevCapBtn && nextCapBtn) {
  prevCapBtn.addEventListener('click', () => {
    scrollCarouselByCard(capabilitiesCarousel, -1);
  });
  nextCapBtn.addEventListener('click', () => {
    scrollCarouselByCard(capabilitiesCarousel, 1);
  });
}
enableMouseDragScroll(capabilitiesCarousel);

// Active Link Highlighting on Scroll
function updateActiveNavLink() {
  const sections = ['hero', 'expertise', 'work', 'testimonials', 'contact'];
  let currentSection = 'hero';

  for (const section of sections) {
    const element = document.getElementById(section);
    if (element) {
      const rect = element.getBoundingClientRect();
      if (rect.top <= window.innerHeight / 2) {
        currentSection = section;
      }
    }
  }

  // Update all nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    const linkSection = link.getAttribute('data-section');
    link.classList.remove('bg-electric', 'text-surface', 'border-ink', 'shadow-brutal-sm');

    if (linkSection === currentSection) {
      link.classList.add('bg-electric', 'text-surface', 'border-ink', 'shadow-brutal-sm');
    }
  });
}

// Update on scroll
window.addEventListener('scroll', updateActiveNavLink);
// Initial call
updateActiveNavLink();

// Scroll animations for general sections
gsap.utils.toArray('.gsap-section:not(#expertise .grid > div)').forEach(section => {
  gsap.fromTo(section,
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 85%',
      }
    }
  );
});

// Elegant stagger animation for Services Matrix
const expertiseGrid = document.querySelector('#expertise .grid');
if (expertiseGrid) {
  gsap.fromTo('#expertise .grid > div',
    { opacity: 0, y: 60, scale: 0.95 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: 'back.out(1.5)',
      stagger: 0.15,
      clearProps: 'transform', // CRITICAL: Ensures Tailwind's hover classes still work after animation!
      scrollTrigger: {
        trigger: expertiseGrid,
        start: 'top 85%',
      }
    }
  );
}

// Stagger animation for Capabilities Cards with Float Effect
const capabilitiesSection = document.querySelector('#capabilities');
if (capabilitiesSection) {
  const capCards = capabilitiesSection.querySelectorAll('.grid > div');

  // Initial entrance animation with float effect
  gsap.fromTo(capCards,
    { opacity: 0, y: 100, scale: 0.9 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.9,
      ease: 'back.out(1.7)',
      stagger: 0.12,
      scrollTrigger: {
        trigger: capabilitiesSection,
        start: 'top 80%',
      },
      onComplete: function () {
        // Add continuous float animation after entrance
        capCards.forEach((card, index) => {
          gsap.to(card, {
            y: -10 - (index % 2) * 5,
            duration: 3 + (index * 0.3),
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true
          });
        });
      }
    }
  );
}

// Navbar slide down animation on load
gsap.from('header', {
  duration: 0.6,
  y: -80,
  opacity: 0,
  ease: 'power3.out',
  delay: 0.1
});

// Contact form cookie helpers for tracking submission success
const COOKIE_NAME = 'kyte_contact_submitted';
const COOKIE_HOURS = 24;

function setCookie(name, value, hours) {
  const d = new Date();
  d.setTime(d.getTime() + hours * 60 * 60 * 1000);
  document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + d.toUTCString() + ';path=/';
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function showReceivedBox() {
  const box = document.getElementById('contact-success');
  const inner = document.getElementById('contact-form-inner');
  const controls = document.getElementById('contact-form-controls');
  if (inner) inner.classList.add('hidden');
  if (controls) controls.classList.add('hidden');
  if (box) {
    box.classList.remove('hidden');
    box.classList.add('flex');
  }
}

function hideReceivedBox() {
  const box = document.getElementById('contact-success');
  const inner = document.getElementById('contact-form-inner');
  const controls = document.getElementById('contact-form-controls');
  if (box) box.classList.add('hidden');
  if (inner) inner.classList.remove('hidden');
  if (controls) controls.classList.remove('hidden');
}

function checkCookieAndToggle() {
  if (getCookie(COOKIE_NAME)) {
    showReceivedBox();
  } else {
    hideReceivedBox();
  }
}

// Initial cookie check on load
document.addEventListener('DOMContentLoaded', checkCookieAndToggle);

// Work section cards stagger animation
const workCards = document.querySelectorAll('#work .group');
if (workCards.length > 0) {
  gsap.fromTo(workCards,
    { opacity: 0, y: 60, rotation: -3 },
    {
      opacity: 1,
      y: 0,
      rotation: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.2,
      scrollTrigger: {
        trigger: '#work',
        start: 'top 80%',
      }
    }
  );
}

// Testimonial cards slide in animation
const testimonialCards = document.querySelectorAll('#testimonials-carousel > div:not(.marquee-clone)');
if (testimonialCards.length > 0) {
  testimonialCards.forEach((card, index) => {
    gsap.fromTo(card,
      { opacity: 0, x: 100 },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#testimonials',
          start: 'top 80%',
        },
        delay: index * 0.1
      }
    );
  });
}

// Contact section elements animation
const contactForm = document.querySelector('#contact');
if (contactForm) {
  gsap.fromTo(contactForm,
    { opacity: 0, y: 40, scale: 0.98 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: 'back.out(1.2)',
      scrollTrigger: {
        trigger: '#contact',
        start: 'top 85%',
      }
    }
  );
}

// Footer fade in animation
gsap.fromTo('footer',
  { opacity: 0 },
  {
    opacity: 1,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: 'footer',
      start: 'top 95%',
    }
  }
);

// Navbar slide down animation
window.addEventListener('load', () => {
  // Animated badge pulse
  const badge = document.querySelector('.pulse-badge');
  if (badge) {
    badge.classList.add('pulse-badge');
  }
});

// Hero image and video parallax effect
const heroVisuals = document.querySelectorAll('#hero img, #hero video');
if (heroVisuals.length > 0) {
  gsap.to(heroVisuals, {
    y: -50,
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom center',
      scrub: 1,
      markers: false,
    }
  });
}

// Subtle parallax on work section
const workSection = document.querySelector('#work');
if (workSection) {
  gsap.to(workSection, {
    y: 30,
    scrollTrigger: {
      trigger: '#work',
      start: 'top center',
      end: 'bottom center',
      scrub: 1,
      markers: false,
    }
  });
}

// Animate section title on scroll
const sectionTitles = document.querySelectorAll('h2[class*="gsap-section"]');
sectionTitles.forEach(title => {
  gsap.fromTo(title,
    { opacity: 0, x: -40 },
    {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: title,
        start: 'top 85%',
      }
    }
  );
});


// Contact form input focus animations
document.querySelectorAll('.contact-form-input').forEach(input => {
  input.addEventListener('focus', function () {
    gsap.to(this, {
      duration: 0.3,
      scale: 1.02,
      boxShadow: '0 0 0 3px rgba(0, 85, 255, 0.1), inset 0 0 0 1px #0055FF',
      ease: 'power2.out'
    });
  });

  input.addEventListener('blur', function () {
    gsap.to(this, {
      duration: 0.3,
      scale: 1,
      boxShadow: 'none',
      ease: 'power2.out'
    });
  });
});

// Stagger animation for interactive badges on hover
document.querySelectorAll('.flex.flex-wrap').forEach(container => {
  const badges = container.querySelectorAll('div');
  container.addEventListener('mouseenter', function () {
    badges.forEach((badge, index) => {
      gsap.to(badge, {
        duration: 0.2,
        y: -2,
        delay: index * 0.05,
        ease: 'power2.out'
      });
    });
  });

  container.addEventListener('mouseleave', function () {
    badges.forEach((badge) => {
      gsap.to(badge, {
        duration: 0.3,
        y: 0,
        ease: 'power2.out'
      });
    });
  });
});


// Formspark AJAX Submission
const kyteContactForm = document.getElementById('contact-form');
if (kyteContactForm) {
  kyteContactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(kyteContactForm);

    // Client-side Cloudflare Turnstile validation
    const turnstileResponse = formData.get('cf-turnstile-response');
    if (!turnstileResponse) {
      alert('Please complete the Captcha challenge before submitting!');
      return;
    }

    const submitBtn = document.getElementById('contact-submit-btn');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Sending...</span> <span class="material-symbols-outlined animate-spin" style="animation: spin 1s linear infinite;">sync</span>';

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    const actionUrl = kyteContactForm.getAttribute('action') || 'https://submit-form.com/YOUR_FORMSPARK_FORM_ID';

    fetch(actionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: json
    })
      .then(async (response) => {
        if (response.ok) {
          try {
            setCookie(COOKIE_NAME, '1', COOKIE_HOURS);
          } catch (err) {
            // Ignore cookie errors
          }
          showReceivedBox();
        } else {
          console.log(response);
          submitBtn.innerHTML = originalContent;
          if (typeof turnstile !== 'undefined') {
            turnstile.reset();
          }
          
          let errorMessage = "Something went wrong! Please try again.";
          try {
            const responseText = await response.text();
            try {
              const errorJson = JSON.parse(responseText);
              if (errorJson && errorJson.message) {
                errorMessage = `Submission failed: ${errorJson.message}`;
              } else if (errorJson && typeof errorJson === 'object') {
                errorMessage = `Submission failed: ${JSON.stringify(errorJson)}`;
              }
            } catch (jsonErr) {
              if (responseText) {
                errorMessage = `Submission failed: ${responseText}`;
              }
            }
          } catch (textErr) {
            // Stream read failed
          }
          alert(errorMessage);
        }
      })
      .catch(error => {
        console.log(error);
        submitBtn.innerHTML = originalContent;
        if (typeof turnstile !== 'undefined') {
          turnstile.reset();
        }
        alert("Network error: " + error.message);
      });
  });
}

// Hero Visual Video Hover Animation
const heroCard = document.getElementById('hero-visual-card');
const heroVideo = document.getElementById('hero-video');

if (heroCard && heroVideo) {
  heroCard.addEventListener('mouseenter', () => {
    heroVideo.play().catch(err => console.log('Video play failed:', err));
  });

  heroCard.addEventListener('mouseleave', () => {
    heroVideo.pause();
    heroVideo.currentTime = 0;
  });
}

// Work Carousel Controls
const workCarousel = document.getElementById('work-carousel');
const prevWorkBtn = document.getElementById('prev-work');
const nextWorkBtn = document.getElementById('next-work');

if (workCarousel && prevWorkBtn && nextWorkBtn) {
  prevWorkBtn.addEventListener('click', () => {
    scrollCarouselByCard(workCarousel, -1);
  });
  nextWorkBtn.addEventListener('click', () => {
    scrollCarouselByCard(workCarousel, 1);
  });
}
enableMouseDragScroll(workCarousel);

