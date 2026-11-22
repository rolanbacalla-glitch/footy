"use client";

import React, { useState } from "react";

export default function PostMatchTacticalArchive({ match, selectedClub }) {
  const [activeShot, setActiveShot] = useState(null);
  const [filterOutcome, setFilterOutcome] = useState("all");

  const clubName =
    selectedClub?.name || match?.clubName || match?.homeTeam || "Club";
  const strikerName =
    match?.startingXI?.[9]?.name || selectedClub?.captain || "Centre Forward";
  const playmakerName = match?.startingXI?.[7]?.name || "Playmaker";
  const wingerName = match?.startingXI?.[8]?.name || "Right Winger";
  const midName = match?.startingXI?.[5]?.name || "Central Midfielder";

  const rawShots = match?.shots?.length
    ? match.shots
    : [
        {
          id: 101,
          x: 88,
          y: 34,
          xG: 0.62,
          outcome: "goal",
          player: strikerName,
          min: "24'",
          desc: `Right-footed low drive into the bottom corner following ${playmakerName}'s reverse pass.`,
        },
        {
          id: 102,
          x: 84,
          y: 46,
          xG: 0.38,
          outcome: "saved",
          player: playmakerName,
          min: "39'",
          desc: "Curled shot towards far top post tipped over crossbar.",
        },
        {
          id: 103,
          x: 92,
          y: 38,
          xG: 0.54,
          outcome: "goal",
          player: wingerName,
          min: "61'",
          desc: "First-time finish at the back post from a drilled low cross.",
        },
        {
          id: 104,
          x: 78,
          y: 28,
          xG: 0.08,
          outcome: "missed",
          player: midName,
          min: "73'",
          desc: "Long-range effort from outside the 18-yard box whistling over the crossbar.",
        },
        {
          id: 105,
          x: 90,
          y: 32,
          xG: 0.45,
          outcome: "saved",
          player: strikerName,
          min: "82'",
          desc: "1v1 breakaway effort smothered by the opposition keeper.",
        },
      ];

  const shots = rawShots.map((s, idx) => ({
    ...s,
    id: s.id ?? `shot-${idx}`,
    xG:
      typeof s.xG === "number"
        ? s.xG
        : typeof s.xg === "number"
        ? s.xg
        : 0.25,
    min: s.min || s.minute || "45'",
  }));

  const filteredShots =
    filterOutcome === "all"
      ? shots
      : shots.filter((s) => s.outcome === filterOutcome);

  const selectedShot = activeShot || filteredShots[0] || shots[0];
  const totalXg = shots.reduce((acc, s) => acc + (s.xG || 0), 0);
  const totalGoals = shots.filter((s) => s.outcome === "goal").length;

  return (
    <section className="glass-card-deep p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div>
          <h2 className="font-display text-base sm:text-lg font-semibold text-white tracking-tight">
            {clubName} Post-Match Shot &amp; xG Map
          </h2>
          <p className="text-xs text-[#8A8D96] mt-0.5 tabular-nums">
            {totalGoals} goals · {totalXg.toFixed(2)} cumulative xG · Click any shot to inspect
          </p>
        </div>

        <div className="glass-segmented inline-flex items-center p-1 rounded-full gap-0.5">
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
              className={`min-h-[30px] px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                filterOutcome === tab.id
                  ? "bg-[#D2F865] text-[#0E100C] font-semibold"
                  : "text-[#8A8D96] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
        {/* Attacking Half SVG */}
        <div className="lg:col-span-8 relative rounded-[20px] overflow-hidden bg-[#0C1310] border border-white/[0.06] p-3 aspect-[16/10] flex items-center justify-center">
          <svg viewBox="50 0 55 68" className="w-full h-full select-none">
            <rect x="50" y="0" width="55" height="68" fill="#0D1612" />
            {[5, 6, 7, 8, 9].map((i) => (
              <rect
                key={i}
                x={i * 10.5}
                y="0"
                width="5.25"
                height="68"
                fill="#FFFFFF"
                fillOpacity={i % 2 === 0 ? "0.018" : "0.004"}
              />
            ))}

            <g stroke="#FFFFFF" strokeOpacity="0.22" strokeWidth="0.38" fill="none">
              <line x1="52.5" y1="2" x2="52.5" y2="66" />
              <path d="M 52.5 24.85 A 9.15 9.15 0 0 1 52.5 43.15" />
              <line x1="52.5" y1="2" x2="103" y2="2" />
              <line x1="52.5" y1="66" x2="103" y2="66" />
              <line x1="103" y1="2" x2="103" y2="66" />
              <rect x="86.5" y="13.84" width="16.5" height="40.32" />
              <rect x="97.5" y="24.84" width="5.5" height="18.32" />
              <path d="M 86.5 28.5 A 9.15 9.15 0 0 0 86.5 39.5" />
              <circle cx="94" cy="34" r="0.45" fill="#FFFFFF" fillOpacity="0.6" stroke="none" />
              <rect x="103" y="30.34" width="1.5" height="7.32" strokeOpacity="0.45" />
            </g>

            {filteredShots.map((shot) => {
              const isSelected = selectedShot?.id === shot.id;
              const radius = 1.6 + Math.min(Math.max((shot.xG || 0.3) * 3.8, 0.9), 3.4);
              const fill =
                shot.outcome === "goal"
                  ? "#D2F865"
                  : shot.outcome === "saved"
                  ? "#F4BA5B"
                  : "#F26E7C";

              return (
                <g
                  key={shot.id}
                  onClick={() => setActiveShot(shot)}
                  className="cursor-pointer"
                >
                  <line
                    x1={shot.x}
                    y1={shot.y}
                    x2={103}
                    y2={34}
                    stroke={shot.outcome === "goal" ? "#D2F865" : "#FFFFFF"}
                    strokeOpacity={isSelected ? "0.55" : "0.14"}
                    strokeWidth={isSelected ? "0.7" : "0.28"}
                    strokeDasharray={shot.outcome === "goal" ? undefined : "1,1"}
                  />

                  {isSelected && (
                    <circle
                      cx={shot.x}
                      cy={shot.y}
                      r={radius + 1}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="0.4"
                      strokeOpacity="0.85"
                    />
                  )}

                  <circle
                    cx={shot.x}
                    cy={shot.y}
                    r={radius}
                    fill={fill}
                    stroke={isSelected ? "#FFFFFF" : "rgba(0,0,0,0.5)"}
                    strokeWidth={isSelected ? "0.55" : "0.25"}
                  />

                  <text
                    x={shot.x}
                    y={shot.y + 0.45}
                    textAnchor="middle"
                    fill="#0E100C"
                    fontSize="1.08"
                    fontWeight="700"
                    className="pointer-events-none select-none font-mono"
                  >
                    {shot.xG.toFixed(2)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Shot Inspector */}
        <div className="lg:col-span-4 glass-tile p-5 flex flex-col justify-between">
          {selectedShot ? (
            <div>
              <div className="flex items-center justify-between text-xs text-[#8A8D96]">
                <span className="font-mono text-white font-semibold">
                  {selectedShot.min}
                </span>
                <span
                  className={`capitalize font-medium ${
                    selectedShot.outcome === "goal"
                      ? "text-[#D2F865]"
                      : selectedShot.outcome === "saved"
                      ? "text-[#F4BA5B]"
                      : "text-[#F26E7C]"
                  }`}
                >
                  {selectedShot.outcome}
                </span>
              </div>

              <h3 className="font-display text-base font-semibold text-white mt-3">
                {selectedShot.player}
              </h3>

              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-display text-4xl font-light text-[#D2F865] tabular-nums">
                  {selectedShot.xG.toFixed(2)}
                </span>
                <span className="text-xs text-[#8A8D96]">Expected Goal (xG)</span>
              </div>

              <p className="text-xs text-[#B7BAC3] mt-4 leading-relaxed">
                {selectedShot.desc ||
                  "Shot created through rapid vertical counter-press turnover."}
              </p>

              <div className="mt-5 pt-4 border-t border-white/[0.06] space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#8A8D96]">Finishing Distance</span>
                  <span className="font-mono text-white tabular-nums">
                    {Math.round((105 - selectedShot.x) * 1.05)} metres
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A8D96]">Angle to Goal</span>
                  <span className="font-mono text-white tabular-nums">
                    {Math.abs(Math.round(selectedShot.y - 34) * 2)}° deviation
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-xs text-[#8A8D96] my-auto">
              Select any shot marker to inspect trajectory and xG probability.
            </div>
          )}

          <div className="mt-5 pt-3 border-t border-white/[0.06] text-[11px] text-[#6F727C]">
            Bubble diameter scales directly with shot probability (xG)
          </div>
        </div>
      </div>
    </section>
  );
}
