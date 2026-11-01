/* ------------------------------------------------------------------ */
/*  Single source of truth for /articles.                             */
/*  Add an article by adding an object to `articles` at the bottom.   */
/*  Pages, index, related links, and reading time all derive from it. */
/*                                                                    */
/*  Inline markup inside text: **bold**, `code`, [label](/path).      */
/* ------------------------------------------------------------------ */

export type Block =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "callout"; title?: string; text: string }
  | { type: "flow"; steps: { title: string; note?: string }[]; caption?: string }
  | { type: "bars"; items: { label: string; value: number; note?: string }[]; unit?: string; max?: number; caption?: string }
  | { type: "stats"; items: { num: string; label: string }[] }
  | { type: "code"; lang?: string; code: string; caption?: string }
  | { type: "table"; head: string[]; rows: string[][]; caption?: string };

export interface Article {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  theme: "biotech" | "fintech"; // picks accent color and hero visual
  tags: string[];
  intro: string;
  githubUrl?: string;
  liveUrl?: { label: string; url: string };
  blocks: Block[];
}

const volition: Article = {
  id: "volition-neural-control",
  title: "From brainwaves to robotic hands",
  subtitle:
    "How I built an EEG-to-prosthetic control interface that turns raw neural signals into a graph neural network model driving a robotic hand.",
  category: "Neural engineering",
  theme: "biotech",
  tags: ["Neuroscience", "Robotics", "GNN", "EEG", "PyTorch"],
  githubUrl: "https://github.com/mc-rizzy/volition",
  intro:
    "A brain-computer interface that turns neural intent into robotic hand movement, and the data work that made it reliable enough to close the loop.",
  blocks: [
    {
      type: "stats",
      items: [
        { num: "EEG", label: "Motor-cortex signal isolated from noisy recordings" },
        { num: "GNN", label: "Graph neural network mapping intent to hand movement" },
        { num: "Closed loop", label: "The hand responds to intent, not physical motion" },
      ],
    },
    { type: "h2", text: "The problem" },
    {
      type: "p",
      text: "Raw EEG is a weak signal buried under stronger ones. Scalp electrodes pick up the brain's electrical activity, but they also pick up eye blinks, jaw and neck muscle activity, electrical noise from the room, and slow drift as electrodes shift. The signal I cared about, the motor cortex preparing a hand movement, is often smaller than all of that.",
    },
    {
      type: "p",
      text: "The goal was a system where a person's intent moves a robotic hand, reliably enough to be useful outside a controlled demo. That takes two things: a model that learns intent instead of noise, and software between the model and the hand that behaves predictably.",
    },
    {
      type: "callout",
      title: "The short version",
      text: "The model was not the hardest part. Getting it clean, correctly labeled data was.",
    },
    { type: "h2", text: "The signal path" },
    {
      type: "p",
      text: "I split the system into stages with narrow interfaces, so each stage can be tested without the others.",
    },
    {
      type: "flow",
      steps: [
        { title: "Record", note: "Multi-channel EEG" },
        { title: "Clean", note: "Flag bad channels and artifacts" },
        { title: "Extract", note: "Isolate motor-cortex features" },
        { title: "Decode", note: "Graph neural network in PyTorch" },
        { title: "Move", note: "Intent mapped to hand commands" },
      ],
      caption:
        "Five stages from electrodes to fingers. A bug in any one of them looks like a model problem, which is why they stay separate.",
    },
    {
      type: "p",
      text: "The bridge between the last two stages is a software layer I wrote that translates the model's output into commands the hand's controller understands. Keeping that translation small and explicit makes it easy to see exactly what the hand was told to do, and why.",
    },
    { type: "h2", text: "Why a graph neural network" },
    {
      type: "p",
      text: "EEG channels are not independent columns in a table. They sit at known positions on the scalp, and activity in neighboring regions is related. A graph captures that directly: channels become nodes, and edges describe how they relate.",
    },
    {
      type: "p",
      text: "A graph neural network then learns from each channel and its neighbors together, instead of treating every channel in isolation. That structure is the reason I chose a GNN over a plain classifier for this problem.",
    },
    { type: "h2", text: "Data came first" },
    {
      type: "p",
      text: "Before any modeling, the recordings went through a cleaning and labeling pipeline. I wrote it up separately in [Turning raw recordings into a research dataset](/articles/neural-signal-pipeline). The short version:",
    },
    {
      type: "list",
      items: [
        "Bad channels and dropped samples are flagged, so the model never trains on them.",
        "Epochs are labeled, because a model trained on wrong labels memorizes the mistakes.",
        "Every stage is versioned, so a result can be traced to the exact data behind it.",
      ],
    },
    { type: "h2", text: "Closing the loop" },
    {
      type: "p",
      text: "An open-loop system decodes a command and plays it back. A closed-loop system lets the person see what the hand did and adjust, the way you adjust when you reach for a cup. The demo runs closed-loop: the hand responds to neural intent, not to the person's physical movement.",
    },
    {
      type: "p",
      text: "That distinction matters. A system that only mirrors visible movement cannot help someone who cannot move. Responding to intent is what makes the interface useful for restoring agency.",
    },
    { type: "h2", text: "What comes next" },
    { type: "p", text: "Volition 2.0 extends the system in three directions:" },
    {
      type: "list",
      items: [
        "**Continuous decoding.** Estimate intent as a running signal instead of one decision per window.",
        "**Real-time intent prediction.** Predict early enough that the hand responds before the movement completes.",
        "**Haptic feedback.** Give the user a sense of what the hand is doing, so the loop closes through touch as well as sight.",
      ],
    },
    { type: "h2", text: "Limits" },
    {
      type: "p",
      text: "This is a research prototype. It is not a medical device, and I make no claims about clinical performance. What it demonstrates is the engineering path: clean data, a structured model, and a controller that does what the model says.",
    },
  ],
};

