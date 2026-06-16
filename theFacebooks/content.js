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


//The Facebooks, excerpts from Nathan Hill, Wellness, 2023
const REPLACEMENTS = [
  "The user appears on the network",
  "The user has inherited this particular computer...from a neighbor who has upgraded his own PC and offered not only to give this one away for free but also to set it up and tutor the user in its basic operations.",
  "The EdgeRank algorithm that first identifies and catalogs the user does not know this information",
  "At first, the only data the algorithm possesses are the answers to two prompts that are the only prompts the user responds to: Name...and Interests,",
  "He is the kind of seventy-year-old first-time computer user who will forever misunderstand the notion of a URL",
  "[he] will instead go to a search engine like Yahoo and type www.facebook.com into its search bar and then click on the top search result, believing that this is the only way to go anywhere on the internet, via an intermediary",
  "like the community rural phone lines he grew up with, where you picked up the phone and had to ask the real-life operator to please place and connect your call",
  "He has such a strong negative suspicion about the intangible and ethereal digital internet that it makes him believe his emails are no more real and lasting than a wisp of smoke that disappears in the wind",
  "He insists, despite others trying to explain to him how networks operate, that he can get to his email and Facebook account only from this one yellowing Dell computer that has found a home on his kitchen table",
  "He finds it so disconcerting to receive emailed advertising or spam",
    "...especially those ads that are addressed to him by name",
    "which often send him searching for a relevant phone number and he’ll call the company responsible for the advertising and accost the poor customer service rep on the other end of the line",
    "HOW DO YOU KNOW MY NAME?",
  "WHERE DID YOU GET MY EMAIL ADDRESS?",
  "WHO ARE YOU?",
  "He gets an error message saying “This program has performed an illegal operation",
  "he genuinely thinks that he himself has accidentally committed a crime...",
  "...after which he never returns to that website again", 
  "He is the kind of user who operates a computer intuitively, but his intuitions are all fundamentally off",
  "This is made even more difficult and confusing when the many flashing toolbars and icons slowly begin to colonize the screen",
  "...being the result of certain mouse-clicks on certain pop-up ads that declare Your computer is infected with viruses!",
  "Download this anti-viral software immediately!!! Which he always does",
  "Every time",
  "Yet the weird flashing stuff on his computer keeps on spreading",
  "Then the interface gets even more baffling",
  "...due to an unlikely series of events that no programmer or beta tester could ever possibly foresee or prevent",
  "Lawrence somehow takes a screenshot of his desktop and then accidentally and unknowingly makes that picture his desktop’s background",
  "...creates this weird doubling effect",
  "Where every chaotic icon that appears on his computer seems to have suddenly cloned itself",
  "Some of these icons remaining clickable and movable...",
  "The relatively friendly- and relaxed-looking Facebook home page is a welcome relief and respite, which is why he ends up going there quite a lot"
  // add things as needed using format: "phrase", 
];

// --- FLAGS ---

// on/off
const HS_ENABLED = true;
// which headings?
const TARGET_HEADINGS = ["H1", "H2", "H3"];
// skip random #?
const HS_SKIP_ENABLED = true;
// max skip (0-X)?
const HS_MAX_SKIPS = 2;
// shuffle+repeat?
const HS_NO_REPEATS = false;
// custom style enabled (default is keep styling)
const HS_CUSTOM_STYLE_ENABLED = true;
const HS_CUSTOM_STYLE = `
  color: #ed08d6;
  font-style: italic;
  font-weight: 400;
  font-family: cursive;
  font-size: 1.25rem;
  letter-spacing: 0.03em;
`;

// ================================================================
//  CONFIG: REPLACE WORDS
// ================================================================

const REMINDERS = [

  // a single word is replaced by a random choice within bank of options per word
  {
    find: "buy",
    reminders: [
      "buy example 1",
      "buy example 2",
      "buy example 3",
    ]
  },
  {
    find: "explore",
    reminders: [
      "explore example 1",
      "explore example 2",
      "explore example 3",
      "explore example 4",
    ]
  },
  {
    find: "deals",
    reminders: [
      "deals example 1",
      "deals example 2",
      "deals example 3",
      "deals example 4",
      "deals example 5",
    ]
  },
  // Add more using:
  // { find: "word", reminders: ["· nudge one", "· nudge two"] },
];

// --- FLAGS ---

const RW_ENABLED = true;
const RW_SKIP_ENABLED = true;
const RW_MAX_SKIPS = 3;
const RW_NO_REPEATS = true;
const RW_REMINDER_STYLE = `
  color: #ed08d6;
  font-style: italic;
  font-weight: 400;
  font-family: cursive;
`;

// ================================================================
//  INTERNAL STATE
// ================================================================

let hsPool = shuffle([...REPLACEMENTS]);
let hsSkipCount = 0;
const hsReplaced = new WeakSet();

const wrWordState = new Map();
const wrProcessed = new WeakSet();

// corrects lockup:
// isProcessing: blocks the observer from firing while mid-update.
// + wraps initial run.
let isProcessing = false;
// nodes collected for debounce
let pendingNodes = [];
let debounceTimer = null;

const RW_SKIP_TAGS = new Set([
  "SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT",
  "SELECT", "BUTTON", "CODE", "PRE", "HEAD", "META", "TITLE"
]);

