import type { Metadata } from "next";
import "./globals.css";
import MetaPixel from "@/components/MetaPixel";

export const metadata: Metadata = {
  title: "LIVE DE OFERTAS | Adila Presentes + Hiper Têxtil",
  description:
    "Live exclusiva de ofertas com mais de 4.000 itens a preço de fábrica. 27 e 28 de Abril. Cama, mesa, banho, cozinha, tapetes e muito mais!",
  keywords: [
    "live ofertas",
    "adila presentes",
    "hiper têxtil",
    "preço de fábrica",
    "cama mesa banho",
  ],
  openGraph: {
    title: "LIVE DE OFERTAS | Adila Presentes + Hiper Têxtil",
    description:
      "Mais de 4.000 itens a preço de fábrica. 27 e 28 de Abril — evento exclusivo!",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <MetaPixel />
      </head>
      <body className="bg-[#060606] text-white antialiased">{children}</body>
    </html>
  );
}
