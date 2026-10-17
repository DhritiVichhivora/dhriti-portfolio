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

  /* --- 01 About --- */
  about: {
    label: '01 · About',
    headline: 'Who is Dhriti?',
    squiggle: 'Dhriti',
    paragraphs: [
      'I’m a Data Science student who likes finding the story hiding inside a messy dataset. I’m happiest when a question I can’t answer yet turns into something I can build.',
      'Right now I’m exploring AI, machine learning and GenAI, and how to make data look as good as it is useful. Away from the screen you’ll find me swimming laps, playing badminton, or somewhere new, talking to people I’ve just met. I also do MUN, volunteer, take part in hackathons like Smart India Hackathon, and I’m learning German (A1 so far).'
    ],
    factsHead: ['Question', 'Answer'],
    facts: [
      ['Studies', 'Data Science (integrated B.Tech), NMIMS Mumbai'],
      ['Interned at', 'Logixal (Data Science, summer 2026)'],
      ['Exploring', 'AI, GenAI, analytics'],
      ['Learning', 'German (A1)'],
      ['Never says no to', 'a new place and a new conversation']
    ],
    factsNote: 'facts found',
    interestsLabel: 'Off the clock',
    interests: ['Swimming', 'Badminton', 'Travel', 'Meeting new people', 'MUN', 'German'],
    caption: 'figuring it out',
    stickers: ['curious', 'data nerd']
  },

  /* --- 02 Work: the tracklist --- */
  work: {
    label: '02 · Work',
    headline: 'What has she built?',
    subhead: 'Tracklist',
    intro: 'A few experiments where data meets curiosity.',
    note: 'The visuals are illustrations of each idea, not real results.',
    blockLabels: { what: 'What it is', did: 'What I did', learned: 'What I learned', tools: 'Tools' },
    codeLabel: 'View code',
    demoLabel: 'Live demo',
    soonLabel: 'Code coming soon',
    projects: [
      {
        id: 'aqi',
        title: 'Mumbai air quality',
        summary: 'Tracking and forecasting Mumbai’s daily air quality.',
        what: 'A live app that tracks Mumbai’s daily air quality and forecasts where it’s heading next.',
        did: 'I cleaned six years of daily pollution-board readings (2018 to 2024), split the trend from the seasons with STL decomposition and checked stationarity with ADF and KPSS. I picked an ARIMA model by AIC across a grid of 16 setups to forecast up to 30 days ahead, then modelled how the city moves between AQI categories as a four-state Markov chain.',
        learned: 'Mumbai’s air is at its worst from November to January. The Markov chain shows how often the city sits in each category over the long run, which says more than any single day’s reading.',
        tools: ['Python', 'pandas', 'NumPy', 'statsmodels', 'SciPy', 'Plotly', 'Streamlit'],
        code: 'https://github.com/DhritiVichhivora/mumbai-aqi-model',
        demo: 'https://mumbai-aqi-model-8bqn4u55xhkin3ibypnrid.streamlit.app/',
        visual: 'bars'
      },
      {
        id: 'cpi',
        title: 'CPI inflation',
        summary: 'Which prices actually push India’s inflation up?',
        what: 'A live app that asks which parts of India’s consumer price index drive headline inflation, using official CPI data from 2015 to 2025.',
        did: 'I turned five CPI groups (food, fuel, housing, clothing and everything else) into year-on-year inflation rates and tested whether prices behaved differently before and after COVID, using hypothesis tests, ANOVA and Tukey HSD. Then I built OLS, Ridge and Lasso models to predict next month’s inflation, tuned with K-fold cross-validation.',
        learned: 'Putting the three models side by side shows which price groups still matter once regularisation kicks in. Lasso is a quick, honest way to spot the ones that add nothing on their own.',
        tools: ['Python', 'pandas', 'statsmodels', 'scikit-learn', 'SciPy', 'seaborn', 'Streamlit'],
        code: 'https://github.com/DhritiVichhivora/CPI-model',
        demo: '',
        visual: 'line'
      },
      {
        id: 'spotify',
        title: 'Spotify dashboard',
        summary: 'A music dashboard, still in the studio.',
        what: 'A dashboard built around Spotify data. It’s still being recorded, so the full write-up and the code land when it’s finished.',
        did: '',
        learned: '',
        tools: [],
        code: '',
        demo: '',
        visual: 'eq',
        chips: ['in progress', 'next release']
      },
      {
        id: 'nl',
        title: 'Natural language to database',
        summary: 'Ask a sales database a question in plain English.',
        what: 'A chat assistant that answers questions about a retail sales database in plain English, with a live dashboard on top.',
        did: 'It started at my internship. As a Data Science intern at Logixal, I worked on a conversational analytics platform for querying databases in plain English. Afterwards I rebuilt a scaled-down version on my own with FastAPI, PostgreSQL and an LLM. The LLM drafts the query, my code checks and repairs it before it runs, and it retries if something fails. It remembers the conversation, so a vague follow-up like “what about last quarter?” still makes sense. It also recommends products based on customers with similar purchases and forecasts sales on the dashboard.',
        learned: 'The model writes a decent first draft. Most of the real work is in the guardrails around it: dates, joins and follow-up questions that don’t quite say what they mean.',
        tools: ['Python', 'FastAPI', 'PostgreSQL', 'SQLAlchemy', 'pandas', 'Groq LLM API', 'HTML/JS'],
        code: 'https://github.com/DhritiVichhivora/Database-Chatbot_Assisstance',
        demo: 'https://database-chatbot-assisstance-mf97.onrender.com/',
        demoNote: 'free server, may take a minute to wake up',
        visual: 'terminal'
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

  /* --- 03 Skills --- */
  skills: {
    label: '03 · Skills',
    headline: 'What’s in the toolkit?',
    groups: [
      { title: 'Data and analytics', icon: 'chart',
        items: ['Python', 'SQL', 'pandas', 'NumPy', 'Time series (STL, ARIMA)', 'Hypothesis testing', 'ANOVA', 'Forecasting', 'Plotly', 'matplotlib', 'seaborn'] },
      { title: 'AI and ML', icon: 'spark',
        items: ['Regression (OLS, Ridge, Lasso)', 'Cross-validation', 'scikit-learn', 'statsmodels', 'Markov chains', 'LLMs', 'Recommendation logic'] },
      { title: 'Tools and building', icon: 'tools',
        items: ['Streamlit', 'FastAPI', 'PostgreSQL', 'MySQL', 'SQLAlchemy', 'HTML, CSS, JS', 'Git and GitHub', 'Deploying apps'] },
      { title: 'People skills', icon: 'people',
        items: ['Public speaking (MUN)', 'Mentoring', 'Team leadership', 'Language learning'] }
    ],
    exploringLead: 'Currently exploring',
    exploring: ['AI', 'Machine Learning', 'GenAI', 'Data Visualisation']
  },

  /* --- 04 Beyond tech: flip cards --- */
  beyond: {
    label: '04 · Bonus tracks',
    headline: 'Beyond the code',
    hint: 'Hover, tap or press Enter to flip a card.',
    cards: [
      { id: 'mun', title: 'MUN', icon: 'mic',
        line: 'I take part in Model United Nations: research a country’s position, then argue for it out loud in a room full of people.',
        detail: 'Model United Nations' },
      { id: 'volunteer', title: 'Volunteering', icon: 'heart',
        line: 'I mentor children at the Dynamic Sansta NGO. Explaining things simply turns out to be a skill you keep practising.',
        detail: 'Dynamic Sansta NGO · mentoring' },
      { id: 'communities', title: 'College communities', icon: 'stack',
        line: 'I’ve served on three college communities, and now lead the tech team at Data Mavericks.',
        timeline: [
          ['2023-2024', 'Cultural executive'],
          ['2024-2025', 'Publicity Executive, IETE'],
          ['2026 – present', 'Head of the Tech department, Data Mavericks']
        ] },
      { id: 'german', title: 'German A1', icon: 'speech',
        line: 'I’m learning German and have reached A1. The next goal is a whole conversation without switching back to English.',
        detail: 'Level A1 · still going',
        sticker: 'Hallo!' }
    ]
  },

  /* --- 05 Contact --- */
  contact: {
    label: '05 · Contact',
    headline: 'Say hi.',
    line: 'Got an idea, a dataset, or a debate topic? My inbox is open.',
    email: 'dhriti076@gmail.com',
    links: [
      { label: 'Email', href: 'mailto:dhriti076@gmail.com' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/dhriti-vichhivora-3155a9373' },
      { label: 'GitHub', href: 'https://github.com/DhritiVichhivora' },
      { label: 'Instagram', href: 'https://www.instagram.com/_dhriti_v/' }
    ],
    copyLabel: 'Copy',
    copied: 'Copied',
    replay: 'Replay from the top'
  },

  footer: '© 2026 Dhriti Vichhivora · Hand-coded in HTML, CSS and JS · Built with help from Claude'
};
