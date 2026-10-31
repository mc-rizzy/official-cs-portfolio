/* Turns /biotech?v=<job url> into a clean, safe job URL.
   The job URL's own query string is usually not encoded, so
   "?v=https://x.com/jobs/1?utm_source=a&ref=b" reaches us as v + ref.
   We stitch the extra params back on, then strip tracking params. */

const RESERVED = new Set(["v", "for", "motion"]);
const TRACKING = /^(utm_.*|ref|referrer|source|src|gh_src|fbclid|gclid)$/i;

type Params = Record<string, string | string[] | undefined>;

export const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

export function parseJobUrl(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(url.protocol) || url.username || url.password || raw.length > 2000) return null;

  /* The server fetches this URL, so refuse local and private targets. */
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    !host.includes(".") ||
    /^\d+(\.\d+){3}$/.test(host) ||
    host.includes(":") ||
    host.startsWith("[")
  ) {
    return null;
  }

  /* Optional: TAILOR_ALLOWED_HOSTS=greenhouse.io,lever.co,ashbyhq.com */
  const allowed = process.env.TAILOR_ALLOWED_HOSTS?.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (allowed?.length && !allowed.some((a) => host === a || host.endsWith("." + a))) return null;

  for (const k of [...url.searchParams.keys()]) if (TRACKING.test(k)) url.searchParams.delete(k);
  url.hash = "";
  return url;
}

export function jobUrlFromParams(sp: Params): string | null {
  const v = first(sp.v)?.trim();
  if (!v) return null;
  let url: URL;
  try {
    url = new URL(v);
  } catch {
    return null;
  }
  for (const [k, val] of Object.entries(sp)) {
    if (RESERVED.has(k) || val === undefined) continue;
    for (const x of Array.isArray(val) ? val : [val]) url.searchParams.append(k, x);
  }
  return parseJobUrl(url.toString())?.toString() ?? null;
}