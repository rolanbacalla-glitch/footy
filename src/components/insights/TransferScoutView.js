"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export const RADAR_AXES = [
  { key: "goalThreat", label: "Goal Threat" },
  { key: "progCarries", label: "Prog. Carries" },
  { key: "creativePassing", label: "Creative Passing" },
  { key: "pressingIntensity", label: "Counter-Press" },
  { key: "defInterceptions", label: "Interceptions" },
  { key: "aerialDominance", label: "Aerial Win %" },
];

export const PROFILE_POOL = [
  {
    id: "wirtz",
    name: "Florian Wirtz (#7)",
    club: "Liverpool FC",
    role: "Playmaker / No.10",
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
    role: "Complete No.9",
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
    role: "Double Pivot Controller",
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
    role: "High-Press Attacking Mid",
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
    role: "Right Wing-Back",
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
    role: "High-Intensity Left-Back",
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
    role: "Wide Forward",
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
    role: "Ball-Playing Centre-Back",
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
  {
    id: "wharton",
    name: "Adam Wharton",
    club: "Crystal Palace",
    role: "Deep-Lying Playmaker / No.6",
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
    role: "Ball-Winning Carrier",
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
    role: "Two-Footed Direct Winger",
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
    role: "Box-to-Box Midfielder",
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
    role: "Inverted Right Winger",
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
  const managerName =
    selectedClub?.manager || activeMatch?.selectedManager || "Andoni Iraola";
  const isLfc = String(selectedClub?.id || "364") === "364";

  const dynamicBenchmarks = React.useMemo(() => {
    if (isLfc) return PROFILE_POOL.filter((p) => p.profileType === "benchmark");
    const xi = activeMatch?.startingXI || [];
    return xi.slice(1).map((p, idx) => ({
      id: String(p.id),
      name: `${p.name} (#${p.number})`,
      club: clubName,
      role: `${clubShort} Starter · ${p.pos}`,
      age: 24 + (idx % 4),
      marketVal: `£${55 + (idx % 5) * 10}m`,
      pressing: Number((8.5 + (idx % 4) * 0.25).toFixed(1)),
      progPasses: Number((7.8 + (idx % 5) * 0.3).toFixed(1)),
      stats: {
        goalThreat:
          p.pos === "ST" || p.pos === "RW" || p.pos === "LW" ? 89 : 64,
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
    () =>
      PROFILE_POOL.filter(
        (p) =>
          p.profileType === "target" &&
          p.club.toLowerCase() !== clubName.toLowerCase()
      ),
    [clubName]
  );

  const [targetId, setTargetId] = useState("wharton");
  const [benchmarkId, setBenchmarkId] = useState("gravenberch");
  const [minPressing, setMinPressing] = useState(7.5);
  const [maxAge, setMaxAge] = useState(26);
  const [minProgPasses, setMinProgPasses] = useState(7.0);

  const targetPlayer =
    targetList.find((p) => p.id === targetId) ||
    targetList[0] ||
    PROFILE_POOL[8];
  const benchmarkPlayer =
    dynamicBenchmarks.find((p) => p.id === benchmarkId) ||
    dynamicBenchmarks[0] ||
    PROFILE_POOL[0];

  const centreX = 150;
  const centreY = 150;
  const maxR = 104;
  const totalAxes = RADAR_AXES.length;

  const getCoordinates = (value, index) => {
    const angle = ((Math.PI * 2) / totalAxes) * index - Math.PI / 2;
    const r = (value / 100) * maxR;
    return {
      x: centreX + r * Math.cos(angle),
      y: centreY + r * Math.sin(angle),
    };
  };

  const targetPoints = RADAR_AXES.map((axis, i) =>
    getCoordinates(targetPlayer.stats[axis.key], i)
  );
  const benchmarkPoints = RADAR_AXES.map((axis, i) =>
    getCoordinates(benchmarkPlayer.stats[axis.key], i)
  );

  const targetPolygon = targetPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const benchmarkPolygon = benchmarkPoints
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  const filteredCandidates = targetList.filter(
    (p) =>
      p.pressing >= minPressing &&
      p.age <= maxAge &&
      p.progPasses >= minProgPasses
  );

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
      {/* Left 8 Cols: Comparison Selectors & 6-Axis Radar */}
      <div className="xl:col-span-8 space-y-5 min-w-0">
        <div className="glass-card p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="select-scout-target"
              className="text-xs font-medium text-[#D2F865] block mb-2"
            >
              Scout Target
            </label>
            <div className="relative">
              <select
                id="select-scout-target"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full min-h-[44px] bg-[#14151A] text-white text-xs font-medium py-2.5 pl-4 pr-9 rounded-full border border-white/[0.09] appearance-none focus:outline-none focus:border-[#D2F865]/60 cursor-pointer"
              >
                {targetList.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#14151A]">
                    {p.name} ({p.club} · Age {p.age})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#8A8D96] absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label
              htmlFor="select-club-benchmark"
              className="text-xs font-medium text-[#8BA3F5] block mb-2"
            >
              {clubShort} Squad Benchmark
            </label>
            <div className="relative">
              <select
                id="select-club-benchmark"
                value={benchmarkPlayer?.id || ""}
                onChange={(e) => setBenchmarkId(e.target.value)}
                className="w-full min-h-[44px] bg-[#14151A] text-white text-xs font-medium py-2.5 pl-4 pr-9 rounded-full border border-white/[0.09] appearance-none focus:outline-none focus:border-[#8BA3F5]/60 cursor-pointer"
              >
                {dynamicBenchmarks.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#14151A]">
                    {p.name} ({p.role})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#8A8D96] absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Radar Visualisation Card */}
        <div className="glass-card-deep p-6 flex flex-col items-center">
          <div className="w-full flex items-center justify-between gap-2 pb-4 border-b border-white/[0.06] mb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-white">
                6-Axis Tactical Percentile Radar
              </h2>
              <p className="text-xs text-[#8A8D96] mt-0.5">
                Head-to-head profile overlay (0–100 percentile scale)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D2F865]" />
                {targetPlayer.name}
              </span>
              <span className="flex items-center gap-1.5 text-[#B7BAC3]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#637AE0]" />
                {benchmarkPlayer.name.split(" (")[0]}
              </span>
            </div>
          </div>

          <svg
            role="img"
            aria-label={`Six-axis recruitment comparison between ${targetPlayer.name} and ${benchmarkPlayer.name}`}
            viewBox="0 0 300 300"
            className="w-full max-w-[380px] max-h-[340px]"
          >
            {[20, 40, 60, 80, 100].map((level) => (
              <polygon
                key={level}
                points={RADAR_AXES.map((_, i) => {
                  const p = getCoordinates(level, i);
                  return `${p.x},${p.y}`;
                }).join(" ")}
                fill="none"
                stroke="rgba(255,255,255,0.09)"
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
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="0.9"
                />
              );
            })}

            {/* Benchmark Polygon (Indigo Slate) */}
            <polygon
              points={benchmarkPolygon}
              fill="#637AE0"
              fillOpacity="0.22"
              stroke="#8BA3F5"
              strokeWidth="1.8"
            />
            {benchmarkPoints.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="2.8"
                fill="#8BA3F5"
                stroke="#0B0C0F"
                strokeWidth="1"
              />
            ))}

            {/* Target Polygon (Electric Lime) */}
            <polygon
              points={targetPolygon}
              fill="#D2F865"
              fillOpacity="0.24"
              stroke="#D2F865"
              strokeWidth="2.1"
            />
            {targetPoints.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="3.2"
                fill="#D2F865"
                stroke="#0B0C0F"
                strokeWidth="1"
              />
            ))}

            {RADAR_AXES.map((axis, i) => {
              const p = getCoordinates(118, i);
              return (
                <text
                  key={i}
                  x={p.x}
                  y={p.y + 3}
                  textAnchor="middle"
                  fill="#B7BAC3"
                  fontSize="7.4"
                  fontWeight="500"
                  className="select-none"
                >
                  {axis.label}
                </text>
              );
            })}
          </svg>

          {/* Attribute Delta Grid */}
          <div className="w-full mt-6 pt-5 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
            {RADAR_AXES.map((axis) => {
              const targetVal = targetPlayer.stats[axis.key];
              const benchVal = benchmarkPlayer.stats[axis.key];
              const delta = targetVal - benchVal;
              return (
                <div
                  key={axis.key}
                  className="py-1.5 border-b border-white/[0.05]"
                >
                  <div className="text-[11px] text-[#8A8D96] truncate">
                    {axis.label}
                  </div>
                  <div className="flex items-baseline justify-between mt-1.5">
                    <span className="font-mono text-xs tabular-nums">
                      <span className="text-[#D2F865] font-semibold">
                        {targetVal}
                      </span>
                      <span className="text-white/30 mx-1">/</span>
                      <span className="text-[#8BA3F5]">{benchVal}</span>
                    </span>
                    <span
                      className={`font-mono text-[11px] font-medium tabular-nums ${
                        delta > 0
                          ? "text-[#A7E87A]"
                          : delta < 0
                          ? "text-[#F2858E]"
                          : "text-[#8A8D96]"
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

      {/* Right 4 Cols: Recruitment Filters & Qualified Shortlist */}
      <div className="xl:col-span-4 space-y-5">
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-display text-sm font-semibold text-white">
            {clubShort} Recruitment Filters
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-2">
                <label htmlFor="slider-pressing" className="text-[#B7BAC3]">
                  Counter-Pressing (PAdj)
                </label>
                <span className="font-mono text-[#D2F865] tabular-nums">
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
              <div className="flex justify-between mb-2">
                <label htmlFor="slider-max-age" className="text-[#B7BAC3]">
                  Max Age Ceiling
                </label>
                <span className="font-mono text-white tabular-nums">
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
              <div className="flex justify-between mb-2">
                <label htmlFor="slider-prog-passes" className="text-[#B7BAC3]">
                  Progressive Passes / 90
                </label>
                <span className="font-mono text-[#D2F865] tabular-nums">
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

        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <h3 className="font-display text-sm font-semibold text-white">
              Shortlist ({filteredCandidates.length})
            </h3>
            <span className="text-[11px] text-[#8A8D96]">
              {managerName} profile
            </span>
          </div>

          {filteredCandidates.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8A8D96]">
              No candidates match these thresholds. Ease the sliders above.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {filteredCandidates.map((candidate) => {
                const isSelected = targetPlayer?.id === candidate.id;
                return (
                  <div
                    key={candidate.id}
                    className="py-1 first:pt-0 last:pb-0"
                  >
                    <button
                      type="button"
                      onClick={() => setTargetId(candidate.id)}
                      aria-pressed={isSelected}
                      className={`w-full text-left px-2.5 py-2.5 rounded-xl transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#D2F865]/[0.08]"
                          : "hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-2 min-w-0">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                              isSelected
                                ? "bg-[#D2F865] shadow-[0_0_8px_rgba(210,248,101,0.7)]"
                                : "bg-white/20"
                            }`}
                            aria-hidden="true"
                          />
                          <span
                            className={`text-sm truncate ${
                              isSelected
                                ? "font-semibold text-white"
                                : "font-medium text-white/90"
                            }`}
                          >
                            {candidate.name}
                          </span>
                        </span>
                        <span className="font-mono text-xs font-semibold text-[#D2F865] tabular-nums shrink-0">
                          {candidate.fitScore}% fit
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-[#8A8D96] mt-1 pl-3.5">
                        <span className="truncate">{candidate.club}</span>
                        <span className="font-mono text-white/90 tabular-nums shrink-0">
                          {candidate.marketVal}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-[#6F727C] mt-1 pl-3.5 tabular-nums">
                        Press {candidate.pressing}/90 · Prog {candidate.progPasses}/90 · Age {candidate.age}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
