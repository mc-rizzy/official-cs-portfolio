"use client";

import React from "react";
import { m } from "framer-motion";
import { ExternalLink, Terminal, Globe, Brain } from "lucide-react";

export interface ProjectData {
  title: string;
  description: string;
  category: "Web App" | "AI & Data" | "System / Engine" | "Blockchain";
  tags: string[];
  liveUrl?: string;
  githubUrl?: string;
  featuredMetric?: string;
}

interface ProjectCardProps {
  project: ProjectData;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  // Map categories to dynamic decorative icons
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "AI & Data": return <Brain className="h-4 w-4 text-orange-400" />;
      case "System / Engine": return <Terminal className="h-4 w-4 text-indigo-400" />;
      default: return <Globe className="h-4 w-4 text-cyan-400" />;
    }
  };

  return (
    <m.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      whileHover={{ y: -4 }}
      className="relative flex flex-col justify-between p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-xl group will-change-transform hover:border-zinc-700/50 transition-colors duration-300 backdrop-blur-sm"
    >
      <div>
        {/* Top bar of card */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-xs font-medium text-zinc-400">
            {getCategoryIcon(project.category)}
            <span>{project.category}</span>
          </div>
          
          {project.featuredMetric && (
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400 font-mono">
              {project.featuredMetric}
            </span>
          )}
        </div>

        {/* Title & Body */}
        <h3 className="text-xl font-bold text-zinc-100 group-hover:text-white transition-colors duration-200">
          {project.title}
        </h3>
        
        <p className="mt-2.5 text-sm text-zinc-400 line-clamp-3 leading-relaxed">
          {project.description}
        </p>
      </div>

      {/* Footer / Info Blocks */}
      <div className="mt-6 pt-4 border-t border-zinc-800/60">
        {/* Tech tags list */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2 py-0.5 rounded font-mono text-zinc-400 bg-zinc-900 border border-zinc-800/40"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action Links */}
        <div className="flex items-center gap-4 text-zinc-400">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium hover:text-zinc-100 transition-colors"
            >
                {/* Inline SVG for GitHub */}
                <svg 
                className="h-3.5 w-3.5" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
                Code
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium hover:text-zinc-100 transition-colors text-cyan-400/90 hover:text-cyan-400"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Live Demo
            </a>
          )}
        </div>
      </div>
      
      {/* Dynamic background card sheen */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.01] transition-opacity duration-300 bg-white rounded-xl pointer-events-none" />
    </m.div>
  );
};