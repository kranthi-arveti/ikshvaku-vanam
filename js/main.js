document.getElementById('year').textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const siteNav = document.getElementById('site-nav');

navToggle.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

siteNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Lightbox gallery
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');

document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const full = item.getAttribute('data-full');
    const alt = item.querySelector('img').getAttribute('alt');
    lightboxImg.src = full;
    lightboxImg.alt = alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxImg.src = '';
  document.body.style.overflow = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// Gallery carousel
const galleryTrack = document.getElementById('gallery-track');
const galleryPrev = document.getElementById('gallery-prev');
const galleryNext = document.getElementById('gallery-next');

if (galleryTrack && galleryPrev && galleryNext) {
  const scrollByCard = (dir) => {
    const card = galleryTrack.querySelector('.gallery-item');
    if (!card) return;
    const gap = parseFloat(getComputedStyle(galleryTrack).columnGap) || 16;
    galleryTrack.scrollBy({ left: dir * (card.getBoundingClientRect().width + gap), behavior: 'smooth' });
  };

  const updateNavState = () => {
    const maxScroll = galleryTrack.scrollWidth - galleryTrack.clientWidth - 1;
    galleryPrev.disabled = galleryTrack.scrollLeft <= 0;
    galleryNext.disabled = galleryTrack.scrollLeft >= maxScroll;
  };

  galleryPrev.addEventListener('click', () => scrollByCard(-1));
  galleryNext.addEventListener('click', () => scrollByCard(1));
  galleryTrack.addEventListener('scroll', updateNavState, { passive: true });
  window.addEventListener('resize', updateNavState);
  updateNavState();
}

// Enquiry form — no backend yet, just acknowledge the submission
const stayForm = document.getElementById('stay-form');
const formNote = document.getElementById('form-note');

stayForm.addEventListener('submit', (e) => {
  e.preventDefault();
  formNote.textContent = "Thanks — online booking isn't live yet, so this form doesn't send anywhere just yet. Please reach out by phone or email below in the meantime.";
  stayForm.reset();
});
