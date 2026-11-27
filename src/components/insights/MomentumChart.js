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
  selectedClub,
  overlayMode,
  setOverlayMode,
  selectedPlayer,
  setSelectedPlayer,
}) {
  const clubName = selectedClub?.name || activeMatch?.clubName || activeMatch?.homeTeam || "Club";
  const stadiumName = selectedClub?.stadium || activeMatch?.venue || "Stadium";
  const managerSurname = (selectedClub?.manager || activeMatch?.selectedManager || "Head Coach").split(" ").slice(-1)[0];
  const momentumPoints = activeMatch?.momentumPoints?.length
    ? activeMatch.momentumPoints
    : [
        { min: 0, val: 28 },
        { min: 15, val: 65, event: `${selectedClub?.shortName || "Home"} High-Press Blitz` },
        { min: 30, val: 78, event: "Half-Space Overload" },
        { min: 45, val: 40, event: "HT Tactical Reset" },
        { min: 60, val: 85, event: "Box Breakthrough", isGoal: true },
        { min: 75, val: 60, event: `${managerSurname} Midfield Control` },
        { min: 90, val: 74, event: "Full-Time Control" },
      ];
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
    <div className="w-full space-y-3.5 min-w-0">
      {/* 0. Selected Player Tactical Spotlight Card */}
      {selectedPlayer && (
        <div className="apple-card rounded-[20px] p-4 border-white/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold tabular-nums text-white">
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
                  <UserCheck className="w-3 h-3 text-white/80" />
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

          <div className="grid grid-cols-3 divide-x divide-white/[0.07] text-xs mb-3 py-1 border-y border-white/[0.06]">
            <div className="pr-2.5">
              <span className="text-[10px] text-[#8E8E93] font-medium block">
                On-Ball Value
              </span>
              <span className="text-[15px] font-semibold text-[#FF2636] tabular-nums mt-0.5 block">
                +{selectedPlayer.obv.toFixed(2)}
              </span>
            </div>
            <div className="px-2.5">
              <span className="text-[10px] text-[#8E8E93] font-medium block">
                Touches / Pass
              </span>
              <span className="text-[15px] font-semibold text-white tabular-nums mt-0.5 block">
                {selectedPlayer.touches} / {selectedPlayer.passes}
              </span>
            </div>
            <div className="pl-2.5">
              <span className="text-[10px] text-[#8E8E93] font-medium block">
                Accuracy
              </span>
              <span className="text-[15px] font-semibold text-white/90 tabular-nums mt-0.5 block">
                {selectedPlayer.comp}%
              </span>
            </div>
          </div>

          {playerConnections.length > 0 && (
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-[#8E8E93] flex items-center gap-1.5 mb-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#E31B23]" />
                Primary Passing Combinations
              </span>
              <div className="divide-y divide-white/[0.06]">
                {playerConnections.slice(0, 3).map((conn, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-[11px] py-2 first:pt-1 last:pb-0"
                  >
                    <span className="text-white font-medium">
                      #{conn.partnerNumber} {conn.partnerName}{" "}
                      <span className="text-[#EBEBF5]/60 text-[10px]">
                        ({conn.partnerPos})
                      </span>
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-white/90">
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
          <span className="text-[11px] text-white/70 font-medium">
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
                className={`min-h-[54px] pressable flex flex-col items-center justify-center py-2 px-1.5 rounded-[12px] text-center cursor-pointer ${
                  isActive
                    ? "glass-crimson-pill text-white"
                    : "text-[#8E8E93] hover:text-white hover:bg-white/[0.08]"
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
            aria-label={`Match momentum chart for ${activeMatch?.title || clubName}`}
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
                    fill={p.isGoal ? "#FF2636" : "#FFFFFF"}
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
                    fill={p.isGoal ? "#FF2636" : "#F5F5F7"}
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
          <Zap className="w-4 h-4 text-[#FF2636]" strokeWidth={2} />
          <h3 className="text-[13px] font-semibold text-white tracking-[-0.01em]">
            Key Match Science Indicators
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-4 text-xs pt-2 border-t border-white/[0.06]">
          {/* Metric 1: Total Team xG */}
          <div className="pb-3 border-b border-white/[0.06]">
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

          {/* Metric 2: Field Tilt */}
          <div className="pb-3 border-b border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-[#FF4D5A] text-[11px] font-semibold uppercase tracking-[0.05em] block">
                Field Tilt
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/70">
                Dominance
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[22px] font-bold tracking-tight text-white tabular-nums">
                {metrics.fieldTilt}%
              </span>
            </div>
            <span className="text-[10px] text-[#8E8E93] font-medium block truncate mt-0.5">
              {stadiumName} Territorial Domination
            </span>
          </div>

          {/* Metric 3: Defensive PPDA */}
          <div>
            <span className="text-[#8E8E93] text-[11px] font-medium block">
              Defensive PPDA
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-[22px] font-bold tracking-tight text-[#FF2636] tabular-nums">
                {metrics.ppda}
              </span>
              <span className="text-[10px] text-[#8E8E93]">passes/act</span>
            </div>
            <span className="text-[10px] text-[#8E8E93] mt-0.5 block truncate">
              {managerSurname} High Press Index
            </span>
          </div>

          {/* Metric 4: Counter-Press Regains */}
          <div>
            <span className="text-[#8E8E93] text-[11px] font-medium block">
              Counter-Press
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-[22px] font-bold tracking-tight text-white tabular-nums">
                {metrics.counterPressRegains}
              </span>
              <span className="text-[10px] text-white/70 font-medium">regains</span>
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
