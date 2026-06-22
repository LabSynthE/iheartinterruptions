// ============================================================
//  theAmazons v2.1
//
//  Reads & replaces H1, H2, H3, and H4 on page at variable frequency
//  Reads & replaces targeted words on page at variable frequency
//    
//  06.26.2026  fix logic for styling and link preservation (ks)
//  05.26.2026  fix mutation loop lockup (ks)
//  05.26.2026  combine header replacement + individual word replacement (ks)
//  05.26.2026  add replacements text (xb)
//
//
// ============================================================


// ============================================================
// CONFIGURE STYLES HERE
// ============================================================

const STYLE_SYSTEM = {
  enabled: true,
  fontFamily: "'Gochi Hand', cursive",

  fonts: {
    base: false,
    heading: true,
    reminder: true,
    link: false
  },

  roles: {
    base: {},

    heading: {
      color: "#a832a8",
      italic: true,
      size: "1.25rem"
    },

    reminder: {
      color: "#a832a8",
      italic: true,
      size: "0.9em",
      opacity: 0.9
    },

    link: {
      color: "#4affa8",
      italic: false,
      size: "0.95em",
      opacity: 1,
      underline: true
    }
  }
};


// ============================================================
// FONT LOADER
// ============================================================

    /* you can swap out the google font you are calling via link.href */

function injectFont() {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Gochi+Hand&display=swap";
  document.head.appendChild(link);
}


// ============================================================
// ROLE STYLE HANDLER
// ============================================================

function injectRoleStyles() {
  if (!STYLE_SYSTEM.enabled) return;

  const r = STYLE_SYSTEM.roles;
  const f = STYLE_SYSTEM.fonts;
  const font = STYLE_SYSTEM.fontFamily;

  const style = document.createElement("style");

  style.textContent = `
    ${f.base ? `
      body,
      button,
      input,
      textarea,
      select,
      optgroup,
      p,
      h1,h2,h3,h4,h5,h6,
      span,
      a {
        font-family: ${font} !important;
      }
    ` : ""}

    .role-heading {
      ${f.heading ? `font-family: ${font};` : ""}
      color: ${r.heading.color};
      font-style: ${r.heading.italic ? "italic" : "normal"};
      font-size: ${r.heading.size};
      display: inline-block;
      padding: .75em;
      margin: .25em;
    }

    .role-reminder {
      ${f.reminder ? `font-family: ${font};` : ""}
      color: ${r.reminder.color};
      font-style: ${r.reminder.italic ? "italic" : "normal"};
      font-size: ${r.reminder.size};
      opacity: ${r.reminder.opacity};
      margin-left: 5px;
    }

    ${f.link ? `
      a.role-link,
      a.role-link:visited,
      a.role-link:hover,
      a.role-link:active {
        color: ${r.link.color} !important;
        font-style: ${r.link.italic ? "italic" : "normal"} !important;
        font-size: ${r.link.size};
        opacity: ${r.link.opacity};
        text-decoration: ${r.link.underline ? "underline" : "none"};
        ${f.link ? `font-family: ${font};` : ""}
      }
    ` : `
      a.role-link {
        all: unset;
        cursor: pointer;
      }
    `}
  `;

  document.head.appendChild(style);
}


// ============================================================
// CONFIGURE WORDS HERE
// ============================================================

    /* These are the Header Replacements */

const REPLACEMENTS = [
  //"Placing a Palm Over His Chest",
  "Feeling the Soft Earth Receiving My Inadequate Footwear",
  "Relax and Touch the Limitless Space of the Human Heart",
  "O I see life is not short, but immeasurably long.",
  "Lead with Affirmations, Not Apologies or Disclaimers",
  //"Don’t Minimize Your Concerns",
  "A Body Rises, Reaches an Apex, and then Falls",
  "The Judge and the Victim Control Our Mind",
  //"The Change Will be Very Significant",
  "Fear Destroys Curiosity and Playfulness"
];

    /* These are the Header Replacements */