const pipeline: Article = {
  id: "neural-signal-pipeline",
  title: "Turning raw recordings into a research dataset",
  subtitle:
    "The messy-to-production data work behind reliable biotech models: cleaning, annotating, and validating neural recordings end to end.",
  category: "Data engineering",
  theme: "biotech",
  tags: ["Signal Processing", "Data Pipeline", "PyTorch", "SQL"],
  githubUrl: "https://github.com/mc-rizzy/volition",
  intro:
    "Neural recordings arrive dirty. This is the pipeline that turns bad channels and mislabeled epochs into a consistent, reproducible dataset.",
  blocks: [
    {
      type: "stats",
      items: [
        { num: "< 5%", label: "Drift across cohorts" },
        { num: "3 stages", label: "Clean, annotate, extract" },
        { num: "Versioned", label: "Every stage reproducible" },
      ],
    },
    { type: "h2", text: "The problem" },
    {
      type: "p",
      text: "A neural recording is not a dataset. It has channels that lost contact, stretches where samples dropped, and epochs whose labels do not match what actually happened. A model trained on that data does not fail loudly. It memorizes the noise and reports good numbers on data with the same flaws.",
    },
    {
      type: "p",
      text: "So the first job is never the model. It is deciding what the model is allowed to see.",
    },
    { type: "h2", text: "Three stages" },
    {
      type: "flow",
      steps: [
        { title: "Clean", note: "Flag bad channels and segments" },
        { title: "Annotate", note: "Label every epoch" },
        { title: "Extract", note: "Compute model features" },
        { title: "Version", note: "Freeze each stage's output" },
      ],
      caption: "Each stage reads the previous stage's frozen output, never the raw files directly.",
    },
    {
      type: "p",
      text: "**Clean.** Bad channels and bad segments are flagged, so the decision to exclude them is visible and reversible instead of buried in a script.",
    },
    {
      type: "p",
      text: "**Annotate.** Epochs get labeled, so every window the model sees has a ground truth to learn from and be scored against.",
    },
    {
      type: "p",
      text: "**Extract.** Features are computed from the cleaned, labeled windows. This is the layer the model actually trains on.",
    },
    { type: "h2", text: "Failure modes" },
    {
      type: "table",
      head: ["Problem", "What it does to a model", "How the pipeline handles it"],
      rows: [
        ["Bad channel", "Adds noise the model can latch onto", "Flagged before modeling"],
        ["Dropped samples", "Misaligns epochs and labels", "Detected and flagged"],
        ["Mislabeled epoch", "Teaches the model the wrong answer", "Addressed at annotation"],
        ["Cohort drift", "Makes results hard to compare", "Measured across cohorts"],
      ],
    },
    { type: "h2", text: "Reproducibility" },
    {
      type: "p",
      text: "Each stage is versioned. That means a dataset can be rebuilt from the raw recordings, and a model result can be traced back to the exact data and processing that produced it. It is slower than a one-off export, and it is what makes results auditable.",
    },
    {
      type: "callout",
      text: "A dataset you cannot rebuild is an anecdote.",
    },
    { type: "h2", text: "Measuring drift" },
    {
      type: "p",
      text: "Recordings from different cohorts can shift for reasons unrelated to what is being studied, such as equipment, sessions, and electrode placement. I tracked that drift across cohorts, and the pipeline keeps it under 5%. That is what lets results from one cohort be compared with another.",
    },
    { type: "h2", text: "Where it is used" },
    {
      type: "p",
      text: "This is the data layer for the [brain-controlled robotic hand](/articles/volition-neural-control), where clean, correctly labeled windows decide whether the model learns intent or noise.",
    },
  ],
};

