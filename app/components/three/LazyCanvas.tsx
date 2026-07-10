"use client";

import { useRef, useState, useEffect } from "react";

/**
 * Mounts children only when the wrapper element enters the viewport.
 * Prevents WebGL contexts from initialising off-screen.
 */
export default function LazyCanvas({
  children,
  rootMargin = "200px",
  className = "",
  style,
}: {
  children: React.ReactNode;
  rootMargin?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className} style={style}>
      {visible ? children : null}
    </div>
  );
}
