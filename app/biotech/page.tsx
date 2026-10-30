"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "../biotech/biotech.css";
import BioProjectCard, { type BioProjectData } from "./BioProjectCard";
import ContactForm from "../components/contactForm";

const BrainScene = dynamic(() => import("./brain"), { ssr: false, loading: () => null });

const bioProjects: BioProjectData[] = [
  {
    title: "EEG-to-Prosthetic Control Interface",
    description:
      "Built an AI mechanical-code bridge that lets a graph neural network read raw EEG brainwaves and translate neural intent into robotic hand movements. Developed feature extraction pipelines to isolate motor-cortex signals from noisy recordings.",
    category: "Prototype",
    tags: ["PyTorch", "EEG", "GNN", "Robotics", "C++"],
    githubUrl: "https://github.com/mc-rizzy/volition",
    featuredMetric: "GNN → Hand",
    videoLabel: "Neural intent → robotic hand",
  },
  {
    title: "Autism vs. Neurotypical Motor Analysis",
    description:
      "Researched and quantified differences in motor-function signatures between autistic and neurotypical subjects, turning clinical observations into a structured, reproducible dataset for downstream ML classification.",
    category: "Research",
    tags: ["Signal Processing", "ML", "Clinical Data", "Python"],
    featuredMetric: "n=2 cohorts",
    videoLabel: "Motor signature study",
  },
  {
    title: "Neural Signal Processing Pipeline",
    description:
      "Designed an end-to-end data pipeline for cleaning, annotating, and feature-extracting neural recordings — the kind of messy-to-production data work that powers reliable biotech research models.",
    category: "Research",
    tags: ["Signal Processing", "Data Pipeline", "PyTorch", "SQL"],
    featuredMetric: "< 5% drift",
    videoLabel: "Pipeline walkthrough",
  },
  {
    title: "Biotech Research Whitepaper",
    description:
      "Authored a technical whitepaper on applying neural decoding to assistive robotics, covering methodology, reproducibility, and the clinical path from lab prototype to real-world assistive device.",
    category: "Publication",
    tags: ["Paper", "Robotics", "Neuroscience", "Writing"],
    featuredMetric: "Peer-reviewed",
    videoLabel: "Read the paper",
  },
  {
    title: "IBM Research Collaboration",
    description:
      "Contributed to IBM research efforts on neural-computing and brain-inspired architectures, applying deep-learning techniques to structured biomedical data and hardware-accelerated inference.",
    category: "Research",
    tags: ["IBM", "Neural Computing", "BioML", "Inference"],
    featuredMetric: "HW-accelerated",
    videoLabel: "IBM research work",
  },
  {
    title: "Healthcare Data Automation",
    description:
      "Automated health-record cleaning and validation workflows, removing the messy-data bottleneck that slows biotech research — turning unstructured clinical records into model-ready tables.",
    category: "Prototype",
    tags: ["Python", "ETL", "Health Records", "Automation"],
    featuredMetric: "4x faster",
    videoLabel: "Data automation demo",
  },
];

export default function BiotechHome() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bio-root">
      {/* Fixed 3D brain background */}
      <div className="bio-bg">
        <BrainScene />
      </div>

      {/* Fixed dark scrim for readable overlaid text */}
      <div className="bio-scrim" />

      {/* Nav */}
      <nav className={`bio-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="bio-logo">Caleb Liu</div>
        <ul className="bio-nav-links">
          <li><a href="#overview" className="active">Overview</a></li>
          <li><a href="#value">Approach</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#featured">Featured</a></li>
          <li><a href="https://github.com/mc-rizzy" target="_blank" rel="noopener noreferrer">GitHub</a></li>
        </ul>
      </nav>

      {/* Scrollable content */}
      <div className="bio-main">
        {/* Hero / Overview */}
        <section id="overview" className="bio-hero">
          <span className="bio-eyebrow">
            <span className="dot" />
            Neuroscience · Assistive Robotics · Deep Learning
          </span>
          <h1 className="bio-wordmark">
            Decoding <span className="grad">brainwaves</span> into movement
          </h1>
          <p className="bio-lede">
            I turn raw neural signals into something useful — from isolating motor-cortex
            intent in EEG recordings to feeding a graph neural network that drives a
            robotic prosthetic hand. Deep research, full-process engineering.
          </p>
          <div className="bio-actions">
            <a href="#projects" className="bio-btn bio-btn-primary">
              Explore the work
            </a>
            <a href="#featured" className="bio-btn bio-btn-ghost">
              Current project
            </a>
          </div>
          <div className="bio-scroll-hint">
            <span>Scroll</span>
          </div>
        </section>

        {/* Value / Approach */}
        <section id="value" className="bio-section">
          <div className="bio-section-head">
            <span className="bio-section-label">How I work</span>
            <div className="line" />
          </div>
          <div className="bio-value-grid">
            <div className="bio-value-card">
              <span className="bio-value-num">01</span>
              <h3 className="bio-value-title">Deep research</h3>
              <p className="bio-value-text">
                I don't just apply models — I dig into the data, the biology, and the
                failure modes. Every project starts with understanding the problem, not
                the tool.
              </p>
            </div>
            <div className="bio-value-card">
              <span className="bio-value-num">02</span>
              <h3 className="bio-value-title">Full-process engineering</h3>
              <p className="bio-value-text">
                From messy, unstructured signals to clean, reproducible pipelines. I own
                the whole flow — cleaning, feature extraction, modeling, validation.
              </p>
            </div>
            <div className="bio-value-card">
              <span className="bio-value-num">03</span>
              <h3 className="bio-value-title">Real impact</h3>
              <p className="bio-value-text">
                The goal is always agency: restoring movement, restoring function,
                restoring what a signal can mean for a person.
              </p>
            </div>
          </div>
        </section>

        {/* Projects */}
        <section id="projects" className="bio-section">
          <div className="bio-section-head">
            <span className="bio-section-label">Research & Prototypes</span>
            <div className="line" />
          </div>
          <div className="bio-grid">
            {bioProjects.map((p, i) => (
              <BioProjectCard key={p.title} project={p} index={i} />
            ))}
          </div>
        </section>

        {/* Featured project */}
        <section id="featured" className="bio-section">
          <div className="bio-section-head">
            <span className="bio-section-label">Currently Building</span>
            <div className="line" />
          </div>
          <div className="bio-featured">
            <span className="bio-status">
              <span className="pulse" />
              In development
            </span>
            <h2 className="bio-wordmark" style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)", fontWeight: 700, marginBottom: "1rem" }}>
              Volition 2.0 — Closed-loop neural control
            </h2>
            <p className="bio-lede" style={{ marginBottom: 0 }}>
              Advancing the EEG-to-prosthetic interface into a fully closed-loop system:
              continuous neural decoding, real-time intent prediction, and haptic feedback
              so the robotic hand responds to the user's intent before movement completes.
              Pairing brain-computer interfaces with assistive robotics to restore agency.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="bio-section">
          <ContactForm />
        </section>
      </div>

      {/* Footer */}
      <footer className="bio-footer">
        <div className="bio-footer-inner">
          <div className="bio-logo" style={{ fontSize: "1rem" }}>Caleb Liu</div>
          <ul className="bio-socials">
            <li><a href="https://github.com/mc-rizzy" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            <li><a href="https://linkedin.com/in/caleb-liu0/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
            <li><a href="mailto:hello@calebliu.com">Email</a></li>
          </ul>
          <div className="bio-copy">© {new Date().getFullYear()} Caleb Liu. Built with React Three Fiber.</div>
        </div>
      </footer>
    </div>
  );
}
