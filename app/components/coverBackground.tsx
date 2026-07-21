'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { svg } from 'framer-motion/client';

interface MouseProps {
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}

export default function CoverBackground({ mouse }: MouseProps) {
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);
  const [isMaskLoaded, setIsMaskLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cacheBuster = Math.random().toString().slice(2, 8);
    const dynamicUrl = `https://picsum.photos/1920/1080?random=${cacheBuster}`;
    setBgUrl(dynamicUrl);
  }, []);

  useEffect(() => {
    if (!bgUrl) return;

    let animationFrameId: number;

    const updateMouseVariables = () => {
      if (containerRef.current) {
        const xPercent = (mouse.current.x / window.innerWidth) * 100;
        const yPercent = (mouse.current.y / window.innerHeight) * 100;

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
    // clipPath: `polygon(
    //   calc(var(--mouse-x, 50%) - 20%) calc(var(--mouse-y, 50%) - 20%),
    //   calc(var(--mouse-x, 50%) + 20%) calc(var(--mouse-y, 50%) - 20%),
    //   calc(var(--mouse-x, 50%) + 20%) calc(var(--mouse-y, 50%) + 20%),
    //   calc(var(--mouse-x, 50%) - 20%) calc(var(--mouse-y, 50%) + 20%)
    // )`,
    clipPath: `polygon(
      calc(var(--mouse-x, 50%) + 5%  + ((var(--mouse-y, 0%) - 50%) / 3.5)) 0%,
      calc(var(--mouse-x, 50%) + 25% + ((var(--mouse-y, 0%) - 50%) / 3.5)) 0%,
      calc(var(--mouse-x, 50%) - 5% + ((var(--mouse-y, 0%) - 50%) / 3.5)) 100%,
      calc(var(--mouse-x, 50%) - 25% + ((var(--mouse-y, 0%) - 50%) / 3.5)) 100%
    )`,
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 -z-10 overflow-hidden select-none pointer-events-none"
    >
      <Image
        src={bgUrl}
        alt="Dynamic Portfolio Background"
        fill
        priority
        unoptimized
        onLoad={() => setIsBackgroundLoaded(true)}
        className={`
          object-cover object-center
          transition-opacity duration-1000 ease-in-out
          ${isBackgroundLoaded ? "opacity-100 blur-[10px] scale-105" : "opacity-0"}
        `}
        
        // className="blur-[10px] scale-105"
        // style={{
        //   objectFit: 'cover',
        //   objectPosition: 'center',
        //   opacity: 0
        // }}
      />

      <div className="absolute inset-0 z-0" style={dynamicMaskStyles}>
        <Image
          src={bgUrl}
          alt="Dynamic Portfolio Background Window"
          fill
          priority
          unoptimized
          onLoad={() => setIsMaskLoaded(true)}
          className={`
            object-cover object-center scale-105
            transition-all duration-2000 linear
            ${isMaskLoaded && isBackgroundLoaded 
              ? "opacity-100 blur-0" 
              : "opacity-0 blur-md"
            }
          `}
        />
      </div>

      <div 
        className="absolute inset-0 z-20 border-2 border-white/40 pointer-events-none rounded-none shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]" 
        style={dynamicMaskStyles} 
      />

      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/20 via-neutral-950/20 to-neutral-950/100 pointer-events-none mix-blend-multiply" />
    </div>
  );
}