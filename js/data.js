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
    foodLine: 'Powered by data and good food.',
    playlist: 'Portfolio 2026',
    intro: 'Data Science student at NMIMS Mumbai and Data Science intern at Logixal, summer 2026. Exploring AI, machine learning and LLMs.',
    photo: 'assets/photo.jpg',
    photoSmall: 'assets/photo-small.jpg',
    photoAlt: 'Portrait of Dhriti Vichhivora'
  },

  /* --- Player bar: the "track" shown for each section --- */
  tracks: {
    top: 'Cover',
    about: 'Who is Dhriti?',
    work: 'Projects',
    record: 'On the record',
    skills: 'The record crate',
    beyond: 'Bonus tracks',
    contact: 'Say hi',
    ended: 'Track ended',
    length: 150            /* seconds: the whole page plays as a 2:30 track */
  },

  /* --- Navigation links (id = section id) --- */
  nav: [
    { id: 'about', label: 'About' },
    { id: 'work', label: 'Projects' },
    { id: 'record', label: 'Experience' },
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

  /* --- 01 About --- */
  about: {
    label: '01 — About',
    headline: 'Who is Dhriti?',
    underline: 'Dhriti',
    statement: 'Strong opinions, open mind, always hungry.',
    paragraphs: [
      'I’m Dhriti, a Data Science student at NMIMS Mumbai, young and still exploring. I like taking my time with things: understanding them properly, then seeing what I can make of them.',
      'People find me easy to talk to and hard to ignore. I lead from the front, speak my mind, and never say no to good food. Where I’ll end up, I honestly don’t know yet, and I’m enjoying finding out.'
    ],
    caption: 'Figuring it out.',
    facts: [
      ['Studies', 'B.Tech Data Science (integrated), NMIMS Mumbai'],
      ['Interned at', 'Logixal, Data Science Intern, June 2026'],
      ['Exploring', 'AI, machine learning, LLMs, analytics'],
      ['Learning', 'German (A2), deep learning, cloud (AWS and Azure)'],
      ['Never says no to', 'a new place, a new conversation and good food']
    ],
    highlightsLabel: 'Highlights',
    highlights: [
      { big: '2026', text: 'Data Science Intern at Logixal' },
      { big: 'Lead', text: 'Head of the Tech department at Data Mavericks' },
      { big: 'A1', text: 'German, certified. A2 in progress' },
      { big: '3', text: 'IBM certifications on Coursera' }
    ]
  },

  /* --- 02 Projects: the tracklist --- */
  work: {
    label: '02 — Projects',
    headline: 'What has she built?',
    subhead: 'Tracklist · 4 tracks',
    intro: 'Four projects, from forecasting Mumbai’s air to talking to a database. Open any track for the full story.',
    note: 'The animated visuals are illustrations of each idea, not real results. The Spotify screenshots are the real dashboard.',
    blockLabels: { origin: 'Where it started', question: 'The question', data: 'The data', built: 'What I built', learned: 'What I learned', tools: 'Tools' },
    codeLabel: 'GitHub',
    demoLabel: 'Live app',
    projects: [
      {
        id: 'chatbot',
        title: 'Database Chatbot Assistant',
        status: 'Live',
        summary: 'Ask a sales database a question in plain English and get the answer, a chart and a follow-up.',
        origin: 'It started at my internship. As a Data Science Intern at Logixal I worked on a conversational analytics platform that let business teams query databases in plain English. To understand the whole pipeline, I rebuilt a scaled-down version on my own.',
        question: 'Can someone who has never written a database query just ask a question and get a straight answer?',
        data: 'A PostgreSQL “Superstore” retail database: 9,994 orders across three joined tables (orders, customers and returns).',
        built: [
          'An LLM (through Groq) turns a plain-English question into a database query. My code checks it, repairs common mistakes with dates, joins and rounding, and retries if it fails.',
          'Conversation memory, using query rewriting and entity resolution, so a vague follow-up like “what about last quarter?” still makes sense.',
          'A collaborative-filtering recommendation engine that suggests products from customers with similar purchases.',
          'Sales, profit and returns forecasting with a trend-based three-month moving average.',
          'A FastAPI backend and a live dashboard with KPIs, auto-generated charts and a Word report export.'
        ],
        learned: 'The model writes a decent first draft. Most of the real work is in the guardrails around it: dates, joins and follow-up questions that don’t quite say what they mean.',
        tools: ['Python', 'FastAPI', 'PostgreSQL', 'SQLAlchemy', 'pandas', 'Groq LLM API', 'HTML/JS'],
        code: 'https://github.com/DhritiVichhivora/Database-Chatbot_Assisstance',
        demo: 'https://database-chatbot-assisstance-mf97.onrender.com/',
        demoNote: 'it runs on a free server, so the first load can take about a minute',
        visual: 'terminal'
      },
      {
        id: 'aqi',
        title: 'Mumbai Air Quality Forecasting',
        status: 'Live',
        summary: 'Six years of Mumbai’s air, broken into seasons and forecast 30 days ahead.',
        question: 'How bad does Mumbai’s air get, when does it peak, and what is coming next?',
        data: '2,431 daily AQI readings from the Central Pollution Control Board, May 2018 to December 2024.',
        built: [
          'STL decomposition to separate the long-term trend from the yearly pollution cycle.',
          'Stationarity checks with ADF and KPSS tests, and ACF/PACF plots to pick model orders.',
          'An ARIMA model chosen by AIC across a grid of 16 configurations, forecasting 7 to 30 days ahead with 95% confidence intervals.',
          'A four-state Markov chain of AQI categories, with its long-run (stationary) distribution found through eigenvalue decomposition.',
          'An interactive Streamlit app with a tab for each step.'
        ],
        learned: 'Mumbai’s air is at its worst from November to January. The Markov chain’s long-run probabilities say more about the city than any single day’s reading.',
        tools: ['Python', 'pandas', 'NumPy', 'statsmodels', 'SciPy', 'Plotly', 'Streamlit'],
        code: 'https://github.com/DhritiVichhivora/mumbai-aqi-model',
        demo: 'https://mumbai-aqi-model-8bqn4u55xhkin3ibypnrid.streamlit.app/',
        visual: 'bars'
      },
      {
        id: 'cpi',
        title: 'India CPI Inflation Insights',
        status: 'Live',
        summary: 'Which prices actually push India’s inflation up? Five price groups, three models.',
        question: 'Which parts of the consumer price index actually drive headline inflation, and did COVID change the picture?',
        data: '132 monthly CPI readings (2015 to 2025) from MOSPI across five groups: food and beverages, fuel and light, housing, clothing and footwear, and miscellaneous.',
        built: [
          'Year-on-year inflation rates for each price group.',
          'A pre- versus post-COVID comparison using hypothesis tests, one- and two-way ANOVA and Tukey HSD.',
          'An OLS model forecasting next month’s headline inflation, checked with VIF for multicollinearity and residual analysis.',
          'Ridge and Lasso regression with K-fold cross-validation, plus coefficient paths, to see which groups predict inflation on their own.',
          'An interactive Streamlit dashboard to explore it all.'
        ],
        learned: 'Putting OLS, Ridge and Lasso side by side shows which price groups still matter once regularisation kicks in. Lasso is a quick, honest way to spot the ones that add nothing on their own.',
        tools: ['Python', 'pandas', 'statsmodels', 'scikit-learn', 'SciPy', 'seaborn', 'Streamlit'],
        code: 'https://github.com/DhritiVichhivora/CPI-model',
        demo: 'https://cpi-model-nvnkzcwl57282arkwxqygd.streamlit.app/',
        visual: 'line'
      },
      {
        id: 'spotify',
        title: 'Spotify Listening Dashboard',
        status: 'Power BI',
        summary: '14 months of my own listening, rebuilt as a four-page report that looks like the Spotify app.',
        question: 'What do my listening habits actually look like: when do I listen, who do I come back to, and what do I skip?',
        data: 'My own Spotify streaming history from December 2024 to February 2026: 10,879 plays across 1,376 artists and 2,571 tracks.',
        built: [
          'A Power Query pipeline that combines the two Spotify export files, converts timestamps to Indian time, flags any play under 30 seconds as a skip, and adds weekday, hour and part-of-day columns.',
          'DAX measures for hours, plays, skip rate, peak hour, top artist and top track, RANKX rankings for the top artists and tracks, and new artists discovered each month.',
          'Four pages styled like the Spotify app: On Repeat (overview), Night Owl (a weekday-by-hour heatmap), Heavy Rotation (artists, loyalty and skips) and Deep Cuts (pick an artist or month).',
          'A custom dark theme, designed page backgrounds with transparent visuals on top, and sidebar buttons for page navigation.'
        ],
        learned: 'The same numbers feel completely different once they look like something people already know. Design is part of the analysis, not decoration on top of it.',
        tools: ['Power BI', 'Power Query (M)', 'DAX'],
        code: 'https://github.com/DhritiVichhivora/spotify-listening-dashboard',
        demo: '',
        visual: 'gallery',
        gallery: [
          { src: 'assets/spotify/01-on-repeat.jpg', label: 'On Repeat', alt: 'On Repeat page: listening totals, top tracks, top artists and minutes per month' },
          { src: 'assets/spotify/02-night-owl.jpg', label: 'Night Owl', alt: 'Night Owl page: weekday by hour heatmap, peak hour and listening by time of day' },
          { src: 'assets/spotify/03-heavy-rotation.jpg', label: 'Heavy Rotation', alt: 'Heavy Rotation page: treemap of top 20 artists, artist loyalty and most skipped artists' },
          { src: 'assets/spotify/04-deep-cuts.jpg', label: 'Deep Cuts', alt: 'Deep Cuts page: artist and month pickers with top tracks and minutes by month' }
        ]
      }
    ],
    /* Made-up examples for the terminal illustration (not real data) */
    terminal: {
      title: 'ask-my-data',
      examples: [
        {
          ask: 'Which region sold the most last quarter?',
          query: 'SELECT region, SUM(sales) FROM orders WHERE quarter = \'last\' GROUP BY region ORDER BY 2 DESC LIMIT 3;',
          head: ['region', 'sales'],
          rows: [['West', '41,200'], ['East', '38,900'], ['Central', '27,450']]
        },
        {
          ask: 'And which product led there?',
          query: 'SELECT product, SUM(sales) FROM orders WHERE region = \'West\' AND quarter = \'last\' GROUP BY product ORDER BY 2 DESC LIMIT 3;',
          head: ['product', 'sales'],
          rows: [['Desk chair', '6,310'], ['Printer', '5,870'], ['Bookcase', '4,120']]
        }
      ]
    }
  },

  /* --- 03 Experience and education ("on the record") --- */
  record: {
    label: '03 — Experience & education',
    headline: 'What’s on her record?',
    experienceLabel: 'Experience',
    experience: [
      {
        when: 'June 2026',
        role: 'Data Science Intern',
        org: 'Logixal · Mumbai',
        points: [
          'Contributed to an enterprise conversational analytics platform that lets business teams query internal databases in plain English.',
          'Worked on turning natural language into database queries and on automatic query correction, and supported multi-turn conversations so follow-up questions resolve using earlier context.',
          'Helped with the recommendation and forecasting modules, and with the dashboard layer that surfaces insights through charts and quick-action queries.',
          'Then rebuilt a scaled-down version end to end on my own (Project 01).'
        ]
      }
    ],
    educationLabel: 'Education',
    education: [
      {
        when: '2022 – 2028',
        role: 'B.Tech in Data Science',
        org: 'NMIMS Mumbai · six-year integrated programme'
      },
      {
        when: 'School',
        role: 'Shishuvan High School',
        org: ''
      }
    ],
    certsLabel: 'Certifications',
    certs: [
      { name: 'Python for Data Science, AI & Development', by: 'IBM · Coursera', href: 'https://www.coursera.org/account/accomplishments/records/C80FHB1FHT53' },
      { name: 'Exploratory Data Analysis for Machine Learning', by: 'IBM · Coursera', href: 'https://www.coursera.org/account/accomplishments/records/A0VOSRVLLZXS' },
      { name: 'Introduction to Deep Learning & Neural Networks with Keras', by: 'IBM · Coursera', href: 'https://www.coursera.org/account/accomplishments/records/JWAW3MI4RM3M' }
    ],
    certLink: 'View certificate'
  },

  /* --- 04 Skills: the record crate --- */
  skills: {
    label: '04 — Toolkit',
    headline: 'What’s in the crate?',
    intro: 'My skills, filed like records. Hover or tap a sleeve to pull the record out.',
    sides: [
      { side: 'Side A', title: 'Making sense of data',
        tracks: [
          ['Python', 'where every project starts'],
          ['SQL', 'asking databases the right questions'],
          ['pandas & NumPy', 'turning messy into usable'],
          ['EDA & data cleaning', 'the unglamorous 80%'],
          ['Time series (STL, ARIMA)', 'patterns that repeat, and the ones that don’t'],
          ['Hypothesis testing & ANOVA', 'proving it, not just plotting it'],
          ['Power BI & Tableau', 'when a dashboard has to do the talking'],
          ['Plotly, Matplotlib, Seaborn', 'charts that tell the story']
        ] },
      { side: 'Side B', title: 'Teaching machines',
        tracks: [
          ['Regression (OLS, Ridge, Lasso)', 'finding what actually drives the number'],
          ['Classification & clustering', 'sorting things into sensible groups'],
          ['Cross-validation', 'keeping my models honest'],
          ['scikit-learn & statsmodels', 'the modelling toolbox'],
          ['Markov chains', 'what happens next, in probabilities'],
          ['LLMs', 'plain English in, answers out'],
          ['Recommendation logic', 'people who bought this also…']
        ] },
      { side: 'Side C', title: 'Shipping it',
        tracks: [
          ['Streamlit', 'from notebook to live app'],
          ['FastAPI', 'backends that answer back'],
          ['PostgreSQL & MySQL', 'where the data lives'],
          ['SQLAlchemy', 'Python, meet database'],
          ['Docker', 'works on my machine, and yours'],
          ['Git & GitHub', 'every version, saved'],
          ['HTML, CSS & JS', 'how this site was built'],
          ['C/C++ & Java', 'the classroom classics']
        ] },
      { side: 'Side D', title: 'The people part',
        tracks: [
          ['Public speaking', 'sharpened at MUN'],
          ['Mentoring', 'weekly sessions at an NGO'],
          ['Team leadership', 'leading tech at Data Mavericks'],
          ['Event coordination', 'college events, from plan to execution'],
          ['Languages', 'German, A1 certified']
        ] }
    ],
    exploringLead: 'Currently exploring',
    exploring: ['AI', 'Machine Learning', 'LLMs', 'Deep Learning', 'Data Visualisation']
  },

  /* --- 05 Beyond tech: flip cards --- */
  beyond: {
    label: '05 — Bonus tracks',
    headline: 'Beyond the code',
    hint: 'Eight things I do away from the screen. Hover, tap or press Enter to turn a card over.',
    cards: [
      { id: 'mun', title: 'MUN', teaser: 'Delegate',
        line: 'I represent assigned countries in formal committee sessions: research the position, then argue it out loud. It’s where I learned to build an argument and think on my feet.',
        detail: 'Model United Nations · NMIMS Mumbai' },
      { id: 'volunteer', title: 'Volunteering', teaser: 'Mentor',
        line: 'I mentor children at the Dynamic Sansta NGO in foundational subjects, week after week. Explaining things simply turns out to be a skill you keep practising.',
        detail: 'Dynamic Sansta NGO · weekly mentoring' },
      { id: 'communities', title: 'College communities', teaser: 'Three roles',
        line: 'I’ve served on three college communities, and now lead the tech team at Data Mavericks.',
        timeline: [
          ['2023-2024', 'Cultural executive'],
          ['2024-2025', 'Publicity Executive, IETE'],
          ['2026 – present', 'Head of the Tech department, Data Mavericks']
        ] },
      { id: 'german', title: 'German', teaser: 'A1 certified',
        line: 'Certified at A1 and now working towards A2. The next goal is a whole conversation without switching back to English.',
        detail: 'A1 certified · A2 in progress' },
      { id: 'hackathons', title: 'Hackathons', teaser: 'Smart India Hackathon',
        line: 'I’ve taken part in hackathons, including the Smart India Hackathon: a real problem statement, a team, and a clock that never slows down.',
        detail: 'Smart India Hackathon' },
      { id: 'sport', title: 'Sport', teaser: 'Swimming · Badminton',
        line: 'Swimming laps and playing badminton are how I reset. Both reward the same thing data does: patience and practice.',
        detail: 'Swimming · Badminton' },
      { id: 'travel', title: 'Travel', teaser: 'Somewhere new',
        line: 'I’m happiest somewhere new, talking to people I’ve just met. Every trip comes back as a few good stories.',
        detail: 'New places, new people' },
      { id: 'food', title: 'Food', teaser: 'Always hungry',
        line: 'Good food is one of my favourite things, and trying something new to eat is half the fun of going anywhere.',
        detail: 'Powered by data and good food' }
    ]
  },

  /* --- 06 Contact --- */
  contact: {
    label: '06 — Contact',
    headline: 'Say hi.',
    line: 'Open to internships and data projects.',
    email: 'dhriti076@gmail.com',
    links: [
      { label: 'Email', href: 'mailto:dhriti076@gmail.com' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/dhriti-vichhivora-3155a9373' },
      { label: 'GitHub', href: 'https://github.com/DhritiVichhivora' },
      { label: 'Instagram', href: 'https://www.instagram.com/_dhriti_v/' }
    ],
    copyLabel: 'Copy email',
    copied: 'Copied',
    replay: 'Replay from the top'
  },

  footer: '© 2026 Dhriti Vichhivora'
};
