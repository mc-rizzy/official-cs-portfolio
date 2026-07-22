"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function Cursor() {
  const [visible, setVisible] = useState(false);
  const [touchingInvisible, setTouchingInvisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 40, stiffness: 600, mass: 0.3 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  useEffect(() => {
    if ("ontouchstart" in window) return;

    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!visible && !touchingInvisible) setVisible(true);
    };
    const leave = () => setVisible(false);
    const enter = () => setVisible(true);

    const hoverStart = () => setHovering(true);
    const hoverEnd = () => setHovering(false);
    
    const hideStart = () => {setTouchingInvisible(true); setVisible(false);};
    const hideEnd = () => {setTouchingInvisible(false); setVisible(true);};

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseleave", leave);
    window.addEventListener("mouseenter", enter);

    const wire = () => {
      document.querySelectorAll("a, button, [data-hover]").forEach((el) => {
        el.addEventListener("mouseenter", hoverStart);
        el.addEventListener("mouseleave", hoverEnd);
      });
      document.querySelectorAll("[data-nopointer]").forEach((el) => {
        el.addEventListener("mouseenter", hideStart);
        el.addEventListener("mouseleave", hideEnd);
      });
    };
    wire();
    const obs = new MutationObserver(wire);
    obs.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", leave);
      window.removeEventListener("mouseenter", enter);
      obs.disconnect();
    };
  }, [cursorX, cursorY, visible]);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 z-[1000000] pointer-events-none mix-blend-difference"
        style={{ x: springX, y: springY }}
        animate={{ opacity: visible ? 1 : 0, scale: hovering ? 0.4 : 1 }}
        transition={{ scale: { duration: 0.15 } }}
      >
        <div className="w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2" style={{backgroundColor:"var(--color-accent)"}}/>
      </motion.div>
      <motion.div
        className="fixed top-0 left-0 z-[1000000] pointer-events-none"
        style={{ x: springX, y: springY }}
        animate={{
          opacity: visible ? 1 : 0,
          width: hovering ? 52 : 32,
          height: hovering ? 52 : 32,
        }}
        transition={{ width: { duration: 0.2 }, height: { duration: 0.2 } }}
      >
        <div
          className="rounded-full border -translate-x-1/2 -translate-y-1/2 w-full h-full transition-[border-color] duration-200"
          style={{
            borderColor: hovering
              ? "var(--color-accent-opaque)"
              : "var(--color-accent-subtle)",
          }}
        />
      </motion.div>
    </>
  );
}
