"use client";

import React from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { Database, Code } from "lucide-react";

interface TechItem {
  name: string;
  category: "frontend" | "backend" | "data-lang";
  iconUrl?: string;
  FallbackIcon?: React.ComponentType<{ className?: string }>;
  color: string;
}

const technologies: TechItem[] = [
  { name: "Next.js", category: "frontend", iconUrl: "nextdotjs", color: "hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]" },
  { name: "React.js", category: "frontend", iconUrl: "react", color: "hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]" },
  { name: "Vue", category: "frontend", iconUrl: "vuedotjs", color: "hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(52,211,153,0.2)]" },
  { name: "Tailwind", category: "frontend", iconUrl: "tailwindcss", color: "hover:border-sky-400 hover:shadow-[0_0_15px_rgba(56,189,248,0.2)]" },
  { name: "Javascript", category: "data-lang", iconUrl: "javascript", color: "hover:border-yellow-400 hover:shadow-[0_0_15px_rgba(250,204,21,0.2)]" },
  { name: "Typescript", category: "data-lang", iconUrl: "typescript", color: "hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]" },
  { name: "Node.js", category: "backend", iconUrl: "nodedotjs", color: "hover:border-green-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]" },
  { name: "Python", category: "data-lang", iconUrl: "python", color: "hover:border-blue-400 hover:shadow-[0_0_15px_rgba(96,165,250,0.2)]" },
  { name: "PyTorch", category: "backend", iconUrl: "pytorch", color: "hover:border-orange-500 hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]" },
  { name: "Java", category: "data-lang", iconUrl: "oracle", color: "hover:border-red-400 hover:shadow-[0_0_15px_rgba(248,113,113,0.2)]" },
  { name: "C++", category: "data-lang", iconUrl: "cplusplus", color: "hover:border-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]" },
  { name: "C#", category: "data-lang", iconUrl: "csharp", color: "hover:border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]" },
  { name: "MongoDB", category: "backend", iconUrl: "mongodb", color: "hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]" },
  { name: "SQL", category: "backend", FallbackIcon: Database, color: "hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03 }, // Slightly faster cascade for snappier feel
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "tween", duration: 0.25 } }, // Using simple tween instead of spring saves CPU calculations
} as const;

export default function TechStack() {
  return (
    <LazyMotion features={domAnimation}>
      <div className="w-full max-w-5xl mx-auto px-4 py-12 dark:bg-zinc-950 rounded-2xl">
        <div className="mb-8 text-center md:text-left">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
            My Toolkit
          </h2>
          <p className="mt-2 text-zinc-400">
            The languages, frameworks, and tools I use to bring ideas to life.
          </p>
        </div>

        <m.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          {technologies.map((tech) => {
            const Fallback = tech.FallbackIcon || Code;
            
            return (
              <m.div
                key={tech.name}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.01 }}
                className={`relative flex flex-col items-center justify-center p-6 bg-zinc-900/70 border border-zinc-800 rounded-xl transition-all duration-200 group cursor-default will-change-transform ${tech.color}`}
              >
                {/* Logo / Icon Container */}
                <div className="h-12 w-12 flex items-center justify-center text-zinc-400 group-hover:text-zinc-100 transition-colors duration-200 mb-3">
                  {tech.iconUrl ? (
                    <img
                      src={`https://unpkg.com/simple-icons@v11/icons/${tech.iconUrl}.svg`}
                      alt={`${tech.name} logo`}
                      className="h-8 w-8 invert opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200 dark:brightness-200"
                      loading="lazy" // Ensures images don't block initial page render
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Fallback className="h-8 w-8 opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200" />
                  )}
                </div>

                {/* Technology Name */}
                <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-100 transition-colors duration-200 tracking-wide text-center">
                  {tech.name}
                </span>
                
                {/* Background glow alternative */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.02] transition-opacity duration-200 bg-white rounded-xl pointer-events-none" />
              </m.div>
            );
          })}
        </m.div>
      </div>
    </LazyMotion>
  );
}