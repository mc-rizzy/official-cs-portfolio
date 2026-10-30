// app/actions/scrape.ts
'use me server';
import * as cheerio from 'cheerio';

export interface ScrapedData {
  title: string;
  description: string;
  h1s: string[];
}

export async function scrapeUrl(targetUrl: string): Promise<ScrapedData> {
  // Validate URL format
  const parsedUrl = new URL(targetUrl);
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('Invalid protocol. URL must start with http or https.');
  }

  // Fetch the target webpage
  const response = await fetch(parsedUrl.toString(), {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    // Opt out of Next.js static caching for dynamic scraping requests
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page. Status code: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Extract core page elements
  const title = $('title').text().trim() || 'No title found';
  const description =
    $('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content') ||
    'No description available';

  const h1s: string[] = [];
  $('h1').each((_, element) => {
    const text = $(element).text().trim();
    if (text) h1s.push(text);
  });

  return { title, description, h1s };
}