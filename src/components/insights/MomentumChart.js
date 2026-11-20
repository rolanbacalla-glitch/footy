"use client";

import React from "react";
import {
  Sliders,
  Flame,
  Crosshair,
  BarChart3,
  TrendingUp,
  Zap,
  UserCheck,
  X,
  ArrowRightLeft,
} from "lucide-react";

export default function MomentumChart({
  activeMatch,
  overlayMode,
  setOverlayMode,
  selectedPlayer,
  setSelectedPlayer,
}) {
  const momentumPoints = activeMatch?.momentumPoints || [];
  const startingXI = activeMatch?.startingXI || [];
  const passLinks = activeMatch?.passLinks || [];
  const metrics = activeMatch?.metrics || {
    teamXg: 2.14,
    opponentXg: 1.15,
    fieldTilt: 65,
    ppda: 7.4,
    counterPressRegains: 22,
  };

  // Compute top passing partners when a player node is selected on the pitch
  const playerConnections = selectedPlayer
    ? passLinks
        .filter((l) => l.from === selectedPlayer.id || l.to === selectedPlayer.id)
        .map((l) => {
          const partnerId = l.from === selectedPlayer.id ? l.to : l.from;
          const partner = startingXI.find((p) => p.id === partnerId);
          return {
            partnerName: partner?.name || partnerId,
            partnerNumber: partner?.number || "",
            partnerPos: partner?.pos || "",
            count: l.count,
          };
        })
        .sort((a, b) => b.count - a.count)
    : [];

  // Map to SVG coordinates (width: 300, height: 100, zero-line at Y=50)
  const points = momentumPoints.map((p) => {
    const x = 15 + (p.min / 90) * 270;
    const y = 50 - (p.val / 100) * 40;
    return { ...p, x, y };
  });

  const pathD = points.reduce((acc, p, idx) => {
    if (idx === 0) return `M ${p.x} ${p.y}`;
    const prev = points[idx - 1];
    const cx1 = (prev.x + p.x) / 2;
    const cy1 = prev.y;
    const cx2 = (prev.x + p.x) / 2;
    const cy2 = p.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`;
  }, "");

  const areaD = points.length
    ? `${pathD} L ${points[points.length - 1].x} 50 L ${points[0].x} 50 Z`
    : "";

  const modes = [
    { id: "pass", label: "Pass Network", icon: BarChart3 },
    { id: "heat", label: "Heatmap", icon: Flame },
    { id: "shots", label: "Shots & xG", icon: Crosshair },
  ];

  return (
    <div className="w-full flex flex-col gap-3.5">
      {/* 0. Selected Player Tactical Spotlight Card */}
      {selectedPlayer && (
        <div className="apple-card rounded-[20px] p-4 border-[#00DAC3]/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#00DAC3]/15 border border-[#00DAC3]/35 flex items-center justify-center text-xs font-bold tabular-nums text-[#00DAC3]">
                #{selectedPlayer.number}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-semibold text-white tracking-[-0.015em]">
                    {selectedPlayer.name}
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FF453A]/16 text-[#FF6961] border border-[#FF453A]/28">
                    {selectedPlayer.pos}
                  </span>
                </div>
                <p className="text-[11px] text-[#EBEBF5]/65 flex items-center gap-1 mt-0.5">
                  <UserCheck className="w-3 h-3 text-[#00DAC3]" />
                  Active Pitch Node Telemetry
                </p>
              </div>
            </div>

            {setSelectedPlayer && (
              <button
                onClick={() => setSelectedPlayer(null)}
                aria-label="Clear selected player"
                className="w-8 h-8 rounded-full bg-[var(--apple-bg-tertiary)] border border-white/10 text-[#EBEBF5]/70 hover:text-white hover:bg-[var(--apple-bg-quaternary)] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs mb-3">
            <div className="apple-tile p-2.5 rounded-[14px]">
              <span className="text-[10px] text-[#8E8E93] font-medium block">
                On-Ball Value
              </span>
              <span className="text-[15px] font-semibold text-[#FF2636] tabular-nums mt-0.5 block">
                +{selectedPlayer.obv.toFixed(2)}
              </span>
            </div>
            <div className="apple-tile p-2.5 rounded-[14px]">
              <span className="text-[10px] text-[#8E8E93] font-medium block">
                Touches / Pass
              </span>
              <span className="text-[15px] font-semibold text-white tabular-nums mt-0.5 block">
                {selectedPlayer.touches} / {selectedPlayer.passes}
              </span>
            </div>
            <div className="apple-tile p-2.5 rounded-[14px]">
              <span className="text-[10px] text-[#8E8E93] font-medium block">
                Accuracy
              </span>
              <span className="text-[15px] font-semibold text-[#F1B82D] tabular-nums mt-0.5 block">
                {selectedPlayer.comp}%
              </span>
            </div>
          </div>

          {playerConnections.length > 0 && (
            <div className="pt-2.5 border-t border-white/[0.08]">
              <span className="text-[11px] font-semibold text-[#8E8E93] flex items-center gap-1.5 mb-2">
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#E31B23]" />
                Primary Passing Combinations
              </span>
              <div className="space-y-1.5">
                {playerConnections.slice(0, 3).map((conn, idx) => (
                  <div
                    key={idx}
                    className="apple-tile flex items-center justify-between text-[11px] px-3 py-2 rounded-xl"
                  >
                    <span className="text-white font-medium">
                      #{conn.partnerNumber} {conn.partnerName}{" "}
                      <span className="text-[#EBEBF5]/60 text-[10px]">
                        ({conn.partnerPos})
                      </span>
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-[#00DAC3]">
                      {conn.count} passes
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 1. Tactical Canvas Mode (Apple Segmented Control Card) */}
      <div className="apple-card rounded-[20px] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#FF453A]" strokeWidth={2} />
            <h3 className="text-[13px] font-semibold text-white tracking-[-0.01em]">
              Tactical Canvas Mode
            </h3>
          </div>
          <span className="text-[11px] text-[#00DAC3] font-medium">
            {activeMatch?.competition}
          </span>
        </div>

        <div className="apple-segmented grid grid-cols-3 gap-1 p-1 rounded-2xl">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = overlayMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setOverlayMode(mode.id)}
                aria-pressed={isActive}
                className={`min-h-[54px] flex flex-col items-center justify-center py-2 px-1.5 rounded-[12px] text-center transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "glass-crimson-pill text-white"
                    : "text-[#8E8E93] hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 mb-1 ${
                    isActive ? "text-white" : "text-[#8E8E93]"
                  }`}
                  strokeWidth={2}
                />
                <span className="text-[11px] font-semibold tracking-[-0.01em]">
                  {mode.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Match Momentum Wave */}
      <div className="apple-card rounded-[24px] p-4">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#FF2636]" strokeWidth={2} />
            <h3 className="text-[13px] font-semibold text-white tracking-[-0.01em]">
              Match Momentum Wave
            </h3>
          </div>
          <span className="text-[10px] text-[#FF2636] font-semibold tabular-nums bg-[#E31B23]/12 px-2.5 py-0.5 rounded-full border border-[#E31B23]/25">
            {activeMatch?.statusText}
          </span>
        </div>

        <div className="relative w-full h-28 bg-[var(--apple-bg-base)]/90 rounded-[14px] border border-white/[0.08] p-2 flex items-center justify-center overflow-hidden">
          <svg
            role="img"
            aria-label={`Match momentum chart for ${activeMatch?.title || "Liverpool FC"}`}
            viewBox="0 0 300 100"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="appleMomentumGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF453A" stopOpacity="0.48" />
                <stop offset="72%" stopColor="#FF453A" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#FF453A" stopOpacity="0" />
              </linearGradient>
            </defs>

            <line
              x1="15"
              y1="50"
              x2="285"
              y2="50"
              stroke="rgba(235,235,245,0.22)"
              strokeWidth="0.9"
              strokeDasharray="3, 3"
            />
            {areaD && <path d={areaD} fill="url(#appleMomentumGrad)" />}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#FF453A"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            )}

            {points.map((p, idx) => {
              if (!p.event) return null;
              return (
                <g key={idx} className="group cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={p.isGoal ? "3.8" : "2.6"}
                    fill={p.isGoal ? "#FFD60A" : "#00DAC3"}
                    stroke="#000000"
                    strokeWidth="0.9"
                  />
                  <line
                    x1={p.x}
                    y1={p.y}
                    x2={p.x}
                    y2="88"
                    stroke="#EBEBF5"
                    strokeOpacity="0.16"
                    strokeDasharray="1.5, 2"
                  />
                  <text
                    x={p.x}
                    y={p.isGoal ? p.y - 7 : p.y - 5.5}
                    textAnchor="middle"
                    fill={p.isGoal ? "#FFD60A" : "#F5F5F7"}
                    fontSize="7"
                    fontWeight="600"
                    className="select-none"
                  >
                    {p.event}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#EBEBF5]/60 mt-2 tabular-nums font-medium px-1">
          <span>0&apos; Kick-off</span>
          <span>45&apos; HT</span>
          <span>90&apos; Full-time</span>
        </div>
      </div>

      {/* 3. Key Match Science Indicators (OKX High-Contrast Metric Grid) */}
      <div className="apple-card rounded-[24px] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-[#F1B82D]" strokeWidth={2} />
          <h3 className="text-[13px] font-semibold text-white tracking-[-0.01em]">
            Key Match Science Indicators
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          {/* Card 1: Total Team xG */}
          <div className="apple-tile p-3 rounded-[16px] border border-white/[0.06]">
            <span className="text-[#8E8E93] text-[11px] font-medium block">
              Total Team xG
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-[22px] font-bold tracking-tight text-white tabular-nums">
                {metrics.teamXg.toFixed(2)}
              </span>
              <span className="text-[11px] text-[#8E8E93] tabular-nums">
                vs {metrics.opponentXg.toFixed(2)}
              </span>
            </div>
            <span className="text-[10px] text-[#FF2636] font-medium tabular-nums mt-0.5 block">
              +{(metrics.teamXg - metrics.opponentXg).toFixed(2)} xG Supremacy
            </span>
          </div>

          {/* Card 2: Signature Crimson Glassmorphic Highlight Card for Field Tilt */}
          <div className="glass-crimson-card p-3 rounded-[16px] text-white flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-white/85 text-[11px] font-semibold uppercase tracking-[0.05em] block drop-shadow-sm">
                Field Tilt
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 border border-white/30 text-white shadow-inner">
                Dominance
              </span>
            </div>
            <div className="flex items-baseline gap-1 my-0.5">
              <span className="text-[26px] font-extrabold tracking-tight text-white tabular-nums drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
                {metrics.fieldTilt}%
              </span>
            </div>
            <span className="text-[10px] text-white/95 font-medium block drop-shadow-sm">
              Anfield Territorial Domination
            </span>
          </div>

          {/* Card 3: Defensive PPDA */}
          <div className="apple-tile p-3 rounded-[16px] border border-white/[0.06]">
            <span className="text-[#8E8E93] text-[11px] font-medium block">
              Defensive PPDA
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-[22px] font-bold tracking-tight text-[#FF2636] tabular-nums">
                {metrics.ppda}
              </span>
              <span className="text-[10px] text-[#8E8E93]">passes/act</span>
            </div>
            <span className="text-[10px] text-[#8E8E93] mt-0.5 block">
              Iraola High Press Index
            </span>
          </div>

          {/* Card 4: Counter-Press Regains */}
          <div className="apple-tile p-3 rounded-[16px] border border-white/[0.06]">
            <span className="text-[#8E8E93] text-[11px] font-medium block">
              Counter-Press
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-[22px] font-bold tracking-tight text-white tabular-nums">
                {metrics.counterPressRegains}
              </span>
              <span className="text-[10px] text-[#F1B82D] font-medium">regains</span>
            </div>
            <span className="text-[10px] text-[#8E8E93] mt-0.5 block">
              Gegenpress Turnovers
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
