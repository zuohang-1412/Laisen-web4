"use client";

import { useEffect, useRef } from "react";

export function HeroVisual() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;

    if (!root || typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (media.matches) {
      return;
    }

    const updatePosition = (clientX: number, clientY: number) => {
      const rect = root.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;

      root.style.setProperty("--hero-parallax-x", `${x.toFixed(3)}`);
      root.style.setProperty("--hero-parallax-y", `${y.toFixed(3)}`);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = requestAnimationFrame(() => {
        updatePosition(event.clientX, event.clientY);
      });
    };

    const handlePointerLeave = () => {
      root.style.setProperty("--hero-parallax-x", "0");
      root.style.setProperty("--hero-parallax-y", "0");
    };

    root.addEventListener("pointermove", handlePointerMove);
    root.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerleave", handlePointerLeave);

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <div ref={rootRef} className="site-hero-field">
      <div className="site-hero-mist site-hero-mist-one" aria-hidden="true" />
      <div className="site-hero-mist site-hero-mist-two" aria-hidden="true" />
      <div className="site-hero-mist site-hero-mist-three" aria-hidden="true" />
      <div className="site-hero-aura" aria-hidden="true" />
      <div className="cyber-hero-grid" aria-hidden="true">
        <div className="cyber-hero-stage">
          <div className="cyber-laisen-stack">
            <div className="cyber-laisen-stack-spin">
              {[0, 1, 2, 3, 4, 5].map((layer) => (
                <span
                  key={layer}
                  className="cyber-laisen-layer"
                  style={{ transform: `translateZ(${(layer - 3) * 7}px)` }}
                >
                  LAISEN
                </span>
              ))}
            </div>
          </div>

          <div className="cyber-web4-core">
            <div className="cyber-web4-core-content">
              <p className="cyber-web4-core-label">AUTONOMOUS ERA</p>
              <p className="cyber-web4-core-word">WEB4.0</p>
              <p className="cyber-web4-core-sub">Signal -&gt; Decision -&gt; Release -&gt; Proof</p>
            </div>

            <div className="cyber-web4-scan" />
            <div className="cyber-web4-grid" />
          </div>
        </div>
      </div>
    </div>
  );
}
