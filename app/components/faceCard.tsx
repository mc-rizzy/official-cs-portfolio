"use client";
import { forwardRef, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import spritePreloader from "./spritePreloader";
import "./faceCard.css";

interface FaceCardProps {
    src: string;
}

const FaceCard = forwardRef<HTMLDivElement, FaceCardProps>(({ src }, ref) => {
    const cardContainerRef = useRef<HTMLDivElement | null>(null);
    const cardContentRef = useRef<HTMLDivElement | null>(null);
    const cursorRef = useRef<HTMLDivElement | null>(null);
    
    const cursorX = useMotionValue(0);
    const cursorY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);

    const cardRotateX = useTransform(rotateY, [-0.5, 0.5], [20, -20]); 
    const cardRotateY = useTransform(rotateX, [-0.5, 0.5], [-20, 20]);
    const profileX = useTransform(rotateX, [-0.5, 0.5], [15, -15]);
    const profileY = useTransform(rotateY, [-0.5, 0.5], [15, -15]);

    const frames = spritePreloader('/cursor/fire.png', 32, 32, 6);
    const spriteAnimationRef = useRef<any>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardContentRef.current || !cardContainerRef.current) return;

        const rect = cardContentRef.current.getBoundingClientRect();
        const containerRect = cardContainerRef.current.getBoundingClientRect();
        
        const width = rect.width;
        const height = rect.height;
        const mouseX = (e.clientX - rect.left) / width - 0.5;
        const mouseY = (e.clientY - rect.top) / height - 0.5;

        rotateX.set(mouseX);
        rotateY.set(mouseY);

        cursorX.set(e.clientX - containerRect.left);
        cursorY.set(e.clientY - containerRect.top);

        const targetElement = e.target as HTMLElement;
        const isOverCard = cardContentRef.current.contains(targetElement);

        if (isOverCard) {
            if (cursorRef.current && parseFloat(cursorRef.current.style.opacity || "0") === 0) {
                startCursorAnimation();
            }
        } else {
            if (cursorRef.current && parseFloat(cursorRef.current.style.opacity || "1") === 1) {
                stopCursorAnimation();
            }
        }
    };

    const startCursorAnimation = () => {
        if (!cursorRef.current) return;
        animate(cursorRef.current, { opacity: 1 }, { duration: 0.15 });

        if (frames.length > 0 && !spriteAnimationRef.current) {
            spriteAnimationRef.current = animate(
                0, 
                frames.length - 1, 
                {
                    repeat: Infinity,
                    duration: 0.6, 
                    ease: "linear",
                    onUpdate: (latest) => {
                        const currentFrameIndex = Math.floor(latest);
                        if (cursorRef.current) {
                            cursorRef.current.style.backgroundImage = `url(${frames[currentFrameIndex]})`;
                        }
                    }
                }
            );
        }
    };

    const stopCursorAnimation = () => {
        if (!cursorRef.current) return;
        animate(cursorRef.current, { opacity: 0 }, { duration: 0.15 });
        
        if (spriteAnimationRef.current) {
            spriteAnimationRef.current.stop();
            spriteAnimationRef.current = null;
        }
    };

    const handleMouseLeave = () => {
        rotateX.set(0);
        rotateY.set(0);
        stopCursorAnimation();
    };

    return (
        <div 
            ref={(node) => {
                if (typeof ref === "function") ref(node);
                else if (ref) ref.current = node;
                cardContainerRef.current = node;
            }} 
            className="cardContainer fadeIn" 
            style={{ position: 'relative', overflow: 'hidden' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <motion.div 
                ref={cardContentRef} 
                className="cardContent" 
                style={{
                    transform: "perspective(1300px)",
                    rotateX: cardRotateX,
                    rotateY: cardRotateY,
                    transformStyle: "preserve-3d"
                }}
            >
                <motion.img 
                    className="profileImg" 
                    src={src} 
                    alt="Team Member" 
                    style={{
                        scale: 1.1,
                        x: profileX,
                        y: profileY
                    }}
                />
            </motion.div>

            <motion.div 
                ref={cursorRef}
                className="fireMouse pixelPerfect" 
                style={{
                    position: 'absolute',
                    pointerEvents: 'none', 
                    left: cursorXSpring,
                    top: cursorYSpring,
                    opacity: 0,
                    transform: 'translate(-50%, -50%)' 
                }}
            />
        </div>
    );
});

FaceCard.displayName = "FaceCard";

export default FaceCard;