"use client";

import React, { useState } from "react";
import { Filter, Sliders, ChevronDown, Sparkles } from "lucide-react";

// 6 Attributes for Liverpool Recruitment Radar
export const RADAR_AXES = [
  { key: "goalThreat", label: "Goal Threat (xG / Sh)" },
  { key: "progCarries", label: "Progressive Carries" },
  { key: "creativePassing", label: "Creative Passing (xA)" },
  { key: "pressingIntensity", label: "Counter-Pressing (PAdj)" },
  { key: "defInterceptions", label: "Defensive Interceptions" },
  { key: "aerialDominance", label: "Aerial Win Rate %" },
];

// Candidates and LFC Benchmarks (Current 2026/27 Squad under Head Coach Andoni Iraola)
export const PROFILE_POOL = [
  // Current Liverpool 2026/27 Squad Benchmarks
  {
    id: "wirtz",
    name: "Florian Wirtz (#7)",
    club: "Liverpool FC",
    role: "LFC Record Signing • Playmaker / No.10",
    age: 23,
    marketVal: "£116m",
    pressing: 8.8,
    progPasses: 9.4,
    stats: {
      goalThreat: 90,
      progCarries: 97,
      creativePassing: 98,
      pressingIntensity: 88,
      defInterceptions: 66,
      aerialDominance: 50,
    },
    profileType: "benchmark",
  },
  {
    id: "isak",
    name: "Alexander Isak (#9)",
    club: "Liverpool FC",
    role: "LFC Marquee Striker • Complete No.9",
    age: 27,
    marketVal: "£125m",
    pressing: 8.4,
    progPasses: 7.2,
    stats: {
      goalThreat: 96,
      progCarries: 91,
      creativePassing: 82,
      pressingIntensity: 85,
      defInterceptions: 52,
      aerialDominance: 78,
    },
    profileType: "benchmark",
  },
  {
    id: "gravenberch",
    name: "Ryan Gravenberch (#38)",
    club: "Liverpool FC",
    role: "LFC No.6 / Double Pivot Controller",
    age: 24,
    marketVal: "£85m",
    pressing: 9.1,
    progPasses: 8.8,
    stats: {
      goalThreat: 64,
      progCarries: 96,
      creativePassing: 85,
      pressingIntensity: 93,
      defInterceptions: 91,
      aerialDominance: 79,
    },
    profileType: "benchmark",
  },
  {
    id: "szoboszlai",
    name: "Dominik Szoboszlai (#8)",
    club: "Liverpool FC",
    role: "LFC High-Press Attacking Midfielder",
    age: 26,
    marketVal: "£85m",
    pressing: 9.4,
    progPasses: 8.4,
    stats: {
      goalThreat: 82,
      progCarries: 88,
      creativePassing: 89,
      pressingIntensity: 96,
      defInterceptions: 78,
      aerialDominance: 70,
    },
    profileType: "benchmark",
  },
  {
    id: "frimpong",
    name: "Jeremie Frimpong (#30)",
    club: "Liverpool FC",
    role: "LFC Dynamic Right Wing-Back",
    age: 25,
    marketVal: "£55m",
    pressing: 8.7,
    progPasses: 8.3,
    stats: {
      goalThreat: 84,
      progCarries: 98,
      creativePassing: 86,
      pressingIntensity: 87,
      defInterceptions: 68,
      aerialDominance: 46,
    },
    profileType: "benchmark",
  },
  {
    id: "kerkez",
    name: "Milos Kerkez (#6)",
    club: "Liverpool FC",
    role: "LFC High-Intensity Left-Back",
    age: 23,
    marketVal: "£50m",
    pressing: 9.1,
    progPasses: 8.2,
    stats: {
      goalThreat: 58,
      progCarries: 90,
      creativePassing: 79,
      pressingIntensity: 93,
      defInterceptions: 86,
      aerialDominance: 72,
    },
    profileType: "benchmark",
  },
  {
    id: "barcola",
    name: "Bradley Barcola (#29)",
    club: "Liverpool FC",
    role: "LFC Marquee Winger (£123m Summer 2026 Signing)",
    age: 24,
    marketVal: "£123m",
    pressing: 8.9,
    progPasses: 8.1,
    stats: {
      goalThreat: 91,
      progCarries: 98,
      creativePassing: 88,
      pressingIntensity: 90,
      defInterceptions: 58,
      aerialDominance: 62,
    },
    profileType: "benchmark",
  },
  {
    id: "jacquet",
    name: "Jérémy Jacquet (#5)",
    club: "Liverpool FC",
    role: "LFC Ball-Playing Centre-Back (£60m Summer 2026 Signing)",
    age: 21,
    marketVal: "£60m",
    pressing: 8.7,
    progPasses: 8.4,
    stats: {
      goalThreat: 52,
      progCarries: 89,
      creativePassing: 82,
      pressingIntensity: 88,
      defInterceptions: 93,
      aerialDominance: 89,
    },
    profileType: "benchmark",
  },

  // Active 2026/27 External Transfer Targets (Iraola / Hughes Watchlist)
  {
    id: "wharton",
    name: "Adam Wharton",
    club: "Crystal Palace",
    role: "Deep-Lying Playmaker / Press-Resistant No.6",
    age: 22,
    marketVal: "£75m",
    pressing: 8.9,
    progPasses: 9.2,
    stats: {
      goalThreat: 58,
      progCarries: 86,
      creativePassing: 93,
      pressingIntensity: 90,
      defInterceptions: 92,
      aerialDominance: 74,
    },
    profileType: "target",
    fitScore: 96,
  },
  {
    id: "baleba",
    name: "Carlos Baleba",
    club: "Brighton & Hove Albion",
    role: "Ball-Winning Destroyer / Carrier",
    age: 22,
    marketVal: "£70m",
    pressing: 9.4,
    progPasses: 8.1,
    stats: {
      goalThreat: 64,
      progCarries: 95,
      creativePassing: 78,
      pressingIntensity: 96,
      defInterceptions: 94,
      aerialDominance: 82,
    },
    profileType: "target",
    fitScore: 95,
  },
  {
    id: "semenyo",
    name: "Antoine Semenyo",
    club: "AFC Bournemouth",
    role: "Two-Footed Direct Winger (Iraola System)",
    age: 26,
    marketVal: "£55m",
    pressing: 8.8,
    progPasses: 7.5,
    stats: {
      goalThreat: 88,
      progCarries: 94,
      creativePassing: 81,
      pressingIntensity: 91,
      defInterceptions: 64,
      aerialDominance: 76,
    },
    profileType: "target",
    fitScore: 93,
  },
  {
    id: "larsson",
    name: "Hugo Larsson",
    club: "Eintracht Frankfurt",
    role: "Box-to-Box Tactical Engine",
    age: 22,
    marketVal: "£48m",
    pressing: 9.2,
    progPasses: 8.3,
    stats: {
      goalThreat: 68,
      progCarries: 84,
      creativePassing: 82,
      pressingIntensity: 94,
      defInterceptions: 88,
      aerialDominance: 75,
    },
    profileType: "target",
    fitScore: 92,
  },
  {
    id: "kudus",
    name: "Mohammed Kudus",
    club: "West Ham United",
    role: "Inverted Right Winger / 1v1 Ball Carrier",
    age: 26,
    marketVal: "£75m",
    pressing: 8.1,
    progPasses: 7.4,
    stats: {
      goalThreat: 86,
      progCarries: 97,
      creativePassing: 79,
      pressingIntensity: 83,
      defInterceptions: 66,
      aerialDominance: 68,
    },
    profileType: "target",
    fitScore: 90,
  },
];

