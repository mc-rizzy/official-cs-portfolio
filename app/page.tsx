"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from 'next/dynamic';
import FaceCard from "./components/faceCard";
// import HeroText from "./components/heroText";
import "./home.css";

const HeroText = dynamic(() => import('./components/heroText'), {
  ssr: false,
});

export default function Home() {

  const faceCardRef = useRef<HTMLDivElement | null>(null);

  return (<>
  {/* About me, basic info. Replace later */}
    <section className="hero">
      <FaceCard ref={faceCardRef} src="profile/faceCard.jpg" />
      <HeroText />
    </section>

    <section className="hero">Technologies</section>
    <section className="hero">My Specialty area</section>
    <section className="hero">Example Projects + link to more</section>
    <section className="hero">brief work experience</section>
    <section className="hero">Contact me + my resume</section>
  </>);
}


// Note to self: Make face card share-able.