"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CursorGlow() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springX = useSpring(cursorX, { stiffness: 120, damping: 20 });
  const springY = useSpring(cursorY, { stiffness: 120, damping: 20 });

  const dotX = useSpring(cursorX, { stiffness: 600, damping: 35 });
  const dotY = useSpring(cursorY, { stiffness: 600, damping: 35 });

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [cursorX, cursorY]);

  return (
    <>
      {/* Ambient glow */}
      <motion.div
        className="pointer-events-none fixed z-[9998] hidden md:block"
        style={{
          width: 600,
          height: 600,
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          background:
            "radial-gradient(circle, rgba(16,212,142,0.04) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />
      {/* Cursor dot */}
      <motion.div
        className="pointer-events-none fixed z-[9999] hidden md:block"
        style={{
          width: 6,
          height: 6,
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
          background: "#10d48e",
          borderRadius: "50%",
          mixBlendMode: "screen",
        }}
      />
    </>
  );
}
