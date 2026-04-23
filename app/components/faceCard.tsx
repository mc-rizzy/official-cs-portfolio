"use client";
import { forwardRef, MutableRefObject, useEffect, useRef, useState } from "react";
import spritePreloader from "./spritePreloader";
import "./faceCard.css";

interface FaceCardProps {
    src: string;
    mouse: MutableRefObject<{ x: number; y: number }>; 
}

const FaceCard = forwardRef<HTMLDivElement, FaceCardProps>(({ src, mouse }, ref) => {
    const cardContentRef = useRef<HTMLDivElement | null>(null);
    const cardContainerRef = useRef<HTMLDivElement | null>(null);
    const profileImgRef = useRef<HTMLImageElement | null>(null);
    const fireMouse = useRef<HTMLDivElement | null>(null);

    const [currentFrame, setCurrentFrame] = useState(0);
    const animationIntervalRef = useRef(null) as any;
    const fireMouseMoveIntervalRef = useRef(null) as any;
    const fireMousePositionRef = useRef({ x: 0, y: 0 });
    
    const frames = spritePreloader('/cursor/fire.png', 32, 32, 6);

    const showCursor = () => {
        if (!animationIntervalRef.current){
            animationIntervalRef.current = setInterval(() => {
                setCurrentFrame((prev) => (prev + 1) % frames.length);
            }, 100);
        }

        let offsetY = cardContainerRef.current?.getBoundingClientRect().top || 0;
        let lerpRate = 0.2;
        fireMousePositionRef.current = { x: mouse.current.x, y: mouse.current.y - offsetY };

        const updatePosition = () => {
            if (!fireMouse.current) return;
            let newX = fireMousePositionRef.current.x + (mouse.current.x - fireMousePositionRef.current.x) * lerpRate;
            let newY = fireMousePositionRef.current.y + (mouse.current.y - fireMousePositionRef.current.y - offsetY) * lerpRate;

            fireMouse.current.style.setProperty('left', `${newX}px`);
            fireMouse.current.style.setProperty('top', `${newY}px`);

            fireMousePositionRef.current = { x: newX, y: newY };
            fireMouseMoveIntervalRef.current = requestAnimationFrame(updatePosition);
        };

        if (!fireMouseMoveIntervalRef.current)
            fireMouseMoveIntervalRef.current = requestAnimationFrame(updatePosition);
    };

    const hideCursor = () => {
        clearInterval(animationIntervalRef.current);
        cancelAnimationFrame(fireMouseMoveIntervalRef.current);
        animationIntervalRef.current = null;
        fireMouseMoveIntervalRef.current = null;
        setCurrentFrame(0);
    };

    useEffect(() => {
        cardContainerRef.current?.addEventListener("mousemove", (e) => {
            const card = cardContentRef.current;
            const profileImg = profileImgRef.current;
            if (!card || !profileImg) return;

            const rect = card.getBoundingClientRect();
            
            const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
            const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

            const rotateX = x * 20; 
            const rotateY = y * 20;

            card.style.transform = `perspective(1300px) rotateY(${rotateX}deg) rotateX(${-rotateY}deg)`;

            const moveX = x * -15; 
            const moveY = y * -15;
            profileImg.style.transform = `scale(1.1) translateX(${moveX}px) translateY(${moveY}px)`;
            
        });

        cardContainerRef.current?.addEventListener("mouseleave", () => {
            const card = cardContentRef.current;
            const img = profileImgRef.current;
            if (card)
                card.style.transform = `perspective(1300px) rotateY(0deg) rotateX(0deg)`;
            if (img)
                img.style.transform = `scale(1.1) translateX(0px) translateY(0px)`;
        });
    }, [cardContentRef, cardContainerRef, profileImgRef]);

    return (<>
        <div ref={cardContainerRef} className="cardContainer fadeIn" onMouseEnter={showCursor} onMouseLeave={hideCursor}>
            <div ref={cardContentRef} className="cardContent" 
            onMouseEnter={()=>{fireMouse.current?.style.setProperty('opacity', '1');}}
            onMouseLeave={()=>{fireMouse.current?.style.setProperty('opacity', '0')}} >
                <img ref={profileImgRef} className="profileImg" src={src} alt="Team Member" />
            </div>
        </div>
        {frames[currentFrame] && (
            <div 
                ref={fireMouse} 
                className="fireMouse pixelPerfect" 
                style={{ backgroundImage: `url(${frames[currentFrame]})` }}
            />
        )}
    </>);
});

export default FaceCard;