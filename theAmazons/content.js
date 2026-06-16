// ============================================================
//  
//  iHeartInterruptions v2
//  
//  In sequence:
//  1) Replaces H1, H2, and H3 elements on any page;
//     replaces full text with a random pick from list.
//  2) Locates & appends reminders after individual words
//  
//  UPDATES:
//  
//  05.26.2026  fix mutation loop lockup (ks)
//  05.26.2026  combine header replacement + individual word replacement (ks)
//  05.26.2026  add replacements text (xb)
//  
//  To do:
//  - fix lag on node overload
// ============================================================


// ================================================================
//  CONFIG: REPLACE HEADINGS
// ================================================================

const HEADING_PHRASES = [
  "Placing a Palm Over His Chest",
  "Feeling the Soft Earth Receiving My Inadequate Footwear",
  "Relax and Touch the Limitless Space of the Human Heart",
  "O I see life is not short, but immeasurably long.",
  "Lead with Affirmations, Not Apologies or Disclaimers",
  "Don’t Minimize Your Concerns",
  "A Body Rises, Reaches an Apex, and then Falls",
  "The Judge and the Victim Control Our Mind",
  "The Change Will be Very Significant",
  "Fear Destroys Curiosity and Playfulness"
];

const WORD_REMINDERS = [
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
      "· Don’t Minimize Your Concerns",
      "· Relax and Touch the Limitless Space of the Human Heart",
      "· Fear Destroys Curiosity and Playfulness"
    ]
  },
  {
    find: "stress",
    reminders: [
      "· Placing a Palm Over His Chest",
      "· Relax and Touch the Limitless Space of the Human Heart",
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

// Pre-compile regular expressions once to avoid massive CPU spikes
const COMPILED_REMINDERS = WORD_REMINDERS.map(entry => {
  const escaped = entry.find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return {
    ...entry,
    regex: new RegExp(`(${escaped})`, "gi")
  };
});

// ============================================================
//  Flags
// ============================================================

// true = stop inserting reminders when all options shown
// false = reminders get reshuffled and reused
const NO_REPEATS = false; 

// true = random skips # word before responding. (stops overcrowding)
const SKIP_ENABLED = true;

// Higher = more lower incidence. 0 = respond every time
const MAX_SKIPS = 3;

// ============================================================
//  Styles
// ============================================================

const REMINDER_STYLE = `
  color: #9e9e9e;
  font-style: italic;
  font-size: 0.9em;
  margin-left: 5px;
  font-weight: normal;
  font-family: inherit;
  letter-spacing: 0.01em;
`;

// Poetic takeover styles for headings
const HEADING_STYLE = `
  font-family: Georgia, serif !important;
  font-style: italic !important;
  font-weight: normal !important;
  letter-spacing: 0.02em !important;
  text-transform: none !important;
  color: inherit;
`;

// ============================================================
//  State & Shuffling Utilities
// ============================================================

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Global heading state
let headingPool = shuffle([...HEADING_PHRASES]);

function getNextHeadingPhrase() {
  if (headingPool.length === 0) {
    if (NO_REPEATS) return null; // Stop replacing headings if no repeats allowed
    headingPool = shuffle([...HEADING_PHRASES]);
  }
  return headingPool.pop();
}

// Track state per word
const wordState = new Map();

function getWordState(entry) {
  if (!wordState.has(entry.find)) {
    wordState.set(entry.find, {
      pool: shuffle([...entry.reminders]),
      skipCount: 0,
    });
  }
  return wordState.get(entry.find);
}

// return next reminder for entry, null if skipping or out.
function nextReminder(entry) {
  const state = getWordState(entry);

  // skipping
  if (SKIP_ENABLED && state.skipCount > 0) {
    state.skipCount--;
    return null;
  }

  // pool out
  if (state.pool.length === 0) {
    if (NO_REPEATS) return null; // stop responding
    state.pool = shuffle([...entry.reminders]); // refill & reshuffle
  }

  const reminder = state.pool.pop();

  // set a new random skip count for round
  if (SKIP_ENABLED) {
    state.skipCount = Math.floor(Math.random() * (MAX_SKIPS + 1));
  }

  return reminder;
}

// ============================================================
//  Pass 1: Heading Processing
// ============================================================

// Helper to create styled replacement text without destroying the wrapper
function makeStyledSpan(text) {
  const span = document.createElement("span");
  span.className = "body-heading-replacement";
  span.setAttribute("style", HEADING_STYLE);
  span.textContent = text;
  return span;
}

function processHeadings(rootNode) {
  // If the root node itself is a heading, process it directly, otherwise query inside it.
  const headings = [];
  if (rootNode.nodeType === Node.ELEMENT_NODE) {
    if (["H1", "H2", "H3"].includes(rootNode.tagName.toUpperCase())) {
      headings.push(rootNode);
    }
    const found = rootNode.querySelectorAll("h1, h2, h3");
    headings.push(...Array.from(found));
  }

  for (const heading of headings) {
    // Avoid re-processing
    if (heading.dataset.headingProcessed) continue;
    heading.dataset.headingProcessed = "true";

    const phrase = getNextHeadingPhrase();
    if (!phrase) continue; 

    // Determine the exact element where we will place the new text.
    const innerLink = heading.querySelector("a");
    const outerLink = heading.closest("a");

    let targetEl;

    if (innerLink) {
      // CASE 1: Heading contains an inner link (e.g., <h2><a href="...">Deals</a></h2>)
      // We target the inner anchor so we preserve the link.
      targetEl = innerLink;
    } else {
      // CASE 2: Heading is inside an outer link (e.g., <a href="..."><h2>Deals</h2></a>)
      // CASE 3: Heading has no link (e.g., <h2>Deals</h2>)
      // For both cases, we target the heading itself. 
      // If there is an outer link, it wraps the heading and won't be harmed.
      targetEl = heading;
    }

    // Safely remove the child nodes of the target (text nodes, images, etc.)
    // without destroying the actual anchor tag or heading element itself.
    while (targetEl.firstChild) {
      targetEl.removeChild(targetEl.firstChild);
    }

    // Append the newly styled poetic phrase safely
    targetEl.appendChild(makeStyledSpan(phrase));
  }
}

// ============================================================
//  Pass 2: Word Processing
// ============================================================

// Include H1, H2, H3 in skip tags so we don't double-process the poetic replacements!
const SKIP_TAGS = new Set([
  "SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT",
  "SELECT", "BUTTON", "CODE", "PRE", "HEAD", "META", "TITLE",
  "H1", "H2", "H3"
]);

const processed = new WeakSet();

function processTextNode(textNode) {
  if (processed.has(textNode)) return;

  const parent = textNode.parentNode;
  
  // Ensure tagName handles SVG/XML node cases gracefully using toUpperCase()
  if (!parent || SKIP_TAGS.has(parent.tagName?.toUpperCase())) return;
  if (parent.dataset && parent.dataset.bodyReminder) return;

  let remaining = textNode.nodeValue;
  if (!remaining) return; // Safeguard against null/empty nodes

  let matched = false;
  const fragment = document.createDocumentFragment();

  while (remaining.length > 0) {
    let earliest = null;
    let earliestEntry = null;

    for (const entry of COMPILED_REMINDERS) {
      entry.regex.lastIndex = 0; // reset regex state
      const match = entry.regex.exec(remaining);
      if (match && (earliest === null || match.index < earliest.index)) {
        earliest = match;
        earliestEntry = entry;
      }
    }

    if (!earliest) {
      // Mark the leftover text node as processed
      const leftoverNode = document.createTextNode(remaining);
      processed.add(leftoverNode);
      fragment.appendChild(leftoverNode);
      break;
    }

    matched = true;

    // text before the match
    if (earliest.index > 0) {
      const beforeNode = document.createTextNode(remaining.slice(0, earliest.index));
      processed.add(beforeNode);
      fragment.appendChild(beforeNode);
    }

    // matched word (always kept)
    const matchNode = document.createTextNode(earliest[0]);
    processed.add(matchNode);
    fragment.appendChild(matchNode);

    // get a reminder (null if skipping or done)
    const reminder = nextReminder(earliestEntry);
    if (reminder) {
      const span = document.createElement("span");
      span.setAttribute("style", REMINDER_STYLE);
      span.dataset.bodyReminder = "true";
      span.textContent = reminder;
      fragment.appendChild(span);
    }

    remaining = remaining.slice(earliest.index + earliest[0].length);
  }

  if (matched) {
    processed.add(textNode);
    parent.replaceChild(fragment, textNode);
  } else {
    processed.add(textNode);
  }
}

function walkAndProcessWords(root) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (SKIP_TAGS.has(node.parentNode?.tagName?.toUpperCase())) return NodeFilter.FILTER_REJECT;
        if (node.parentNode?.dataset?.bodyReminder) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const nodes = [];
  let node;
  while ((node = walker.nextNode())) nodes.push(node);
  nodes.forEach(processTextNode);
}

// ============================================================
//  Execution & Dynamic Handling
// ============================================================

// Catch dynamic / lazy-loaded content
const observer = new MutationObserver((mutations) => {
  // Disconnect observer during processing to guarantee we don't trigger 
  // infinite loops via our own DOM node changes.
  observer.disconnect();

  for (const mutation of mutations) {
    for (const added of mutation.addedNodes) {
      if (added.nodeType === Node.ELEMENT_NODE) {
        // Run headings on element first, then words
        processHeadings(added);
        walkAndProcessWords(added);
      } else if (added.nodeType === Node.TEXT_NODE) {
        processTextNode(added);
      }
    }
  }

  // Reconnect observer after all updates are finished.
  observer.observe(document.body, { childList: true, subtree: true });
});

// Run on page-load
processHeadings(document.body);
walkAndProcessWords(document.body);
observer.observe(document.body, { childList: true, subtree: true });