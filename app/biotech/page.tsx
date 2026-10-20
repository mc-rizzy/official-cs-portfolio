"use client";
import { use, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from 'next/dynamic';
import FaceCard from "../components/faceCard";
import CoverBackground from "../components/coverBackground";
// import HeroText from "./components/heroText";
import "../home.css";
import TechStack from "../components/techStack";
import ContactForm from "../components/contactForm";
import ProjectsGrid from "../components/projectGrid";
import CursorWrapper from "../components/cursorWrapper";
import HeroSection from "../components/heroSection";
import ModelScene from "../model/Scene";

// Disable SSR to avoid window/canvas hydration mismatch errors
const BiotechHero = dynamic(() => import('./brain'), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen bg-slate-950 flex items-center justify-center text-cyan-500 font-mono text-sm">
      INITIALIZING NEURAL GRAPH...
    </div>
  ),
})

export default function Home() {

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
      const handleScroll = () => { setScrollY(window.scrollY); };
      window.addEventListener('scroll', handleScroll, { passive: true });        

      return () => {
          window.removeEventListener('scroll', handleScroll);
      };
  }, []);


  return (<>
    <CursorWrapper />
    <BiotechHero />
    {/* <ModelScene scrollY={0}/> */}
    {/* <HeroSection/> */}

    
    <TechStack/>
    {/* <ProjectsGrid/> */}
    {/* <ContactForm/> */}
  </>);
}