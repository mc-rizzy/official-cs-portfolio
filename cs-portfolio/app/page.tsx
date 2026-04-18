"use client";
import { useEffect } from "react";
import Image from "next/image";
import FaceCard from "./components/faceCard";

import "./home.css";

export default function Home() {

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    const hiddenElements = document.querySelectorAll('.fade-in-hidden');
    hiddenElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (<>
  {/* About me, basic info. Replace later */}
    <section className="hero">
      <FaceCard src="profile/faceCard.jpg" />
      <div className="heroText">
        <h1 key={1} className="fade-in-hidden">Hi, I'm <span className="highlight fade-in-hidden">Cracked</span>.</h1>
        <p key={2} className="fade-in-hidden">I'm a software engineer specializing in building exceptional digital experiences. Currently, I'm focused on building accessible, human-centered products.</p>
      </div>
    </section>

    <section className="hero">Technologies</section>
    <section className="hero">My Specialty area</section>
    <section className="hero">Example Projects + link to more</section>
    <section className="hero">brief work experience</section>
    <section className="hero">Contact me + my resume</section>
  </>);
}


// Note to self: Make face card share-able.