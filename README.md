# Ikshvaku Vanam

Marketing site for **Ikshvaku Vanam**, a farmhouse retreat in Rachloor village, Future City, Hyderabad — built around a sunken stone courtyard, an amphitheater, and a rooftop pool.

**Live site:** https://www.ikshvakuvanam.com

A static site for now; the plan is to layer in real reservations (availability, booking, payments) on top of this once the site itself is validated with real visitors.

## Stack

Plain HTML/CSS/JS — no framework, no build step. Chosen to get something live fast; if/when the reservation system is added, that's the natural point to reconsider (e.g. moving to a framework with a backend/DB).

- `index.html` — all page content and structure
- `css/style.css` — styling
- `js/main.js` — mobile nav, gallery carousel + lightbox, enquiry form handling
- `images/` — farmhouse photos and logo
- `CNAME` — custom domain config for GitHub Pages

## Running locally

No install needed to view the site — it's static:

```bash
python -m http.server 8080
# open http://localhost:8080
```

Any static file server works equally well (`npx serve`, VS Code Live Server, etc.).

## Tests

JS behavior (nav, gallery, lightbox, form) and HTML structure/accessibility (alt text, working links, valid asset paths) are covered with Jest + jsdom, run against the real `index.html`/`main.js` rather than fixtures.

```bash
npm install
npm test              # run the suite
npm run test:coverage # run with a coverage report (target: 100%)
```

## Deployment

Hosted on **GitHub Pages**, serving directly from the `main` branch. Every push to `main` deploys automatically — there's no separate build/release step.

- Canonical domain: `www.ikshvakuvanam.com` (set via the `CNAME` file); `ikshvakuvanam.com` redirects to it
- DNS is managed in **Cloudflare** (`A` records for the apex domain pointing at GitHub Pages' IPs, a `CNAME` for `www`), kept in **DNS-only mode** (not proxied) so GitHub can issue and renew the HTTPS certificate
- Fallback URL: https://kranthi-arveti.github.io/ikshvaku-vanam/
- Email (`events@ikshvakuvanam.com`) is live via **Cloudflare Email Routing**, forwarding to a personal inbox — no mailbox is actually hosted, it's forwarding only

## Known placeholders

A few things are intentionally left as placeholders until real details are available — worth checking before wider sharing:

- Facebook, YouTube and WhatsApp footer icons link to `#` (Instagram is live)
- The enquiry form doesn't send anywhere yet — it just shows a "coming soon" message on submit
