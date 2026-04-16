"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useGsapScrollReveal() {
  useEffect(() => {
    // Small delay to ensure DOM is ready, then batch all reveals
    const timer = requestAnimationFrame(() => {
      const reveals = document.querySelectorAll(".reveal-up, .reveal-left, .reveal-right, .reveal-scale");

      reveals.forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            once: true,
          },
        });
      });
    });

    return () => {
      cancelAnimationFrame(timer);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);
}
