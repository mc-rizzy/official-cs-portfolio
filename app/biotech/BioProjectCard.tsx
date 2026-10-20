"use client";

import React from "react";
import { m, LazyMotion, domAnimation } from "framer-motion";
import { GitBranch, Play, Dna, Brain, Activity } from "lucide-react";

export interface BioProjectData {
  title: string;
  description: string;
  category: "Research" | "Prototype" | "Publication";
  tags: string[];
  githubUrl?: string;
  featuredMetric?: string;
  /** Video demonstration placeholder (e.g. a recording / demo link). */
  videoUrl?: string;
  /** Caption shown under the video placeholder. */
  videoLabel?: string;
  /** Optional image shown above the video. */
  image?: string;
}

interface BioProjectCardProps {
  project: BioProjectData;
  index: number;
}

const categoryMeta: Record<
  BioProjectData["category"],
  { icon: React.ReactNode; color: string }
> = {
  Prototype: {
    icon: <Activity className="h-3.5 w-3.5 text-teal-300" />,
    color: "text-teal-300",
  },
  Publication: {
    icon: <Brain className="h-3.5 w-3.5 text-sky-300" />,
    color: "text-sky-300",
  },
  Research: {
    icon: <Dna className="h-3.5 w-3.5 text-emerald-300" />,
    color: "text-emerald-300",
  },
};

export const BioProjectCard: React.FC<BioProjectCardProps> = ({ project, index }) => {
  const meta = categoryMeta[project.category];

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        layout
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.06, ease: "easeOut" }}
        whileHover={{ y: -6 }}
        className="relative flex flex-col justify-between p-6 h-full bg-zinc-950/40 border border-zinc-800/70 rounded-2xl group will-change-transform hover:border-teal-500/40 transition-colors duration-300 backdrop-blur-sm"
      >
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
              {meta.icon}
              <span>{project.category}</span>
            </div>
            {project.featuredMetric && (
              <span className="text-[11px] font-semibold tracking-wider text-teal-300 font-mono">
                {project.featuredMetric}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors duration-200 leading-snug">
            {project.title}
          </h3>

          <p className="mt-2.5 text-sm text-zinc-400 leading-relaxed">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-4">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded font-mono text-zinc-400 bg-zinc-900 border border-zinc-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Video demonstration + github */}
        <div className="mt-5 pt-4 border-t border-zinc-800/60">
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr),1.4fr] gap-4 items-stretch">
            {/* Text column */}
            <div className="flex flex-col justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
                <GitBranch className="h-3.5 w-3.5" /> Code
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-300 hover:text-teal-200 transition-colors"
                  >
                    {project.githubUrl.replace("https://github.com/", "")}
                  </a>
                )}
              </div>
              <div className="text-[11px] text-zinc-500 leading-relaxed">
                Deep research + full-process engineering — from raw, messy data to a
                working, reproducible result.
              </div>
            </div>

            {/* Video demonstration column */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/60 group/video">
              {project.image ? (
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover/video:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-zinc-900/40 to-cyan-500/10" />
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-300">
                <span className="relative flex h-12 w-12">
                  <span
                    className="absolute inset-0 rounded-full bg-teal-400/20 blur-md"
                    aria-hidden
                  />
                  <span className="relative flex items-center justify-center">
                    <Play className="h-5 w-5 fill-current" />
                  </span>
                </span>
                <span className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
                  {project.videoLabel ?? "Watch the demo"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.02] transition-opacity duration-300 bg-white rounded-2xl pointer-events-none" />
      </m.div>
    </LazyMotion>
  );
};

export default BioProjectCard;