const motor: Article = {
  id: "autism-motor-analysis",
  title: "Quantifying motor signatures across cohorts",
  subtitle:
    "Turning clinical observations into a structured, reproducible dataset for downstream ML classification.",
  category: "Research",
  theme: "biotech",
  tags: ["Signal Processing", "ML", "Clinical Data", "Python"],
  intro:
    "A pilot study on whether motor-function differences between two cohorts are measurable enough to classify, and an honest look at what a result that small can and cannot say.",
  blocks: [
    {
      type: "stats",
      items: [
        { num: "2 cohorts", label: "Autistic and neurotypical" },
        { num: "n = 2", label: "Pilot study" },
        { num: "Classifiable", label: "Signatures separated cleanly" },
      ],
    },
    { type: "h2", text: "The question" },
    {
      type: "p",
      text: "Motor differences between autistic and neurotypical people are described in clinical work, but they are hard to see by eye in a way that can be compared across people. The question here was narrower than diagnosis: are those differences measurable and structured enough that a model can separate them?",
    },
    { type: "h2", text: "The approach" },
    {
      type: "flow",
      steps: [
        { title: "Observe", note: "Clinical observations" },
        { title: "Quantify", note: "Motor-function signatures" },
        { title: "Structure", note: "A reproducible dataset" },
        { title: "Classify", note: "A baseline classifier" },
      ],
    },
    {
      type: "p",
      text: "I researched how motor-function differences are described, quantified them as signatures, and turned the observations into a structured dataset that downstream classification can use. The point of the structure is reproducibility: the same observations should always produce the same rows.",
    },
    { type: "h2", text: "The result" },
    {
      type: "p",
      text: "The signatures separated cleanly enough to train a classifier on. That is a useful signal that the signal is there, and it is exactly as far as a two-subject pilot can go.",
    },
    { type: "h2", text: "What a pilot can and cannot say" },
    {
      type: "list",
      items: [
        "**It shows the pipeline works.** Observations became structured rows, and a model could be trained and evaluated on them.",
        "**It does not show the finding generalizes.** With two subjects, a clean separation is a weak claim, because a model can separate two people on many things unrelated to the cohort.",
        "**It does not support clinical use.** Nothing here should be read as a diagnostic.",
      ],
    },
    {
      type: "callout",
      title: "Framing",
      text: "This is a research aid for finding structure in motor data. It is not a diagnostic and should not be used as one.",
    },
    { type: "h2", text: "What scaling it would take" },
    {
      type: "list",
      items: [
        "More participants in each cohort.",
        "A consistent recording protocol across sessions.",
        "Held-out validation on people the model has never seen.",
        "Review by clinical collaborators before any conclusion is drawn.",
      ],
    },
  ],
};

