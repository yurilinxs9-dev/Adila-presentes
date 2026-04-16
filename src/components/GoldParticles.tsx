"use client";

/**
 * Pure CSS particles — no GSAP, no per-particle JS animation.
 * Each particle uses CSS custom properties for randomized motion.
 */

const PARTICLE_COUNT = 20;

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  // Round to 6 decimal places to avoid float precision differences between server/client
  return Math.round((x - Math.floor(x)) * 1e6) / 1e6;
}

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const r1 = seededRandom(i);
  const r2 = seededRandom(i + 100);
  const r3 = seededRandom(i + 200);
  const r4 = seededRandom(i + 300);
  const r5 = seededRandom(i + 400);

  const size = r1 * 3 + 1;
  const isRed = r5 > 0.6;
  const isPurple = !isRed && r5 > 0.3;

  const color = isRed
    ? "rgba(212, 25, 32, 0.3)"
    : isPurple
    ? "rgba(107, 63, 160, 0.25)"
    : "rgba(255, 255, 255, 0.15)";

  return {
    size,
    color,
    left: `${r2 * 100}%`,
    top: `${r3 * 100}%`,
    duration: `${r4 * 8 + 6}s`,
    delay: `${r1 * 5}s`,
    driftX: `${(r2 - 0.5) * 80}px`,
    driftY: `${(r3 - 0.5) * 80}px`,
  };
});

export default function GoldParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            left: p.left,
            top: p.top,
            "--duration": p.duration,
            "--delay": p.delay,
            "--drift-x": p.driftX,
            "--drift-y": p.driftY,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
