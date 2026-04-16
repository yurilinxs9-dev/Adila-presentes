"use client";

import { Calendar, MapPin, Clock, Users } from "lucide-react";
import Image from "next/image";

const details = [
  { icon: Calendar, label: "Quando", value: "27 e 28 de Abril, 2026" },
  { icon: Clock, label: "Horário", value: "A partir das 19h" },
  { icon: MapPin, label: "Onde", value: "Live exclusiva no Instagram" },
  { icon: Users, label: "Acesso", value: "Grupo VIP no WhatsApp" },
];

export default function AboutSection() {
  return (
    <section className="py-24 px-4 max-w-5xl mx-auto relative z-10 section-glow-purple">
      {/* Photos + Text row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center mb-16">
        {/* Photos side */}
        <div className="reveal-left relative">
          <div className="grid grid-cols-5 gap-3 md:gap-4">
            {/* Owner photo - takes 3 cols */}
            <div className="col-span-3 relative aspect-[3/4] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/50">
              <Image
                src="/foto-adila.jpg"
                alt="Adila - Fundadora da Adila Presentes"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 60vw, 30vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-display font-bold text-sm">Adila</p>
                <p className="text-white/50 text-[11px] font-body">Fundadora da Adila Presentes</p>
              </div>
            </div>
            {/* Stock photo - takes 2 cols */}
            <div className="col-span-2 relative aspect-[2/3] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/50 mt-8">
              <Image
                src="/foto-estoque.jpg"
                alt="Estoque Hiper Têxtil - Direto da Fábrica"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 40vw, 20vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-display font-bold text-xs">Estoque</p>
              </div>
            </div>
          </div>
          {/* Decorative glow behind photos */}
          <div className="absolute -inset-4 bg-gradient-to-br from-accent/5 via-transparent to-purple/5 rounded-3xl -z-10 blur-2xl" />
        </div>

        {/* Text side */}
        <div className="reveal-right">
          <span className="text-purple-light text-xs font-body font-semibold tracking-[0.3em] uppercase mb-4 block">
            Sobre o evento
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-5 leading-tight">
            A maior live de ofertas da região
          </h2>
          <p className="text-white/40 font-body text-sm leading-relaxed mb-4">
            A <strong className="text-white/70">Adila Presentes</strong>, referência em casa, presentes e papelaria,
            se une à <strong className="text-purple-light">Hiper Têxtil</strong>, gigante do setor têxtil direto de fábrica,
            para trazer dois dias de ofertas que você nunca viu.
          </p>
          <p className="text-white/40 font-body text-sm leading-relaxed">
            Mais de 4.000 itens com preços exclusivos, válidos apenas durante a live.
            Quem estiver no grupo VIP recebe as ofertas antes — e os melhores produtos esgotam rápido.
          </p>
        </div>
      </div>

      {/* Event details cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {details.map((d, i) => (
          <div
            key={d.label}
            className="reveal-scale glass-card glass-card-hover p-5 text-center"
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            <div className="w-10 h-10 rounded-xl bg-purple/10 flex items-center justify-center mx-auto mb-3">
              <d.icon className="w-4 h-4 text-purple-light" />
            </div>
            <p className="text-white/30 text-[10px] font-body uppercase tracking-[0.2em] mb-1">{d.label}</p>
            <p className="text-white font-body font-medium text-sm">{d.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
