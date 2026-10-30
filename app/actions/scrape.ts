// app/actions/scrape-headless.ts
'use server';

import { chromium } from 'playwright';
import * as cheerio from 'cheerio';

async function fetchPageElements(targetUrl: string) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  try {
    // 1. Fast navigation to DOMContentLoaded (stops waiting for background telemetry/network calls)
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    // await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 15000 });

    // 2. Wait explicitly for key job content containers to render
    const contentSelector = 'article, .job-description, .posting-description, .content, #content, .job-post-content, main, body';
    await page.waitForSelector(contentSelector, { timeout: 10000 }).catch(() => null);
  
    // const title = await page.locator('h1').first().textContent();
    // const rawHtml = await page.locator('article, .job-description, .posting-description, .content, #content, .job-post-content, main, body').first().innerHTML();
    
    // 3. Extract title and raw HTML content
    const title = await page.locator('h1').first().textContent();
    const rawHtml = await page.locator(contentSelector).first().innerHTML();

    await browser.close();

    return {
      title: title?.trim() || 'Title not found',
      rawHtml: rawHtml || '',
    };
  } catch (error: any) {
    await browser.close();
    throw new Error(`Headless scraping failed: ${error.message}`);
  }
}

export async function scrapeProtectedPageRaw(targetUrl: string) {
  const { title, rawHtml } = await fetchPageElements(targetUrl);
  return {
    title,
    content: rawHtml,
  };
}

export async function scrapeProtectedPage(targetUrl: string) {
  const { title, rawHtml } = await fetchPageElements(targetUrl);

  const $ = cheerio.load(rawHtml);

  // 1. Remove standard non-content scripts and layout wrappers
  $(
    'script, style, noscript, svg, nav, footer, header, iframe, ' +
    'form, #application, #application_form, .application-form, select, option, input, label, button, .select2-container, #eeoc, .eeoc, ' +
    'script[type="application/json"], [data-json], [style*="display:none"], [style*="display: none"]'
  ).remove();

  // 3. Inject newlines at block element boundaries before converting to text
  $('br').replaceWith('\n');
  $('p, div, li, h1, h2, h3, h4, h5, h6').after('\n');

  // 4. Extract text
  let cleanedText = $('body').text();

  // 5. Post-process lines: strip application form keywords & trim empty lines
  const ignorePatterns = [
    /apply for this job/i,
    /indicates a required field/i,
    /autofill my application/i,
    /voluntary self-identification/i,
    /equal employment opportunity/i,
    /veteran status/i,
    /race & ethnicity/i,
    /submit application/i,
    // Add these for Lever, Workday, etc.:
    /attach resume/i,
    /linkedin profile/i,
    /cookie policy/i,
    /privacy notice/i,
    /data protection/i,
  ];

  cleanedText = cleanedText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => {
      if (line.length === 0) return false;

      // Filter out raw JSON lines (Eightfold / Workday config payloads)
      if (
        (line.startsWith('{') && line.endsWith('}')) ||
        line.includes('"themeOptions"') ||
        line.includes('"navbarData"') ||
        line.includes('"varTheme"')
      ) {
        return false;
      }

      // Filter out form terms
      return !ignorePatterns.some((pattern) => pattern.test(line));
    })
    .join('\n');

  return {
    title,
    content: cleanedText,
  };
}