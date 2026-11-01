"use client";

import { useEffect } from "react";

/* Three jobs, no markup:
   1. Reading progress bar at the top of the page.
   2. The table-of-contents link for the section being read gets data-active.
   3. Figures get data-in="true" when scrolled into view (CSS animates them). */
export default function ArticleEffects() {
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
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    root.querySelectorAll("[data-reveal]").forEach((el) => reveal.observe(el));

    const links = Array.from(root.querySelectorAll<HTMLAnchorElement>(".toc a"));
    const heads = links
      .map((a) => root.querySelector(a.getAttribute("href") ?? ""))
      .filter((el): el is Element => !!el);
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          links.forEach((a) =>
            a.toggleAttribute("data-active", a.getAttribute("href") === `#${e.target.id}`)
          );
        });
      },
      { rootMargin: "-15% 0px -75% 0px" }
    );
    heads.forEach((h) => spy.observe(h));

    const bar = root.querySelector<HTMLElement>(".art-progress i");
    const onScroll = () => {
      if (!bar) return;
      const d = document.documentElement;
      const p = d.scrollTop / Math.max(1, d.scrollHeight - d.clientHeight);
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      reveal.disconnect();
      spy.disconnect();
      window.removeEventListener("scroll", onScroll);
      delete root.dataset.ready;
    };
  }, []);

  return null;
}