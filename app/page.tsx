"use client";
import { use, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from 'next/dynamic';
import FaceCard from "./components/faceCard";
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
  {/* About me, basic info. Replace later */}
    <section className="hero">
      <FaceCard src="profile/faceCard.jpg" mouse={mouse}/>
      <HeroText mouse={mouse}/>
    </section>

    <section className="hero">Technologies</section>
    <section className="hero">My Specialty area</section>
    <section className="hero">Example Projects + link to more</section>
    <section className="hero">brief work experience</section>
    <section className="hero">Contact me + my resume</section>
  </>);
}


// Note to self: Make face card share-able.