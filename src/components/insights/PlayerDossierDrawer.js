"use client";

import React, { useEffect } from "react";
import {
  X,
  Zap,
  HeartPulse,
} from "lucide-react";

// Tactical profiles and per-90 benchmark datasets for Liverpool FC squad
export const PLAYER_PROFILES = {
  alisson: {
    fullName: "Alisson Becker",
    role: "Sweeper Keeper (Proactive Rest Defence)",
    instructions: "High starting position to sweep behind high defensive line; initiate rapid counter-attacks via laser side-volleys.",
    fitness: 96,
    minutesSeason: 1080,
    cards: 1,
    metrics: [
      { label: "Goals Prevented /90", value: "+0.34", benchmark: "Elite (96th %ile)", pct: 96 },
      { label: "Pass Completion", value: "88.6%", benchmark: "High (89th %ile)", pct: 89 },
      { label: "Sweeping Actions /90", value: "2.1", benchmark: "Premier League Top 3", pct: 94 },
      { label: "Cross Claiming %", value: "11.2%", benchmark: "Very High", pct: 91 },
    ],
    radar: [
      { axis: "Shot Stopping", val: 95 },
      { axis: "Sweeping", val: 94 },
      { axis: "Dist. Range", val: 90 },
      { axis: "Aerial Claim", val: 88 },
      { axis: "Calm Under Press", val: 96 },
    ],
  },
  frimpong: {
    fullName: "Jeremie Frimpong",
    role: "Attacking Wingback / Touchline Sprinter",
    instructions: "Maintain wide touchline stretch; execute underlap bursts into the penalty area when Barcola pins the opposition fullback.",
    fitness: 92,
    minutesSeason: 940,
    cards: 2,
    metrics: [
      { label: "Sprints /90", value: "34.8", benchmark: "League High (99th %ile)", pct: 99 },
      { label: "Prog. Carries /90", value: "7.8", benchmark: "Elite (97th %ile)", pct: 97 },
      { label: "Touches in Opp. Box", value: "6.2", benchmark: "Top 2 Fullbacks", pct: 95 },
      { label: "Cross Accuracy", value: "32.4%", benchmark: "Above Average", pct: 78 },
    ],
    radar: [
      { axis: "Top Speed", val: 98 },
      { axis: "Prog. Carries", val: 96 },
      { axis: "Key Passes", val: 84 },
      { axis: "1v1 Dribbles", val: 92 },
      { axis: "Press Recovery", val: 82 },
    ],
  },
  jacquet: {
    fullName: "Jérémy Jacquet",
    role: "Ball-Playing Centre-Back (Right Stopper)",
    instructions: "Cover the vacated channel behind Frimpong's attacking runs; execute direct progressive diagonals to opposite flank.",
    fitness: 95,
    minutesSeason: 890,
    cards: 2,
    metrics: [
      { label: "Pass Completion", value: "94.6%", benchmark: "Elite (96th %ile)", pct: 96 },
      { label: "Ground Duels Won", value: "68.4%", benchmark: "Dominant", pct: 90 },
      { label: "Interceptions /90", value: "1.8", benchmark: "High", pct: 86 },
      { label: "Long Pass Acc.", value: "76.2%", benchmark: "Top Decile", pct: 92 },
    ],
    radar: [
      { axis: "Ground Duels", val: 90 },
      { axis: "Pass Security", val: 95 },
      { axis: "Long Balls", val: 91 },
      { axis: "Channel Cover", val: 88 },
      { axis: "Aerial Wins", val: 86 },
    ],
  },
  vandijk: {
    fullName: "Virgil van Dijk (C)",
    role: "Defensive Anchor & Diagonal Distributor",
    instructions: "Direct the offside trap line; dominate defensive aerial duels; initiate rapid switches to Barcola and Frimpong.",
    fitness: 98,
    minutesSeason: 1170,
    cards: 1,
    metrics: [
      { label: "Aerial Win Rate", value: "81.4%", benchmark: "League No. 1 (99th %ile)", pct: 99 },
      { label: "Pass Completion", value: "95.3%", benchmark: "World Class", pct: 98 },
      { label: "Dribbled Past /90", value: "0.18", benchmark: "Elite", pct: 97 },
      { label: "Possession Won /90", value: "6.8", benchmark: "High", pct: 89 },
    ],
    radar: [
      { axis: "Aerial Dominance", val: 99 },
      { axis: "Anticipation", val: 98 },
      { axis: "Dist. Switches", val: 96 },
      { axis: "1v1 Defence", val: 97 },
      { axis: "Leadership/Shape", val: 99 },
    ],
  },
  kerkez: {
    fullName: "Milos Kerkez",
    role: "Aggressive Inverted Fullback",
    instructions: "Tuck into the midfield pivot during possession build-up; counter-press with high vertical intensity on defensive transition.",
    fitness: 89,
    minutesSeason: 990,
    cards: 4,
    metrics: [
      { label: "Tackles + Int /90", value: "3.9", benchmark: "High Intensity", pct: 93 },
      { label: "Prog. Carries /90", value: "5.4", benchmark: "Above Average", pct: 85 },
      { label: "Pressures in Mid 3rd", value: "16.2", benchmark: "Elite (94th %ile)", pct: 94 },
      { label: "Duel Win %", value: "61.0%", benchmark: "Solid", pct: 80 },
    ],
    radar: [
      { axis: "Pressing Workrate", val: 94 },
      { axis: "Tackling", val: 90 },
      { axis: "Acceleration", val: 91 },
      { axis: "Inverted Pivot", val: 85 },
      { axis: "Recovery Sprints", val: 89 },
    ],
  },
  gravenberch: {
    fullName: "Ryan Gravenberch",
    role: "Press-Resistant Double Pivot",
    instructions: "Receive back-to-goal and turn through tight central corridors; break first defensive line through body swerves and vertical surges.",
    fitness: 94,
    minutesSeason: 1040,
    cards: 3,
    metrics: [
      { label: "Take-On Success Rate", value: "79.2%", benchmark: "Elite Midfielder (98th %ile)", pct: 98 },
      { label: "Pass Under Press %", value: "92.4%", benchmark: "Premier League Elite", pct: 95 },
      { label: "Interceptions /90", value: "2.3", benchmark: "Top 5 DMs", pct: 94 },
      { label: "Ball Regains /90", value: "7.1", benchmark: "Outstanding", pct: 91 },
    ],
    radar: [
      { axis: "Press Resistance", val: 98 },
      { axis: "Ball Turn & Surge", val: 96 },
      { axis: "Interceptions", val: 92 },
      { axis: "Pass Retention", val: 94 },
      { axis: "Ground Duels", val: 88 },
    ],
  },
  macallister: {
    fullName: "Alexis Mac Allister",
    role: "Metronomic Deep-Lying Playmaker",
    instructions: "Control game tempo with one- and two-touch distributions; anchor rest-defence alongside Gravenberch.",
    fitness: 84, // Minor hamstring doubt noted
    minutesSeason: 860,
    cards: 2,
    metrics: [
      { label: "Pass Accuracy", value: "91.5%", benchmark: "Elite Controller", pct: 94 },
      { label: "Passes into Final 3rd", value: "8.4", benchmark: "Top 3 Midfielders", pct: 96 },
      { label: "Tackles Won /90", value: "2.8", benchmark: "High", pct: 88 },
      { label: "Expected Threat (xT)", value: "+0.42", benchmark: "Top Decile", pct: 93 },
    ],
    radar: [
      { axis: "Vision & Tempo", val: 96 },
      { axis: "Through Balls", val: 94 },
      { axis: "Tackle Timing", val: 87 },
      { axis: "Press Resistance", val: 92 },
      { axis: "Tactical IQ", val: 97 },
    ],
  },
  szoboszlai: {
    fullName: "Dominik Szoboszlai",
    role: "High-Energy Free 8 / Counter-Press Trigger",
    instructions: "Lead the first pressing line on opposition pivots; unleash long-range efforts from edge of penalty box.",
    fitness: 97,
    minutesSeason: 1110,
    cards: 2,
    metrics: [
      { label: "Distance Covered /90", value: "11.8 km", benchmark: "League High (98th %ile)", pct: 98 },
      { label: "High-Speed Runs", value: "68", benchmark: "Match Leader", pct: 96 },
      { label: "Shot-Creating Actions", value: "4.8", benchmark: "Elite", pct: 92 },
      { label: "Ball Recoveries", value: "6.4", benchmark: "High", pct: 89 },
    ],
    radar: [
      { axis: "Stamina & Engine", val: 99 },
      { axis: "Pressing Trigger", val: 95 },
      { axis: "Shot Power", val: 94 },
      { axis: "Set-Piece Deliv.", val: 92 },
      { axis: "Transition Pace", val: 91 },
    ],
  },
  wirtz: {
    fullName: "Florian Wirtz",
    role: "Creative Half-Space Maestro (No. 10 / Inverted LW)",
    instructions: "Drift between midfield and defensive lines in the left half-space; combine with Isak via slide passes and disguised reverse balls.",
    fitness: 95,
    minutesSeason: 1020,
    cards: 1,
    metrics: [
      { label: "Expected Assists (xA)", value: "0.48 /90", benchmark: "Premier League No. 1", pct: 99 },
      { label: "Key Passes /90", value: "3.7", benchmark: "Elite (99th %ile)", pct: 99 },
      { label: "Prog. Passes Received", value: "9.2", benchmark: "Top Decile", pct: 95 },
      { label: "Goal Involvements", value: "6 in 5 games", benchmark: "Peak Form", pct: 97 },
    ],
    radar: [
      { axis: "Vision & Creation", val: 99 },
      { axis: "Half-Space IQ", val: 98 },
      { axis: "Dribble in Tight", val: 96 },
      { axis: "Goal Threat", val: 91 },
      { axis: "Press IQ", val: 90 },
    ],
  },
  barcola: {
    fullName: "Bradley Barcola",
    role: "Explosive 1v1 Wide Forward",
    instructions: "Isolate opposition fullback in wide right channel; burst past on the outside or cut inside to combine with Isak.",
    fitness: 93,
    minutesSeason: 910,
    cards: 1,
    metrics: [
      { label: "Successful Dribbles", value: "4.1 /90", benchmark: "League Leader (99th %ile)", pct: 99 },
      { label: "Carries into Penalty Area", value: "4.6", benchmark: "Elite (98th %ile)", pct: 98 },
      { label: "Non-Penalty xG /90", value: "0.44", benchmark: "High Forward", pct: 91 },
      { label: "Pressing Sprints", value: "24.2", benchmark: "Top Decile", pct: 90 },
    ],
    radar: [
      { axis: "1v1 Dribble", val: 99 },
      { axis: "Burst & Pace", val: 97 },
      { axis: "Box Threat", val: 92 },
      { axis: "Overload Link", val: 89 },
      { axis: "Counter-Press", val: 88 },
    ],
  },
  isak: {
    fullName: "Alexander Isak",
    role: "Complete Modern Number 9 (Target & Runner)",
    instructions: "Pin central defenders with deceptive channel movements; attack near post on low crosses and link counter-press transitions.",
    fitness: 94,
    minutesSeason: 970,
    cards: 0,
    metrics: [
      { label: "Non-Penalty xG /90", value: "0.68", benchmark: "Elite (96th %ile)", pct: 96 },
      { label: "Shot Conversion", value: "22.4%", benchmark: "Lethal", pct: 94 },
      { label: "Carries into Box", value: "3.2", benchmark: "High", pct: 89 },
      { label: "Touches in Opp. Box", value: "7.1", benchmark: "Top 3 Strikers", pct: 95 },
    ],
    radar: [
      { axis: "Clinical Finish", val: 96 },
      { axis: "Channel Runs", val: 95 },
      { axis: "Box Movement", val: 97 },
      { axis: "Hold-Up Link", val: 89 },
      { axis: "Pace in Behind", val: 92 },
    ],
  },
};

