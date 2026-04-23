import { useState, useEffect, useRef } from 'react';

const spritePreloader = (spriteUrl: string, frameWidth: number, frameHeight: number, totalFrames: number) => {
  const [frames, setFrames] = useState([]);

  useEffect(() => {
    const img = new Image();
    img.src = spriteUrl;
    img.crossOrigin = "anonymous";

    img.onload = () => {
        const canvas = document.createElement('canvas');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = frameWidth * dpr;
        canvas.height = frameHeight * dpr;

        // const cursorSize = 32;
        // canvas.width = cursorSize;
        // canvas.height = cursorSize;

        // canvas.width = frameWidth;
        // canvas.height = frameHeight;

        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = false;

        const extractedFrames = [] as string[] | any;

        for (let i = 0; i < totalFrames; i++) {
            ctx.clearRect(0, 0, frameWidth, frameHeight);
            ctx.drawImage(
                img, 
                0, i * frameHeight, frameWidth, frameHeight,
                0, 0, frameWidth, frameHeight
            );

            extractedFrames.push(canvas.toDataURL());
        }
        setFrames(extractedFrames);
    };
    }, [spriteUrl, frameWidth, frameHeight, totalFrames]);

    return frames;
};

export default spritePreloader;