const REMINDERS = [
  {
    find: "urgent",
    reminders: [
      "· Placing a Palm Over His Chest",
      "· Don’t Minimize Your Concerns",
      "· The Change Will be Very Significant"
    ]
  },
  {
    find: "anxiety",
    reminders: [
   //   "· Don’t Minimize Your Concerns",
      "· Relax and Touch the Limitless Space of the Human Heart",
      "· Fear Destroys Curiosity and Playfulness"
    ]
  },
  {
    find: "stress",
    reminders: [
      "· Placing a Palm Over His Chest",
    //  "· Relax and Touch the Limitless Space of the Human Heart",
      "· Fear Destroys Curiosity and Playfulness"
    ]
  },
  {
    find: "deals",
    reminders: [
      "· The Judge and the Victim Control Our Mind",
      "· The Change Will be Very Significant",
      "· You’ve Been Onto Something"
    ]
  },
  {
    find: "deal",
    reminders: [
      "· The Judge and the Victim Control Our Mind",
      "· The Change Will be Very Significant"
    ]
  },
  {
    find: "fast",
    reminders: [
      "· A Body Rises, Reaches an Apex, and then Falls",
      "· O I see life is not short, but immeasurably long."
    ]
  },
  {
    find: "recommended",
    reminders: [
      "· Placing a Palm Over His Chest",
      "· Relax and Touch the Limitless Space of the Human Heart"
    ]
  },
  {
    find: "customer",
    reminders: [
      "· Fear Destroys Curiosity and Playfulness",
      "· Don’t Minimize Your Concerns"
    ]
  },
  {
    find: "reviews",
    reminders: [
      "· The Judge and the Victim Control Our Mind",
      "· Don’t Minimize Your Concerns"
    ]
  },
  {
    find: "ratings",
    reminders: [
      "· The Judge and the Victim Control Our Mind",
      "· Don’t Minimize Your Concerns"
    ]
  },
  {
    find: "stars",
    reminders: [
      "· The Judge and the Victim Control Our Mind"
    ]
  },
  {
    find: "buy now",
    reminders: [
      "· The Change Will be Very Significant",
      "· Don’t Minimize Your Concerns"
    ]
  },
  {
    find: "add to cart",
    reminders: [
      "· Feeling the Soft Earth Receiving My Inadequate Footwear"
    ]
  },
  {
    find: "save",
    reminders: [
      "· Relax and Touch the Limitless Space of the Human Heart",
      "· Don’t Minimize Your Concerns"
    ]
  },
  {
    find: "limited",
    reminders: [
      "· Don’t Minimize Your Concerns",
      "· The Change Will be Very Significant"
    ]
  }
];


// ============================================================
// FLAGS
// ============================================================

const HS_ENABLED = true;      // Process Headings
const HS_SKIP_ENABLED = true; // Control Frequency
const HS_MAX_SKIPS = 3;       // Higher = less frequent
const HS_NO_REPEATS = false;  // Don't Repeat Phrases?

const RW_ENABLED = true;      // Process Individual Words?
const RW_SKIP_ENABLED = false; // Control Frequency?
const RW_MAX_SKIPS = 3;       // Higher = less frequent
const RW_NO_REPEATS = false;   // Don't Repeat Phrases


// ============================================================
// STATE
// ============================================================

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}


// Heading state
let hsPool = shuffle([...REPLACEMENTS]);
let hsSkipCount = 0;
const hsReplaced = new WeakSet();

// Individual Word state
const wrWordState = new Map();
const wrProcessed = new WeakSet();


// ============================================================
// PROCESS HEADINGS
// ============================================================

function hsNextReplacement() {
  if (!HS_ENABLED) return null;

  if (HS_SKIP_ENABLED && hsSkipCount > 0) {
    hsSkipCount--;
    return null;
  }

  if (hsPool.length === 0) {
    if (HS_NO_REPEATS) return null;
    hsPool = shuffle([...REPLACEMENTS]);
  }

  const text = hsPool.pop();

  if (HS_SKIP_ENABLED) {
    hsSkipCount = Math.floor(Math.random() * (HS_MAX_SKIPS + 1));
  }

  return text;
}

