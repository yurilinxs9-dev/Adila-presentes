"use client";

import { ExternalLink } from "lucide-react";

const socials = [
  {
    handle: "@adilapresentes",
    url: "https://www.instagram.com/adilapresentes/",
    label: "Siga no Instagram",
    glowClass: "card-glow-red",
    hoverTextColor: "group-hover:text-accent",
    hoverBgColor: "group-hover:bg-accent/10",
    hoverIconColor: "group-hover:text-accent",
  },
  {
    handle: "@hipertextil.oficial",
    url: "https://www.instagram.com/hipertextil.oficial/",
    label: "Siga no Instagram",
    glowClass: "card-glow-purple",
    hoverTextColor: "group-hover:text-purple-light",
    hoverBgColor: "group-hover:bg-purple/10",
    hoverIconColor: "group-hover:text-purple-light",
  },
];

export default function SocialSection() {
  return (
    <section className="py-24 px-4 max-w-3xl mx-auto relative z-10 section-glow-red">
      <h2 className="reveal-up font-display text-2xl md:text-3xl font-bold text-center mb-3">
        Siga nossas marcas
      </h2>
      <p className="reveal-up text-white/25 text-sm font-body text-center mb-12">
        Acompanhe as novidades no Instagram
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {socials.map((s, i) => (
          <a
            key={s.handle}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`reveal-up glass-card glass-card-hover p-5 flex items-center gap-4 group ${s.glowClass}`}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <div className={`w-10 h-10 rounded-full bg-white/[0.04] ${s.hoverBgColor} flex items-center justify-center shrink-0 transition-colors duration-300`}>
              <ExternalLink className={`w-4 h-4 text-white/30 ${s.hoverIconColor} transition-colors duration-300`} />
            </div>
            <div>
              <p className={`font-body font-semibold text-white text-sm ${s.hoverTextColor} transition-colors duration-300`}>{s.handle}</p>
              <p className="text-white/25 text-xs font-body">{s.label}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
