const fs = require('fs');
const path = require('path');
const { getIndexHtmlSource } = require('./utils/loadPage');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function parseIndexHtml() {
  const html = getIndexHtmlSource();
  return new DOMParser().parseFromString(html, 'text/html');
}

function isLocalAsset(src) {
  return !!src && !/^(https?:)?\/\//i.test(src) && !src.startsWith('data:');
}

describe('document head', () => {
  let doc;
  beforeAll(() => {
    doc = parseIndexHtml();
  });

  test('declares a title mentioning the farmhouse', () => {
    expect(doc.title).toMatch(/Ikshvaku Vanam/);
  });

  test('has a non-empty meta description', () => {
    const meta = doc.querySelector('meta[name="description"]');
    expect(meta).not.toBeNull();
    expect(meta.getAttribute('content').length).toBeGreaterThan(20);
  });

  test('has a responsive viewport meta tag', () => {
    const meta = doc.querySelector('meta[name="viewport"]');
    expect(meta).not.toBeNull();
    expect(meta.getAttribute('content')).toMatch(/width=device-width/);
  });

  test('declares a lang attribute on <html>', () => {
    expect(doc.documentElement.getAttribute('lang')).toBe('en');
  });

  test('references a favicon that exists on disk', () => {
    const icon = doc.querySelector('link[rel="icon"]');
    expect(icon).not.toBeNull();
    const iconPath = path.resolve(PROJECT_ROOT, icon.getAttribute('href'));
    expect(fs.existsSync(iconPath)).toBe(true);
  });
});

describe('local asset references', () => {
  let doc;
  beforeAll(() => {
    doc = parseIndexHtml();
  });

  test('css/style.css is linked and exists on disk', () => {
    const link = doc.querySelector('link[rel="stylesheet"][href="css/style.css"]');
    expect(link).not.toBeNull();
    expect(fs.existsSync(path.resolve(PROJECT_ROOT, 'css/style.css'))).toBe(true);
  });

  test('js/main.js is linked and exists on disk', () => {
    const script = doc.querySelector('script[src="js/main.js"]');
    expect(script).not.toBeNull();
    expect(fs.existsSync(path.resolve(PROJECT_ROOT, 'js/main.js'))).toBe(true);
  });

  test('every local <img src> resolves to a real file', () => {
    const imgs = Array.from(doc.querySelectorAll('img[src]')).filter(img =>
      isLocalAsset(img.getAttribute('src'))
    );
    expect(imgs.length).toBeGreaterThan(0);

    imgs.forEach(img => {
      const src = img.getAttribute('src');
      const resolved = path.resolve(PROJECT_ROOT, src);
      expect(fs.existsSync(resolved)).toBe(true);
    });
  });

  test('every gallery data-full image resolves to a real file', () => {
    const items = Array.from(doc.querySelectorAll('.gallery-item[data-full]'));
    expect(items.length).toBeGreaterThan(0);

    items.forEach(item => {
      const full = item.getAttribute('data-full');
      expect(fs.existsSync(path.resolve(PROJECT_ROOT, full))).toBe(true);
    });
  });
});

