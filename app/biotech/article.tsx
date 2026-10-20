"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "../biotech/article.css";

const BrainScene = dynamic(() => import("./brain"), { ssr: false, loading: () => null });

interface ArticleData {
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  date: string;
  tags: string[];
  githubUrl: string;
  sections: {
    label: string;
    body: React.ReactNode;
  }[];
}

const article: ArticleData = {
  slug: "volition-neural-control",
  title: "From brainwaves to robotic hands",
  subtitle:
    "How I built an EEG-to-prosthetic control interface — turning raw neural signals into a graph-neural-network model that drives a robotic hand.",
  author: "Caleb Liu",
  date: "2026",
  tags: ["Neuroscience", "Robotics", "GNN", "EEG", "PyTorch"],
  githubUrl: "https://github.com/mc-rizzy/volition",
  sections: [
    {
      label: "The problem",
      body: (
        <p>
          Raw EEG recordings are messy — muscle artifacts, electrical noise, and
          overlapping signals all mixed together. The goal was to extract the specific
          motor-cortex intent needed to control a robotic prosthetic hand, and to do it
          reliably enough to be useful outside the lab.
        </p>
      ),
    },
    {
      label: "The approach",
      body: (
        <>
          <p>
            I built an AI mechanical-code bridge: a feature-extraction pipeline that
            isolates the relevant neural signals, feeding them into a graph neural
            network that maps neural intent onto robotic hand movements.
          </p>
          <p>
            The key was treating the data as the hard part — cleaning, annotating, and
            validating the recordings before modeling, so the network learned real
            intent rather than noise.
          </p>
        </>
      ),
    },
    {
      label: "The result",
      body: (
        <>
          <p>
            The interface translates neural intent into robotic hand movements with
            enough fidelity to demonstrate closed-loop control — the hand responds to
            the user's intent, not just their physical motion.
          </p>
          <p>
            This is the kind of work that pairs brain-computer interfaces with
            assistive robotics to restore agency for people who need it.
          </p>
        </>
      ),
    },
  ],
};

export default function ArticleTemplate() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="art-root">
      <div className="art-bg">
        <BrainScene />
      </div>
      <div className="art-scrim" />

      <nav className={`art-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="art-logo">Volition</div>
        <ul className="art-nav-links">
          <li><a href="/biotech" className="active">Biotech</a></li>
          <li><a href="/biotech#projects">Projects</a></li>
          <li><a href="https://github.com/mc-rizzy" target="_blank" rel="noopener noreferrer">GitHub</a></li>
        </ul>
      </nav>

      <div className="art-main">
        <article className="art-body">
          <div className="art-meta">
            <span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400" />
              {article.date}
            </span>
            <span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400" />
              {article.tags.join(" · ")}
            </span>
            <span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
              {article.author}
            </span>
          </div>

          <h1 className="art-title">
            {article.title.split(" ").map((word, i) =>
              i === 0 ? (
                <span key={i} className="grad">
                  {word}
                </span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </h1>

          <p className="art-lede">{article.subtitle}</p>

          <div className="art-actions">
            <a href={article.githubUrl} target="_blank" rel="noopener noreferrer" className="art-btn art-btn-primary">
              View the code
            </a>
            <a href="/biotech#projects" className="art-btn art-btn-ghost">
              ← Back to projects
            </a>
          </div>

          {article.sections.map((section, i) => (
            <section key={section.label} className="art-section">
              <div className="art-section-head">
                <span className="art-section-label">{i + 1}. {section.label}</span>
                <div className="art-line" />
              </div>
              <div className="art-body-text">{section.body}</div>
            </section>
          ))}

          <div className="art-callout">
            <p>
              The real challenge wasn't the model — it was the data. Clean, well-annotated
              neural recordings turned a research curiosity into something reproducible.
            </p>
          </div>

          <div className="art-stats">
            <div className="art-stat">
              <div className="art-stat-num">EEG</div>
              <div className="art-stat-label">Motor-cortex signal isolation from noisy recordings</div>
            </div>
            <div className="art-stat">
              <div className="art-stat-num">GNN</div>
              <div className="art-stat-label">Graph neural network mapping intent to hand movement</div>
            </div>
            <div className="art-stat">
              <div className="art-stat-num">Closed-loop</div>
              <div className="art-stat-label">Hand responds to neural intent, not physical motion</div>
            </div>
          </div>
        </article>
      </div>

      <footer className="art-footer">
        <div className="art-footer-inner">
          <div className="art-logo" style={{ fontSize: "1rem" }}>Volition</div>
          <ul className="art-socials">
            <li><a href="https://github.com/mc-rizzy" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            <li><a href="https://linkedin.com/in/caleb-liu0/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
            <li><a href="mailto:hello@calebliu.com">Email</a></li>
          </ul>
          <div className="art-copy">© {new Date().getFullYear()} Caleb Liu. Built with React Three Fiber.</div>
        </div>
      </footer>
    </div>
  );
}