// Precompile regexes at start
const COMPILED_REMINDERS = REMINDERS.map(entry => ({
  ...entry,
  regex: new RegExp(`(${entry.find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
}));

// ============================================================
//  FUNCTIONS: REPLACE HEADING
// ============================================================

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function hsNextReplacement() {
  if (!HS_ENABLED) return null;
  if (HS_SKIP_ENABLED && hsSkipCount > 0) { hsSkipCount--; return null; }
  if (hsPool.length === 0) {
    if (HS_NO_REPEATS) return null;
    hsPool = shuffle([...REPLACEMENTS]);
  }
  const text = hsPool.pop();
  if (HS_SKIP_ENABLED) hsSkipCount = Math.floor(Math.random() * (HS_MAX_SKIPS + 1));
  return text;
}

function replaceHeading(el) {
  if (hsReplaced.has(el)) return;
  hsReplaced.add(el);
  const text = hsNextReplacement();
  if (text === null) return;
  while (el.firstChild) el.removeChild(el.firstChild);
  if (HS_CUSTOM_STYLE_ENABLED) {
    const span = document.createElement("span");
    span.setAttribute("style", HS_CUSTOM_STYLE);
    span.dataset.hsReplaced = "true";
    span.textContent = text;
    el.appendChild(span);
  } else {
    el.textContent = text;
  }
}

function processHeadings(root) {
  if (!HS_ENABLED) return;
  const selector = TARGET_HEADINGS.join(", ");
  const found = root.querySelectorAll ? root.querySelectorAll(selector) : [];
  const all = (root.matches && root.matches(selector)) ? [root, ...found] : [...found];
  for (const el of all) replaceHeading(el);
}

// ================================================================
//  FUNCTIONS: WORD REMINDER
// ================================================================

function wrGetState(entry) {
  if (!wrWordState.has(entry.find)) {
    wrWordState.set(entry.find, {
      pool: shuffle([...entry.reminders]),
      skipCount: 0,
    });
  }
  return wrWordState.get(entry.find);
}

function wrNextReminder(entry) {
  const state = wrGetState(entry);
  if (RW_SKIP_ENABLED && state.skipCount > 0) { state.skipCount--; return null; }
  if (state.pool.length === 0) {
    if (RW_NO_REPEATS) return null;
    state.pool = shuffle([...entry.reminders]);
  }
  const reminder = state.pool.pop();
  if (RW_SKIP_ENABLED) state.skipCount = Math.floor(Math.random() * (RW_MAX_SKIPS + 1));
  return reminder;
}

function processTextNode(textNode) {
  if (!RW_ENABLED) return;
  if (wrProcessed.has(textNode)) return;
  wrProcessed.add(textNode);

  const parent = textNode.parentNode;
  if (!parent) return;
  if (RW_SKIP_TAGS.has(parent.tagName)) return;
  if (parent.dataset?.hsReplaced || parent.dataset?.wrReminder) return;

  // Don't touch text inside heading elements (heading swapper owns those)
  const headingSelector = TARGET_HEADINGS.join(",");
  if (parent.closest && parent.closest(headingSelector)) return;

  let remaining = textNode.nodeValue;
  let matched = false;
  const fragment = document.createDocumentFragment();

  while (remaining.length > 0) {
    let earliest = null;
    let earliestEntry = null;

    for (const entry of COMPILED_REMINDERS) {
      entry.regex.lastIndex = 0;
      const match = entry.regex.exec(remaining);
      if (match && (earliest === null || match.index < earliest.index)) {
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
      fragment.appendChild(document.createTextNode(remaining.slice(0, earliest.index)));
    }

    // Replace original word from bank (or keep original if skipping/exhausted)
    const reminder = wrNextReminder(earliestEntry);
    if (reminder) {
      const span = document.createElement("span");
      span.setAttribute("style", RW_REMINDER_STYLE);
      span.dataset.wrReminder = "true";  // marks span to prevent re-processing
      span.textContent = reminder;
      fragment.appendChild(span);
    } else {
      // skip instance
      fragment.appendChild(document.createTextNode(earliest[0]));
    }

    remaining = remaining.slice(earliest.index + earliest[0].length);
  }

  if (matched) parent.replaceChild(fragment, textNode);
}

function processTextNodes(root) {
  if (!RW_ENABLED) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (RW_SKIP_TAGS.has(node.parentNode?.tagName)) return NodeFilter.FILTER_REJECT;
      if (node.parentNode?.dataset?.wrReminder) return NodeFilter.FILTER_REJECT;
      if (node.parentNode?.dataset?.hsReplaced) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) nodes.push(node);
  nodes.forEach(processTextNode);
}

// ================================================================
//  RUN TOGETHER
// ================================================================

function processAll(root) {
  processHeadings(root);
  processTextNodes(root);
}

// deal with loop via isProcessing guard + observer debounce
// (batch changes). Deal with lag next iteration.
isProcessing = true;
try {
  processAll(document.body);
} finally {
  isProcessing = false;
}

function flushPending() {
  if (pendingNodes.length === 0) return;
  const toProcess = pendingNodes.splice(0);
  isProcessing = true;
  try {
    for (const node of toProcess) {
      if (node.nodeType === Node.ELEMENT_NODE) processAll(node);
      else if (node.nodeType === Node.TEXT_NODE) processTextNode(node);
    }
  } finally {
    isProcessing = false;
  }
}

const observer = new MutationObserver((mutations) => {
  if (isProcessing) return;
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      pendingNodes.push(node);
    }
  }
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(flushPending, 100);
});

observer.observe(document.body, { childList: true, subtree: true });
