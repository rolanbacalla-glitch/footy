"use client";

import React from "react";
import {
  Crosshair,
  Compass,
  Shield,
  Zap,
  Gauge,
  Target,
  CornerDownRight,
  Trophy,
  ArrowUpRight,
} from "lucide-react";

export default function TacticalKpiDeck({
  activeMatch,
  selectedClub,
  liveFactData,
  onOpenStandings,
}) {
  const clubShort =
    selectedClub?.shortName || activeMatch?.clubShort || "LIV";
  const metrics = activeMatch?.metrics || {
    teamXg: 2.18,
    opponentXg: 1.05,
    fieldTilt: 65.4,
    ppda: 7.4,
    counterPressRegains: 22,
  };

  const xgDiff = metrics.teamXg - metrics.opponentXg;
  const possession = activeMatch?.liveStats?.possession || [58, 42];
  const shots = activeMatch?.liveStats?.shots || [15, 8];
  const shotsOnTarget = activeMatch?.liveStats?.shotsOnTarget || [6, 3];
  const corners = activeMatch?.liveStats?.corners || [6, 3];

  const selectedRank =
    liveFactData?.standings?.selected?.rank ||
    activeMatch?.standings?.selected?.rank;
  const selectedPts =
    liveFactData?.standings?.selected?.points ||
    activeMatch?.standings?.selected?.points;

  // Momentum wave points for the signature glowing chartreuse spline card
  const momentumPoints = activeMatch?.momentumPoints?.length
    ? activeMatch.momentumPoints
    : [
        { min: 0, val: 28 },
        { min: 15, val: 58 },
        { min: 30, val: 46 },
        { min: 45, val: 64 },
        { min: 60, val: 48 },
        { min: 75, val: 88 },
        { min: 90, val: 66 },
      ];

  const mappedPts = momentumPoints.map((p, idx) => {
    const x =
      momentumPoints.length > 1
        ? 8 + (idx / (momentumPoints.length - 1)) * 204
        : 110;
    const clamped = Math.max(8, Math.min(96, Number(p.val) || 40));
    const y = 78 - (clamped / 100) * 58;
    return { ...p, x, y };
  });

  const wavePath = mappedPts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = mappedPts[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
  }, "");

  const waveArea = mappedPts.length
    ? `${wavePath} L ${mappedPts[mappedPts.length - 1].x} 84 L ${mappedPts[0].x} 84 Z`
    : "";

  const isLive = activeMatch?.type === "LIVE" || activeMatch?.isLive;
  const isMatchday =
    activeMatch?.type === "MATCHDAY" ||
    (activeMatch?.isMatchday && !activeMatch?.isLive);

  const momentumStatus = isLive
    ? "Live Surge"
    : isMatchday
    ? "Projected"
    : "Dominant";

  const kpiCards = [
    {
      id: "xg",
      label: "Expected Goals",
      sublabel: "Attacking output",
      value: Number(metrics.teamXg).toFixed(2),
      delta: `${xgDiff >= 0 ? "+" : ""}${xgDiff.toFixed(2)}`,
      deltaPositive: xgDiff >= 0,
      washClass: "kpi-wash-indigo",
      icon: Crosshair,
    },
    {
      id: "tilt",
      label: "Field Tilt",
      sublabel: "Final-third share",
      value: `${Number(metrics.fieldTilt).toFixed(0)}%`,
      delta: `${(metrics.fieldTilt - 50).toFixed(0)}%`,
      deltaPositive: metrics.fieldTilt >= 50,
      washClass: "kpi-wash-olive",
      icon: Compass,
    },
    {
      id: "ppda",
      label: "Defensive PPDA",
      sublabel: "Press intensity",
      value: Number(metrics.ppda).toFixed(1),
      delta: metrics.ppda <= 9 ? "High" : "Mid",
      deltaPositive: metrics.ppda <= 9,
      washClass: "kpi-wash-teal",
      icon: Shield,
    },
    {
      id: "regains",
      label: "Press Regains",
      sublabel: "High turnovers",
      value: `${metrics.counterPressRegains}`,
      delta: "+14%",
      deltaPositive: true,
      washClass: "kpi-wash-sage",
      icon: Zap,
    },
  ];

  return (
    <section
      aria-label="Match performance indicators"
      className="glass-card p-5 sm:p-6 space-y-5"
    >
      {/* Top Row: Signature 4 Stacked Atmospheric Glass KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.id} className="stacked-kpi-wrap">
              <div
                className={`stacked-kpi-card ${card.washClass} p-5 flex flex-col justify-between min-h-[168px]`}
              >
                {/* Top circular frosted icon well */}
                <div className="w-9 h-9 rounded-full bg-black/55 border border-white/10 flex items-center justify-center text-white/90">
                  <Icon className="w-4 h-4" strokeWidth={1.8} />
                </div>

                {/* Label & oversized light geometric numeral */}
                <div className="mt-5">
                  <div className="text-[11px] font-medium tracking-[0.06em] uppercase text-white/75 leading-snug">
                    {card.label}
                  </div>
                  <div className="text-[11px] text-white/45 mt-0.5">
                    {card.sublabel}
                  </div>

                  <div className="flex items-baseline justify-between gap-2 mt-3.5">
                    <span className="font-display text-3xl sm:text-[36px] font-light tracking-[-0.03em] text-white tabular-nums leading-none">
                      {card.value}
                    </span>
                    <span
                      className={`text-xs font-medium tabular-nums ${
                        card.deltaPositive
                          ? "text-[#A7E87A]"
                          : "text-[#F2858E]"
                      }`}
                    >
                      {card.delta}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Row: 4 Clean Utility Stat Tiles + Glowing Electric Lime Momentum Wave */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left 7 cols: 2x2 quiet glass utility tiles */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="glass-tile px-4 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Gauge className="w-4 h-4 text-[#8A8D96] shrink-0" strokeWidth={1.8} />
              <span className="text-xs sm:text-[13px] text-[#B7BAC3] truncate">
                Possession
              </span>
            </div>
            <span className="font-display text-base font-medium text-white tabular-nums">
              {possession[0]}%
            </span>
          </div>

          <div className="glass-tile px-4 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Target className="w-4 h-4 text-[#8A8D96] shrink-0" strokeWidth={1.8} />
              <span className="text-xs sm:text-[13px] text-[#B7BAC3] truncate">
                Shots (On Target)
              </span>
            </div>
            <span className="font-display text-base font-medium text-white tabular-nums">
              {shots[0]} ({shotsOnTarget[0]})
            </span>
          </div>

          <div className="glass-tile px-4 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <CornerDownRight
                className="w-4 h-4 text-[#8A8D96] shrink-0"
                strokeWidth={1.8}
              />
              <span className="text-xs sm:text-[13px] text-[#B7BAC3] truncate">
                Corner Kicks
              </span>
            </div>
            <span className="font-display text-base font-medium text-white tabular-nums">
              {corners[0]} – {corners[1]}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenStandings}
            className="glass-tile px-4 py-3.5 flex items-center justify-between gap-3 text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Trophy
                className="w-4 h-4 text-[#D2F865] shrink-0"
                strokeWidth={1.8}
              />
              <span className="text-xs sm:text-[13px] text-[#B7BAC3] group-hover:text-white transition-colors truncate">
                {clubShort} Table Rank
              </span>
            </div>
            <span className="flex items-center gap-1 font-display text-base font-medium text-white tabular-nums">
              {selectedRank ? `#${selectedRank}` : "Table"}
              {selectedPts ? (
                <span className="text-xs text-[#8A8D96] font-normal ml-0.5">
                  ({selectedPts} pts)
                </span>
              ) : null}
              <ArrowUpRight className="w-3.5 h-3.5 text-[#8A8D96] group-hover:text-[#D2F865] transition-colors" />
            </span>
          </button>
        </div>

        {/* Right 5 cols: Match Momentum Wave (Direct nod to reference "Project Progress / On Track" lime wave) */}
        <div className="lg:col-span-5 glass-tile p-4 flex flex-col justify-between min-h-[124px] overflow-hidden">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs sm:text-[13px] font-medium text-white">
              Match Momentum
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-[#D2F865] text-[#0E100C] text-[10px] font-semibold tracking-tight whitespace-nowrap">
              {momentumStatus}
            </span>
          </div>

          <div className="relative w-full h-[76px] -mx-1">
            <svg
              role="img"
              aria-label={`Match momentum spline for ${activeMatch?.title || clubShort}`}
              viewBox="0 0 220 84"
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient id="limeMomentumFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D2F865" stopOpacity="0.42" />
                  <stop offset="70%" stopColor="#D2F865" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#D2F865" stopOpacity="0" />
                </linearGradient>
                <filter id="limeWaveGlow" x="-10%" y="-20%" width="120%" height="140%">
                  <feDropShadow
                    dx="0"
                    dy="2"
                    stdDeviation="3"
                    floodColor="#D2F865"
                    floodOpacity="0.45"
                  />
                </filter>
              </defs>
              {waveArea && <path d={waveArea} fill="url(#limeMomentumFill)" />}
              {wavePath && (
                <path
                  d={wavePath}
                  fill="none"
                  stroke="#D2F865"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  filter="url(#limeWaveGlow)"
                />
              )}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
