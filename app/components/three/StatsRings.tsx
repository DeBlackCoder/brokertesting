"use client";

import Image from "next/image";

/**
 * Stats section background — real 3D render photograph.
 * Black & green glowing metallic abstract (Pawel Czerwinski / Unsplash, free license).
 * Perfectly matches AUREX emerald brand color.
 */
export default function StatsRings() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Actual 3D render — black & green metallic glow */}
      <Image
        src="https://images.unsplash.com/photo-1685094488656-9231107be07f?q=85&w=1920&auto=format&fit=crop"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover object-center"
        style={{ opacity: 0.22, mixBlendMode: "screen" }}
      />

      {/* Center fade — stats content stays clear */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 50%, rgba(8,10,15,0.6) 30%, rgba(8,10,15,0.15) 70%, rgba(8,10,15,0.8) 100%)",
        }}
      />
    </div>
  );
}
