# Dhriti Vichhivora: Portfolio

**Live site:** https://dhritivichhivora.github.io/dhriti-portfolio/

## The concept

A magazine cover that opens into a music player. The site opens on my name, set huge like a fashion cover, in burgundy, dusty rose and one loud hot pink. As you scroll, a player bar at the bottom treats each section as a track: the cover, then About, the tracklist (my projects), what's on my record (experience and education), the record crate (skills), the bonus tracks (life beyond code) and finally "Say hi". Scrolling to the end of the page ends the track.

## Tech

Plain HTML, CSS and JavaScript, written by hand. No frameworks, no build step, no npm packages, no templates. The only outside resources are two Google Fonts and GSAP with ScrollTrigger from cdnjs, which power a few optional scroll effects. The site works fully if GSAP fails to load.

## Features

- **Cover:** a magazine masthead with my name in huge variable-weight Playfair Display. Letters rise in, react to the cursor (weight, lean, push) and wiggle. A soft ink trail follows the mouse, and the cover pins and shrinks into the page as you scroll
- **Player bar:** shows the section in view as the current track, scroll progress as a 2:30 track, a seekable progress bar, previous/next, play/pause for all ambient animation, and Replay at the end
- **Mood switcher:** three colour palettes (Burgundy, Midnight, Blush), remembered between visits
- **Wiggling letters:** every big headline reacts letter by letter on hover or tap
- **Projects as case studies:** the question, the data, what I built, what I learned and the tools, with GitHub and live-app links, plus animated illustrations (a bar chart, a self-drawing line chart, an equaliser and a typing terminal; not real results)
- **Record crate:** skills filed as vinyl sleeves whose records slide out, each skill with a one-line note
- **Editorial layout:** page-wipe section transitions, a dark tracklist page with a project preview that follows the cursor, experience and education with linked certificates, flip cards for life beyond tech and a copy-email button
- Mobile first, keyboard accessible, and respects reduced-motion settings

## Editing the content

Every word on the site lives in **`js/data.js`** (one object, `window.SITE`). Change text there; the HTML, CSS and `main.js` never need touching.

## Project structure

```
index.html          page shell, nav, player bar, fallback content
css/style.css       design tokens, moods, every section, responsive rules
js/data.js          all the content
js/main.js          builds the page from data.js and adds all behaviour
assets/photo.jpg    processed portrait (metadata removed)
assets/photo-small.jpg  player-bar album art
```

## Run it locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Deployment

Hosted for free on GitHub Pages, published from the `main` branch, root folder. Every push to `main` updates the live site.

## Credits

- **Fonts:** Playfair Display and Space Grotesk via Google Fonts (SIL Open Font License)
- **GSAP and ScrollTrigger** 3.12.5 from cdnjs (GSAP standard licence)
- **Design inspiration only** from galleries such as SiteInspire, Awwwards, Dribbble and Behance. Nothing was copied.
- All code, charts, icons and copy are written by me.
- **AI disclosure:** Built with help from Claude (Anthropic) as an AI coding assistant. The ideas, content and personality are mine.
