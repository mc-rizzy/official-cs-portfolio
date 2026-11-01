// app/actions/job-text.ts
// Plain-fetch way to read a job posting. Used when a headless browser is not
// available (for example on Vercel). It reads the page's JobPosting JSON-LD
// first, which many job boards include, then falls back to the visible text.

import * as cheerio from 'cheerio';

const IGNORE = [
  /apply for this job/i,
  /indicates a required field/i,
  /autofill my application/i,
  /voluntary self-identification/i,
  /equal employment opportunity/i,
  /veteran status/i,
  /race & ethnicity/i,
  /submit application/i,
  /attach resume/i,
  /linkedin profile/i,
  /cookie policy/i,
  /privacy notice/i,
  /data protection/i,
];

const cleanLines = (text: string) =>
  text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !(l.startsWith('{') && l.endsWith('}')) && !IGNORE.some((p) => p.test(l)))
    .join('\n');

const htmlToText = (html: string) => {
  let t = cheerio.load(html).text();
  if (t.includes('<')) t = cheerio.load(t).text(); // description was double-escaped
  return t;
};

function fromJsonLd($: cheerio.CheerioAPI): { title: string; content: string } | null {
  let found: { title: string; content: string } | null = null;

  $('script[type="application/ld+json"]').each((_, el) => {
    if (found) return;
    try {
      const data = JSON.parse($(el).text());
      const nodes: any[] = Array.isArray(data) ? data : data?.['@graph'] ? data['@graph'] : [data];
      const job = nodes.find((n) => {
        const t = n?.['@type'];
        return t === 'JobPosting' || (Array.isArray(t) && t.includes('JobPosting'));
      });
      if (!job?.description) return;

      const loc = [job.jobLocation?.address?.addressLocality, job.jobLocation?.address?.addressRegion]
        .filter(Boolean)
        .join(', ');
      const parts = [
        job.title,
        job.hiringOrganization?.name && `Company: ${job.hiringOrganization.name}`,
        loc && `Location: ${loc}`,
        job.jobLocationType === 'TELECOMMUTE' && 'Remote',
        htmlToText(String(job.description)),
      ].filter(Boolean);
      found = { title: String(job.title ?? ''), content: cleanLines(parts.join('\n')) };
    } catch {
      /* ignore malformed JSON-LD */
    }
  });

  return found;
}

export async function scrapeStaticPage(targetUrl: string): Promise<{ title: string; content: string }> {
  const res = await fetch(targetUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(15_000),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`job page returned HTTP ${res.status}`);

  const $ = cheerio.load(await res.text());

  const ld = fromJsonLd($);
  if (ld && ld.content.length >= 300) return ld;

  $('script, style, noscript, svg, nav, footer, header, iframe, form, select, option, input, label, button').remove();
  $('br').replaceWith('\n');
  $('p, div, li, h1, h2, h3, h4, h5, h6').after('\n');

  const root = $('main, article, [role="main"]').first();
  const text = (root.length ? root : $('body')).text();
  const title = $('h1').first().text().trim() || $('title').text().trim() || 'Title not found';
  return { title, content: cleanLines(text) };
}