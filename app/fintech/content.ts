import type { Content } from "../biotech/content";

/* ------------------------------------------------------------------ */
/*  Single source of truth for the /fintech page.                     */
/*  DRAFT built from your site notes and code, not from your resume.  */
/*  Check every line against the resume before publishing.            */
/*                                                                    */
/*  In your notes but not included (no details yet): James Fund,      */
/*  MoreNBest Amazon automation, Napcast, Plantilir, autonomous video */
/*  content generator, neural language model, Elligton, conference    */
/*  networking.                                                       */
/* ------------------------------------------------------------------ */

export const content: Content = {
  profile: {
    name: "Caleb Liu",
    role: "Software and data engineering for finance",
    headline: "I build reliable software for finance.",
    summary:
      "Computer science student with a business analytics and finance background. I build the blockchain systems, data pipelines, and automation where speed and correctness matter.",
    facts: [
      { label: "Studying", value: "Computer Science, Business Analytics, Finance" },
      { label: "Roles", value: "Software, data, and analytics engineering" },
      { label: "Domain", value: "Fintech: blockchain, automation, financial data" },
      { label: "Status", value: "Open to 2027 internships" },
      { label: "Location", value: "Albany, NY" },
    ],
  },

  current: {
    title: "Blockchain live demonstration",
    status: "Upcoming",
    summary:
      "Preparing a live demonstration of my Python blockchain node: mining blocks with SHA-256 proof of work and resolving consensus across nodes.",
    milestones: [
      { label: "Node with proof of work and consensus", state: "done" },
      { label: "REST API and test suite", state: "done" },
      { label: "Live demonstration", state: "planned" },
    ],
    links: [{ label: "Code", url: "https://github.com/mc-rizzy/python-blockchain" }],
  },

  projects: [
    {
      id: "blockchain",
      title: "Blockchain node in Python and Flask",
      kind: "Blockchain",
      stage: "Completed",
      role: "Software engineer",
      summary:
        "A functioning blockchain node with a Flask REST API, SHA-256 proof of work, node consensus resolution, and a test suite.",
      outcome: "Under 10 ms per block.",
      tags: ["python", "flask", "rest api", "cryptography", "sha-256", "blockchain", "consensus"],
      links: [{ label: "Code", url: "https://github.com/mc-rizzy/python-blockchain" }],
    },
    {
      id: "budgeter",
      title: "Budgeter",
      kind: "Personal finance",
      stage: "Completed",
      role: "Software engineer",
      summary:
        "A budgeting app that tracks daily earnings against a weekly profit goal and splits income across savings, index investing, deposits, and spending, with a Sankey diagram of where each dollar goes.",
      tags: ["next.js", "typescript", "react", "data visualization", "budgeting"],
      links: [{ label: "Live demo", url: "/budgeter" }],
    },
    {
      id: "health-automation",
      title: "Health records cleaning automation",
      kind: "Data engineering",
      stage: "Completed",
      role: "Software engineer",
      summary:
        "Automated cleaning and validation of health records, turning unstructured data into model-ready tables.",
      outcome: "4x faster than the manual process.",
      tags: ["python", "etl", "automation", "data cleaning"],
    },
    {
      id: "public-safety-ai",
      title: "Whitepaper: AI in public safety",
      kind: "Writing",
      stage: "Completed",
      role: "Author",
      summary: "A whitepaper on how AI is used in public safety.",
      tags: ["ai", "writing", "research"],
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
      group: "Blockchain and backend",
      items: [
        { name: "REST APIs", level: 3 },
        { name: "Flask", level: 2 },
        { name: "Cryptographic hashing", level: 2 },
        { name: "Consensus algorithms", level: 2 },
      ],
    },
    {
      group: "Data and analytics",
      items: [
        { name: "ETL pipelines", level: 3 },
        { name: "Data cleaning", level: 3 },
        { name: "Statistical analysis", level: 2 },
        { name: "Data visualization", level: 2 },
      ],
    },
    {
      group: "Machine learning",
      items: [
        { name: "PyTorch", level: 3 },
        { name: "Classification", level: 2 },
        { name: "Model validation", level: 2 },
      ],
    },
    {
      group: "Web",
      items: [
        { name: "Next.js", level: 3 },
        { name: "React", level: 3 },
        { name: "Node.js", level: 2 },
      ],
    },
  ],

  background: [
    { org: "Rensselaer Polytechnic Institute", role: "Computer Science, Business Analytics, and Finance", kind: "Education" },
    { org: "HackRPI", role: "Director of Technology", kind: "Leadership", note: "Runs the hackathon and tech team; built the event website; runs event statistical analysis." },
    { org: "RPI Union", role: "Full-stack engineer", kind: "Engineering" },
  ],

  contact: {
    blurb: "Looking for 2027 software, data, or analytics internships in fintech.",
    links: [
      { label: "LinkedIn", url: "https://linkedin.com/in/caleb-liu0/" },
      { label: "GitHub", url: "https://github.com/mc-rizzy" },
      { label: "Handshake", url: "https://app.joinhandshake.com/profiles/caleb-liu" },
    ],
  },
};