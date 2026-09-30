# Amplivate website

The live site for [amplivate.co.uk](https://amplivate.co.uk), served by GitHub Pages from this repository's root.

## Editing

- **Quick text fixes:** edit the page's `index.html` directly (e.g. `about/index.html`) on GitHub and commit.
- **Anything bigger:** the whole site is generated from `_build/amplivate.html`. Edit that file (and the *YOUR DETAILS* block at the top of `_build/gen.py` for phone, booking link, socials and photo), then run:

  ```
  python3 _build/build.py
  ```

  This rebuilds every page and copies it to the root. It needs Python 3, Node.js and Playwright (for the share image and icons).

## What's where

| Path | What it is |
|---|---|
| `index.html`, `about/`, `services/`, … | The published pages |
| `assets/` | Stylesheet, script, logo, icons, share image and founder photo |
| `sitemap.xml`, `robots.txt` | For search engines |
| `_build/` | Source and build tools (not published) |

Contact form messages are sent through Web3Forms to hello@amplivate.co.uk.
