# LMS brand assets

The LMS follows the visual identity used by the Centaur Careers website while keeping its build and runtime independent.

## Source of truth

- Color and typography reference: `web/src/index.css`.
- Header logo treatment: `web/src/components/Header.jsx`.
- Official logo source: `web/public/images/brand/centaur-careers-logo.jpg`.
- Hero photo source: `web/public/images/posters/home-hero-finance-classroom.webp`.
- Course photo source and track mapping: `web/src/content/courseImages.js` and `web/public/images/courses/`.
- Font source packages: IBM Plex Sans Variable and Source Serif 4 in the website's `@fontsource` dependencies.

## LMS copies

The files below are copied into the LMS so deployment does not need the website app, its public host, a font CDN, or a third-party image service:

- `public/brand/centaur-careers-logo.jpg` — site logo.
- `src/app/icon.png` — small site logo for the browser icon.
- `public/images/learning-hero.webp` — classroom hero image.
- `public/images/courses/*.webp` — one locally served image for each proposed track.
- `public/fonts/*.woff2` — local IBM Plex Sans and Source Serif 4 font files.

The website remains the editing source. If its logo, fonts, colors, or selected imagery change, copy the approved replacement assets here and update this note. Keep runtime references rooted at the LMS's own `/brand`, `/images`, and `/fonts` paths.

## Design tokens and content boundaries

- Primary navy: `hsl(220 48% 20%)`; foreground navy: `hsl(220 48% 15%)`.
- Centaur gold: `hsl(43 65% 52%)`; small text/icons on light surfaces use the website's darker gold ink, `hsl(40 100% 24%)`.
- Warm page background: `hsl(40 33% 98%)`; subtle surface: `hsl(220 20% 98%)`.
- IBM Plex Sans is used for interface and body text. Source Serif 4 is reserved for the home-page hero heading.
- Public LMS text continues to identify the tracks as proposals until product/content approval. Images do not imply that enrollment, instruction, or certification is currently available.

Before public launch, confirm the source photography and logo usage rights cover this separately deployed LMS.
