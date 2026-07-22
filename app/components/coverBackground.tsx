'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, MotionValue } from 'framer-motion';

const MotionImage = motion.create(Image);

interface CoverBackgroundProps {
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  xOffset: MotionValue<number>;
  yOffset: MotionValue<number>;
}

export default function CoverBackground({ mouse, xOffset, yOffset }: CoverBackgroundProps) {
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);
  const [isMaskLoaded, setIsMaskLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cacheBuster = Math.random().toString().slice(2, 8);
    setBgUrl(`https://picsum.photos/1920/1080?random=${cacheBuster}`);
  }, []);

  useEffect(() => {
    if (!bgUrl) return;

    let lastX = -1;
    let lastY = -1;
    let animationFrameId: number;

    const updateMouseVariables = () => {
      const currentX = mouse.current.x;
      const currentY = mouse.current.y;

      if (containerRef.current && (currentX !== lastX || currentY !== lastY)) {
        const xPercent = (currentX / window.innerWidth) * 100;
        const yPercent = (currentY / window.innerHeight) * 100;

        containerRef.current.style.setProperty('--mouse-x', `${xPercent}%`);
        containerRef.current.style.setProperty('--mouse-y', `${yPercent}%`);
      }

      animationFrameId = requestAnimationFrame(updateMouseVariables);
    };

    animationFrameId = requestAnimationFrame(updateMouseVariables);
    return () => cancelAnimationFrame(animationFrameId);
  }, [bgUrl, mouse]);

  if (!bgUrl) return null;

  const dynamicMaskStyles = {
    clipPath: `polygon(
      calc(var(--mouse-x, 50%) + 5%  + ((var(--mouse-y, 0%) - 50%) / 3.5)) 0%,
      calc(var(--mouse-x, 50%) + 25% + ((var(--mouse-y, 0%) - 50%) / 3.5)) 0%,
      calc(var(--mouse-x, 50%) - 5% + ((var(--mouse-y, 0%) - 50%) / 3.5)) 100%,
      calc(var(--mouse-x, 50%) - 25% + ((var(--mouse-y, 0%) - 50%) / 3.5)) 100%
    )`,
  };

  const isReady = isMaskLoaded && isBackgroundLoaded;

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 -z-10 overflow select-none pointer-events-none transition-opacity duration-1000 ease-in-out ${
        isReady ? "opacity-100" : "opacity-0"
      }`}
      style={{ willChange: 'transform' }}
    >
      <MotionImage
        src={bgUrl}
        alt="Dynamic Portfolio Background"
        fill
        priority
        onLoad={() => setIsBackgroundLoaded(true)}
        className="object-cover object-center blur-[10px]"
        style={{x: xOffset, y: yOffset, scale: 1.25}}
      />

      <motion.div className="absolute inset-0 z-0" style={{...dynamicMaskStyles}}>
        <MotionImage
          src={bgUrl}
          alt="Dynamic Portfolio Background Window"
          fill
          priority
          onLoad={() => setIsMaskLoaded(true)}
          className="object-cover object-center"
          style={{x: xOffset, y: yOffset, scale: 1.25}}
        />
      </motion.div>

      <div 
        className="absolute inset-0 z-20 border-2 border-white/40 pointer-events-none rounded-none shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]" 
        style={dynamicMaskStyles} 
      />

      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/20 via-neutral-950/20 to-neutral-950/100 pointer-events-none mix-blend-multiply" />
    </div>
  );
}