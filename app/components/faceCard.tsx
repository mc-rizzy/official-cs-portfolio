"use client";
import { forwardRef, useEffect, useRef } from "react";

import "./faceCard.css";

interface FaceCardProps {
    src: string;
}

const FaceCard = forwardRef<HTMLDivElement, FaceCardProps>(({ src }, ref) => {

    const cardContentRef = useRef<HTMLDivElement | null>(null);
    const cardContainerRef = useRef<HTMLDivElement | null>(null);
    const profileImgRef = useRef<HTMLImageElement | null>(null);

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

    return (
        <div ref={cardContainerRef} className="cardContainer fadeIn">
            <div ref={cardContentRef} className="cardContent">
                <img ref={profileImgRef} className="profileImg" src={src} alt="Team Member" />
            </div>

        </div>
    );
});

export default FaceCard;