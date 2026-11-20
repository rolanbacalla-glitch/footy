"use client";

import React from "react";
import Image from "next/image";

export default function FootballLogo({ className = "w-7 h-7" }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 select-none ${className}`}>
      <Image
        src="/football-icon.png"
        alt="Football Insights"
        width={36}
        height={36}
        priority
        className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)] group-hover:scale-105 transition-transform"
      />
    </div>
  );
}
