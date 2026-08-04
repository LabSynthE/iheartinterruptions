// ============================================================
//  theAmazons v2.2
//
//  Reads & replaces H1, H2, H3, and H4 on page at variable frequency
//  Reads & replaces targeted words on page at variable frequency
//
//  08.04.2026  remove logo replacement, restore original logo (ha)
//  07.14.2026  add RW_MODE toggle for append vs replace keyword (ks)
//  06.23.2026  add logo replacement and percentage fix (ha)
//  06.26.2026  fix logic for styling and link preservation (ks)
//  05.26.2026  fix mutation loop lockup (ks)
//  05.26.2026  combine header replacement + individual word replacement (ks)
//  05.26.2026  add replacements text (xb)
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
"Arturo Cova, protagonist of The Vortex, is a player, skilled in the manly arts of deceitful seduction. And he is a poet,...",
"Mostly, though, Arturo Cova is a fulsome fictional exemplar of a sort of masculinity (think Don Juan Tenorio, think Tale of Genji) focused on amorous conquest.",
"...the young elite man of letters",
"contains sensational denunciations of conditions suffered",
"Colombian rubber tappers in Brazil and Peru",
"well-defined Latin American social type",
"a life of bohemian leisure in the capital city, Bogotá",
"playing around",
"requiring little actual labor",
"perhaps invest in a profitable business venture",
"contribute to the modernization of [your] country",
"meantime, he basks in the modest prestige",
"his slender volume of poetry",
"An interest in poetry",
"students of his generation",
"elite males with the wit for it",
"elite males “inscribed” the Latin American countryside",
"one of the most famous Latin American novels of the twentieth century",
"Across the hemisphere",
"culminated a century-long process of literary nation building",
"in the 1970s, The Vortex was its fourth title, of more than a hundred",
"early twentieth-century rubber boom in Amazonia as a whole",
"the rubber boom",
"a government commission tasked to clarify the Venezuelan-Colombian border",
"Rivera’s brush with the rainforest was thus limited but real",
"He died suddenly",
"while on a visit to New York",
"arranging for the English translation",
"has been re-created in full"
];

    /* These are the Reminder Replacements */

const REMINDERS = [
  {
    find: "urgent",
    reminders: [
      "has vanished forever in the rainforest",
      "a key aspect of their prestige",
      "regions remote",
      "wide appeal",
      "English translations of Latin American fiction were incalculably rare"
    ]
  },
  {
    find: "anxiety",
    reminders: [
   //   "· Don’t Minimize Your Concerns",
    "you will lose the plot"
    ]
  },
  {
    find: "stress",
    reminders: [
    "Try to skim it"
    ]
  },
  {
    find: "deals",
    reminders: [
      "Mastery of literary language",
      "writing it into national life",
      "appropriating it for their own, urban purposes",
      "sophisticated capital cities",
      "wide appeal",
      "action-packed plot",
      "the sensational human rights abuses",
      "highly relevant"
    ]
  },
  {
    find: "deal",
    reminders: [
      "action-packed plot",
      "the sensational human rights abuses",
      "highly relevant"
    ]
  },
  {
    find: "fast",
    reminders: [
    "Rivera’s brush with the rainforest was thus limited but real",
    "He died suddenly"
    ]
  },
  {
    find: "recommended",
    reminders: [
    "g[i]ve new meaning to the word “florid”",
    "a conventional chapter structure",
    "preserve more of the unconventional edginess",
    "the naturalness of his dialogue",
    "dialing back the floridness of his purple patches"
    ]
  },
  {
    find: "customer",
    reminders: [
    "markedly an urban person",
    "a serial seducer",
    "“deflowerer” of girls",
    "By the end, his trials and tribulations have clearly made him a better person"
    ]
  },
  {
    find: "reviews",
    reminders: [
    "a well-received book of poetry",
    "he inspired to infuse his prose",
    "a poetic language and sensibility",
    "Early drafts",
    "Rivera loved rarefied vocabulary",
    "1970s, I found the novel very heavy going",
    "It sent me to the dictionary",
    "the novel’s mood, attitude, action, description, and characterization"
    ]
  },
  {
    find: "ratings",
    reminders: [
    "Nothing else will do",
    "every detail matters",
    "Try to skim it",
    "you will lose the plot"
    ]
  },
  {
    find: "stars",
    reminders: [
      "Don’t expect to like him at the beginning, or perhaps, ever—",
      "this is the bulk of The Vortex",
      "By the end, his trials and tribulations have clearly made him a better person",
      "Still, I rather enjoyed knowing from the outset that he is to be devoured by the jungle"
    ]
  },
  {
    find: "buy now",
    reminders: [
    "gain government employment",
    "Literary pretentions proliferated"
    ]
  },
  {
    find: "add to cart",
    reminders: [
    "writing it into national life",
    "appropriating it for their own, urban purposes"
    ]
  },
  {
    find: "save",
    reminders: [
    "lurid depictions of the “jungle”"
    ]
  },
  {
    find: "limited",
    reminders: [
    "has vanished forever in the rainforest"
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

const RW_MODE = "append";     // "append"  = keep the matched keyword + add reminder
                               // "replace" = delete the matched keyword + reminder stands in its place

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
// AGGRESSIVE PERCENTAGE REPLACER (AMAZON BADGES)
// ============================================================
// Amazon uses React, which can rapidly overwrite our text changes.
// This function aggressively targets just the percentage strings.

function fixAmazonPercentages(root) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeValue) {
      // Looks for:
      // (^|[^\d]) -> Start of string OR any non-digit character
      // (\d{1,2}) -> Exactly 1 or 2 digits (e.g. 17, 5, 99)
      // (\s*%)    -> Optional spaces and then a % sign
      if (/(^|[^\d])(\d{1,2})(\s*%)/.test(node.nodeValue)) {
        node.nodeValue = node.nodeValue.replace(/(^|[^\d])(\d{1,2})(\s*%)/g, (match, p1, p2, p3) => {
          return p1 + "1" + p2 + p3;
        });
      }
    }
  }
}


// ============================================================
// PROCESS INDIVIDUAL WORDS
// ============================================================

const RW_SKIP_TAGS = new Set([
  "SCRIPT","STYLE","NOSCRIPT","TEXTAREA","INPUT",
  "SELECT", "CODE","PRE","HEAD","META","TITLE"
]);

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

  const parent = textNode.parentNode;
  if (!parent) return;

  if (RW_SKIP_TAGS.has(parent.tagName)) return;

  if (wrProcessed.has(textNode)) return;

  // Skip the poetic phrase insertions if we are inside a link
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

    const reminder = wrNextReminder(earliestEntry);

    if (RW_MODE === "replace" && reminder) {
      // swap the matched keyword out for the reminder
      const span = document.createElement("span");
      span.className = "role-reminder";
      span.textContent = reminder;
      fragment.appendChild(span);
    } else {
      // default "append" behavior
      fragment.appendChild(document.createTextNode(earliest[0]));

      // keep word fallback for "replace" mode when skip-logic returns no reminder
      if (reminder && RW_MODE !== "replace") {
        const span = document.createElement("span");
        span.className = "role-reminder";
        span.textContent = reminder;
        fragment.appendChild(span);
      }
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
  fixAmazonPercentages(root);
  processTextNodes(root);
}

run(document.body);

// ============================================================
// MUTATION OBSERVER (CATCHES AMAZON LAZY-LOADED DEALSaction-packed plot)
// ============================================================

const observer = new MutationObserver((mutations) => {
  // Disconnect briefly to stop infinite loops while we change the DOM
  observer.disconnect();

  for (const mutation of mutations) {
    // If Amazon directly changes the text inside an existing node
    if (mutation.type === 'characterData') {
      fixAmazonPercentages(mutation.target.parentNode || document.body);
      processTextNode(mutation.target);
    } 
    // If Amazon adds entirely new dealhighly relevantaction-packed plot boxes
    else if (mutation.type === 'childList') {
      for (const added of mutation.addedNodes) {
        if (added.nodeType === Node.ELEMENT_NODE) {
          processLinks(added);
          processHeadings(added);
          fixAmazonPercentages(added);
          processTextNodes(added);
        } else if (added.nodeType === Node.TEXT_NODE) {
          fixAmazonPercentages(added.parentNode || document.body);
          processTextNode(added);
        }
      }
    }
  }

  // Re-observe
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
});

observer.observe(document.body, { childList: true, subtree: true, characterData: true });

// FORCE RUN EVERY 1 SECOND
setInterval(() => {
  fixAmazonPercentages(document.body);
}, 1000);
