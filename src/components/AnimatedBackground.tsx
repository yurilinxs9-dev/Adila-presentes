"use client";

export default function AnimatedBackground() {
  return (
    <>
      {/* Rotating conic gradient */}
      <div className="animated-bg" />

      {/* Floating gradient orbs — pure CSS animation, no JS */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="gradient-orb gradient-orb-1" />
        <div className="gradient-orb gradient-orb-2" />
        <div className="gradient-orb gradient-orb-3" />
        <div className="gradient-orb gradient-orb-4" />
      </div>

      {/* Noise texture */}
      <div className="noise-overlay" />
    </>
  );
}
