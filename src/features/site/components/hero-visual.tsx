"use client";

import { useEffect, useRef } from "react";

const ringWord = "LAISEN  •  LAISEN  •  LAISEN  •  LAISEN  •  LAISEN  •  ";

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
      <div className="site-hero-scan" aria-hidden="true" />

      <div className="site-hero-typo-sculpture" aria-hidden="true">
        <svg
          viewBox="0 0 840 840"
          className="h-full w-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="laisen-typo-core" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(422 416) rotate(90) scale(250)">
              <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.96" />
              <stop offset="0.38" stopColor="#DCF9FF" stopOpacity="0.78" />
              <stop offset="0.68" stopColor="#B4ECF5" stopOpacity="0.24" />
              <stop offset="1" stopColor="#B4ECF5" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="laisen-word-primary" x1="240" y1="320" x2="600" y2="500" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="rgba(255,255,255,0.96)" />
              <stop offset="0.48" stopColor="rgba(223,250,255,0.94)" />
              <stop offset="1" stopColor="rgba(173,235,244,0.72)" />
            </linearGradient>
            <linearGradient id="laisen-ring-stroke" x1="180" y1="170" x2="660" y2="670" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="rgba(255,255,255,0.72)" />
              <stop offset="0.5" stopColor="rgba(184,235,243,0.58)" />
              <stop offset="1" stopColor="rgba(255,255,255,0.3)" />
            </linearGradient>
            <filter id="laisen-word-blur" x="40" y="80" width="760" height="680" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="28" />
            </filter>
            <path id="laisen-ring-outer" d="M 420,170 a 250,250 0 1,1 0,500 a 250,250 0 1,1 0,-500" />
            <path id="laisen-ring-inner" d="M 420,230 a 190,190 0 1,1 0,380 a 190,190 0 1,1 0,-380" />
          </defs>

          <g opacity="0.54" filter="url(#laisen-word-blur)">
            <ellipse cx="420" cy="410" rx="220" ry="200" fill="url(#laisen-typo-core)" />
          </g>

          <g className="site-hero-ring-layer site-hero-ring-layer-back">
            <text
              fill="rgba(255,255,255,0.28)"
              fontSize="26"
              fontWeight="500"
              letterSpacing="0.34em"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              <textPath href="#laisen-ring-outer" startOffset="0%">
                {ringWord.repeat(3)}
              </textPath>
            </text>
          </g>

          <g className="site-hero-ring-layer site-hero-ring-layer-front">
            <text
              fill="url(#laisen-ring-stroke)"
              fontSize="18"
              fontWeight="600"
              letterSpacing="0.42em"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              <textPath href="#laisen-ring-inner" startOffset="4%">
                {ringWord.repeat(2)}
              </textPath>
            </text>
          </g>

          <g className="site-hero-word-cloud">
            <text
              x="418"
              y="308"
              textAnchor="middle"
              fill="rgba(255,255,255,0.42)"
              fontSize="128"
              fontWeight="700"
              letterSpacing="0.1em"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              LAISEN
            </text>
            <text
              x="426"
              y="564"
              textAnchor="middle"
              fill="rgba(178,236,244,0.24)"
              fontSize="154"
              fontWeight="700"
              letterSpacing="0.12em"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              LAISEN
            </text>
          </g>

          <g className="site-hero-word-primary">
            <text
              x="420"
              y="458"
              textAnchor="middle"
              fill="url(#laisen-word-primary)"
              fontSize="116"
              fontWeight="700"
              letterSpacing="0.14em"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              LAISEN
            </text>
          </g>

          <circle cx="420" cy="420" r="14" fill="#A4F4FF" opacity="0.92" />
        </svg>
      </div>
    </div>
  );
}
