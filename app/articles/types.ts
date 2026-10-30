/* ------------------------------------------------------------------ */
/*  Shared article shape.                                            */
/*                                                                    */
/*  An article is described by { slug, title, subtitle, author,      */
/*  date, tags, githubUrl, hero, sections[], stats[] }.             */
/* ------------------------------------------------------------------ */

interface SectionData {
  type: "paragraph" | "video" | "image" | "stats" | "callout";
  label?: string;
  caption?: string;
  body?: string;
  items?: { num: string; label: string }[];
}

export interface ArticleData {
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  date: string;
  tags: string[];
  githubUrl: string;
  hero: { video?: boolean; videoLabel?: string };
  intro: string;
  sections: SectionData[];
  stats?: { num: string; label: string }[];
}
