"use client";

import React, { useState } from "react";
import {
  Crosshair,
  Target,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingUp,
  Shield,
  Activity,
  Flame,
} from "lucide-react";

// Real-coordinate shot map & tactical assignment breakdown for post-match analysis
export default function PostMatchTacticalArchive({ match, selectedClub }) {
  const [activeShot, setActiveShot] = useState(null);
  const [filterOutcome, setFilterOutcome] = useState("all"); // 'all' | 'goal' | 'saved' | 'missed'

  const clubName = selectedClub?.name || match?.clubName || match?.homeTeam || "Club";
  const strikerName = match?.startingXI?.[9]?.name || selectedClub?.captain || "Centre Forward";
  const playmakerName = match?.startingXI?.[7]?.name || "Playmaker";
  const wingerName = match?.startingXI?.[8]?.name || "Right Winger";
  const midName = match?.startingXI?.[5]?.name || "Central Midfielder";

  // Default to provided match shots or club-specific tactical dataset
  const rawShots = match?.shots?.length
    ? match.shots
    : [
        { id: 101, x: 88, y: 34, xG: 0.62, outcome: "goal", player: strikerName, min: "24'", desc: `Right-footed low drive into the bottom corner following ${playmakerName}'s reverse pass.` },
        { id: 102, x: 84, y: 46, xG: 0.38, outcome: "saved", player: playmakerName, min: "39'", desc: "Curled shot towards far top post tipped over crossbar." },
        { id: 103, x: 92, y: 38, xG: 0.54, outcome: "goal", player: wingerName, min: "61'", desc: "First-time finish at the back post from a drilled low cross." },
        { id: 104, x: 78, y: 28, xG: 0.08, outcome: "missed", player: midName, min: "73'", desc: "Long-range effort from outside the 18-yard box whistling over the crossbar." },
        { id: 105, x: 90, y: 32, xG: 0.45, outcome: "saved", player: strikerName, min: "82'", desc: "1v1 breakaway effort smothered by the opposition keeper." },
      ];
  const shots = rawShots.map((s, idx) => ({
    ...s,
    id: s.id ?? `shot-${idx}`,
    xG: typeof s.xG === "number" ? s.xG : (typeof s.xg === "number" ? s.xg : 0.25),
    min: s.min || s.minute || "45'",
  }));

  const filteredShots = filterOutcome === "all"
    ? shots
    : shots.filter((s) => s.outcome === filterOutcome);

  const selectedShot = activeShot || filteredShots[0] || shots[0];

  const totalXg = shots.reduce((acc, s) => acc + (s.xG || 0), 0);
  const totalGoals = shots.filter((s) => s.outcome === "goal").length;

  return (
    <div className="apple-tile rounded-2xl border border-white/[0.08] p-4 bg-[#0B0E14] text-white">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#FF2636]/15 border border-[#FF2636]/30 flex items-center justify-center">
            <Crosshair className="w-4 h-4 text-[#FF2636]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-white">
                {clubName} Post-Match Shot &amp; xG Map
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {totalGoals} Goals • {totalXg.toFixed(2)} xG
              </span>
            </div>
            <p className="text-[10px] text-white/50 mt-0.5">
              Shot generation probability, outcome clusters & attacking quadrants
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/[0.06]">
          {[
            { id: "all", label: "All Shots" },
            { id: "goal", label: "Goals" },
            { id: "saved", label: "Saved" },
            { id: "missed", label: "Off Target" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterOutcome(tab.id)}
              className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filterOutcome === tab.id
                  ? "bg-[#FF2636] text-white shadow-sm font-semibold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Pitch Goal Box Half & Shot Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* SVG Attacking Third Half-Pitch */}
        <div className="lg:col-span-2 relative rounded-xl overflow-hidden bg-[#07100B] border border-white/[0.08] p-3 aspect-[16/10] flex items-center justify-center">
          <svg viewBox="50 0 55 68" className="w-full h-full select-none">
            {/* Turf Gradient */}
            <defs>
              <linearGradient id="archiveTurfGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0B1912" />
                <stop offset="100%" stopColor="#0E2319" />
              </linearGradient>
            </defs>
            <rect x="50" y="0" width="55" height="68" fill="url(#archiveTurfGrad)" />

            {/* Mowing stripes */}
            {[5, 6, 7, 8, 9].map((i) => (
              <rect
                key={i}
                x={i * 10.5}
                y="0"
                width="5.25"
                height="68"
                fill="#FFFFFF"
                fillOpacity={i % 2 === 0 ? "0.02" : "0.005"}
              />
            ))}

            {/* Chalk markings */}
            <g stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="0.4" fill="none">
              {/* Halfway Line */}
              <line x1="52.5" y1="2" x2="52.5" y2="66" />
              <path d="M 52.5 24.85 A 9.15 9.15 0 0 1 52.5 43.15" />

              {/* Pitch boundaries */}
              <line x1="52.5" y1="2" x2="103" y2="2" />
              <line x1="52.5" y1="66" x2="103" y2="66" />
              <line x1="103" y1="2" x2="103" y2="66" />

              {/* Penalty box (Right / The Kop End) */}
              <rect x="86.5" y="13.84" width="16.5" height="40.32" />
              <rect x="97.5" y="24.84" width="5.5" height="18.32" />
              <path d="M 86.5 28.5 A 9.15 9.15 0 0 0 86.5 39.5" />
              <circle cx="94" cy="34" r="0.5" fill="#FFFFFF" fillOpacity="0.7" stroke="none" />

              {/* Goal outline */}
              <rect x="103" y="30.34" width="1.5" height="7.32" strokeOpacity="0.5" />
            </g>

            {/* Shot Points Layer */}
            {filteredShots.map((shot) => {
              const isSelected = selectedShot?.id === shot.id;
              const radius = 1.6 + Math.min(Math.max((shot.xG || 0.3) * 3.5, 0.8), 3.2);

              return (
                <g
                  key={shot.id}
                  onClick={() => setActiveShot(shot)}
                  className="cursor-pointer transition-transform duration-200"
                >
                  {/* Trajectory vector to goal center */}
                  <line
                    x1={shot.x}
                    y1={shot.y}
                    x2={103}
                    y2={34}
                    stroke={shot.outcome === "goal" ? "#FF2636" : "#FFFFFF"}
                    strokeOpacity={isSelected ? "0.6" : "0.15"}
                    strokeWidth={isSelected ? "0.8" : "0.3"}
                    strokeDasharray={shot.outcome === "goal" ? undefined : "1,1"}
                  />

                  {/* Static Accent Ring for Selected Shot */}
                  {isSelected && (
                    <circle
                      cx={shot.x}
                      cy={shot.y}
                      r={radius + 0.9}
                      fill="none"
                      stroke="#FF2636"
                      strokeWidth="0.4"
                      strokeOpacity="0.8"
                    />
                  )}

                  {/* Shot Marker */}
                  <circle
                    cx={shot.x}
                    cy={shot.y}
                    r={radius}
                    fill={
                      shot.outcome === "goal"
                        ? "#FF2636"
                        : shot.outcome === "saved"
                        ? "#F1B82D"
                        : "#8E8E93"
                    }
                    stroke="#FFFFFF"
                    strokeWidth={isSelected ? "0.6" : "0.3"}
                    filter="drop-shadow(0 1px 3px rgba(0,0,0,0.8))"
                  />

                  {/* xG Value Label */}
                  <text
                    x={shot.x}
                    y={shot.y + 0.5}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="1.1"
                    fontWeight="800"
                    className="pointer-events-none select-none font-mono"
                  >
                    {shot.xG.toFixed(2)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Shot Detail Card */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          {selectedShot ? (
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-white/80">
                  {selectedShot.min}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    selectedShot.outcome === "goal"
                      ? "bg-[#FF2636]/20 text-[#FF4D5A] border border-[#FF2636]/30"
                      : selectedShot.outcome === "saved"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-white/10 text-white/70"
                  }`}
                >
                  {selectedShot.outcome}
                </span>
              </div>

              <div className="mt-3">
                <h4 className="text-sm font-bold text-white tracking-tight">
                  {selectedShot.player}
                </h4>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black font-mono text-[#FF2636]">
                    {selectedShot.xG.toFixed(2)}
                  </span>
                  <span className="text-xs text-[#8E8E93] font-medium">Expected Goal (xG)</span>
                </div>
              </div>

              <p className="text-xs text-white/75 mt-3 leading-relaxed">
                {selectedShot.desc || "Shot created through rapid vertical counter-press turnover."}
              </p>

              <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/50">Finishing Distance</span>
                  <span className="font-mono text-white/85">
                    {Math.round((105 - selectedShot.x) * 1.05)} metres
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Angle to Goal</span>
                  <span className="font-mono text-white/85">
                    {Math.abs(Math.round(selectedShot.y - 34) * 2)}° deviation
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-xs text-white/40 my-auto">
              Select any shot bubble on the pitch to inspect detailed trajectory and xG value.
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-white/[0.06] text-[10px] text-white/40 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF2636]" />
            <span>Bubble diameter corresponds directly to shot probability (xG)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
