/* ==========================================================================
   data.js: every word on the site lives here.
   To change text, edit this file only. main.js reads window.SITE and
   builds the page from it, so the HTML, CSS and JS never need touching.
   ========================================================================== */
window.SITE = {

  /* --- Who I am, and the cover --- */
  profile: {
    name: 'Dhriti Vichhivora',
    first: 'DHRITI',
    last: 'VICHHIVORA',
    monogram: 'DV',
    tagline: 'Figuring it out. Building it anyway.',
    issue: 'ISSUE 01 / 2026',
    playlist: 'Issue 01',
    sticker: 'data science',
    badge: 'ISSUE 01 · PORTFOLIO · 2026 · ',
    coverLines: [
      'Inside: 4 projects, 1 debate stage, 1 new language.',
      'Also: an internship that turned into a side project.',
      'Plus: what I’m exploring next.'
    ],
    photo: 'assets/photo.jpg',
    photoSmall: 'assets/photo-small.jpg',
    photoAlt: 'Portrait of Dhriti Vichhivora'
  },

  /* --- Player bar: the "track" shown for each section --- */
  tracks: {
    top: 'Cover',
    about: 'Who is Dhriti?',
    work: 'Tracklist',
    skills: 'Toolkit',
    beyond: 'Bonus tracks',
    contact: 'Say hi',
    ended: 'Track ended',
    length: 150            /* seconds: the whole page plays as a 2:30 track */
  },

  /* --- Navigation links (id = section id) --- */
  nav: [
    { id: 'about', label: 'About' },
    { id: 'work', label: 'Work' },
    { id: 'skills', label: 'Skills' },
    { id: 'beyond', label: 'Beyond' },
    { id: 'contact', label: 'Contact' }
  ],

  /* --- Colour moods (ids match the CSS) --- */
  moods: [
    { id: 'burgundy', name: 'Burgundy' },
    { id: 'midnight', name: 'Midnight' },
    { id: 'blush', name: 'Blush' }
  ],

  /* --- The outlined band between the cover and About --- */
  band: 'A LITTLE DATA ✦ A LOT OF CURIOSITY ✦',

  footer: '© 2026 Dhriti Vichhivora · Hand-coded in HTML, CSS and JS · Built with help from Claude'
};
