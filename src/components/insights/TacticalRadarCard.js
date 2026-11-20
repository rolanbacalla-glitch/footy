"use client";

import React, { useState } from "react";
import { Radar, Swords, Shield, Zap, Target, Gauge } from "lucide-react";

export default function TacticalRadarCard({ activeMatch }) {
  const [comparisonMode, setComparisonMode] = useState("manager"); // 'manager' | 'territory'

  const homeManager = "Andoni Iraola (4-2-3-1)";
  const awayManager = activeMatch?.opponent === "Manchester United" || activeMatch?.awayTeam === "Man United"
    ? "Rúben Amorim (3-4-2-1)"
    : "Opposition Setup";

  // Tactical Radar Dimensions (Scale: 0 to 100)
  // LFC (Iraola 2026/27) vs Manchester United (Amorim 2026/27)
  const dimensions = [
    { label: "Vertical Press", lfc: 94, opp: 72, lfcVal: "6.4 PPDA", oppVal: "10.2 PPDA" },
    { label: "Direct Progression", lfc: 88, opp: 65, lfcVal: "3.4 m/s", oppVal: "2.1 m/s" },
    { label: "High Regains", lfc: 91, opp: 68, lfcVal: "27 / 90", oppVal: "16 / 90" },
    { label: "Field Tilt Dominance", lfc: 85, opp: 52, lfcVal: "70.2%", oppVal: "48.5%" },
    { label: "Set-Piece xG Net", lfc: 78, opp: 60, lfcVal: "+0.45 xG", oppVal: "+0.08 xG" },
  ];

  // SVG Radar Chart (Center: 100, 100, Radius: 70)
  const numPoints = dimensions.length;
  const centerX = 100;
  const centerY = 100;
  const radius = 68;

  const getCoordinates = (index, value) => {
    const angle = (Math.PI * 2 / numPoints) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return { x, y };
  };

  const lfcPoints = dimensions.map((d, i) => getCoordinates(i, d.lfc));
  const oppPoints = dimensions.map((d, i) => getCoordinates(i, d.opp));

  const lfcPath = `${lfcPoints.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ")} Z`;
  const oppPath = `${oppPoints.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ")} Z`;

  return (
    <div className="apple-tile rounded-2xl border border-white/[0.08] p-3.5 bg-black/40 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#E31B23]/15 border border-[#E31B23]/30 flex items-center justify-center text-[#FF2636]">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
              Tactical Counter-Press Radar
            </h4>
            <p className="text-[10px] text-[#8E8E93]">
              {homeManager} vs {awayManager}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2.5 text-[10px]">
          <span className="flex items-center gap-1 text-white font-medium">
            <span className="w-2 h-2 rounded-full bg-[#FF2636] shadow-[0_0_6px_#FF2636]" />
            LFC
          </span>
          <span className="flex items-center gap-1 text-white/70">
            <span className="w-2 h-2 rounded-full bg-white/70 shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
            Opp
          </span>
        </div>
      </div>

      {/* Main Radar SVG & Metrics Split */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Radar SVG Visualisation (5 Cols) */}
        <div className="sm:col-span-5 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-44 h-44 drop-shadow-md" aria-label="Tactical Radar Chart">
            {/* Radar Background Polygons (Concentric Rings: 25%, 50%, 75%, 100%) */}
            {[0.25, 0.5, 0.75, 1].map((scale, ringIdx) => {
              const ringPoints = dimensions.map((_, i) => {
                const angle = (Math.PI * 2 / numPoints) * i - Math.PI / 2;
                const r = scale * radius;
                return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
              }).join(" ");
              return (
                <polygon
                  key={ringIdx}
                  points={ringPoints}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="0.8"
                />
              );
            })}

            {/* Spoke Lines */}
            {dimensions.map((_, i) => {
              const angle = (Math.PI * 2 / numPoints) * i - Math.PI / 2;
              const x2 = centerX + radius * Math.cos(angle);
              const y2 = centerY + radius * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={centerX}
                  y1={centerY}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="0.8"
                />
              );
            })}

            {/* Opposition Polygon (Subdued Precision Steel / Silver Glass) */}
            <path
              d={oppPath}
              fill="rgba(255, 255, 255, 0.10)"
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth="1.2"
              strokeDasharray="3 2"
              strokeLinejoin="round"
            />

            {/* LFC Polygon (Electric Anfield Crimson) */}
            <path
              d={lfcPath}
              fill="rgba(255, 38, 54, 0.28)"
              stroke="#FF2636"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Spoke Vertex Dots */}
            {lfcPoints.map((p, i) => (
              <circle key={`lfc-${i}`} cx={p.x} cy={p.y} r="2.5" fill="#FF2636" stroke="#FFFFFF" strokeWidth="0.6" />
            ))}
            {oppPoints.map((p, i) => (
              <circle key={`opp-${i}`} cx={p.x} cy={p.y} r="2" fill="#FFFFFF" fillOpacity="0.6" stroke="#8E8E93" strokeWidth="0.5" />
            ))}
          </svg>
        </div>

        {/* Tactical Key Metric Bars (7 Cols) */}
        <div className="sm:col-span-7 space-y-1.5">
          {dimensions.map((dim, i) => (
            <div key={i} className="apple-tile p-2 rounded-xl border border-white/[0.05]">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-semibold text-white/90">{dim.label}</span>
                <span className="font-mono text-[10px]">
                  <strong className="text-[#FF2636]">{dim.lfcVal}</strong>
                  <span className="text-white/30"> vs </span>
                  <span className="text-white/60">{dim.oppVal}</span>
                </span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden flex gap-0.5">
                <div
                  className="bg-[#FF2636] h-full rounded-full transition-all duration-500"
                  style={{ width: `${(dim.lfc / (dim.lfc + dim.opp)) * 100}%` }}
                />
                <div
                  className="bg-white/35 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(dim.opp / (dim.lfc + dim.opp)) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
