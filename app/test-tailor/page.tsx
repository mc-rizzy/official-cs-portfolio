// app/page.tsx
'use client';

import { useState, useTransition } from 'react';
import { generateTextReplacements } from '../actions/tailor-text';
import { scrapeProtectedPage } from '../actions/scrape';

// Your initial baseline portfolio data
const INITIAL_DATA = {
  headline: "Full Stack Engineer specializing in Web Systems",
  location: "New York, NY",
  skills: ["React", "TypeScript", "Node.js", "SQL"],
  interests: "I enjoy building developer tools, exploring distributed databases, and contributing to open-source software.",
  projects: [
    {
      title: "Portfolio Scraper",
      description: "Built a custom web crawler using Playwright and Next.js App Router to fetch protected pages."
    },
    {
      title: "Real-Time Chat App",
      description: "Engineered a high-throughput WebSocket chat server backed by Node.js and Redis."
    }
  ]
};

export default function PortfolioPage() {
  const [jobUrl, setJobUrl] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Page state fields that will be directly overwritten by the AI response
  const [headline, setHeadline] = useState(INITIAL_DATA.headline);
  const [location, setLocation] = useState(INITIAL_DATA.location);
  const [skills, setSkills] = useState(INITIAL_DATA.skills);
  const [interests, setInterests] = useState(INITIAL_DATA.interests);
  const [projects, setProjects] = useState(INITIAL_DATA.projects);

  const handleTailor = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        // 1. Scrape the job description page using your headless scraper
        const scrapedJob = await scrapeProtectedPage(jobUrl);

        // 2. Make the single AI call passing the description and your projects/interests
        const updates = await generateTextReplacements(
          scrapedJob.content,
          projects,
          interests
        );

        // 3. Directly update state with tailored values in 1 pass
        setHeadline(updates.oneLinerTitle);
        setLocation(updates.locations);
        setSkills(updates.skills);
        setInterests(updates.rephrasedInterests);
        
        // Map back the tailored descriptions to your projects list
        setProjects(
          updates.rephrasedProjects.map((item) => ({
            title: item.originalTitle,
            description: item.tailoredDescription,
          }))
        );
      } catch (err: any) {
        setError(err.message || 'Failed to tailor content. Please check the URL.');
      }
    });
  };

  return (
    <main style={{ maxWidth: '750px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 16px', color: '#7d8ea4' }}>
      
      {/* Control Bar: Paste job link to tailor instantly */}
      <form 
        onSubmit={handleTailor} 
        style={{ 
          display: 'flex', 
          gap: '8px', 
          marginBottom: '32px', 
          background: '#f1f5f9', 
          padding: '16px', 
          borderRadius: '8px',
          border: '1px solid #cbd5e1'
        }}
      >
        <input
          type="url"
          required
          placeholder="Paste Job Description URL (e.g. Greenhouse link)..."
          value={jobUrl}
          onChange={(e) => setJobUrl(e.target.value)}
          style={{ flex: 1, padding: '10px', fontSize: '15px', borderRadius: '4px', border: '1px solid #94a3b8' }}
        />
        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '10px 20px',
            fontSize: '15px',
            fontWeight: '600',
            borderRadius: '4px',
            background: isPending ? '#94a3b8' : '#2563eb',
            color: '#fff',
            border: 'none',
            cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {isPending ? 'Tailoring...' : 'Tailor Page'}
        </button>
      </form>

      {error && (
        <div style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fca5a5', padding: '12px', borderRadius: '4px', marginBottom: '24px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* YOUR WEBSITE CONTENT */}
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: '#8796b7' }}>{headline}</h1>
        <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>
          <strong>Location:</strong> {location}
        </p>
      </header>

      <section style={{ marginBottom: '32px' }}>
        <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px' }}>Skills</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {skills.map((skill, idx) => (
            <span 
              key={idx} 
              style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '16px', fontSize: '14px', fontWeight: '500' }}
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '6px', marginBottom: '12px' }}>Interests</h3>
        <p style={{ lineHeight: '1.6', color: '#8796b7' }}>{interests}</p>
      </section>

      <section>
        <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '6px', marginBottom: '16px' }}>Projects</h3>
        {projects.map((project, idx) => (
          <div key={idx} style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '18px' }}>{project.title}</h4>
            <p style={{ margin: 0, lineHeight: '1.6', color: '#475569' }}>{project.description}</p>
          </div>
        ))}
      </section>

    </main>
  );
}