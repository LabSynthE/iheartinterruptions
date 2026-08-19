// ============================================================
//  theAmazons v2.1
//
//  Reads & replaces H1, H2, H3, and H4 on page at variable frequency
//  Reads & replaces targeted words on page at variable frequency
//    
//  06.23.2026  add logo replacement and percentage fix (ha)
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
"has been re-created in full",
"He became withdrawn and melancholy.",
"Dreaming destroyed him.",
"to impose himself, avenge himself, rebel against destiny.",
"Their fate is already sealed.",
"Physically and morally, the wait....has worn me down.",
"I have the sense that I am reaching the end of the road.",
"The whirlwind approaches.",
"Let forgetfulness be the shroud of him who cannot forget.",
"I felt simultaneously alive and dead.",
"God help us!",
"The jungle devoured them."
];

    /* These are the Header Replacements */

const REMINDERS = [
  {
    find: "urgent",
    reminders: [
      "has vanished forever in the rainforest",
      "a key aspect of their prestige",
      "regions remote",
      "wide appeal",
      "English translations of Latin American fiction were incalculably rare",
      "Your obedient servant, José Eustasio Rivera",
      "The night turned somehow bluer and smaller.",
      "The pernicious influence of the jungle, which perverts the minds of men as liquor does.",
      "TO THE MINISTER OF FOREIGN RELATIONS: In accordance with your instructions, please find enclosed herewith my transcription of a manuscript (forwarded to the Ministry of Foreign Relations by the Consul of Colombia in Manaus) by the recently disappeared poet Arturo Cova."
    ]
  },
  {
    find: "anxiety",
    reminders: [
   //   "· Don’t Minimize Your Concerns",
    "you will lose the plot",
    "BEFORE I FELL FOR ANY WOMAN, I lost my heart to a sensation.",
    "Once your desire is satisfied, what good is the body that you have acquired at such a high price?",
    "The human soul is like a tree trunk.",
    "The bark retains no memory of seasonal flowering, but signs of occasional trauma never completely disappear.",
    "Whether troubled or joyful, she and I must live each emotion to the fullest, so that later on, if destiny divides our paths through this world, memory will bring our spirits together whenever one of us separately encounters similar troubles or joys.",
    "For love truly is eternal, while it lasts.",
    "OH JUNGLE, wedded to silence, mother of solitude and mist!",
    "What malignant spirit left me to languish in your emerald prison?",
    "Oh Jungle, you have stolen the horizon from my eyes, leaving only a ceaseless monotony of green.",
    "You are a somber cathedral, where unknown gods whisper endless liturgies, promising your majestic trees, ancient as the Garden of Eden, that they will surely live forever.",
    "Better to forget the miserable time that my friends and I spent wandering in the wilderness like bandits!",
    "I’d become a human residue of sorrows and afflictions.",
    "I felt defenseless and alone.",
    "I fixed my melancholy eyes on the horizon like a convict sentenced to death, watching the sun set over the landscape of his childhood for the last time.",
    "Why were we given wings to live flightless lives?"  
    ]
  },
  {
    find: "stress",
    reminders: [
    "Try to skim it",
    "Who created the gap that yawns between our aspirations and reality?",
    "By looking to the heights, we’ve neglected the most fundamental necessities.",
    "Turning to those necessities, we’ve lost whatever we had gained.",
    "As a result, we are heroes only of mediocrity.",
    "The trees’ revenge against your eyes. Or punishment for what my eyes have witnessed.",
    "The man who saw the resources for a happy life almost within reach has not been able to get rich and leave Amazonia.",
    "Man is puny, insignificant, and vulnerable in the vastness of the jungle."

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
      "highly relevant",
      "High hopes, lost triumphs, forlorn dreams. Look what has become of this poor dreamer!",
    ]
  },
  {
    find: "deal",
    reminders: [
      "action-packed plot",
      "the sensational human rights abuses",
      "highly relevant",
      "The jungle seduces them, the jungle retains them.",
      "If they try to escape, the jungle brings them back.",
      "The ultimate revenge of a natural world that they had heedlessly exploited."
    ]
  },
  {
    find: "fast",
    reminders: [
    "Rivera’s brush with the rainforest was thus limited but real",
    "He died suddenly",
    "It would instantly triumph if all natural forces cooperated to wipe us out.",
    "Behold: The vortex."
    ]
  },
  {
    find: "recommended",
    reminders: [
    "g[i]ve new meaning to the word 'florid'",
    "a conventional chapter structure",
    "preserve more of the unconventional edginess",
    "the naturalness of his dialogue",
    "dialing back the floridness of his purple patches",
    "They held their rubber tappers as virtual slaves.",
    "I have been a rubber tapper. I am still a rubber tapper. My hand ax cuts wood and can cut flesh."
    ]
  },
  {
    find: "customer",
    reminders: [
    "markedly an urban person",
    "a serial seducer",
    "'deflowerer' of girls",
    "The workers were then bound to their employer by continuing debt.",
    "Unable to leave until it was paid off, which meant more or less never.",
    "By the end, his trials and tribulations have clearly made him a better person",
    "Science cannot explain what happens to men’s minds when they wander in the jungle, but I believe I know...."
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
    "the novel’s mood, attitude, action, description, and characterization",
    "The progress offered by our Amazonian rubber barons is thus a fraud.",
    "The rubber tappers’ desolate saga of abuse and suffering.",
    "It contains sensational denunciations of conditions suffered by Colombian rubber tappers.",
    "Little is known about what plants feel, and yet the jungle, both virgin and sadist, communicates to men a presentiment of immediate, constant threat."
    ]
  },
  {
    find: "ratings",
    reminders: [
    "Nothing else will do",
    "every detail matters",
    "Try to skim it",
    "you will lose the plot",
    "I still believed in the ideal of love.",
    "How indicative of my future had been my past!",
    "I despaired to find myself so ragged, impoverished, and ill-prepared for love.",
    "My heart never makes a mistake."
    ]
  },
  {
    find: "stars",
    reminders: [
      "Don’t expect to like him at the beginning, or perhaps, ever—",
      "this is the bulk of The Vortex",
      "By the end, his trials and tribulations have clearly made him a better person",
      "Still, I rather enjoyed knowing from the outset that he is to be devoured by the jungle",
      "I regarded her with the solidarity of all those who suffer.",
      "My angel, give me your business."
    ]
  },
  {
    find: "buy now",
    reminders: [
    "gain government employment",
    "Literary pretentions proliferated",
    "All those who enter the green hell looking for black gold are ultimately damned.",
    "Cast not your eyes on my naked feet and mended clothing, señora...The path that you seek passes through the thicket of my heart!",
    "Can’t I even dream?"
    ]
  },
  {
    find: "add to cart",
    reminders: [
    "writing it into national life",
    "appropriating it for their own, urban purposes",
    "Today more than ever I feel nostalgia for the pure, ideal woman.",
    "The struggle for rubber profits became a general melee, a war of extermination.",
    "I had stepped out of the enchanted wood and found myself in the abode of Desolation."
    ]
  },
  {
    find: "save",
    reminders: [
    "lurid depictions of the 'jungle'",
    "The women, the most enslaved of all.",
    "These are our masters’ concubines.",
    "Their parents traded them for merchandise or provisions.",
    "She's a good woman. I was her downfall, so I will be her salvation."
    ]
  },
  {
    find: "limited",
    reminders: [
    "has vanished forever in the rainforest",
    "Murder became a normal way to do business.",
    "A state of mind, an unrestrained struggle for profit at any cost.",
    "The jungle devoured them."
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
// REPLACE LOGOS
// ============================================================

function replaceLogos(root) {
  const logos = root.querySelectorAll?.("#nav-logo-sprites, .nav-logo, [data-cel-widget='nav-logo'], img[src*='logo']");
  logos.forEach(logo => {
    if (logo.dataset.logoReplaced) return;
    logo.dataset.logoReplaced = "true";
    logo.style.cssText = "font-family: 'Amazon Ember', sans-serif !important; color: #26b813 !important; font-size: 1.5rem !important; font-style: strong !important; white-space: nowrap; display: inline-block; line-height: 1;";
    logo.textContent = "the amazons";
    if (logo.tagName === "IMG") {
      logo.removeAttribute("src");
      logo.alt = "The Amazon";
    }
  });
}

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

  replaceLogos(root);
  processLinks(root);
  processHeadings(root);
  fixAmazonPercentages(root);
  processTextNodes(root);
}

run(document.body);

// ============================================================
// MUTATION OBSERVER (CATCHES AMAZON LAZY-LOADED DEALS)
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
    // If Amazon adds entirely new deal boxes
    else if (mutation.type === 'childList') {
      for (const added of mutation.addedNodes) {
        if (added.nodeType === Node.ELEMENT_NODE) {
          processLinks(added);
          replaceLogos(added);
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

// FORCE RUN EVERY 1 SECOND (To guarantee we beat Amazon's React engine)
setInterval(() => {
  fixAmazonPercentages(document.body);
}, 1000);
