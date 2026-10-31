/* ------------------------------------------------------------------ */
/*  Single source of truth for the /biotech page.                     */
/*  Edit text, reorder arrays, add items. The page renders whatever   */
/*  is here. `tags` on projects/skills are what tailoring matches on. */
/* ------------------------------------------------------------------ */

export interface Project {
  id: string;
  title: string;
  kind: "Machine learning" | "Data engineering" | "Software" | "Research" | "Writing";
  stage?: string; // timeless status, e.g. "Completed", "Ongoing"
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
    role: string;
    headline: string;
    summary: string;
    facts: { label: string; value: string }[];
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
  background: { org: string; role: string; kind: string; note?: string }[];
  contact: {
    blurb: string;
    links: { label: string; url: string }[]; // email is intentionally not here; the form sends it
  };
}

export const content: Content = {
  profile: {
    name: "Caleb Liu",
    role: "Software and ML engineering for biotech",
    headline: "I build software for biotech.",
    summary:
      "Computer science student building the machine learning models and data pipelines behind a brain-controlled robotic hand, plus the tooling that cleans and validates the neural and clinical data feeding them.",
    facts: [
      { label: "Studying", value: "Computer Science, Rensselaer Polytechnic Institute" },
      { label: "Roles", value: "Software, machine learning, and data engineering" },
      { label: "Domain", value: "Biotech, neural and clinical data" },
      { label: "Status", value: "Open to 2027 internships" },
      { label: "Location", value: "Albany, NY" },
    ],
  },

  current: {
    title: "Volition 2.0: real-time brain-controlled hand",
    status: "In development",
    summary:
      "Extending the EEG-to-robotic-hand system into a closed loop: continuous decoding, real-time intent prediction, and haptic feedback so the hand responds to intent before the movement completes.",
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
      title: "Brain-controlled robotic hand",
      kind: "Machine learning",
      stage: "Ongoing",
      role: "Software and ML engineer, solo",
      summary:
        "A Python and PyTorch system that reads EEG, extracts motor-cortex features, and uses a graph neural network to map them to robotic hand movements.",
      outcome: "Closed-loop demo: the hand responds to neural intent, not physical motion.",
      tags: ["eeg", "gnn", "pytorch", "robotics", "c++", "neural decoding", "bci"],
      articleId: "volition-neural-control",
      links: [{ label: "Code", url: "https://github.com/mc-rizzy/volition" }],
    },
    {
      id: "signal-pipeline",
      title: "EEG data pipeline",
      kind: "Data engineering",
      stage: "Completed",
      role: "Data engineer",
      summary:
        "End-to-end cleaning, annotation, and feature extraction for neural recordings. Bad channels and mislabeled epochs are flagged before any model sees them.",
      outcome: "Drift under 5% across cohorts; every stage versioned and reproducible.",
      tags: ["signal processing", "data pipeline", "pytorch", "sql", "eeg", "etl"],
      articleId: "neural-signal-pipeline",
    },
    {
      id: "motor-analysis",
      title: "Motor-function classifier",
      kind: "Machine learning",
      stage: "Pilot study",
      role: "ML and data analysis",
      summary:
        "Quantified differences in motor-function signatures between autistic and neurotypical subjects and turned clinical observations into a structured dataset for classification.",
      outcome: "Pilot (n=2): signatures separated cleanly enough to train a classifier. A research aid, not a diagnostic.",
      tags: ["signal processing", "ml", "clinical data", "python", "classification"],
      articleId: "autism-motor-analysis",
    },
    {
      id: "health-automation",
      title: "Health records cleaning automation",
      kind: "Data engineering",
      stage: "Completed",
      role: "Software engineer",
      summary:
        "Automated cleaning and validation of health records, turning unstructured clinical data into model-ready tables.",
      outcome: "4x faster than the manual process.",
      tags: ["python", "etl", "health records", "automation", "data cleaning"],
    },
    {
      id: "ibm",
      title: "IBM research collaboration",
      kind: "Research",
      stage: "Collaboration",
      role: "Research collaborator",
      summary:
        "Contributed to work on neural computing and brain-inspired architectures, applying deep learning to structured biomedical data and hardware-accelerated inference.",
      tags: ["ibm", "neural computing", "bioml", "inference", "deep learning"],
    },
    {
      id: "whitepaper",
      title: "Whitepaper: neural decoding for assistive robotics",
      kind: "Writing",
      stage: "Completed",
      role: "Author",
      summary:
        "Methodology, reproducibility, and the clinical path from lab prototype to a real assistive device.",
      tags: ["writing", "robotics", "neuroscience", "reproducibility"],
    },
  ],

  skills: [
    {
      group: "Languages",
      items: [
        { name: "Python", level: 3 },
        { name: "TypeScript", level: 3 },
        { name: "SQL", level: 3 },
        { name: "C++", level: 2 },
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
        { name: "ETL pipelines", level: 3 },
        { name: "Data cleaning", level: 3 },
        { name: "Feature extraction", level: 3 },
        { name: "Dataset versioning", level: 2 },
      ],
    },
    {
      group: "Web",
      items: [
        { name: "Next.js", level: 3 },
        { name: "React", level: 3 },
        { name: "Node.js", level: 2 },
        { name: "Three.js", level: 2 },
      ],
    },
    {
      group: "Biotech domain",
      items: [
        { name: "EEG", level: 3 },
        { name: "Signal processing", level: 3 },
        { name: "Artifact rejection", level: 2 },
        { name: "Clinical data", level: 2 },
      ],
    },
  ],

  background: [
    { org: "Rensselaer Polytechnic Institute", role: "Computer Science major", kind: "Education" },
    { org: "IBM", role: "Research collaborator", kind: "Research", note: "Neural computing and brain-inspired architectures." },
    { org: "RPI Union", role: "Full-stack engineer", kind: "Engineering" },
    { org: "HackRPI", role: "Executive board", kind: "Leadership", note: "Runs the hackathon; built the event website." },
  ],

  contact: {
    blurb: "Looking for 2027 software, ML, or data engineering internships in biotech and health tech.",
    links: [
      { label: "LinkedIn", url: "https://linkedin.com/in/caleb-liu0/" },
      { label: "GitHub", url: "https://github.com/mc-rizzy" },
      { label: "Handshake", url: "https://app.joinhandshake.com/profiles/caleb-liu" },
    ],
  },
};