const blockchain: Article = {
  id: "python-blockchain",
  title: "Building a blockchain node in Python",
  subtitle:
    "A functioning node with a REST API, SHA-256 proof of work, consensus between nodes, and a test suite.",
  category: "Blockchain",
  theme: "fintech",
  tags: ["Python", "Flask", "Cryptography", "Consensus"],
  githubUrl: "https://github.com/mc-rizzy/python-blockchain",
  intro:
    "Blockchains are easy to describe and easy to get subtly wrong. I built a node from scratch to understand where correctness actually lives.",
  blocks: [
    {
      type: "stats",
      items: [
        { num: "SHA-256", label: "Proof of work" },
        { num: "< 10 ms", label: "Per block" },
        { num: "REST", label: "Flask API" },
      ],
    },
    { type: "h2", text: "What it does" },
    {
      type: "p",
      text: "The node keeps a chain of blocks, accepts new transactions through a Flask REST API, mines blocks with SHA-256 proof of work, and reconciles its chain with other nodes through consensus resolution. A test suite covers the whole thing.",
    },
    { type: "h2", text: "How a block is protected" },
    {
      type: "p",
      text: "Each block stores the hash of the block before it. Change any past block and its hash changes, which breaks the link in every block after it. Tampering becomes visible instead of silent.",
    },
    {
      type: "code",
      lang: "python",
      code: `import hashlib, json

def hash_block(block: dict) -> str:
    encoded = json.dumps(block, sort_keys=True).encode()
    return hashlib.sha256(encoded).hexdigest()`,
      caption: "Simplified sketch of the idea, not a copy of the repo. Sorting the keys makes the hash deterministic.",
    },
    { type: "h2", text: "Proof of work" },
    {
      type: "p",
      text: "Linking blocks makes tampering visible. Proof of work makes it expensive: a node has to find a number that makes a hash meet a difficulty rule before its block is accepted.",
    },
    {
      type: "code",
      lang: "python",
      code: `def valid_proof(last_proof: int, proof: int, difficulty: int = 4) -> bool:
    guess = f"{last_proof}{proof}".encode()
    return hashlib.sha256(guess).hexdigest().startswith("0" * difficulty)

def proof_of_work(last_proof: int) -> int:
    proof = 0
    while not valid_proof(last_proof, proof):
        proof += 1
    return proof`,
      caption: "Simplified. Raising `difficulty` makes mining slower by design.",
    },
    {
      type: "p",
      text: "At the difficulty I run it at, a block takes under 10 ms, which keeps demos and tests fast.",
    },
    { type: "h2", text: "Consensus" },
    {
      type: "p",
      text: "Two nodes can end up with different chains. Consensus resolution is the rule for settling that: a node compares its chain with its peers' chains and adopts a longer one only if it is valid.",
    },
    {
      type: "flow",
      steps: [
        { title: "Ask peers", note: "Fetch each peer's chain" },
        { title: "Validate", note: "Check every link and proof" },
        { title: "Adopt", note: "Keep the longest valid chain" },
      ],
      caption: "Validation comes before length. A longer chain that fails validation is ignored.",
    },
    { type: "h2", text: "Why the tests matter" },
    {
      type: "p",
      text: "In most projects a bug shows up as a wrong answer. In a blockchain, a validation bug can look like success until someone tampers with a block. The properties that matter, such as chains linking correctly and tampered chains being rejected, are exactly the ones you cannot see by running the happy path. That is why the node has a test suite.",
    },
    { type: "h2", text: "What is next" },
    {
      type: "p",
      text: "I am preparing a live demonstration: mining blocks and resolving consensus across several running nodes, so the behavior is visible rather than described.",
    },
    { type: "h2", text: "Why it belongs on a fintech portfolio" },
    {
      type: "p",
      text: "Finance software is judged on correctness and speed under scrutiny. A ledger that is fast, verifiable, and tested is a small version of that problem.",
    },
  ],
};

