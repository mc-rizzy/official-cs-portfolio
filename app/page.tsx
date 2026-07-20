"use client";
import { use, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from 'next/dynamic';
import FaceCard from "./components/faceCard";
import CoverBackground from "./components/coverBackground";
// import HeroText from "./components/heroText";
import "./home.css";

const HeroText = dynamic(() => import('./components/heroText'), {
  ssr: false,
});

export default function Home() {

  const mouse = useRef({x: 0, y: 0});

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

  return (<>
    <CoverBackground mouse={mouse}/>
    <section className="hero">
      <FaceCard src="profile/faceCard.jpg"/>
      <HeroText mouse={mouse}/>
    </section>

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

    <section className="hero">Technologies</section>
    <section className="hero">My Specialty area</section>
    <section className="hero">Example Projects + link to more</section>
    <section className="hero">brief work experience</section>
    <section className="hero">Contact me + my resume</section>
  </>);
}


// Note to self: Make face card share-able.