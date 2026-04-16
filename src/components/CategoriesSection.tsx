"use client";

import { Bed, ChefHat, Layers, Wine, PawPrint, Sparkles } from "lucide-react";

const categories = [
  { icon: Bed, name: "Cama, Mesa e Banho", desc: "Lençóis, toalhas, jogos de cama premium", hoverColor: "group-hover:bg-accent/10 group-hover:text-accent" },
  { icon: ChefHat, name: "Itens para Cozinha", desc: "Utensílios, panelas e acessórios", hoverColor: "group-hover:bg-purple/10 group-hover:text-purple-light" },
  { icon: Layers, name: "Tapetes", desc: "Diversos modelos e tamanhos", hoverColor: "group-hover:bg-accent/10 group-hover:text-accent" },
  { icon: Wine, name: "Mesa Posta", desc: "Elegância para suas refeições", hoverColor: "group-hover:bg-purple/10 group-hover:text-purple-light" },
  { icon: PawPrint, name: "Linha Pet", desc: "Caminhas, comedouros e mais", hoverColor: "group-hover:bg-accent/10 group-hover:text-accent" },
  { icon: Sparkles, name: "E muito mais...", desc: "Surpresas exclusivas na live", hoverColor: "group-hover:bg-purple/10 group-hover:text-purple-light" },
];

export default function CategoriesSection() {
  return (
    <section className="py-24 px-4 max-w-4xl mx-auto relative z-10 section-glow-red">
      <h2 className="reveal-up font-display text-3xl md:text-4xl font-bold text-center mb-3">
        O que você vai encontrar
      </h2>
      <p className="reveal-up text-white/30 text-sm font-body text-center mb-14 max-w-md mx-auto">
        Produtos selecionados das melhores marcas nacionais
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat, i) => (
          <div
            key={cat.name}
            className="reveal-scale glass-card glass-card-hover p-6 md:p-7 text-center cursor-default group"
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            <div className={`w-12 h-12 rounded-xl bg-white/[0.04] ${cat.hoverColor} flex items-center justify-center mx-auto mb-3 transition-colors duration-300`}>
              <cat.icon className="w-5 h-5 text-white/40 transition-colors duration-300 group-hover:text-inherit" />
            </div>
            <p className="font-body font-semibold text-sm text-white/80 mb-1">{cat.name}</p>
            <p className="font-body text-[11px] text-white/25 leading-relaxed">{cat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
