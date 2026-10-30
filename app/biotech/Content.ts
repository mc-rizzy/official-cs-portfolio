/* ------------------------------------------------------------------ */
/*  Single source of truth for the /biotech page.                     */
/*  Edit text, reorder arrays, add items. The page renders whatever   */
/*  is here. `tags` on projects/skills are what tailoring matches on. */
/* ------------------------------------------------------------------ */

export interface Project {
  id: string;
  title: string;
  kind: "Prototype" | "Research" | "Publication";
  period?: string;
  role?: string;
  summary: string;
  outcome?: string;
  tags: string[];
  articleId?: string; // links to /articles/[id]
  links?: { label: string; url: string }[];
}

export interface Skill {
  name: string;
  level: 1 | 2 | 3; // 3 = daily, 2 = working, 1 = familiar
  focus?: boolean; // set by tailoring, not by hand
}

export interface SkillGroup {
  group: string;
  items: Skill[];
}

export interface Milestone {
  label: string;
  state: "done" | "active" | "planned";
}

export interface Content {
  profile: {
    name: string;
    headline: string;
    summary: string;
    affiliation: string;
    location: string;
    status: string;
    focus: string;
  };
  current: {
    title: string;
    status: string;
    summary: string;
    milestones: Milestone[];
    links?: { label: string; url: string }[];
  };
  projects: Project[];
  skills: SkillGroup[];
  background: { org: string; role: string; period?: string; note?: string }[];
  contact: {
    blurb: string;
    email: string;
    links: { label: string; url: string }[];
  };
}

export const content: Content = {
  profile: {
    name: "Caleb Liu",
    headline: "Turning noisy brain signals into movement.",
    summary:
      "I build the data pipelines and graph neural networks that let EEG control a robotic prosthetic hand. Most of the work happens before the model: cleaning, annotating, and validating recordings until the network learns intent instead of noise.",
    affiliation: "Rensselaer Polytechnic Institute",
    location: "Albany, NY",
    status: "Open to 2027 internships",
    focus: "Neural decoding, assistive robotics",
  },

  current: {
    title: "Volition 2.0: closed-loop neural control",
    status: "In development",
    summary:
      "Extending the EEG-to-prosthetic interface into a closed-loop system: continuous decoding, real-time intent prediction, and haptic feedback so the hand responds to intent before the movement completes.",
    milestones: [
      { label: "Open-loop EEG to hand control", state: "done" },
      { label: "Continuous neural decoding", state: "active" },
      { label: "Real-time intent prediction", state: "planned" },
      { label: "Haptic feedback to the user", state: "planned" },
    ],
    links: [{ label: "Code", url: "https://github.com/mc-rizzy/volition" }],
  },

  projects: [
    {
      id: "volition",
      title: "EEG-to-prosthetic control interface",
      kind: "Prototype",
      period: "2026",
      role: "Sole developer",
      summary:
        "A bridge between a graph neural network and a robotic hand. Feature-extraction pipelines isolate motor-cortex signals from noisy EEG, and the network maps them to hand movements.",
      outcome: "Closed-loop demo: the hand responds to neural intent, not physical motion.",
      tags: ["eeg", "gnn", "pytorch", "robotics", "c++", "neural decoding", "bci"],
      articleId: "volition-neural-control",
      links: [{ label: "Code", url: "https://github.com/mc-rizzy/volition" }],
    },
    {
      id: "signal-pipeline",
      title: "Neural signal processing pipeline",
      kind: "Research",
      period: "2026",
      summary:
        "End-to-end cleaning, annotation, and feature extraction for neural recordings. Bad channels and mislabeled epochs are flagged before any model sees them.",
      outcome: "Drift under 5% across cohorts; every stage versioned and reproducible.",
      tags: ["signal processing", "data pipeline", "pytorch", "sql", "eeg", "etl"],
      articleId: "neural-signal-pipeline",
    },
    {
      id: "motor-analysis",
      title: "Autistic vs. neurotypical motor signatures",
      kind: "Research",
      period: "2026",
      summary:
        "Quantified differences in motor-function signatures between cohorts and turned clinical observations into a structured dataset for ML classification.",
      outcome: "Pilot study (n=2): signatures separated cleanly enough to train a classifier. A research aid, not a diagnostic.",
      tags: ["signal processing", "ml", "clinical data", "python", "classification"],
      articleId: "autism-motor-analysis",
    },
    {
      id: "health-automation",
      title: "Healthcare data automation",
      kind: "Prototype",
      summary:
        "Automated cleaning and validation of health records, turning unstructured clinical data into model-ready tables.",
      outcome: "4x faster than the manual process.",
      tags: ["python", "etl", "health records", "automation", "data cleaning"],
    },
    {
      id: "ibm",
      title: "IBM research collaboration",
      kind: "Research",
      summary:
        "Contributed to work on neural computing and brain-inspired architectures, applying deep learning to structured biomedical data and hardware-accelerated inference.",
      tags: ["ibm", "neural computing", "bioml", "inference", "deep learning"],
    },
    {
      id: "whitepaper",
      title: "Neural decoding for assistive robotics",
      kind: "Publication",
      summary:
        "Whitepaper on methodology, reproducibility, and the clinical path from lab prototype to a real assistive device.",
      tags: ["writing", "robotics", "neuroscience", "reproducibility"],
    },
  ],

  skills: [
    {
      group: "Neural data",
      items: [
        { name: "EEG", level: 3 },
        { name: "Signal processing", level: 3 },
        { name: "Feature extraction", level: 3 },
        { name: "Artifact rejection", level: 2 },
      ],
    },
    {
      group: "Machine learning",
      items: [
        { name: "PyTorch", level: 3 },
        { name: "Graph neural networks", level: 2 },
        { name: "Classification", level: 2 },
        { name: "Model validation", level: 2 },
      ],
    },
    {
      group: "Data engineering",
      items: [
        { name: "Python", level: 3 },
        { name: "SQL", level: 3 },
        { name: "ETL pipelines", level: 3 },
        { name: "Dataset versioning", level: 2 },
      ],
    },
    {
      group: "Systems",
      items: [
        { name: "C++", level: 2 },
        { name: "Robotics interfaces", level: 2 },
        { name: "TypeScript", level: 3 },
        { name: "Next.js", level: 3 },
      ],
    },
  ],

  background: [
    { org: "IBM", role: "Research contributor", note: "Neural computing and brain-inspired architectures." },
    { org: "HackRPI", role: "Executive board", note: "Runs the hackathon; built the event website." },
    { org: "RPI Union", role: "Full-stack engineer" },
  ],

  contact: {
    blurb: "Looking for 2027 internships in neural engineering, biomedical ML, or assistive robotics.",
    email: "hello@calebliu.com",
    links: [
      { label: "LinkedIn", url: "https://linkedin.com/in/caleb-liu0/" },
      { label: "GitHub", url: "https://github.com/mc-rizzy" },
      { label: "Handshake", url: "https://app.joinhandshake.com/profiles/caleb-liu" },
    ],
  },
};