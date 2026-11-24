# OKNO

Static site for OKNO, served by GitHub Pages at [ok-no.net](https://ok-no.net).

No build step. Every file is committed as served; pushing to `main` deploys within a minute.

## Structure

| Path | Purpose |
| --- | --- |
| `index.html` | Homepage gallery |
| `alien/`, `nocomply/`, `roots/`, `rot/`, `keepleft/`, `machine/`, `punch/` | Product pages |
| `manifesto/`, `thanks/`, `privacy/` | Supporting pages |
| `404.html` | Error page |
| `style.css` | All styles |
| `form-handler.js` | Order form validation and submission |
| `redact.js`, `redact-static.js` | Redaction animation on the homepage and manifesto |
| `images/` | Product photos (WebP) and `images/social/` preview images (JPEG) |
| `stencil/` | Free downloadable stencils |

`.nojekyll` keeps GitHub Pages from running Jekyll, so files are published exactly as committed.

## Order flow

The form posts to one of two Google Apps Script endpoints, chosen by `data-endpoint` on the `<form>`:

- `data-endpoint="prints"` — the five print pages
- `data-endpoint="decks"` — `machine` and `punch`

They are separate on purpose: each produces a different Monzo payment link. Both URLs live at the top of `form-handler.js`.

On success the browser redirects to `/thanks/`. Errors are returned as plain text codes (`ERR_CAPTCHA`, `ERR_POSTCODE`, and so on) and surfaced with `alert()`.

Turnstile handles bot protection. The hidden `website` field is a honeypot.

## Marking a work as sold out

On the product page, change the button:

```html
<button id="buy-btn" type="submit" class="form-submit" data-oos="true">BUY</button>
```

`form-handler.js` then relabels it `OUT OF STOCK` and blocks submission. Also update the `availability` value in that page's JSON-LD to `https://schema.org/OutOfStock`, and remove the product from `sitemap.xml` if it will not return.

## Editing a product

Each product page carries four places that repeat the same information:

1. `<title>` and `<meta name="description">`
2. Open Graph and Twitter tags
3. The `Product` JSON-LD block
4. The visible copy and price line

Keep them in sync. Prices are literal strings in the JSON-LD (`"20.00"` or `"60.00"`), not generated.

## Checks before pushing

```sh
node --check form-handler.js
node --check redact.js
node --check redact-static.js
```

Then load the pages locally with `python3 -m http.server` and confirm images resolve. Open Graph image URLs must stay absolute (`https://ok-no.net/...`); everything else uses root-relative paths.

- Facebook Sharing Debugger
- LinkedIn Post Inspector
- Google Rich Results Test (product pages)

## Privacy

`privacy/index.html` covers what is collected, why, and the one-month retention period. Update it if the order flow, processors or retention change.
