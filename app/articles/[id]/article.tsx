"use client";

import type { ArticleData } from "../types";

/* ------------------------------------------------------------------ */
/*  ArticlePage — renders a single article from resolved ArticleData. */
/*                                                                    */
/*  Hero : hero media (video or still) + intro laid out side by side */
/*  Body : sections interleaved in document order                    */
/*            • paragraph  → centered prose block                    */
/*            • image      → full-bleed figure w/ caption            */
/*            • video      → figure w/ animated media + caption      */
/*            • stats      → "At a glance" metric cards              */
/*            • callout    → highlighted pull-quote                  */
/* ------------------------------------------------------------------ */

import { useEffect, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import "../article.css";

// The 3D hero media is rendered client-side only.
const BrainScene = dynamic(() => import("../../biotech/brain"), {
  ssr: false,
  loading: () => null,
});

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function MetaRow({ article }: { article: ArticleData }) {
  return (
    <div className="art-meta">
      <span>{article.date ? formatDate(article.date) : ""}</span>
      <span>{article.author}</span>
      <span>{article.tags.length} tags</span>
    </div>
  );
}

function Hero({ article }: { article: ArticleData }) {
  const { hero, intro } = article;
  return (
    <div className="art-hero">
      <div className="art-hero-media">
        {hero.video ? (
          <div className="art-video-wrap">
            <BrainScene />
            <span className="art-video-badge">{hero.videoLabel}</span>
          </div>
        ) : (
          <div className="art-hero-media-placeholder" />
        )}
      </div>
      <div className="art-hero-text">
        <MetaRow article={article} />
        <h1 className="art-title">
          <span className="grad">{article.title}</span>
        </h1>
        <p className="art-lede">{intro}</p>
        <div className="art-actions">
          <a
            className="art-btn art-btn-primary"
            href={article.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Read on GitHub
          </a>
          <a className="art-btn art-btn-ghost" href="/articles">
            All articles
          </a>
        </div>
      </div>
    </div>
  );
}

function Section({
  section,
  index,
}: {
  section: ArticleData["sections"][0];
  index: number;
}) {
  if (section.type === "paragraph") {
    return (
      <div className="art-section">
        {section.label && (
          <div className="art-section-head">
            <span className="art-section-label">{section.label}</span>
            <span className="art-line" />
          </div>
        )}
        <div className="art-body-text">
          <p>{section.body}</p>
        </div>
      </div>
    );
  }

  if (section.type === "video") {
    return (
      <div className="art-section">
        <div className="art-section-head">
          <span className="art-section-label">{section.label ?? "Demonstration"}</span>
          <span className="art-line" />
        </div>
        <div className="art-figure">
          <div className="art-video-wrap">
            <BrainScene />
            <span className="art-video-badge">{section.label}</span>
          </div>
        </div>
        {section.caption && <p className="art-caption">{section.caption}</p>}
      </div>
    );
  }

  if (section.type === "image") {
    return (
      <div className="art-section">
        <div className="art-figure">
          <div className="art-figure-inner">
            <div className="art-figure-scrim" />
            <div className="art-figure-label">{section.label}</div>
          </div>
        </div>
        {section.caption && <p className="art-caption">{section.caption}</p>}
      </div>
    );
  }

  if (section.type === "stats") {
    return (
      <div className="art-section">
        <div className="art-section-head">
          <span className="art-section-label">At a glance</span>
          <span className="art-line" />
        </div>
        <div className="art-stats">
          {section.items?.map((item, i) => (
            <div className="art-stat" key={i}>
              <div className="art-stat-num">{item.num}</div>
              <div className="art-stat-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section.type === "callout") {
    return (
      <div className="art-section">
        <div className="art-callout">
          <p>{section.body}</p>
        </div>
      </div>
    );
  }

  return null;
}

/* ------------------------------------------------------------------ */
/*  Page — renders the resolved article data.                        */
/* ------------------------------------------------------------------ */

export default function ArticlePage({
  article,
  id,
}: {
  article: ArticleData | null;
  id: string;
}) {
  return (
    <div className="art-root">
      <nav className="art-nav">
        <div className="art-nav-links">
          <a href="/articles">Articles</a>
        </div>
        <div className="art-logo">Caleb Liu</div>
      </nav>

      <main className="art-main">
        {article && (
          <>
            <Hero article={article} />
            <div className="art-body">
              {article.sections.map((section, index) => (
                <Section key={`${article.slug}-${index}`} section={section} index={index} />
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="art-footer">
        <div className="art-footer-inner">
          <div className="art-logo" style={{ fontSize: "1rem" }}>
            Caleb Liu
          </div>
          <ul className="art-socials">
            <li>
              <a
                href="https://github.com/mc-rizzy"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://linkedin.com/in/caleb-liu0/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a href="mailto:hello@calebliu.com">Email</a>
            </li>
          </ul>
          <div className="art-copy">
            © {new Date().getFullYear()} Caleb Liu. Built with React Three Fiber.
          </div>
        </div>
      </footer>
    </div>
  );
}
