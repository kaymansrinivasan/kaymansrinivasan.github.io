# kaymansrinivasan.github.io

Personal portfolio site for Kayman Srinivasan — AI & Data Science engineer.

Live at [kaymansrinivasan.github.io](https://kaymansrinivasan.github.io/).

## Stack

Static site, no build step: plain HTML5, CSS3, and vanilla JS. Fonts via Google Fonts
(Instrument Serif, Geist, JetBrains Mono).

## Structure

```
index.html    — page markup + content
style.css     — all styling
main.js       — nav/scroll behavior, reveal animations, counters
favicon.svg   — site icon
robots.txt / sitemap.xml — SEO
```

## Local preview

No build tooling required — open `index.html` directly in a browser, or serve the
folder with any static server, e.g.:

```
python -m http.server 8000
```

## Deployment

Served directly by GitHub Pages from the `main` branch — pushing to `main` deploys.
