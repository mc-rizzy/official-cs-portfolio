'use client';

import { useEffect, useRef, useState } from "react";
import CoverBackground from "./coverBackground";
import FaceCard from "./faceCard";
import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";

import dynamic from "next/dynamic";

const HeroText = dynamic(() => import("./heroText"), { ssr: false });

const navLinks = [
  { label: "Work", href: "#section1" },
  { label: "Stack", href: "#section2" },
  { label: "Archive", href: "#section3" },
  { label: "Contact", href: "#section5" },
];

const socialLinks = [
    {content: "GitHub", url: "https://github.com/mc-rizzy"}, 
    {content: "LinkedIn", url: "https://linkedin.com/in/caleb-liu0/"}, 
    {content: "Handshake", url: "https://app.joinhandshake.com/profiles/caleb-liu"}
];

export default function HeroSection() {
    const [animationsLoaded, setAnimationsLoaded] = useState(0);
    
    // Raw mouse position normalized to -1 to 1
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const { scrollY } = useScroll();

    const sX = useSpring(mouseX, { damping: 50, stiffness: 150 });
    const sY = useSpring(mouseY, { damping: 50, stiffness: 150 });

    // Text moves OPPOSITE to mouse (negative multiplier)
    const textX = useTransform(sX, (v) => v * -18);
    const textY = useTransform(sY, (v) => v * -12);

    // Blob moves WITH mouse (positive, larger multiplier = more movement)
    const blobX = useTransform(sX, (v) => v * 30);
    const blobY = useTransform(sY, (v) => v * 20);

    const mouse = useRef({x: 0, y: 0});
    const simulateHero = useRef(true);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const isNearTop = latest < window.innerHeight/2;

        if (isNearTop !== simulateHero.current)
            simulateHero.current = isNearTop;
    });

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            mouseX.set((e.clientX / window.innerWidth) * 2 - 1);
            mouseY.set((e.clientY / window.innerHeight) * 2 - 1);
        };
        window.addEventListener("mousemove", handler, { passive: true });
        return () => window.removeEventListener("mousemove", handler);
    }, [mouseX, mouseY]);
    
    useEffect(() => {
        const handleMouseMove = (event: any) => {
            mouse.current.x = event.clientX;
            mouse.current.y = event.clientY;
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    },[]);

    return(<>
        
        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_30%,#090909_100%)]" />

        {/* ── Nav ── */}
        <motion.header
            className="relative z-20 flex items-center justify-between px-6 md:px-12 lg:px-16 py-5"
        >
            <motion.a
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 0.3, y: 0 }}
                whileHover={{ scale: 1.05, opacity: 1 }}
                whileTap={{ scale: 0.95 }}
                onAnimationComplete={() => setAnimationsLoaded((prev) => prev+1)}
                transition={
                    (animationsLoaded > navLinks.length + 1 + socialLinks.length)
                    ? { type: "spring", stiffness: 400, damping: 25 }
                    : { duration: 0.7, delay: 0.1 }
                }


                className="font-[family-name:var(--font-display)] text-bone text-2xl tracking-tight"
                data-hover
                onClick={(e) => {
                        e.preventDefault();
                        const targetElement = document.getElementById("section5");
                        
                        if (targetElement) {
                            targetElement.scrollIntoView({ behavior: "smooth" });
                            history.pushState(null, "", "#section5");
                        }
                }}
            >
            Caleb
            </motion.a>

            <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link, i) => (
                <motion.a
                key={link.label}
                href={link.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 0.3, y: 0 }}
                whileHover={{ scale: 1.05, opacity: 1 }}
                whileTap={{ scale: 0.95 }}
                onAnimationComplete={() => setAnimationsLoaded((prev) => prev+1)}
                transition={
                    (animationsLoaded > navLinks.length + 1 + socialLinks.length)
                    ? { type: "spring", stiffness: 400, damping: 25 }
                    : { duration: 0.7, delay: 0.1+0.2*i }
                }
                data-hover
                onClick={(e) => {
                    if (link.href.startsWith("#")) {
                        e.preventDefault();
                        const targetId = link.href.replace("#", "");
                        const targetElement = document.getElementById(targetId);
                        
                        if (targetElement) {
                            targetElement.scrollIntoView({ behavior: "smooth" });
                            // Update URL hash without jumping
                            history.pushState(null, "", link.href);
                        }
                    }
                }}
                className="px-4 py-2 text-[11px] text-stone hover:text-bone transition-colors duration-200 font-[family-name:var(--font-mono)] tracking-[0.14em] uppercase"
                >
                {link.label}
                </motion.a>
            ))}
            </nav>
        </motion.header>

        <CoverBackground mouse={mouse} xOffset={blobX} yOffset={blobY} simulate={simulateHero}/>

        <motion.div style={{ x: textX, y: textY }} className="will-change-transform z-10">
            <section className="hero">
                <FaceCard src="profile/faceCard.jpg" simulate={simulateHero}/>
                <HeroText mouse={mouse} simulate={simulateHero}/>
            </section>
        </motion.div>

        <div className="scroll-indicator-container">
            <span className="scroll-indicator-text">Scroll Down</span>
            <svg 
            className="scroll-indicator-svg"
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            >
            <path 
                d="M7 13L12 18L17 13M7 6L12 11L17 6" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
            </svg>
        </div>

        {/* Bottom Bar */}
        <motion.div
            className="absolute bottom-0 z-10 flex items-center justify-between px-6 md:px-12 lg:px-16 py-5"
        >
            <div className="flex items-center gap-6">
            {socialLinks.map((s, i) => (
                <motion.a
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    whileHover={{ scale: 1.05, opacity: 1 }}
                    whileTap={{ scale: 0.95 }}
                    onAnimationComplete={() => setAnimationsLoaded((prev) => prev+1)}
                    transition={
                        (animationsLoaded > navLinks.length + 1 + socialLinks.length)
                        ? { type: "spring", stiffness: 400, damping: 25 }
                        : { delay: 1 + 0.2*i }
                    }
                    
                    key={s.content}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-hover
                    className="text-[10px] font-[family-name:var(--font-mono)] text-stone/70 hover:text-ember transition-colors duration-200 tracking-[0.15em] uppercase"
                >
                {s.content}
                </motion.a>
            ))}
            </div>
        </motion.div>
    </>);

}