"use client";

import { ShoppingBag, Gem, Zap, ArrowRight } from "lucide-react";

const cards = [
  {
    icon: ShoppingBag,
    title: "+4.000 ITENS",
    description: "Catálogo gigante com produtos selecionados a preço de fábrica. Variedade que você não encontra em nenhuma outra live.",
    accent: "bg-accent/10 text-accent",
    glowClass: "card-glow-red",
  },
  {
    icon: Gem,
    title: "PREÇOS DE FÁBRICA",
    description: "Economia real direto do fornecedor, sem intermediários. Descontos exclusivos que só acontecem durante a live.",
    accent: "bg-purple/10 text-purple-light",
    glowClass: "card-glow-purple",
  },
  {
    icon: Zap,
    title: "ACESSO VIP",
    description: "Entre no grupo antes de todos e garanta as melhores ofertas em primeira mão. Estoque limitado por produto.",
    accent: "bg-purple/10 text-purple-light",
    glowClass: "card-glow-purple",
  },
];

interface WhyJoinSectionProps {
  onCtaClick: () => void;
}

export default function WhyJoinSection({ onCtaClick }: WhyJoinSectionProps) {
  return (
    <section className="py-24 px-4 max-w-5xl mx-auto relative z-10 section-glow-purple">
      <h2 className="reveal-up font-display text-3xl md:text-4xl font-bold text-center mb-3">
        Por que <span className="text-accent">participar</span>?
      </h2>
      <p className="reveal-up text-white/30 text-sm font-body text-center mb-14 max-w-md mx-auto">
        Dois dias de ofertas imperdíveis com as melhores marcas do mercado
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((card, i) => (
          <div
            key={card.title}
            className={`reveal-up glass-card glass-card-hover p-8 text-center cursor-default ${card.glowClass}`}
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <div className={`w-14 h-14 rounded-2xl ${card.accent} flex items-center justify-center mx-auto mb-6`}>
              <card.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-display font-bold mb-3 text-white">{card.title}</h3>
            <p className="text-white/35 text-sm font-body leading-relaxed">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="reveal-up text-center mt-14">
        <button
          onClick={onCtaClick}
          className="inline-flex items-center gap-2 text-accent hover:text-accent-light font-body font-medium text-sm tracking-wide transition-colors cursor-pointer group"
        >
          Garantir meu acesso VIP
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
}
