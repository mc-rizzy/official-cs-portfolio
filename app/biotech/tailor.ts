import type { Content } from "./Content";

/* A Lens only SELECTS, ORDERS, and REWORDS existing content.
   It can never add a project or skill that isn't in content.ts. */
export interface Lens {
  headline?: string;
  summary?: string;
  projectOrder?: string[]; // project ids, best match first
  hide?: string[]; // project ids to drop
  skillFocus?: string[]; // skill names to float up and highlight
}

/* Hand-written or generated lenses, addressed as /biotech?for=<key> */
export const lenses: Record<string, Lens> = {
  "example-neuro-startup": {
    headline: "Decoding EEG into control signals.",
    summary:
      "I build the signal-processing pipelines and graph neural networks that turn raw EEG into prosthetic hand control, with a focus on data quality and reproducibility.",
    projectOrder: ["volition", "signal-pipeline", "motor-analysis"],
    hide: ["whitepaper"],
    skillFocus: ["EEG", "PyTorch", "Signal processing"],
  },
};

export function resolveLens(key?: string): Lens | undefined {
  return key ? lenses[key] : undefined;
}

export function applyLens(c: Content, lens?: Lens): Content {
  if (!lens) return c;

  const order = lens.projectOrder ?? [];
  const rank = (id: string) => {
    const i = order.indexOf(id);
    return i === -1 ? order.length : i;
  };

  const projects = c.projects
    .filter((p) => !lens.hide?.includes(p.id))
    .map((p, i) => ({ p, i }))
    .sort((a, b) => rank(a.p.id) - rank(b.p.id) || a.i - b.i)
    .map((x) => x.p);

  const focus = new Set((lens.skillFocus ?? []).map((s) => s.toLowerCase()));
  const skills = c.skills.map((g) => ({
    ...g,
    items: g.items
      .map((it) => ({ ...it, focus: focus.has(it.name.toLowerCase()) }))
      .sort((a, b) => Number(b.focus) - Number(a.focus)),
  }));

  return {
    ...c,
    profile: {
      ...c.profile,
      headline: lens.headline ?? c.profile.headline,
      summary: lens.summary ?? c.profile.summary,
    },
    projects,
    skills,
  };
}

/* Zero-cost baseline: build a lens from a pasted job description by
   keyword overlap. Swap or combine with an LLM later (see notes). */
export function lensFromKeywords(c: Content, jobDescription: string): Lens {
  const jd = jobDescription.toLowerCase();

  const scored = c.projects
    .map((p) => ({ id: p.id, score: p.tags.filter((t) => jd.includes(t)).length }))
    .sort((a, b) => b.score - a.score);

  const skillFocus = c.skills
    .flatMap((g) => g.items)
    .filter((s) => jd.includes(s.name.toLowerCase()))
    .map((s) => s.name);

  return { projectOrder: scored.map((s) => s.id), skillFocus };
}