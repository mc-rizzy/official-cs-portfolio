// app/actions/schema.ts
import { z } from 'zod';
import type { Content } from '../biotech/content';

/* ------------------------------------------------------------------ */
/*  Original schema, still used by /test-tailor. Unchanged.           */
/* ------------------------------------------------------------------ */
export const directReplaceSchema = z.object({
  locations: z.string().describe("Formatted as: 'City, State, Country' or 'Remote, USA'"),
  skills: z.array(z.string()).describe("Short tech stack or soft skills matching JD (e.g. ['REST', 'SQL', 'C++'])"),
  oneLinerTitle: z.string().describe("A concise 1-line headline matching the target job title and domain focus."),
  rephrasedInterests: z.string().describe("2-3 sentences tying current interests directly to the company's domain."),
  rephrasedProjects: z.array(
    z.object({
      originalTitle: z.string().describe("The exact original project title passed in."),
      tailoredDescription: z.string().describe(
        "Rephrased description incorporating relevant technical keywords, tools, and terminology from the job description while keeping the core accomplishments truthful."
      ),
    })
  ).describe("Rephrased descriptions for EVERY project provided in the input list, in the exact same order."),
});

export type DirectReplacements = z.infer<typeof directReplaceSchema>;

/* ------------------------------------------------------------------ */
/*  Full-page schema for /biotech?v=<job url>.                        */
/*  Every field is required (empty string = "no change") so strict    */
/*  JSON-schema providers accept it.                                  */
/* ------------------------------------------------------------------ */
export const pageTailorSchema = z.object({
  company: z.string().describe("Employer name. Empty string if unknown."),
  jobTitle: z.string().describe("Job title as written in the posting, e.g. 'Software Engineer Intern'."),
  headline: z.string().describe(
    "Hero headline in first person, plain words, max 7 words, no hype. Must be true of the candidate. Example style: 'I build software for biotech.'"
  ),
  summary: z.string().describe(
    "2 sentences, max 300 characters, first person. Connect the candidate's real work to what this job needs. Facts only from the candidate data."
  ),
  roles: z.string().describe("Roles line using the job's function, e.g. 'Software and machine learning engineering'. Max 70 characters."),
  domain: z.string().describe("The employer's industry or domain, 2-5 words, e.g. 'Neurotechnology and medical devices'."),
  location: z.string().describe("Job location as 'City, State' or 'Remote'. Empty string if the posting does not say."),
  contactBlurb: z.string().describe("1-2 sentences, max 180 characters, saying the candidate is interested in this role. Mention the company if known."),
  currentWork: z.string().describe(
    "Rephrase the candidate's current-work summary toward this job. Keep every fact. Max 400 characters."
  ),
  jobSkills: z.array(z.string()).describe("Technical skills and tools named in the posting, short names, at most 15."),
  matchedSkills: z.array(z.string()).describe(
    "Skills the posting asks for or clearly implies that ALSO appear in the candidate skill list. Copy each name exactly from that list."
  ),
  projects: z.array(
    z.object({
      id: z.string().describe("The exact project id from the candidate data."),
      summary: z.string().describe(
        "Rephrased summary, max 350 characters. Use the posting's terminology only where the candidate really did that work. Never invent technologies, results, or numbers."
      ),
      relevance: z.number().describe("0 to 10: how relevant this project is to the posting."),
    })
  ).describe("One entry for EVERY candidate project."),
});

export type PageTailoring = z.infer<typeof pageTailorSchema>;

/* Skills the posting asks for that the candidate has not listed are NOT
   added by default: that would claim proficiency on a public page.
   Flip to true to show them in an extra group at full bars. */
export const ALLOW_UNLISTED_SKILLS = false;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#]+/g, " ").trim();

/* Accept the model's text only if it is non-empty and within the limit;
   otherwise keep the original. Never truncate mid-sentence. */
const pick = (next: string | undefined, fallback: string, max: number) => {
  const s = (next ?? "").replace(/\s+/g, " ").trim();
  return s && s.length <= max ? s : fallback;
};

/* Pure function: maps a validated model response onto the page content.
   It can only reword, reorder, and re-level what already exists. */
export function applyPageTailoring(
  c: Content,
  t: PageTailoring,
  allowUnlisted: boolean = ALLOW_UNLISTED_SKILLS
): Content {
  /* projects: reworded summary, ordered by relevance (stable) */
  const byId = new Map(t.projects.map((p) => [p.id, p]));
  const projects = c.projects
    .map((p, i) => {
      const x = byId.get(p.id);
      return { p: { ...p, summary: pick(x?.summary, p.summary, 380) }, rel: x?.relevance ?? 0, i };
    })
    .sort((a, b) => b.rel - a.rel || a.i - b.i)
    .map((x) => x.p);

  /* facts: roles, domain, location come from the posting */
  const roles = pick(t.roles, "", 80);
  const domain = pick(t.domain, "", 60);
  const location = pick(t.location, "", 60);
  let facts = c.profile.facts.map((f) =>
    f.label === "Roles" && roles ? { ...f, value: roles }
    : f.label === "Domain" && domain ? { ...f, value: domain }
    : f.label === "Location" && location ? { ...f, value: location }
    : f
  );
  const target = [pick(t.jobTitle, "", 80), pick(t.company, "", 50)].filter(Boolean).join(", ");
  if (target) facts = [{ label: "Applying to", value: target }, ...facts];

  /* skills: posting skills the candidate has go to full bars + highlight */
  const wanted = new Set([...t.matchedSkills, ...t.jobSkills].map(norm));
  const known = new Set(c.skills.flatMap((g) => g.items.map((s) => norm(s.name))));

  let skills = c.skills.map((g) => ({
    ...g,
    items: g.items
      .map((it) => (wanted.has(norm(it.name)) ? { ...it, level: 3 as const, focus: true } : it))
      .sort((a, b) => Number(!!b.focus) - Number(!!a.focus)),
  }));
  skills = skills
    .map((g, i) => ({ g, i, n: g.items.filter((s) => s.focus).length }))
    .sort((a, b) => b.n - a.n || a.i - b.i)
    .map((x) => x.g);

  if (allowUnlisted) {
    const seen = new Set<string>();
    const extra = t.jobSkills
      .filter((s) => {
        const k = norm(s);
        if (!k || known.has(k) || seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .slice(0, 12)
      .map((name) => ({ name, level: 3 as const, focus: true }));
    if (extra.length) skills = [...skills, { group: "Also in this job description", items: extra }];
  }

  return {
    ...c,
    profile: {
      ...c.profile,
      headline: pick(t.headline, c.profile.headline, 56),
      summary: pick(t.summary, c.profile.summary, 420),
      facts,
    },
    current: { ...c.current, summary: pick(t.currentWork, c.current.summary, 420) },
    projects,
    skills,
    contact: { ...c.contact, blurb: pick(t.contactBlurb, c.contact.blurb, 200) },
  };
}