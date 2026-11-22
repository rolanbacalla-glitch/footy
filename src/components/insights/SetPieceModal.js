"use client";

import React, { useState } from "react";
import { X, CornerDownRight, ShieldAlert, Target } from "lucide-react";
import { getTeamManagerInfo } from "../../data/premierLeagueManagers";

export default function SetPieceModal({ isOpen, onClose, activeMatch, selectedClub }) {
  const [activeSide, setActiveSide] = useState("left"); // 'left' | 'right' corner
  const [deliveryType, setDeliveryType] = useState("inswinger"); // 'inswinger' | 'outswinger'

  if (!isOpen) return null;

  const club = selectedClub || getTeamManagerInfo(activeMatch?.teamId || "364") || getTeamManagerInfo("364");
  const homeTeam = activeMatch?.homeTeam || club.name;
  const awayTeam = activeMatch?.awayTeam || activeMatch?.opponent || "Opponent";

  const xi = activeMatch?.startingXI || [];
  const primaryAerial = xi[3] || { name: club.captain, number: 4 };
  const secondaryAerial = xi[2] || { name: `${club.shortName} Centre-Back`, number: 5 };
  const poacher = xi[9] || { name: `${club.shortName} Striker`, number: 9 };
  const edgeCreator = xi[7] || { name: `${club.shortName} Playmaker`, number: 10 };

  const shortLast = (fullName = "") => fullName.split(" ").slice(-1)[0] || fullName;

  const receiverProbabilities = [
    {
      player: `${primaryAerial.name} (#${primaryAerial.number})`,
      shortLabel: shortLast(primaryAerial.name),
      targetZone: "Near Post Flick / 6-Yard Box",
      probability: 38,
      shotQualityXg: 0.28,
      role: "Primary Aerial Target",
      colour: "#D2F865",
    },
    {
      player: `${secondaryAerial.name} (#${secondaryAerial.number})`,
      shortLabel: shortLast(secondaryAerial.name),
      targetZone: "Central Penalty Spot",
      probability: 29,
      shotQualityXg: 0.22,
      role: "Second-Ball Attacker",
      colour: "#8BA3F5",
    },
    {
      player: `${poacher.name} (#${poacher.number})`,
      shortLabel: shortLast(poacher.name),
      targetZone: "Back Post / Blindside Run",
      probability: 21,
      shotQualityXg: 0.35,
      role: "Far-Post Poacher",
      colour: "#F4BA5B",
    },
    {
      player: `${edgeCreator.name} (#${edgeCreator.number})`,
      shortLabel: shortLast(edgeCreator.name),
      targetZone: "Edge of Box (D-Arc)",
      probability: 12,
      shotQualityXg: 0.14,
      role: "Cutback Volley & Recirculation",
      colour: "#8A8D96",
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tacticai-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl glass-card-deep p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D2F865]/15 border border-[#D2F865]/30 flex items-center justify-center text-[#D2F865]">
              <CornerDownRight className="w-5 h-5" />
            </div>
            <div>
              <h2 id="tacticai-title" className="font-display text-base sm:text-lg font-semibold text-white tracking-tight">
                {club.name} Set-Piece Dynamics
              </h2>
              <p className="text-xs text-[#8A8D96] mt-0.5">
                Predictive Corner Trajectory · {homeTeam} vs {awayTeam}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-white/[0.06] text-[#8A8D96] hover:text-white hover:bg-white/[0.12] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
          <div className="glass-tile p-1.5 rounded-full flex items-center justify-between">
            <span className="text-xs text-[#8A8D96] pl-3">Delivery Side</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setActiveSide("left")}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                  activeSide === "left"
                    ? "bg-[#D2F865] text-[#0E100C] font-semibold"
                    : "text-[#8A8D96] hover:text-white"
                }`}
              >
                Left
              </button>
              <button
                type="button"
                onClick={() => setActiveSide("right")}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                  activeSide === "right"
                    ? "bg-[#D2F865] text-[#0E100C] font-semibold"
                    : "text-[#8A8D96] hover:text-white"
                }`}
              >
                Right
              </button>
            </div>
          </div>

          <div className="glass-tile p-1.5 rounded-full flex items-center justify-between">
            <span className="text-xs text-[#8A8D96] pl-3">Trajectory</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setDeliveryType("inswinger")}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                  deliveryType === "inswinger"
                    ? "bg-white text-[#0E100C] font-semibold"
                    : "text-[#8A8D96] hover:text-white"
                }`}
              >
                Inswinger
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType("outswinger")}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                  deliveryType === "outswinger"
                    ? "bg-white text-[#0E100C] font-semibold"
                    : "text-[#8A8D96] hover:text-white"
                }`}
              >
                Outswinger
              </button>
            </div>
          </div>
        </div>

        {/* Tactical Pitch Box Visualization */}
        <div className="relative w-full h-44 sm:h-52 bg-[#090A0E] rounded-2xl border border-white/10 p-3 overflow-hidden mb-4 shadow-inner">
          <svg viewBox="0 0 320 160" className="w-full h-full" aria-hidden="true">
            <rect x="0" y="0" width="320" height="160" fill="#0C0E14" />
            <line x1="0" y1="150" x2="320" y2="150" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <rect x="110" y="146" width="100" height="4" fill="#FFFFFF" fillOpacity="0.8" />
            <rect x="70" y="80" width="180" height="70" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            <rect x="115" y="125" width="90" height="25" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            <circle cx="160" cy="105" r="2" fill="#FFFFFF" />
            <path d="M 130 80 A 30 30 0 0 1 190 80" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

            {activeSide === "left" ? (
              <path d="M 0 135 A 15 15 0 0 1 15 150" fill="none" stroke="#FFFFFF" strokeWidth="2" />
            ) : (
              <path d="M 320 135 A 15 15 0 0 0 305 150" fill="none" stroke="#FFFFFF" strokeWidth="2" />
            )}

            {activeSide === "left" ? (
              <path
                d={
                  deliveryType === "inswinger"
                    ? "M 5 145 Q 80 50 140 128"
                    : "M 5 145 Q 90 70 160 105"
                }
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeDasharray="4 2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d={
                  deliveryType === "inswinger"
                    ? "M 315 145 Q 240 50 180 128"
                    : "M 315 145 Q 230 70 160 105"
                }
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeDasharray="4 2"
                strokeLinecap="round"
              />
            )}

            {/* Dynamic Player Target Hotspots */}
            <g>
              <circle cx="138" cy="128" r="9" fill="#D2F865" fillOpacity="0.32" />
              <circle cx="138" cy="128" r="4.5" fill="#D2F865" stroke="#0E100C" strokeWidth="1" />
              <text x="138" y="120" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold">
                {receiverProbabilities[0].shortLabel}
              </text>

              <circle cx="160" cy="105" r="8" fill="#8BA3F5" fillOpacity="0.28" />
              <circle cx="160" cy="105" r="4" fill="#8BA3F5" stroke="#0E100C" strokeWidth="1" />
              <text x="160" y="98" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold">
                {receiverProbabilities[1].shortLabel}
              </text>

              <circle cx="184" cy="130" r="7.5" fill="#F4BA5B" fillOpacity="0.28" />
              <circle cx="184" cy="130" r="4" fill="#F4BA5B" stroke="#0E100C" strokeWidth="1" />
              <text x="184" y="122" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold">
                {receiverProbabilities[2].shortLabel}
              </text>
            </g>
          </svg>
          <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white/80 border border-white/10 font-mono">
            {activeSide === "left" ? "Left Corner" : "Right Corner"} · {deliveryType}
          </div>
        </div>

        {/* Receiver Probabilities Leaderboard */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs font-medium text-white/80">
            <span className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#D2F865]" />
              Receiver First-Contact Probability Model
            </span>
            <span className="text-[11px] text-[#8A8D96]">Geometric GNN</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {receiverProbabilities.map((r, i) => (
              <div key={i} className="apple-tile p-2.5 rounded-xl border border-white/[0.06] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white truncate">{r.player}</span>
                  <span className="text-xs font-bold font-mono" style={{ color: r.colour }}>
                    {r.probability}%
                  </span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${r.probability}%`, backgroundColor: r.colour }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#8E8E93]">
                  <span>{r.targetZone}</span>
                  <span className="text-white/70 font-mono">xG: {r.shotQualityXg.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Defensive Marking Scheme Breakdown */}
        <div className="apple-tile p-3 rounded-xl border border-white/[0.06] text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-white/70" />
              Opposition Marking Vulnerability
            </span>
            <span className="text-[10px] font-mono text-white/70">Hybrid 60/40 Scheme</span>
          </div>
          <p className="text-[11px] text-[#8E8E93] leading-relaxed">
            <strong className="text-white">{awayTeam}</strong> deploys a 5-man zonal spine with man-to-man coverage on{" "}
            <strong className="text-white">{primaryAerial.name}</strong>. {club.name}&apos;s inswinging near-post delivery under{" "}
            <strong className="text-white">{club.manager}</strong> creates natural separation for{" "}
            <strong className="text-white">{secondaryAerial.name}</strong> and far-post back-runners.
          </p>
        </div>
      </div>
    </div>
  );
}