function replaceHeading(el) {
  if (hsReplaced.has(el)) return;
  hsReplaced.add(el);

  const text = hsNextReplacement();
  if (!text) return;

  el.textContent = "";

  const span = document.createElement("span");
  span.className = "role-heading";
  span.textContent = text;

  el.appendChild(span);
}

function processHeadings(root) {
  const headings = root.querySelectorAll?.("h1, h2, h3, h4") || [];
  headings.forEach(replaceHeading);
}


// ============================================================
// PROCESS INDIVIDUAL WORDS
// ============================================================

const RW_SKIP_TAGS = new Set([
  "SCRIPT","STYLE","NOSCRIPT","TEXTAREA","INPUT",
  "SELECT", "BUTTON","CODE","PRE","HEAD","META","TITLE"
]);     // Can experiment with commenting out 'button'

const COMPILED_REMINDERS = REMINDERS.map(entry => ({
  ...entry,
  regex: new RegExp(
    `(${entry.find.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")})`,
    "gi"
  )
}));

function wrGetState(entry) {
  if (!wrWordState.has(entry.find)) {
    wrWordState.set(entry.find, {
      pool: shuffle([...entry.reminders]),
      skipCount: 0
    });
  }
  return wrWordState.get(entry.find);
}

function wrNextReminder(entry) {
  const state = wrGetState(entry);

  if (RW_SKIP_ENABLED && state.skipCount > 0) {
    state.skipCount--;
    return null;
  }

  if (state.pool.length === 0) {
    if (RW_NO_REPEATS) return null;
    state.pool = shuffle([...entry.reminders]);
  }

  const reminder = state.pool.pop();

  if (RW_SKIP_ENABLED) {
    state.skipCount = Math.floor(Math.random() * (RW_MAX_SKIPS + 1));
  }

  return reminder;
}

function processTextNode(textNode) {
  if (!RW_ENABLED) return;
  if (wrProcessed.has(textNode)) return;

  const parent = textNode.parentNode;
  if (!parent) return;

  if (RW_SKIP_TAGS.has(parent.tagName)) return;
  if (parent.closest && parent.closest("a")) return;

  wrProcessed.add(textNode);

  let remaining = textNode.nodeValue;
  if (!remaining) return;

  let matched = false;
  const fragment = document.createDocumentFragment();

  while (remaining.length > 0) {
    let earliest = null;
    let earliestEntry = null;

    for (const entry of COMPILED_REMINDERS) {
      entry.regex.lastIndex = 0;
      const match = entry.regex.exec(remaining);

      if (match && (!earliest || match.index < earliest.index)) {
        earliest = match;
        earliestEntry = entry;
      }
    }

    if (!earliest) {
      fragment.appendChild(document.createTextNode(remaining));
      break;
    }

    matched = true;

    if (earliest.index > 0) {
      fragment.appendChild(
        document.createTextNode(remaining.slice(0, earliest.index))
      );
    }

    fragment.appendChild(document.createTextNode(earliest[0]));

    const reminder = wrNextReminder(earliestEntry);

    if (reminder) {
      const span = document.createElement("span");
      span.className = "role-reminder";
      span.textContent = reminder;
      fragment.appendChild(span);
    }

    remaining = remaining.slice(
      earliest.index + earliest[0].length
    );
  }

  if (matched) {
    parent.replaceChild(fragment, textNode);
  }
}


// ============================================================
// HANDLER: IGNORE OR INCLUDE LINKS
// ============================================================

function processLinks(root) {
  if (!STYLE_SYSTEM.fonts.link) return;

  const links = root.querySelectorAll?.("a") || [];

  links.forEach(a => {
    if (a.dataset.linkProcessed) return;
    a.dataset.linkProcessed = "true";
    a.classList.add("role-link");
  });
}


// ============================================================
// TREE WALKER
// ============================================================

function processTextNodes(root) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (RW_SKIP_TAGS.has(node.parentNode?.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  let node;
  while ((node = walker.nextNode())) {
    processTextNode(node);
  }
}


// ============================================================
// RUN
// ============================================================

function run(root) {
  injectFont();
  injectRoleStyles();

  processLinks(root);
  processHeadings(root);
  processTextNodes(root);
}

run(document.body);