export default function TransferScoutView({ selectedClub, activeMatch }) {
  const clubName = selectedClub?.name || activeMatch?.clubName || "Liverpool";
  const clubShort = selectedClub?.shortName || activeMatch?.clubShort || "LIV";
  const managerName = selectedClub?.manager || activeMatch?.selectedManager || "Andoni Iraola";
  const isLfc = String(selectedClub?.id || "364") === "364";

  // Build dynamic benchmark list for the currently selected club from its real starting XI
  const dynamicBenchmarks = React.useMemo(() => {
    if (isLfc) {
      return PROFILE_POOL.filter((p) => p.profileType === "benchmark");
    }
    const xi = activeMatch?.startingXI || [];
    return xi.slice(1).map((p, idx) => ({
      id: String(p.id),
      name: `${p.name} (#${p.number})`,
      club: clubName,
      role: `${clubShort} First-Team Starter • ${p.pos}`,
      age: 24 + (idx % 4),
      marketVal: `£${55 + (idx % 5) * 10}m`,
      pressing: Number((8.5 + (idx % 4) * 0.25).toFixed(1)),
      progPasses: Number((7.8 + (idx % 5) * 0.3).toFixed(1)),
      stats: {
        goalThreat: p.pos === "ST" || p.pos === "RW" || p.pos === "LW" ? 89 : 64,
        progCarries: 88 + (idx % 8),
        creativePassing: 84 + (idx % 10),
        pressingIntensity: 87 + (idx % 7),
        defInterceptions: p.pos.includes("B") || p.pos.includes("DM") ? 90 : 66,
        aerialDominance: p.pos.includes("CB") || p.pos === "ST" ? 84 : 68,
      },
      profileType: "benchmark",
    }));
  }, [isLfc, activeMatch?.startingXI, clubName, clubShort]);

  const targetList = React.useMemo(
    () => PROFILE_POOL.filter((p) => p.profileType === "target" && p.club.toLowerCase() !== clubName.toLowerCase()),
    [clubName]
  );

  const [targetId, setTargetId] = useState("wharton");
  const [benchmarkId, setBenchmarkId] = useState("gravenberch");

  // Interactive Recruitment Sliders
  const [minPressing, setMinPressing] = useState(7.5);
  const [maxAge, setMaxAge] = useState(26);
  const [minProgPasses, setMinProgPasses] = useState(7.0);

  const targetPlayer =
    targetList.find((p) => p.id === targetId) || targetList[0] || PROFILE_POOL[8];
  const benchmarkPlayer =
    dynamicBenchmarks.find((p) => p.id === benchmarkId) || dynamicBenchmarks[0] || PROFILE_POOL[0];

  const centreX = 150;
  const centreY = 150;
  const maxR = 105;
  const totalAxes = RADAR_AXES.length;

  const getCoordinates = (value, index) => {
    const angle = ((Math.PI * 2) / totalAxes) * index - Math.PI / 2;
    const r = (value / 100) * maxR;
    const x = centreX + r * Math.cos(angle);
    const y = centreY + r * Math.sin(angle);
    return { x, y, angle };
  };

  const targetPoints = RADAR_AXES.map((axis, i) =>
    getCoordinates(targetPlayer.stats[axis.key], i)
  );
  const benchmarkPoints = RADAR_AXES.map((axis, i) =>
    getCoordinates(benchmarkPlayer.stats[axis.key], i)
  );

  const targetPolygon = targetPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const benchmarkPolygon = benchmarkPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const filteredCandidates = targetList.filter(
    (p) =>
      p.pressing >= minPressing &&
      p.age <= maxAge &&
      p.progPasses >= minProgPasses
  );

  return (
    <div className="w-full min-h-0 flex-1 flex flex-col lg:flex-row gap-4 overflow-y-auto pr-0.5">
      {/* 2/3 Left Column: Dual Comparison & 6-Axis Radar Canvas */}
      <div className="flex-1 lg:w-2/3 space-y-3.5 min-w-0">
        {/* Dropdown Selector Header */}
        <div className="apple-card shrink-0 rounded-[20px] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-1/2">
            <label
              htmlFor="select-scout-target"
              className="text-[11px] font-semibold text-[#00DAC3] block mb-1.5"
            >
              Active Scout Target (Mint Polygon)
            </label>
            <div className="relative">
              <select
                id="select-scout-target"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full min-h-[42px] bg-[var(--apple-bg-tertiary)] text-white text-xs font-semibold py-2.5 pl-3.5 pr-9 rounded-xl border border-white/10 appearance-none focus:outline-none focus:border-[#00D2B4] cursor-pointer transition-colors hover:bg-[var(--apple-bg-quaternary)]"
              >
                {targetList.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[var(--apple-bg-elevated)] text-white">
                    {p.name} ({p.club} • Age {p.age})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#EBEBF5]/65 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="w-full sm:w-1/2">
            <label
              htmlFor="select-lfc-benchmark"
              className="text-[11px] font-semibold text-[#FF453A] block mb-1.5"
            >
              Current {clubShort} Benchmark (Crimson Polygon)
            </label>
            <div className="relative">
              <select
                id="select-lfc-benchmark"
                value={benchmarkPlayer?.id || ""}
                onChange={(e) => setBenchmarkId(e.target.value)}
                className="w-full min-h-[42px] bg-[var(--apple-bg-tertiary)] text-white text-xs font-semibold py-2.5 pl-3.5 pr-9 rounded-xl border border-white/10 appearance-none focus:outline-none focus:border-[#E63946] cursor-pointer transition-colors hover:bg-[var(--apple-bg-quaternary)]"
              >
                {dynamicBenchmarks.map(
                  (p) => (
                    <option key={p.id} value={p.id} className="bg-[var(--apple-bg-elevated)] text-white">
                      {p.name} ({p.role})
                    </option>
                  )
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-[#EBEBF5]/65 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Radar Graphic Canvas */}
        <div className="apple-card rounded-[20px] p-4 flex-1 flex flex-col items-center justify-center relative min-h-[360px]">
          <div className="w-full flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFD60A]" strokeWidth={2} />
              <span className="text-[13px] font-semibold text-white tracking-[-0.01em]">
                6-Axis Tactical Percentile Radar Matrix
              </span>
            </div>
            <span className="text-[11px] text-[#EBEBF5]/60 hidden sm:inline">
              Percentile Scale (0–100)
            </span>
          </div>

          {/* Inline SVG Radar Wheel */}
          <svg
            role="img"
            aria-label={`Six-axis recruitment comparison radar between ${targetPlayer.name} and ${benchmarkPlayer.name}`}
            viewBox="0 0 300 300"
            className="w-full max-w-[420px] max-h-[370px]"
          >
            {[20, 40, 60, 80, 100].map((level) => (
              <polygon
                key={level}
                points={RADAR_AXES.map((_, i) => {
                  const p = getCoordinates(level, i);
                  return `${p.x},${p.y}`;
                }).join(" ")}
                fill="none"
                stroke="rgba(235,235,245,0.14)"
                strokeWidth="0.9"
                strokeDasharray={level === 60 ? "2.5, 2.5" : undefined}
              />
            ))}

            {RADAR_AXES.map((_, i) => {
              const p = getCoordinates(100, i);
              return (
                <line
                  key={i}
                  x1={centreX}
                  y1={centreY}
                  x2={p.x}
                  y2={p.y}
                  stroke="rgba(235,235,245,0.12)"
                  strokeWidth="0.9"
                />
              );
            })}

            {/* Benchmark Polygon (Apple Dark Red) */}
            <polygon
              points={benchmarkPolygon}
              fill="#FF453A"
              fillOpacity="0.22"
              stroke="#FF453A"
              strokeWidth="2"
            />
            {benchmarkPoints.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="3.1"
                fill="#FF453A"
                stroke="#121212"
                strokeWidth="1"
              />
            ))}

            {/* Target Polygon (Apple Dark Mint) */}
            <polygon
              points={targetPolygon}
              fill="#00DAC3"
              fillOpacity="0.26"
              stroke="#00DAC3"
              strokeWidth="2.2"
            />
            {targetPoints.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="3.4"
                fill="#00DAC3"
                stroke="#121212"
                strokeWidth="1"
              />
            ))}

            {/* Axis Labels */}
            {RADAR_AXES.map((axis, i) => {
              const p = getCoordinates(118, i);
              return (
                <text
                  key={i}
                  x={p.x}
                  y={p.y + 3}
                  textAnchor="middle"
                  fill="#F5F5F7"
                  fontSize="7.4"
                  fontWeight="600"
                  className="select-none"
                >
                  {axis.label}
                </text>
              );
            })}
          </svg>

          {/* Bottom Legend */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs mt-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00DAC3]" />
              <span className="font-semibold text-white">
                {targetPlayer.name}{" "}
                <span className="text-[#EBEBF5]/60 font-normal">(Target)</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF453A]" />
              <span className="font-semibold text-white">
                {benchmarkPlayer.name}{" "}
                <span className="text-[#EBEBF5]/60 font-normal">({clubShort} Squad)</span>
              </span>
            </div>
          </div>

          {/* 6-Axis Head-to-Head Attribute Delta Grid */}
          <div className="w-full mt-4 pt-3.5 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-3 gap-2">
            {RADAR_AXES.map((axis) => {
              const targetVal = targetPlayer.stats[axis.key];
              const benchVal = benchmarkPlayer.stats[axis.key];
              const delta = targetVal - benchVal;
              return (
                <div
                  key={axis.key}
                  className="apple-tile px-3 py-2.5 rounded-[14px] flex flex-col justify-between"
                >
                  <span className="text-[11px] text-[#EBEBF5]/68 font-medium truncate">
                    {axis.label}
                  </span>
                  <div className="flex items-baseline justify-between mt-1.5">
                    <div className="text-xs font-mono tabular-nums">
                      <span className="text-[#00DAC3] font-semibold">
                        {targetVal}
                      </span>
                      <span className="text-[#EBEBF5]/45 mx-1">vs</span>
                      <span className="text-[#FF453A] font-semibold">
                        {benchVal}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono tabular-nums font-semibold px-2 py-0.5 rounded-full ${
                        delta > 0
                          ? "bg-[#30D158]/16 text-[#30D158]"
                          : delta < 0
                            ? "bg-[#FF453A]/16 text-[#FF6961]"
                            : "bg-white/10 text-[#EBEBF5]/70"
                      }`}
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 1/3 Right Column: Edwards/Hughes Tactical Sliders & Filtered Shortlist */}
      <div className="lg:w-1/3 space-y-3.5 min-w-0">
        {/* Tactical Trait Sliders */}
        <div className="apple-card rounded-[20px] p-4">
          <div className="flex items-center gap-2 mb-3.5">
            <Sliders className="w-4 h-4 text-[#FF453A]" strokeWidth={2} />
            <h3 className="text-[13px] font-semibold text-white tracking-[-0.01em]">
              {clubShort} Recruitment Filters
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-medium mb-2">
                <label htmlFor="slider-pressing" className="text-[#EBEBF5]/75">
                  Counter-Pressing Rate (PAdj)
                </label>
                <span className="text-[#00DAC3] font-mono tabular-nums font-semibold">
                  &gt; {minPressing.toFixed(1)}/90
                </span>
              </div>
              <input
                id="slider-pressing"
                type="range"
                min="6.0"
                max="9.5"
                step="0.1"
                value={minPressing}
                onChange={(e) => setMinPressing(parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium mb-2">
                <label htmlFor="slider-max-age" className="text-[#EBEBF5]/75">
                  Max Age Ceiling (FSG Profile)
                </label>
                <span className="text-[#FFD60A] font-mono tabular-nums font-semibold">
                  &le; {maxAge} yrs
                </span>
              </div>
              <input
                id="slider-max-age"
                type="range"
                min="19"
                max="28"
                step="1"
                value={maxAge}
                onChange={(e) => setMaxAge(parseInt(e.target.value, 10))}
                className="w-full cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-medium mb-2">
                <label htmlFor="slider-prog-passes" className="text-[#EBEBF5]/75">
                  Prog. Passes / 90
                </label>
                <span className="text-[#00DAC3] font-mono tabular-nums font-semibold">
                  &gt; {minProgPasses.toFixed(1)}
                </span>
              </div>
              <input
                id="slider-prog-passes"
                type="range"
                min="5.0"
                max="9.0"
                step="0.2"
                value={minProgPasses}
                onChange={(e) => setMinProgPasses(parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Filtered Shortlist Table */}
        <div className="apple-card rounded-[20px] p-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#00DAC3]" strokeWidth={2} />
              <h3 className="text-[13px] font-semibold text-white tracking-[-0.01em]">
                Qualified Targets ({filteredCandidates.length})
              </h3>
            </div>
            <span className="text-[11px] text-[#EBEBF5]/60">
              {managerName} System Fit
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1">
            {filteredCandidates.length === 0 ? (
              <div className="apple-tile p-6 rounded-[14px] text-center text-xs text-[#EBEBF5]/68">
                No scouted targets meet these pressing thresholds. Try easing the sliders.
              </div>
            ) : (
              filteredCandidates.map((candidate) => {
                const isSelected = targetPlayer?.id === candidate.id;
                return (
                  <button
                    type="button"
                    key={candidate.id}
                    onClick={() => setTargetId(candidate.id)}
                    aria-pressed={isSelected}
                    className={`w-full text-left p-3 rounded-[14px] pressable border cursor-pointer ${
                      isSelected
                        ? "apple-tile border-[#00D2B4]/80 shadow-[inset_0_1px_1px_rgba(0,210,180,0.3),0_4px_16px_rgba(0,210,180,0.15)]"
                        : "apple-tile border-white/[0.08] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-white">
                        {candidate.name}
                      </span>
                      <span className="text-[10px] font-mono tabular-nums font-semibold text-[#FFD60A] bg-[#FFD60A]/12 px-2 py-0.5 rounded-full border border-[#FFD60A]/25 shrink-0">
                        {candidate.fitScore}% {clubShort} Fit
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#EBEBF5]/68 mb-1.5">
                      <span>{candidate.club}</span>
                      <span className="text-white font-mono tabular-nums font-semibold">
                        {candidate.marketVal}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-[#00DAC3] font-mono tabular-nums">
                      <span>Press {candidate.pressing}/90</span>
                      <span className="text-[#EBEBF5]/35">•</span>
                      <span>Prog {candidate.progPasses}/90</span>
                      <span className="text-[#EBEBF5]/35">•</span>
                      <span>Age {candidate.age}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