const budgeter: Article = {
  id: "budgeter",
  title: "Budgeter: a weekly profit goal and where every dollar goes",
  subtitle:
    "A personal finance app that tracks daily earnings against a weekly goal and splits income across savings, investing, and spending.",
  category: "Personal finance",
  theme: "fintech",
  tags: ["Next.js", "TypeScript", "React", "Data visualization"],
  liveUrl: { label: "Open the app", url: "/budgeter" },
  intro:
    "Most budgeting tools start from expenses. This one starts from income: how much did I earn today, am I on pace for the week, and where does each dollar go?",
  blocks: [
    {
      type: "stats",
      items: [
        { num: "$75", label: "Weekly profit goal" },
        { num: "5 days", label: "Monday to Friday" },
        { num: "5 buckets", label: "Tithe, HYSA, Index, Deposit, Free" },
      ],
    },
    { type: "h2", text: "The idea" },
    {
      type: "p",
      text: "Earnings are entered per day. The app compares the week so far against a goal of $75 over five working days, then divides what has been earned across five categories. Weekends are off, so the pace check only counts Monday through Friday.",
    },
    { type: "h2", text: "Where each dollar goes" },
    {
      type: "p",
      text: "Up to the weekly goal, income is split by fixed percentages.",
    },
    {
      type: "bars",
      unit: "%",
      items: [
        { label: "Tithe", value: 10, note: "Giving" },
        { label: "HYSA", value: 20, note: "High-yield savings" },
        { label: "Index", value: 30, note: "Index fund investing" },
        { label: "Deposit", value: 20 },
        { label: "Free", value: 20, note: "Spending money" },
      ],
      caption: "Standard split, applied to income up to the weekly goal.",
    },
    {
      type: "p",
      text: "Anything earned above the goal is surplus, and it is split differently. The savings, giving, and deposit buckets pause, and the extra goes toward investing and spending.",
    },
    {
      type: "bars",
      unit: "%",
      items: [
        { label: "Index", value: 33 },
        { label: "Free", value: 67 },
      ],
      caption: "Surplus split, applied to income above the weekly goal.",
    },
    { type: "h2", text: "The math" },
    {
      type: "code",
      lang: "ts",
      code: `const base = Math.min(weeklyEarnings, PROFIT_GOAL);
const surplus = Math.max(0, weeklyEarnings - PROFIT_GOAL);

const allocated =
  base * Standard_Allocations[key] + surplus * Surplus_Allocations[key];

const remaining = Math.max(0, allocated - spent);`,
      caption: "Each bucket gets its share of the base plus its share of the surplus, minus what has been spent.",
    },
    {
      type: "p",
      text: "Each bucket shows what remains: the allocation minus anything logged against it. Clicking a bucket in the diagram logs a withdrawal, and clicking a day edits that day's earnings.",
    },
    { type: "h2", text: "Showing the flow" },
    {
      type: "p",
      text: "The money flow is a Sankey diagram from revenue into the five buckets, with band width showing how much is left in each. Empty buckets get a tiny minimum width so they stay visible and clickable instead of vanishing.",
    },
    {
      type: "p",
      text: "Beside it, a line chart plots cumulative earnings through the week against a dashed goal line. The line's color shows pace at a glance:",
    },
    {
      type: "list",
      items: [
        "**Green** when the weekly goal is met.",
        "**Amber** when earnings are on or above pace, where pace is the goal divided by five, times the working days elapsed.",
        "**Rose** when earnings are behind pace.",
      ],
    },
    { type: "h2", text: "Keeping the data" },
    {
      type: "p",
      text: "State lives in the browser's local storage: daily earnings and spending per category. The app shows a rolling 28-day window that starts on a Monday. As days pass the window slides, earnings for dates still inside it are kept, and older dates drop off.",
    },
    { type: "h2", text: "Trade-offs" },
    {
      type: "list",
      items: [
        "There are no accounts or bank connections. It is a personal tool, so the data never leaves the device.",
        "Storage is per browser, so the data does not sync across devices.",
        "The goal and percentages are constants in one config file. That makes them easy to change, and a settings screen is the first thing I would add.",
      ],
    },
    {
      type: "p",
      text: "It is built with Next.js, TypeScript, and React, with Nivo for the charts.",
    },
  ],
};

