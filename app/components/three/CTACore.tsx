"use client";

import Image from "next/image";

/**
 * CTA section background — real 3D render photograph.
 * Amber & dark curves on black (Pawel Czerwinski / Unsplash, free license).
 * The warm gold tones reinforce the gold accent used in the CTA typography.
 */
export default function CTACore() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Actual 3D render — amber/gold curves on deep black */}
      <Image
        src="https://images.unsplash.com/photo-1709377195538-5522ed0f9e10?q=90&w=1920&auto=format&fit=crop"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover object-center"
        style={{ opacity: 0.45, mixBlendMode: "screen" }}
      />

      {/* Strong center vignette — text stays crystal clear */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(4,5,7,0.75) 0%, rgba(4,5,7,0.3) 50%, rgba(4,5,7,0.85) 100%)",
        }}
      />

      {/* Top + bottom fades */}
      <div
        className="absolute top-0 left-0 right-0 h-32"
        style={{ background: "linear-gradient(to bottom, #040507, transparent)" }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{ background: "linear-gradient(to top, #040507, transparent)" }}
      />
    </div>
  );
}