// SVG Pentagon/Radar generator
function renderRadar(radarData = []) {
  if (!radarData || radarData.length === 0) return null;
  const size = 180;
  const center = size / 2;
  const radius = 60;
  const total = radarData.length;

  const levels = [0.25, 0.5, 0.75, 1.0];

  const getCoordinates = (index, valuePct) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = radius * (valuePct / 100);
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const pointsString = radarData
    .map((item, i) => {
      const { x, y } = getCoordinates(i, item.val);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto select-none">
      {levels.map((lvl, lIdx) => {
        const ringPoints = Array.from({ length: total }).map((_, i) => {
          const { x, y } = getCoordinates(i, lvl * 100);
          return `${x},${y}`;
        }).join(" ");
        return (
          <polygon
            key={lIdx}
            points={ringPoints}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.8"
          />
        );
      })}

      {radarData.map((_, i) => {
        const outer = getCoordinates(i, 100);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={outer.x}
            y2={outer.y}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="0.7"
            strokeDasharray="2,2"
          />
        );
      })}

      <polygon
        points={pointsString}
        fill="rgba(255, 38, 54, 0.28)"
        stroke="#FF2636"
        strokeWidth="1.6"
        className="transition-all duration-300"
      />

      {radarData.map((item, i) => {
        const { x, y } = getCoordinates(i, item.val);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="2.5"
            fill="#FFFFFF"
            stroke="#FF2636"
            strokeWidth="1.2"
          />
        );
      })}

      {radarData.map((item, i) => {
        const { x, y } = getCoordinates(i, 120);
        return (
          <text
            key={i}
            x={x}
            y={y + 3}
            textAnchor="middle"
            fill="#8E8E93"
            fontSize="7"
            fontWeight="600"
            className="tracking-tight select-none"
          >
            {item.axis}
          </text>
        );
      })}
    </svg>
  );
}

