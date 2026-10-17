# Dhriti Vichhivora: Portfolio

**Live site:** https://dhritivichhivora.github.io/dhriti-portfolio/

## The concept

A magazine cover that opens into a music player. The site opens on my name, set huge like a fashion cover, in burgundy, dusty rose and one loud hot pink. As you scroll, a player bar at the bottom treats each section as a track: the cover, then the liner notes (About), the tracklist (my projects), the toolkit (skills), the bonus tracks (life beyond code) and finally "Say hi". Scrolling to the end of the page ends the track.

## Tech

Plain HTML, CSS and JavaScript, written by hand. No frameworks, no build step, no npm packages, no templates. The only outside resources are two Google Fonts.

## Features

- **Cover:** my name in huge variable-weight Playfair Display, with letters that rise in, float and wiggle, plus stickers, a rotating badge, cover lines and a barcode
- **Player bar:** shows the section in view as the current track, scroll progress as a 2:30 track, a seekable progress bar, previous/next, play/pause for all ambient animation, and Replay at the end
- **Mood switcher:** three colour palettes (Burgundy, Midnight, Blush), remembered between visits
- **Wiggling letters:** every big headline reacts letter by letter on hover or tap
- **Animated project visuals:** a bar chart, a self-drawing line chart, an equaliser and a typing terminal, all hand-made illustrations (not real results)
- **Flip cards** for life beyond tech, a polaroid photo stack, copy-email button, custom cursor on desktop
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
- **Design inspiration only** from galleries such as SiteInspire, Awwwards, Dribbble and Behance. Nothing was copied.
- All code, charts, icons and copy are written by me.
- **AI disclosure:** Built with help from Claude (Anthropic) as an AI coding assistant. The ideas, content and personality are mine.
