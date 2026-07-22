"use client";
import { JSX, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import "../home.css";
import React from "react";

interface HeroTextProps {
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  simulate: React.MutableRefObject<boolean>;
}

const textData = [
  { content: "Hi, I'm ", type: "h1" as const, className: "hero-greeting", newLine: false },
  { content: "Caleb", type: "h1" as const, mode: "highlight", className: "hero-name", newLine: true },
  { content: "Computer Science    Business Analytics    Finance", type: "p" as const, newLine: true },
  { content: "Bridging raw data infrastructure to executive strategy", type: "p" as const, className: "hero-subheading", newLine: true },
  { content: "Clean automated production-grade data pipelines", type: "p" as const, className: "hero-subheading", newLine: true },
  { content: "Messy corporate datasets -> optimize metrics and revenue", type: "p" as const, className: "hero-scroller", newLine: true },
  { content: "Open to 2027 internships", type: "p" as const, className: "hero-scroller", newLine: true },
];

export const InteractiveLetter = React.memo(function({ letter, type, mode, mouse, containerRef, simulate }: { 
  letter: string; 
  mode?: string; 
  type?: string;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  simulate: React.MutableRefObject<boolean>;
}) {
  const letterRef = useRef<HTMLSpanElement>(null);
  
  const animX = useMotionValue(0);
  const animY = useMotionValue(0);

  const springConfig = { damping: 12, stiffness: 130, mass: 0.3 };
  const springX = useSpring(animX, springConfig);
  const springY = useSpring(animY, springConfig);

  useEffect(() => {
    let animationFrameId: number;

    const updatePhysics = () => {
      if (!letterRef.current || !containerRef.current || !simulate.current) {
        animationFrameId = requestAnimationFrame(updatePhysics);
        return;
      }

      const rect = letterRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      const letterCenterX = rect.left + rect.width / 2;
      const letterCenterY = rect.top + rect.height / 2;

      const currentMouseX = mouse.current.x;
      const currentMouseY = mouse.current.y;

      const dx = letterCenterX - currentMouseX;
      const dy = letterCenterY - currentMouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const mouseRadius = 80;
      const mouseForce = 40; 

      if (distance < mouseRadius && distance > 0) {
        const force = (mouseRadius - distance) / mouseRadius;

        animX.set((dx / distance) * force * mouseForce);
        animY.set((dy / distance) * force * mouseForce);
      } else {
        animX.set(0);
        animY.set(0);
      }

      animationFrameId = requestAnimationFrame(updatePhysics);
    };

    animationFrameId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mouse, containerRef, animX, animY]);

  const randomX = (Math.random() - 0.5) * 300;
  const randomY = -150 - Math.random() * 150;

  return (
    <motion.span
      ref={letterRef}
      className={`letter-span ${mode || ""}`}
      style={{ 
        x: springX, 
        y: springY,
        display: "inline-block",
        position: "relative",
        marginBottom: "10px"
      }}
      initial={{ opacity: 0, x: randomX, y: randomY }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 45,
        damping: 12,
        delay: Math.random() * 0.5 
      }}
    >
      {letter === " " ? 
          type === "h1" ? "\u00A0\u00A0" : "\u00A0\u00A0\u00A0"
        : letter}
    </motion.span>
  );
});

export default function HeroText({ mouse, simulate }: HeroTextProps) {
  const heroTextRef = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);

  const totalLetters = textData.reduce(
    (acc, obj) => acc + obj.content.length,
    0
  );

  useEffect(() => {
    if (visibleCount < totalLetters) {
      // Chunk size: reveal 5-10 letters per frame
      const frame = requestAnimationFrame(() => {
        setVisibleCount((prev) => Math.min(prev + 5, totalLetters));
      });

      return () => cancelAnimationFrame(frame);
    }
  }, [visibleCount, totalLetters]);

  const renderRows = () => {
    const rows: JSX.Element[][] = [[]];
    let globalIndex = 0;
    
    textData.forEach((textObj, index) => {
      const Tag = textObj.type;
      const letters = Array.from(textObj.content).map((letter, i) => {
        const currentLetterIdx = globalIndex++;
        const isVisible = currentLetterIdx < visibleCount;

        if (!isVisible) {
          return (
            <span
              key={`${index}-${i}`}
              className="inline-block opacity-0 min-w-[0.2em]"
            >
              {letter}
            </span>
          );
        }

        return(
          <InteractiveLetter
            key={`${index}-${i}`}
            letter={letter}
            mode={textObj.mode}
            type={textObj.type}
            mouse={mouse}
            containerRef={heroTextRef}
            simulate={simulate}
          />
        )
      });

      const element = (
        <Tag key={index} className="text-element">
          {letters}
        </Tag>
      );

      rows[rows.length - 1].push(element);

      if (textObj.newLine && index < textData.length - 1) {
        rows.push([]);
      }
    });

    return rows.map((row, rIndex) => (
      <div key={rIndex} className="hero-row">
        {row}
      </div>
    ));
  };

  return (
    <div ref={heroTextRef} className="hero-container">
      {renderRows()}
    </div>
  );
}