describe('accessibility basics', () => {
  let doc;
  beforeAll(() => {
    doc = parseIndexHtml();
  });

  test('every content image has meaningful alt text', () => {
    // The lightbox <img> starts empty by design — its alt/src are populated
    // dynamically by js/main.js when a gallery item is opened.
    const imgs = Array.from(doc.querySelectorAll('img')).filter(
      img => img.id !== 'lightbox-img'
    );
    expect(imgs.length).toBeGreaterThan(0);

    imgs.forEach(img => {
      expect(img.hasAttribute('alt')).toBe(true);
      expect(img.getAttribute('alt').trim().length).toBeGreaterThan(0);
    });
  });

  test('every form input/textarea has an associated label', () => {
    const fields = Array.from(doc.querySelectorAll('#stay-form input, #stay-form textarea'));
    expect(fields.length).toBeGreaterThan(0);

    fields.forEach(field => {
      const id = field.getAttribute('id');
      expect(id).toBeTruthy();
      const label = doc.querySelector(`label[for="${id}"]`);
      expect(label).not.toBeNull();
      expect(label.textContent.trim().length).toBeGreaterThan(0);
    });
  });

  test('the mobile nav toggle has an accessible label', () => {
    const toggle = doc.querySelector('#nav-toggle');
    expect(toggle.getAttribute('aria-label')).toBeTruthy();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  test('the lightbox close button has an accessible label', () => {
    const closeBtn = doc.querySelector('#lightbox-close');
    expect(closeBtn.getAttribute('aria-label')).toBeTruthy();
  });
});

describe('navigation integrity', () => {
  let doc;
  beforeAll(() => {
    doc = parseIndexHtml();
  });

  test('every in-page nav link points to an id that exists in the document', () => {
    const navLinks = Array.from(doc.querySelectorAll('.site-nav a[href^="#"]'));
    expect(navLinks.length).toBeGreaterThan(0);

    navLinks.forEach(link => {
      const targetId = link.getAttribute('href').slice(1);
      expect(doc.getElementById(targetId)).not.toBeNull();
    });
  });

  test('the brand logo link and hero CTAs resolve to real section ids', () => {
    ['#top', '#stay', '#gallery', '#about'].forEach(hash => {
      const targetId = hash.slice(1);
      expect(doc.getElementById(targetId)).not.toBeNull();
    });
  });

  test('required page sections are present exactly once', () => {
    ['hero', 'about', 'amenities', 'gallery', 'location', 'stay'].forEach(id => {
      const matches = doc.querySelectorAll(`#${id}`);
      expect(matches.length).toBe(1);
    });
  });
});

describe('contact and external links', () => {
  let doc;
  beforeAll(() => {
    doc = parseIndexHtml();
  });

  test('the phone link uses the tel: protocol', () => {
    const telLink = doc.querySelector('.stay-contact a[href^="tel:"]');
    expect(telLink).not.toBeNull();
    expect(telLink.getAttribute('href')).toMatch(/^tel:\+?\d+$/);
  });

  test('the email link uses the mailto: protocol with a valid-looking address', () => {
    const mailLink = doc.querySelector('.stay-contact a[href^="mailto:"]');
    expect(mailLink).not.toBeNull();
    const address = mailLink.getAttribute('href').replace('mailto:', '');
    expect(address).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  test('external links open in a new tab safely (target=_blank paired with rel=noopener)', () => {
    const externalLinks = Array.from(doc.querySelectorAll('a[target="_blank"]'));
    expect(externalLinks.length).toBeGreaterThan(0);

    externalLinks.forEach(link => {
      expect(link.getAttribute('rel')).toMatch(/noopener/);
    });
  });

  test('the directions link points to the provided Google Maps location', () => {
    const link = doc.querySelector('.location-directions');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toMatch(/^https:\/\/maps\.app\.goo\.gl\//);
  });
});

describe('gallery and amenities content', () => {
  let doc;
  beforeAll(() => {
    doc = parseIndexHtml();
  });

  test('the gallery renders all seven farmhouse photos', () => {
    const items = doc.querySelectorAll('.gallery-item');
    expect(items.length).toBe(7);
  });

  test('gallery items are <button> elements so they are keyboard-operable', () => {
    const items = Array.from(doc.querySelectorAll('.gallery-item'));
    items.forEach(item => {
      expect(item.tagName.toLowerCase()).toBe('button');
    });
  });

  test('the amenities grid lists at least six amenities with titles and descriptions', () => {
    const cards = Array.from(doc.querySelectorAll('.amenity-card'));
    expect(cards.length).toBeGreaterThanOrEqual(6);

    cards.forEach(card => {
      expect(card.querySelector('h3').textContent.trim().length).toBeGreaterThan(0);
      expect(card.querySelector('p').textContent.trim().length).toBeGreaterThan(0);
    });
  });
});