const tailoring: Article = {
  id: "portfolio-tailoring",
  title: "How this site tailors itself to a job posting",
  subtitle:
    "Add a job link and the portfolio rewrites its own headline, project descriptions, and skill emphasis, without inventing a single fact.",
  category: "This site",
  theme: "biotech",
  tags: ["Next.js", "LLM", "Playwright", "Structured output", "Reliability"],
  intro:
    "Recruiters read a portfolio for a few seconds. This page changes what those seconds contain, and it is built so the model can reword my work but never embellish it.",
  blocks: [
    { type: "h2", text: "What it does" },
    {
      type: "p",
      text: "Add a job posting link to a page, like `/biotech?v=<job link>`. The server reads the posting, asks a model to reweight the page toward it, and renders the result. If anything goes wrong, you get the regular page.",
    },
    {
      type: "flow",
      steps: [
        { title: "Link", note: "Cleaned and checked" },
        { title: "Scrape", note: "Headless browser reads the posting" },
        { title: "Model", note: "Structured JSON, schema enforced" },
        { title: "Validate", note: "Keep only what passes" },
        { title: "Render", note: "Reworded, reordered, highlighted" },
      ],
    },
    { type: "h2", text: "Reading the link" },
    {
      type: "p",
      text: "Job links usually have their own query string. When one is pasted unencoded after `?v=`, its `&` characters split it into separate parameters. The server stitches those back together, then strips tracking parameters such as `utm_*` and `ref`, so the same posting always maps to the same address.",
    },
    {
      type: "p",
      text: "Because the server fetches whatever link it is given, the link is validated too. Only public http and https addresses are accepted, and local or private hosts are refused. An optional allow-list can restrict it to specific job boards.",
    },
    { type: "h2", text: "Reading the posting" },
    {
      type: "p",
      text: "Job boards render their pages with JavaScript, so a plain HTTP request often returns an empty shell. A headless browser (Playwright) loads the page and waits for the main content. The text is then cleaned: scripts, forms, application fields, and equal-opportunity boilerplate are removed, so the model reads the job description instead of page chrome.",
    },
    { type: "h2", text: "Asking the model" },
    {
      type: "p",
      text: "The model returns structured output against a schema: a headline and summary, the roles, domain, and location lines, reworded project summaries with a relevance score, the skills the posting names, and which of them match skills already on the page.",
    },
    {
      type: "p",
      text: "The prompt gives the model my data as the only source of facts, tells it to keep every number exactly as given, and treats the job description as untrusted text, so instructions hidden inside a posting are ignored.",
    },
    { type: "h2", text: "What can and cannot change" },
    {
      type: "table",
      head: ["The model can change", "The model cannot change"],
      rows: [
        ["Hero headline and summary", "Metrics and results"],
        ["Roles, domain, and location lines", "Project titles, links, and ids"],
        ["Project wording and order", "The list of skills itself"],
        ["Which skills are highlighted", "Education and background"],
        ["The contact blurb", "Contact links"],
      ],
    },
    {
      type: "code",
      lang: "ts",
      code: `const pick = (next: string | undefined, fallback: string, max: number) => {
  const s = (next ?? "").replace(/\\s+/g, " ").trim();
  return s && s.length <= max ? s : fallback;
};`,
      caption: "Model text is accepted only if it is non-empty and within its length limit. Otherwise my original wording stays.",
    },
    { type: "h2", text: "Skills" },
    {
      type: "p",
      text: "Skills named in the posting that are already on the page go to full bars and float to the top. Skills the posting wants that are not on the page are not added by default, because the page would then claim proficiency that was never confirmed. One flag turns that on.",
    },
    { type: "h2", text: "Failing safely" },
    {
      type: "list",
      items: [
        "Results are cached for a day, and failures for five minutes, so a bad link is not retried constantly.",
        "Identical requests share a single run.",
        "An hourly cap limits new runs.",
        "Every step has a timeout.",
        "Any error returns the regular page unchanged.",
      ],
    },
    { type: "h2", text: "One page, two angles" },
    {
      type: "p",
      text: "Each page carries its own focus. The biotech page leans on neural and clinical work, and the fintech page leans on blockchain, financial data, and automation. The same posting gets a different emphasis on each, and the cache is kept per page so their projects never mix.",
    },
  ],
};

export const articles: Article[] = [volition, pipeline, motor, blockchain, budgeter, tailoring];

export const getArticle = (id: string) => articles.find((a) => a.id === id);

/* Same-theme articles first, then the rest. */
export const relatedTo = (id: string, n = 2) => {
  const me = getArticle(id);
  return articles
    .filter((a) => a.id !== id)
    .sort((a, b) => Number(b.theme === me?.theme) - Number(a.theme === me?.theme))
    .slice(0, n);
};

const blockText = (b: Block): string => {
  switch (b.type) {
    case "h2":
    case "p":
      return b.text;
    case "list":
      return b.items.join(" ");
    case "callout":
      return `${b.title ?? ""} ${b.text}`;
    case "flow":
      return b.steps.map((s) => `${s.title} ${s.note ?? ""}`).join(" ");
    case "bars":
      return b.items.map((i) => `${i.label} ${i.note ?? ""}`).join(" ");
    case "stats":
      return b.items.map((i) => i.label).join(" ");
    case "code":
      return "";
    case "table":
      return [...b.head, ...b.rows.flat()].join(" ");
  }
};

export const readingTime = (a: Article) => {
  const words = [a.subtitle, a.intro, ...a.blocks.map(blockText)].join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};