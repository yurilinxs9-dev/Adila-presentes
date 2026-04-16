"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import Image from "next/image";

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

interface HeroSectionProps {
  onCtaClick: () => void;
}

const EVENT_DATE = new Date("2026-04-27T19:00:00-03:00");

export default function HeroSection({ onCtaClick }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { days, hours, minutes, seconds } = useCountdown(EVENT_DATE);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-logos", { opacity: 0, y: 40, duration: 0.8 })
        .from(".hero-badge", { opacity: 0, scale: 0.8, duration: 0.6 }, "-=0.4")
        .from(".hero-title span", { opacity: 0, y: 50, duration: 0.8, stagger: 0.12 }, "-=0.3")
        .from(".hero-subtitle", { opacity: 0, y: 30, duration: 0.6 }, "-=0.4")
        .from(".hero-date span", { opacity: 0, y: 30, duration: 0.5, stagger: 0.08 }, "-=0.3")
        .from(".hero-countdown > div", { opacity: 0, y: 40, scale: 0.8, duration: 0.5, stagger: 0.08 }, "-=0.3")
        .from(".hero-cta", { opacity: 0, y: 30, duration: 0.6 }, "-=0.2")
        .from(".hero-note", { opacity: 0, duration: 0.5 }, "-=0.2");
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleBtnMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
    btn.style.transform = `translate(${x}px, ${y}px)`;
  }, []);

  const handleBtnLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "translate(0, 0)";
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden z-10">
      <div className="hero-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="hero-logos flex items-center gap-5 md:gap-8 mb-10">
        <div className="relative w-[90px] h-[90px] md:w-[120px] md:h-[120px] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
          <Image src="/logo-adila.png" alt="Adila Presentes" fill className="object-cover" priority />
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-px h-6 bg-gradient-to-b from-transparent via-white/15 to-transparent" />
          <span className="text-white/20 text-xs tracking-widest">+</span>
          <div className="w-px h-6 bg-gradient-to-b from-transparent via-white/15 to-transparent" />
        </div>
        <div className="relative w-[90px] h-[90px] md:w-[120px] md:h-[120px] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10 bg-white/5 flex items-center justify-center p-2">
          <Image src="/logo-hiper.png" alt="Hiper Têxtil" fill className="object-contain p-2" priority />
        </div>
      </div>

      <div className="hero-badge glass-card px-5 py-2 mb-8 inline-flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-subtle" />
        <span className="text-[11px] font-body font-medium tracking-[0.25em] uppercase text-white/70">Evento Exclusivo</span>
        <div className="w-1.5 h-1.5 rounded-full bg-purple animate-pulse-subtle" />
      </div>

      <h1 className="hero-title font-display text-5xl md:text-7xl lg:text-8xl font-bold text-center leading-[1.05] mb-5 tracking-tight">
        <span className="text-glow text-accent inline-block">LIVE</span>
        <span className="text-white/30 mx-3 md:mx-4 font-light italic inline-block">de</span>
        <span className="text-white inline-block">OFERTAS</span>
      </h1>

      <p className="hero-subtitle text-white/40 text-base md:text-lg text-center mb-8 max-w-md font-body font-light tracking-wide">
        Tudo a preço de fábrica — apenas 2 dias
      </p>

      <div className="hero-date flex items-baseline gap-3 text-3xl md:text-4xl font-display font-bold text-center mb-10">
        <span className="text-white inline-block">27</span>
        <span className="text-white/20 text-base font-body font-light italic inline-block">e</span>
        <span className="text-white inline-block">28</span>
        <span className="text-white/20 text-base font-body font-light italic inline-block">de</span>
        <span className="text-accent inline-block">ABRIL</span>
      </div>

      <div className="hero-countdown flex gap-3 md:gap-4 mb-14">
        {[
          { value: days, label: "Dias" },
          { value: hours, label: "Horas" },
          { value: minutes, label: "Min" },
          { value: seconds, label: "Seg" },
        ].map((item) => (
          <div key={item.label} className="glass-card px-4 py-3 md:px-5 md:py-4 text-center min-w-[65px] md:min-w-[78px]">
            <div className="text-2xl md:text-3xl font-display font-bold text-white tabular-nums">
              {String(item.value).padStart(2, "0")}
            </div>
            <div className="text-[9px] md:text-[10px] text-white/25 uppercase tracking-[0.2em] mt-1.5 font-body">
              {item.label}
            </div>
          </div>
        ))}
      </div>

      <div className="hero-cta flex flex-col items-center gap-5">
        <button
          onClick={onCtaClick}
          onMouseMove={handleBtnMove}
          onMouseLeave={handleBtnLeave}
          className="magnetic-btn btn-primary text-white font-body font-semibold text-sm md:text-base px-10 py-4 rounded-full cursor-pointer tracking-wider uppercase"
        >
          Quero Entrar no Grupo VIP
        </button>
        <p className="hero-note text-white/20 text-xs font-body tracking-wide">
          Acesso antecipado e ofertas em primeira mão
        </p>
      </div>
    </section>
  );
}
