"use client";

import Image from "next/image";

interface FooterProps {
  onCtaClick: () => void;
}

export default function Footer({ onCtaClick }: FooterProps) {
  return (
    <footer className="relative z-10">
      <div className="py-16 px-4 text-center">
        <h3 className="reveal-up font-display text-2xl md:text-3xl font-bold text-white mb-3">
          Não fique de fora
        </h3>
        <p className="reveal-up text-white/30 text-sm font-body mb-8 max-w-sm mx-auto">
          Vagas limitadas no grupo VIP. Garanta a sua agora.
        </p>
        <button
          onClick={onCtaClick}
          className="reveal-scale btn-gradient text-white font-body font-semibold text-sm px-10 py-4 rounded-full cursor-pointer tracking-wider uppercase"
        >
          Quero Entrar no Grupo VIP
        </button>
      </div>

      <div className="border-t border-white/[0.03] py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-5 mb-4">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-white/[0.06]">
              <Image src="/logo-adila.png" alt="Adila" fill className="object-cover" />
            </div>
            <span className="text-white/10 text-xs">+</span>
            <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-white/[0.06] bg-white">
              <Image src="/logo-hiper.png" alt="Hiper Têxtil" fill className="object-contain p-0.5" />
            </div>
          </div>
          <p className="text-white/15 text-xs font-body">
            &copy; 2026 Adila Presentes + Hiper Têxtil. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
