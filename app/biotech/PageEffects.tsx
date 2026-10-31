"use client";

import { useEffect } from "react";

/* Two jobs, no markup:
   1. Sections get data-in="true" when scrolled into view (CSS draws rules,
      fills skill bars, and builds the milestone timeline from that).
   2. The nav link for the section at mid-screen gets data-active. */
export default function PageEffects() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".bio");
    if (!root) return;
    root.dataset.ready = "true";

    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.in = "true";
            reveal.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );
    root.querySelectorAll("[data-reveal]").forEach((el) => reveal.observe(el));

    const links = Array.from(root.querySelectorAll<HTMLAnchorElement>(".top-nav a"));
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          links.forEach((a) =>
            a.toggleAttribute("data-active", a.getAttribute("href") === `#${e.target.id}`)
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    links.forEach((a) => {
      const section = root.querySelector(a.getAttribute("href") ?? "");
      if (section) spy.observe(section);
    });

    return () => {
      reveal.disconnect();
      spy.disconnect();
      delete root.dataset.ready;
    };
  }, []);

  return null;
}