export default function PlayerDossierDrawer({ player, isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !player) return null;

  const profile = PLAYER_PROFILES[player.id] || {
    fullName: player.name,
    role: `Tactical ${player.pos || "Specialist"}`,
    instructions: "Standard tactical discipline in Iraola's vertical counter-press system.",
    fitness: 94,
    minutesSeason: 880,
    cards: 1,
    metrics: [
      { label: "On-Ball Value (OBV)", value: `+${(player.obv || 0.5).toFixed(2)}`, benchmark: "High", pct: 88 },
      { label: "Pass Completion", value: `${player.comp || 87.5}%`, benchmark: "Solid", pct: 86 },
      { label: "Touches /90", value: `${player.touches || 60}`, benchmark: "Active", pct: 82 },
    ],
    radar: [
      { axis: "Pressing", val: 88 },
      { axis: "Passing", val: 86 },
      { axis: "Duels", val: 84 },
      { axis: "Carries", val: 85 },
      { axis: "Vision", val: 87 },
    ],
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Player Dossier: ${profile.fullName}`}
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md h-full bg-[#0D1117] border-l border-white/[0.1] shadow-2xl overflow-y-auto p-5 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF2636] animate-pulse" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8E8E93]">
                Tactical Player Dossier
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
              aria-label="Close dossier"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black font-mono text-[#FF2636]">
                  #{player.number}
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {profile.fullName}
                </h3>
              </div>
              <p className="text-xs font-semibold text-[#8E8E93] mt-0.5">
                {profile.role} • <span className="text-white/80">{player.pos}</span>
              </p>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider font-semibold">
                Fitness Index
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono font-bold text-sm text-white">
                  {profile.fitness}%
                </span>
              </div>
            </div>
          </div>

          <div className="apple-tile rounded-xl border border-white/[0.08] p-3.5 mt-4 bg-white/[0.02]">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/90">
              <Zap className="w-3.5 h-3.5 text-[#FF2636]" />
              <span>Head Coach Tactical Instruction</span>
            </div>
            <p className="text-xs text-white/70 mt-1.5 leading-relaxed">
              {profile.instructions}
            </p>
          </div>

          <div className="mt-5 apple-tile rounded-xl border border-white/[0.08] p-4 text-center bg-white/[0.01]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E8E93] block mb-2">
              Per-90 Tactical Profile vs League Average
            </span>
            {renderRadar(profile.radar)}
          </div>

          <div className="mt-4 space-y-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E8E93] block">
              Key Performance Indicators
            </span>
            {profile.metrics.map((m, idx) => (
              <div
                key={idx}
                className="apple-tile rounded-lg border border-white/[0.06] p-2.5 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs text-white/80 font-medium block">
                    {m.label}
                  </span>
                  <span className="text-[10px] text-[#8E8E93]">
                    {m.benchmark}
                  </span>
                </div>
                <span className="font-mono font-bold text-sm text-white">
                  {m.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="apple-tile rounded-lg border border-white/[0.06] p-2">
              <span className="text-[9px] uppercase tracking-wider text-[#8E8E93] block">
                Minutes
              </span>
              <span className="font-mono font-bold text-xs text-white mt-0.5 block">
                {profile.minutesSeason}'
              </span>
            </div>
            <div className="apple-tile rounded-lg border border-white/[0.06] p-2">
              <span className="text-[9px] uppercase tracking-wider text-[#8E8E93] block">
                OBV Metric
              </span>
              <span className="font-mono font-bold text-xs text-emerald-400 mt-0.5 block">
                +{(player.obv || 0.65).toFixed(2)}
              </span>
            </div>
            <div className="apple-tile rounded-lg border border-white/[0.06] p-2">
              <span className="text-[9px] uppercase tracking-wider text-[#8E8E93] block">
                Discipline
              </span>
              <span className="font-mono font-bold text-xs text-white mt-0.5 block">
                {profile.cards} {profile.cards === 1 ? "Caution" : "Cautions"}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.08] mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold tracking-tight transition cursor-pointer border border-white/15"
          >
            Return to Pitch Canvas
          </button>
        </div>
      </div>
    </div>
  );
}
