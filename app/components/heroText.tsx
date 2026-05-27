"use client";
import { JSX, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import "../home.css";

interface HeroTextProps {
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}

const textData = [
  { content: "Hi, I'm ", type: "h1" as const, className: "hero-greeting", newLine: false },
  { content: "Cracked", type: "h1" as const, mode: "highlight", className: "hero-name", newLine: true },
  { content: "Haha lol, no actually my name is Caleb.", type: "p" as const, newLine: true },
  { content: "I'm a programmer", type: "p" as const, className: "hero-subheading", newLine: true },
  { content: "with a specialty in AI and Robotics.", type: "p" as const, className: "hero-subheading", newLine: true },
  { content: "Scroll down for more info! :D", type: "p" as const, className: "hero-scroller", newLine: true },
];

function InteractiveLetter({ letter, mode, mouse, containerRef }: { 
  letter: string; 
  mode?: string; 
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  containerRef: React.RefObject<HTMLDivElement | null>;
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
      if (!letterRef.current || !containerRef.current) {
        animationFrameId = requestAnimationFrame(updatePhysics);
        return;
      }

      const rect = letterRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      // letter center relative to viewport
      const letterCenterX = rect.left + rect.width / 2;
      const letterCenterY = rect.top + rect.height / 2;

      // mouse coordinates adjusted to viewport
      const currentMouseX = mouse.current.x;
      const currentMouseY = mouse.current.y;

      const dx = letterCenterX - currentMouseX;
      const dy = letterCenterY - currentMouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const mouseRadius = 80;
      const mouseForce = 40; 

      if (distance < mouseRadius && distance > 0) {
        const force = (mouseRadius - distance) / mouseRadius;
        // Pushes letters away from mouse position
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

  // Initial explosive random entry offset
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
        position: "relative"
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
      {/* Non-breaking space prevents standard layout collapsing */}
      {letter === " " ? "\u00A0" : letter}
    </motion.span>
  );
}

export default function HeroText({ mouse }: HeroTextProps) {
  const heroTextRef = useRef<HTMLDivElement | null>(null);

  // Helper function to group items into rows based on the newLine trigger
  const renderRows = () => {
    const rows: JSX.Element[][] = [[]];
    
    textData.forEach((textObj, index) => {
      const Tag = textObj.type;
      const letters = Array.from(textObj.content).map((letter, i) => (
        <InteractiveLetter
          key={`${index}-${i}`}
          letter={letter}
          mode={textObj.mode}
          mouse={mouse}
          containerRef={heroTextRef}
        />
      ));

      // Wrap the characters in their semantic tag (h1, p)
      const element = (
        <Tag key={index} className="text-element">
          {letters}
        </Tag>
      );

      rows[rows.length - 1].push(element);

      // If this object forces a new line, start a fresh row array
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