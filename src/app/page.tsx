"use client";

import { useState } from "react";
import { useGsapScrollReveal } from "@/hooks/useGsapScrollReveal";
import AnimatedBackground from "@/components/AnimatedBackground";
import GoldParticles from "@/components/GoldParticles";
import HeroSection from "@/components/HeroSection";
import WhyJoinSection from "@/components/WhyJoinSection";
import AboutSection from "@/components/AboutSection";
import CategoriesSection from "@/components/CategoriesSection";
import SocialSection from "@/components/SocialSection";
import Footer from "@/components/Footer";
import LeadFormModal from "@/components/LeadFormModal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Activate GSAP scroll reveal animations
  useGsapScrollReveal();

  return (
    <>
      <AnimatedBackground />
      <main className="relative overflow-hidden">
        <GoldParticles />
        <HeroSection onCtaClick={openModal} />
        <WhyJoinSection onCtaClick={openModal} />
        <AboutSection />
        <CategoriesSection />
        <SocialSection />
        <Footer onCtaClick={openModal} />
        <LeadFormModal isOpen={isModalOpen} onClose={closeModal} />
      </main>
    </>
  );
}
