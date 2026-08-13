"use client";
import { use, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from 'next/dynamic';
import FaceCard from "./components/faceCard";
import CoverBackground from "./components/coverBackground";
// import HeroText from "./components/heroText";
import "./home.css";
import TechStack from "./components/techStack";
import ContactForm from "./components/contactForm";
import ProjectsGrid from "./components/projectGrid";
import CursorWrapper from "./components/cursorWrapper";
import HeroSection from "./components/heroSection";

const HeroText = dynamic(() => import('./components/heroText'), {
  ssr: false,
});

export default function Home() {

  

  return (<>
    <CursorWrapper />
    <HeroSection/>

    {/* Note: section3 is featured projects */}
    {/* Note: section1 is work experience */}
    
    {/* <section className="hero">Technologies</section> */}
    <TechStack/>
    {/* <section className="hero">My Specialty area</section>
    <section className="hero">Featured Projects</section> */}
    <ProjectsGrid/>
    {/* <section className="hero">brief work experience</section> */}
    <ContactForm/>
  </>);
}


// Note to self: Make face card share-able.