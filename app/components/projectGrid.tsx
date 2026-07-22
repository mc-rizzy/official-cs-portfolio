"use client";

import React, { useState } from "react";
import { LazyMotion, domAnimation, AnimatePresence, m } from "framer-motion";
import { ProjectCard, ProjectData } from "./projectCard";

// Mock Projects Array configured to cleanly match your tech stack properties
const initialProjects: ProjectData[] = [
  {
    title: "AI Predictive Analytics Dashboard",
    description: "Highly interactive Next.js application displaying modular accuracy arrays, leveraging a backend processing stream built via PyTorch and custom Python architecture scripts.",
    category: "AI & Data",
    tags: ["Next.js", "PyTorch", "Python", "Tailwind"],
    githubUrl: "https://github.com",
    liveUrl: "https://example.com",
    featuredMetric: "98.4% ACC"
  },
  {
    title: "Ultra-Fast Physics Simulation Engine",
    description: "High-performance mathematical engine rendering complex spatial mechanics calculations and thread synchronization using optimized low-level C++ paradigms.",
    category: "System / Engine",
    tags: ["C++", "System Architecture", "Mathematics"],
    githubUrl: "https://github.com",
    featuredMetric: "< 2ms Latency"
  },
  {
    title: "Full-Stack Enterprise Cloud System",
    description: "Cloud workflow system combining robust React frontends with heavy Java microservices and C# middleware clusters, backed by persistent MongoDB data storage layers.",
    category: "Web App",
    tags: ["React.js", "Java", "C#", "MongoDB"],
    githubUrl: "https://github.com",
    liveUrl: "https://example.com",
    featuredMetric: "99.9% UPTIME"
  },
  {
    title: "SQL Performance Query Optimizer",
    description: "A database utility written in Python that parses complex diagnostic paths, analyzing key indexes to speed up heavy data pipelines by rewriting multi-join expressions.",
    category: "AI & Data",
    tags: ["Python", "SQL", "Database Optimization"],
    githubUrl: "https://github.com",
    featuredMetric: "4x Query Speed"
  },
  {
    title: "Vue Real-Time E-Commerce Engine",
    description: "A serverless storefront platform showcasing reactive rendering states, synchronized fully with dynamic Node.js edge APIs and webhooks.",
    category: "Web App",
    tags: ["Vue", "Node.js", "Tailwind", "Javascript"],
    githubUrl: "https://github.com",
    liveUrl: "https://example.com"
  }
];

type CategoryFilter = "All" | "Web App" | "AI & Data" | "System / Engine";

export default function ProjectsGrid() {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("All");

  const categories: CategoryFilter[] = ["All", "Web App", "AI & Data", "System / Engine"];

  // Perform lightweight functional filtering
  const filteredProjects = activeFilter === "All"
    ? initialProjects
    : initialProjects.filter((p) => p.category === activeFilter);

  return (
    <LazyMotion features={domAnimation}>
      <div id="section4" className="w-full max-w-5xl mx-auto px-4 py-16 dark:bg-zinc-950 rounded-2xl">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
              Selected Works
            </h2>
            <p className="mt-2 text-zinc-400 max-w-md">
              A curated collection of production applications, deep learning architectures, and native engines.
            </p>
          </div>

          {/* Filtering Tabs */}
          <div className="flex flex-wrap justify-center gap-1.5 p-1 bg-zinc-900/60 border border-zinc-800/80 rounded-xl backdrop-blur-sm self-center md:self-end">
            {categories.map((category) => {
              const isActive = activeFilter === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={`relative px-4 py-2 text-xs font-medium rounded-lg transition-colors duration-200 focus:outline-none ${
                    isActive ? "text-zinc-950" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {isActive && (
                    <m.span
                      layoutId="activeTabGlow"
                      className="absolute inset-0 bg-zinc-100 rounded-lg will-change-transform"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{category}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Animate Grid */}
        <m.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.title} project={project} />
            ))}
          </AnimatePresence>
        </m.div>

      </div>
    </LazyMotion>
  );
}