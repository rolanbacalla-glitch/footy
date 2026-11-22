"use client";

import React from "react";
import { Swords } from "lucide-react";
import { getTeamManagerInfo } from "../../data/premierLeagueManagers";

export default function TacticalRadarCard({ activeMatch, selectedClub }) {
  const club = selectedClub || getTeamManagerInfo(activeMatch?.teamId || "364") || getTeamManagerInfo("364");
  const homeManager = `${club.manager} (${club.formation})`;
  const awayTeamIdentifier =
    (activeMatch?.homeTeam === club.name ? activeMatch?.awayTeam : activeMatch?.homeTeam) ||
    activeMatch?.opponent ||
    "Opponent";
  const oppInfo = getTeamManagerInfo(awayTeamIdentifier);
  const awayManager = oppInfo
    ? `${oppInfo.manager} (${oppInfo.formation})`
    : `${awayTeamIdentifier} Setup`;

  const ppdaVal = activeMatch?.metrics?.ppda || 7.1;
  const tiltVal = activeMatch?.metrics?.fieldTilt || 65.4;
  const regainsVal = activeMatch?.metrics?.counterPressRegains || 24;

  // Tactical Radar Dimensions (Scale: 0 to 100)
  const dimensions = [
    { label: "Vertical Press", lfc: 92, opp: 71, lfcVal: `${ppdaVal} PPDA`, oppVal: "10.4 PPDA" },
    { label: "Direct Progression", lfc: 87, opp: 66, lfcVal: "3.3 m/s", oppVal: "2.2 m/s" },
    { label: "High Regains", lfc: 90, opp: 68, lfcVal: `${regainsVal} / 90`, oppVal: "16 / 90" },
    { label: "Field Tilt Dominance", lfc: 84, opp: 54, lfcVal: `${tiltVal}%`, oppVal: `${(100 - tiltVal).toFixed(1)}%` },
    { label: "Set-Piece xG Net", lfc: 79, opp: 61, lfcVal: "+0.38 xG", oppVal: "+0.09 xG" },
  ];

  // SVG Radar Chart (Center: 100, 100, Radius: 68)
  const numPoints = dimensions.length;
  const centerX = 100;
  const centerY = 100;
  const radius = 68;

  const getCoordinates = (index, value) => {
    const angle = ((Math.PI * 2) / numPoints) * index - Math.PI / 2;
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
    <div className="glass-tile p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#D2F865]/15 border border-[#D2F865]/30 flex items-center justify-center text-[#D2F865]">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold text-white tracking-tight">
              Tactical Counter-Press Radar
            </h4>
            <p className="text-xs text-[#8A8D96]">
              {homeManager} vs {awayManager}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-white font-medium">
            <span className="w-2 h-2 rounded-full bg-[#D2F865]" />
            {club.shortName}
          </span>
          <span className="flex items-center gap-1.5 text-[#8A8D96]">
            <span className="w-2 h-2 rounded-full bg-[#8BA3F5]" />
            {oppInfo?.shortName || "OPP"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        <div className="sm:col-span-5 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-44 h-44" aria-label="Tactical Radar Chart">
            {[0.25, 0.5, 0.75, 1].map((scale, ringIdx) => {
              const ringPoints = dimensions
                .map((_, i) => {
                  const angle = ((Math.PI * 2) / numPoints) * i - Math.PI / 2;
                  const r = scale * radius;
                  return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
                })
                .join(" ");
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

            {dimensions.map((_, i) => {
              const angle = ((Math.PI * 2) / numPoints) * i - Math.PI / 2;
              const x2 = centerX + radius * Math.cos(angle);
              const y2 = centerY + radius * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={centerX}
                  y1={centerY}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="0.8"
                />
              );
            })}

            <path
              d={oppPath}
              fill="rgba(99, 122, 224, 0.16)"
              stroke="#8BA3F5"
              strokeWidth="1.2"
              strokeDasharray="3 2"
              strokeLinejoin="round"
            />

            <path
              d={lfcPath}
              fill="rgba(210, 248, 101, 0.24)"
              stroke="#D2F865"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {lfcPoints.map((p, i) => (
              <circle key={`club-${i}`} cx={p.x} cy={p.y} r="2.5" fill="#D2F865" stroke="#0E100C" strokeWidth="0.6" />
            ))}
            {oppPoints.map((p, i) => (
              <circle key={`opp-${i}`} cx={p.x} cy={p.y} r="2" fill="#8BA3F5" stroke="#0E100C" strokeWidth="0.5" />
            ))}
          </svg>
        </div>

        <div className="sm:col-span-7 space-y-2">
          {dimensions.map((dim, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.05] px-3 py-2 rounded-xl">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-white/90">{dim.label}</span>
                <span className="font-mono text-[11px] tabular-nums">
                  <strong className="text-[#D2F865]">{dim.lfcVal}</strong>
                  <span className="text-white/25"> vs </span>
                  <span className="text-[#8A8D96]">{dim.oppVal}</span>
                </span>
              </div>
              <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden flex gap-0.5">
                <div
                  className="bg-[#D2F865] h-full rounded-full transition-all duration-500"
                  style={{ width: `${(dim.lfc / (dim.lfc + dim.opp)) * 100}%` }}
                />
                <div
                  className="bg-[#637AE0]/70 h-full rounded-full transition-all duration-500"
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
