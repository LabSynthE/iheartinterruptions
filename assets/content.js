// ============================================================
//  CONFIGURATION: Remember Body
//
//  Replaces H1, H2, and H3 elements on any page;
//  replaces full text with a random pick from list.
//  (see xtine's list)
//
//  ** original heading from page is erased
// ============================================================

const REPLACEMENTS = [
  "Placing A Palm Over His Chest",
  "Feeling The Soft Earth Receiving My Inadequate Footware",
  "Relax And Touch The Limitless Space Of The Human Heart",
  "O I See Life Is Not Short, But Immeasurably Long.",
  "...Lead With Affirmations...Not Apologies Or Disclaimers",
  "Don't Minimize Your Concerns",
  "A Body Rises, Reaches an Apex, And Then Falls",
  "The Judge And The Victim Control Our Mind",
  "...'The Change Will Be Very Significant'...",
  "Fear Destroys Curiosity and Playfulness "
  // add things as needed using format: "x", 
];

// ============================================================
//  FLAGS
// ============================================================

// on/off
const ENABLED = true;

// which headings
const TARGET_HEADINGS = ["H1", "H2", "H3"];

// true = randomly skip headings
const SKIP_ENABLED = true;

// higher = more sparses; 0 = replace every heading
const MAX_SKIPS = 2;

// repeats?
// true = phrase used once then retired (exp ends when all retired)
// false = phrases reshuffled indefinitely
const NO_REPEATS = false;

// use styling:
// true = overrides style with block from below; use // to comment out
// false = style inherited from page
const CUSTOM_STYLE_ENABLED = true;

const CUSTOM_STYLE = `
  color: #ed08d6;
  font-style: italic;
  font-weight: 400;
  font-size: inherit;
  font-family: cursive;
  font-size: 1.25rem;
  letter-spacing: 0.03em;
`;

// ============================================================
//  State (controls in flags above, edit if comfortable)
// ============================================================

let pool = shuffle([...REPLACEMENTS]);
let skipCount = 0;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// replacement text / null if skip or exhaust
function nextReplacement() {
  if (!ENABLED) return null;

  if (SKIP_ENABLED && skipCount > 0) {
    skipCount--;
    return null;
  }

  if (pool.length === 0) {
    if (NO_REPEATS) return null;
    pool = shuffle([...REPLACEMENTS]);
  }

  const text = pool.pop();

  if (SKIP_ENABLED) {
    skipCount = Math.floor(Math.random() * (MAX_SKIPS + 1));
  }

  return text;
}

// ============================================================
//  Logic (edit if comfortable)
// ============================================================

const replaced = new WeakSet();

function replaceHeading(el) {
  if (replaced.has(el)) return;
  replaced.add(el);

  const text = nextReplacement();
  if (text === null) return; // skip or exhaust

  // clear / full swap
  while (el.firstChild) el.removeChild(el.firstChild);

  if (CUSTOM_STYLE_ENABLED) {
    const span = document.createElement("span");
    span.setAttribute("style", CUSTOM_STYLE);
    span.textContent = text;
    el.appendChild(span);
  } else {
    el.textContent = text;
  }
}

function processRoot(root) {
  const selector = TARGET_HEADINGS.join(", ");
  const headings = root.querySelectorAll
    ? root.querySelectorAll(selector)
    : [];

  // check if root = heading
  const all = (root.matches && root.matches(selector))
    ? [root, ...headings]
    : [...headings];

  for (const el of all) {
    replaceHeading(el);
  }
}

// on page load
processRoot(document.body);

// dynamic content
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        processRoot(node);
      }
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });
