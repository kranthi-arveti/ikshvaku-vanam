const { loadPageAndScript } = require('./utils/loadPage');

describe('footer year', () => {
  test('is set to the current year on load', () => {
    loadPageAndScript();
    const expectedYear = String(new Date().getFullYear());
    expect(document.getElementById('year').textContent).toBe(expectedYear);
  });
});

describe('mobile nav toggle', () => {
  beforeEach(() => {
    loadPageAndScript();
  });

  test('clicking the toggle opens the nav and marks it expanded', () => {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('site-nav');

    expect(nav.classList.contains('open')).toBe(false);

    toggle.dispatchEvent(new Event('click', { bubbles: true }));

    expect(nav.classList.contains('open')).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });

  test('clicking the toggle again closes the nav', () => {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('site-nav');

    toggle.dispatchEvent(new Event('click', { bubbles: true })); // open
    toggle.dispatchEvent(new Event('click', { bubbles: true })); // close

    expect(nav.classList.contains('open')).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  test('clicking a nav link closes the menu and resets aria-expanded', () => {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('site-nav');
    const firstLink = nav.querySelector('a');

    toggle.dispatchEvent(new Event('click', { bubbles: true })); // open the menu
    expect(nav.classList.contains('open')).toBe(true);

    firstLink.dispatchEvent(new Event('click', { bubbles: true }));

    expect(nav.classList.contains('open')).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  test('every nav link (including the Enquire CTA) closes the menu when clicked', () => {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('site-nav');
    const links = Array.from(nav.querySelectorAll('a'));

    expect(links.length).toBeGreaterThan(0);

    links.forEach(link => {
      toggle.dispatchEvent(new Event('click', { bubbles: true })); // open
      link.dispatchEvent(new Event('click', { bubbles: true }));   // should close
      expect(nav.classList.contains('open')).toBe(false);
    });
  });
});

describe('gallery lightbox', () => {
  beforeEach(() => {
    loadPageAndScript();
  });

  test('clicking a gallery item opens the lightbox with the matching full image and alt text', () => {
    const galleryItems = document.querySelectorAll('.gallery-item');
    expect(galleryItems.length).toBeGreaterThan(0);

    const firstItem = galleryItems[0];
    const expectedFull = firstItem.getAttribute('data-full');
    const expectedAlt = firstItem.querySelector('img').getAttribute('alt');

    firstItem.dispatchEvent(new Event('click', { bubbles: true }));

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    expect(lightbox.classList.contains('open')).toBe(true);
    expect(lightboxImg.src).toContain(expectedFull);
    expect(lightboxImg.alt).toBe(expectedAlt);
    expect(document.body.style.overflow).toBe('hidden');
  });

  test('every gallery item opens the lightbox with its own image', () => {
    const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
    const lightboxImg = document.getElementById('lightbox-img');

    galleryItems.forEach(item => {
      const expectedFull = item.getAttribute('data-full');
      item.dispatchEvent(new Event('click', { bubbles: true }));
      expect(lightboxImg.src).toContain(expectedFull);
    });
  });

  test('the close button closes the lightbox and clears the image', () => {
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems[0].dispatchEvent(new Event('click', { bubbles: true }));

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');

    closeBtn.dispatchEvent(new Event('click', { bubbles: true }));

    expect(lightbox.classList.contains('open')).toBe(false);
    expect(lightboxImg.getAttribute('src')).toBe('');
    expect(document.body.style.overflow).toBe('');
  });

  test('clicking the backdrop (outside the image) closes the lightbox', () => {
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems[0].dispatchEvent(new Event('click', { bubbles: true }));

    const lightbox = document.getElementById('lightbox');
    lightbox.dispatchEvent(new Event('click', { bubbles: true }));

    expect(lightbox.classList.contains('open')).toBe(false);
  });

  test('clicking the enlarged image itself does not close the lightbox', () => {
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems[0].dispatchEvent(new Event('click', { bubbles: true }));

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    const clickEvent = new Event('click', { bubbles: true });
    lightboxImg.dispatchEvent(clickEvent);

    expect(lightbox.classList.contains('open')).toBe(true);
  });

  test('pressing Escape closes the lightbox', () => {
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems[0].dispatchEvent(new Event('click', { bubbles: true }));

    const lightbox = document.getElementById('lightbox');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(lightbox.classList.contains('open')).toBe(false);
  });

  test('pressing a non-Escape key does not close the lightbox', () => {
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems[0].dispatchEvent(new Event('click', { bubbles: true }));

    const lightbox = document.getElementById('lightbox');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(lightbox.classList.contains('open')).toBe(true);
  });
});

describe('enquiry form', () => {
  beforeEach(() => {
    loadPageAndScript();
  });

  test('submitting shows the not-live-yet note, prevents navigation, and resets the fields', () => {
    const form = document.getElementById('stay-form');
    const note = document.getElementById('form-note');
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');

    nameInput.value = 'Test Guest';
    phoneInput.value = '9999999999';

    expect(note.textContent).toBe('');

    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);

    expect(submitEvent.defaultPrevented).toBe(true);
    expect(note.textContent).toMatch(/isn't live yet/i);
    expect(nameInput.value).toBe('');
    expect(phoneInput.value).toBe('');
  });
});
