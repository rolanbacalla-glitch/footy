"use client";

import React from "react";

export default function FootballLogo({ className = "w-6 h-6", isLive = true }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_8px_rgba(255,38,54,0.3)] select-none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="fbShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E242D" />
            <stop offset="50%" stopColor="#13171F" />
            <stop offset="100%" stopColor="#0B0E14" />
          </linearGradient>

          <linearGradient id="fbCrimsonCore" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF4D5A" />
            <stop offset="100%" stopColor="#FF2636" />
          </linearGradient>

          <linearGradient id="fbBorderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#FF2636" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Tactical Shield Crest Background */}
        <path
          d="M18 2.5 L30.5 7 V17 C30.5 25.2 24.8 31.5 18 34.5 C11.2 31.5 5.5 25.2 5.5 17 V7 L18 2.5 Z"
          fill="url(#fbShieldGrad)"
          stroke="url(#fbBorderGrad)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Subtle Pitch Coordinate Crosshair Tick Marks */}
        <path
          d="M18 5 V8 M18 29 V32 M8 18 H11 M25 18 H28"
          stroke="#FFFFFF"
          strokeOpacity="0.2"
          strokeWidth="0.8"
          strokeLinecap="round"
        />

        {/* Telstar Football Motif */}
        {/* Outer Circular Seam */}
        <circle
          cx="18"
          cy="18"
          r="8"
          fill="#0C1017"
          stroke="#FFFFFF"
          strokeOpacity="0.45"
          strokeWidth="1"
        />

        {/* Center Pentagon Core */}
        <polygon
          points="18,15 20.85,17.07 19.76,20.43 16.24,20.43 15.15,17.07"
          fill="url(#fbCrimsonCore)"
        />

        {/* Seam Lines Radiating to Perimeter */}
        <path
          d="
            M18 15 L18 10
            M20.85 17.07 L25.6 15.5
            M19.76 20.43 L22.7 25.4
            M16.24 20.43 L13.3 25.4
            M15.15 17.07 L10.4 15.5
          "
          stroke="#FFFFFF"
          strokeOpacity="0.75"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
      </svg>

      {/* Live In-Play / Signal Indicator Dot */}
      {isLive && (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5"
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2636] opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF2636] border border-black/40" />
        </span>
      )}
    </div>
  );
}
