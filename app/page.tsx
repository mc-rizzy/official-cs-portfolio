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
import ModelScene from "./model/Scene";

const HeroText = dynamic(() => import('./components/heroText'), {
  ssr: false,
});

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
    {/* <ModelScene scrollY={0}/> */}
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

// TO DO:
// Events page. events
// Involvement
// Projects with detailed "how to's" articles.

/*Modeling. 
Fintech -> emphasize speed, reliability, model intelligence
- Blockchain
- Health record data cleaning and automation
- James Fund (healthcare sector. (Can link to my biotech profile)
- AI in public safety whitepaper
- Conference networking
- Potentially Elligton.
- Upcoming Blockchain live demonstration
+Automation
- MoreNBest Amazon Automation
- Neural Language model
- Autonomous video content generator
- Plantilir
- Napcast

Biotech -> emphasize anatomy, depth of research (niche), and organized flow of full-process work.
- Volition
- Autism and Neurotypical Motor functioons research
- IBM would be better here.

Software Dev
- RPI Union fullstack engi
- Voice assistant
- HackRPI 2025 Game

Maybe both -> Leadership
- HackRPI
- Executive Board





Fintech page:
Some sort of organizational flow, stocks, models, etc. Maybe live API with stocks influencing the model.


Biotech page:
Components of some design coming apart, or something with brain brainwaves.




*/