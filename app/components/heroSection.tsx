'use client';

import { useEffect, useRef } from "react";
import CoverBackground from "./coverBackground";
import FaceCard from "./faceCard";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

import dynamic from "next/dynamic";

const HeroText = dynamic(() => import("./heroText"), { ssr: false });
// const HeroText = dynamic(() => import("./heroText"), {
//   ssr: false,
//   loading: () => <div className="w-full h-full" />,
// });

export default function HeroSection() {
    // Raw mouse position normalized to -1 to 1
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth it out
    const sX = useSpring(mouseX, { damping: 50, stiffness: 150 });
    const sY = useSpring(mouseY, { damping: 50, stiffness: 150 });

    // Text moves OPPOSITE to mouse (negative multiplier)
    const textX = useTransform(sX, (v) => v * -18);
    const textY = useTransform(sY, (v) => v * -12);

    // Blob moves WITH mouse (positive, larger multiplier = more movement)
    const blobX = useTransform(sX, (v) => v * 30);
    const blobY = useTransform(sY, (v) => v * 20);

    const mouse = useRef({x: 0, y: 0});

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
        
        {/* <motion.div style={{ x: blobX, y: blobY}} className="will-change-transform absolute inset-0 -z-10 overflow-hidden select-none pointer-events-none">
            <CoverBackground mouse={mouse} xOffset={blobX} yOffset={blobY}/>
        </motion.div> */}

        <CoverBackground mouse={mouse} xOffset={blobX} yOffset={blobY}/>

        <motion.div style={{ x: textX, y: textY }} className="will-change-transform z-10">
            <section className="hero">
                <FaceCard src="profile/faceCard.jpg"/>
                <HeroText mouse={mouse}/>
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
    </>);

}