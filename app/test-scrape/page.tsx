// app/page.tsx
'use client';

import { useState, useTransition } from 'react';
import { scrapeProtectedPage, scrapeProtectedPageRaw } from '../actions/scrape';

interface ScrapeResult {
  title: string;
  rawContent: string;
  cleanContent: string;
}

export default function HeadlessScraperPage() {
  const [url, setUrl] = useState('');
  const [data, setData] = useState<ScrapeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'raw' | 'clean' | 'side-by-side'>('side-by-side');
  const [isPending, startTransition] = useTransition();

  const handleScrape = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setData(null);

    startTransition(async () => {
      try {
        const [rawRes, cleanRes] = await Promise.all([
          scrapeProtectedPageRaw(url),
          scrapeProtectedPage(url),
        ]);

        setData({
          title: rawRes.title,
          rawContent: rawRes.content,
          cleanContent: cleanRes.content,
        });
      } catch (err: any) {
        setError(err.message || 'Headless scraping failed. Please try again.');
      }
    });
  };

  return (
    <main style={{ maxWidth: '1200px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 16px' }}>
      <h1>Playwright Headless Scraper</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Compare raw HTML content against cleaned plain text optimized for LLM token usage.
      </p>

      <form onSubmit={handleScrape} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <input
          type="url"
          required
          placeholder="https://job-boards.greenhouse.io/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ flex: 1, padding: '12px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            borderRadius: '6px',
            background: isPending ? '#94a3b8' : '#2563eb',
            color: '#fff',
            border: 'none',
            cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {isPending ? 'Launching Browser...' : 'Scrape Page'}
        </button>
      </form>

      {error && (
        <div style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fca5a5', padding: '16px', borderRadius: '6px', marginBottom: '24px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, color: '#1e293b' }}>{data.title}</h2>
            
            {/* View Switcher Controls */}
            <div style={{ display: 'flex', gap: '4px', background: '#e2e8f0', padding: '4px', borderRadius: '6px' }}>
              {(['side-by-side', 'raw', 'clean'] as const).map((viewMode) => (
                <button
                  key={viewMode}
                  onClick={() => setActiveTab(viewMode)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: 'none',
                    background: activeTab === viewMode ? '#fff' : 'transparent',
                    color: activeTab === viewMode ? '#0f172a' : '#64748b',
                    fontWeight: activeTab === viewMode ? '600' : 'normal',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {viewMode.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: activeTab === 'side-by-side' ? '1fr 1fr' : '1fr', 
              gap: '24px' 
            }}
          >
            {/* RAW HTML VIEW */}
            {(activeTab === 'side-by-side' || activeTab === 'raw') && (
              <div style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '8px', background: '#ffffff' }}>
                <h3 style={{ marginTop: 0, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  Raw Rendered HTML
                </h3>
                <div
                  dangerouslySetInnerHTML={{ __html: data.rawContent }}
                  style={{ lineHeight: '1.6', color: '#334155' }}
                />
              </div>
            )}

            {/* CLEAN TEXT VIEW */}
              {(activeTab === 'side-by-side' || activeTab === 'clean') && (
                <div style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '8px', background: '#f8fafc' }}>
                  <h3 style={{ marginTop: 0, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    Cleaned Plain Text (For AI)
                  </h3>
                  <div
                    style={{
                      whiteSpace: 'pre-line', // <-- THIS PRESERVES YOUR \n LINE BREAKS AS ACTUAL NEWLINES
                      wordBreak: 'break-word',
                      fontSize: '15px',
                      lineHeight: '1.6',
                      color: '#334155',
                    }}
                  >
                    {data.cleanContent}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
    </main>
  );
}