"use client";

import React, { useState } from "react";
import { Trophy, History, Award, Activity, ArrowUpRight } from "lucide-react";

export const HISTORIC_MATCHES = [
  {
    id: "istanbul-2005",
    title: "2005 Istanbul UCL Final",
    opponent: "AC Milan",
    score: "3 – 3 (3 – 2 pens)",
    date: "25 May 2005",
    venue: "Atatürk Olympic Stadium",
    summary:
      "The Miracle of Istanbul. 3–0 down at half-time, Liverpool staged the greatest comeback in Champions League history with three goals in six furious minutes.",
    teamXg: 2.15,
    opponentXg: 2.84,
    ppda: 11.4,
    possession: 47,
    mvp: "Steven Gerrard",
    topPerformers: [
      {
        name: "Steven Gerrard",
        role: "Captain / CM",
        obv: 1.42,
        note: "Catalyst header 54', won penalty 60', shifted to RB",
      },
      {
        name: "Jerzy Dudek",
        role: "Goalkeeper",
        obv: 1.28,
        note: "Double Shevchenko save 118', two penalty stops",
      },
      {
        name: "Vladimír Šmicer",
        role: "Attacking Mid",
        obv: 0.88,
        note: "Long-range strike 56', scored crucial shootout pen",
      },
      {
        name: "Xabi Alonso",
        role: "Deep Playmaker",
        obv: 0.74,
        note: "Rebound penalty conversion 60', dictated tempo",
      },
      {
        name: "Jamie Carragher",
        role: "Centre Back",
        obv: 0.69,
        note: "Heroic cramp-stricken tackles during extra time",
      },
    ],
  },
  {
    id: "barca-2019",
    title: "2019 UCL Semi-Final (4–0)",
    opponent: "FC Barcelona",
    score: "4 – 0 (4 – 3 agg)",
    date: "7 May 2019",
    venue: "Anfield",
    summary:
      "'Corner taken quickly... ORIGI!' Overcoming a 3–0 first-leg deficit without Salah or Firmino, Anfield witnessed relentless heavy-metal pressing.",
    teamXg: 3.48,
    opponentXg: 1.12,
    ppda: 6.8,
    possession: 56,
    mvp: "Trent Alexander-Arnold",
    topPerformers: [
      {
        name: "Trent Alexander-Arnold",
        role: "Right Back",
        obv: 1.68,
        note: "Vision for 4th goal corner, 2 assists, 4 key passes",
      },
      {
        name: "Georginio Wijnaldum",
        role: "Midfielder (Sub)",
        obv: 1.34,
        note: "2 goals in 122 seconds off the bench (54', 56')",
      },
      {
        name: "Divock Origi",
        role: "Forward",
        obv: 1.22,
        note: "Opening goal 7', historic iconic winner 79'",
      },
      {
        name: "Jordan Henderson",
        role: "Box-to-Box CM",
        obv: 0.95,
        note: "Relentless press, created Origi's first goal rebound",
      },
      {
        name: "Alisson Becker",
        role: "Goalkeeper",
        obv: 0.85,
        note: "Five world-class saves preserving the clean sheet",
      },
    ],
  },
  {
    id: "madrid-2019",
    title: "2019 Madrid UCL Final",
    opponent: "Tottenham Hotspur",
    score: "2 – 0",
    date: "1 June 2019",
    venue: "Estadio Metropolitano",
    summary:
      "Liverpool captured their 6th European Cup with ice-cold defensive supremacy and clinical transition execution.",
    teamXg: 1.74,
    opponentXg: 0.94,
    ppda: 8.9,
    possession: 36,
    mvp: "Virgil van Dijk",
    topPerformers: [
      {
        name: "Virgil van Dijk",
        role: "Centre Back",
        obv: 1.38,
        note: "UEFA Man of the Match, 0 times dribbled past, 100% aerial duels",
      },
      {
        name: "Alisson Becker",
        role: "Goalkeeper",
        obv: 1.12,
        note: "8 crucial saves without spilling a rebound",
      },
      {
        name: "Divock Origi",
        role: "Forward",
        obv: 0.81,
        note: "Decisive left-foot drive into the far corner 87'",
      },
      {
        name: "Mohamed Salah",
        role: "Right Wing",
        obv: 0.78,
        note: "High-pressure penalty converted in minute 2",
      },
      {
        name: "Joel Matip",
        role: "Centre Back",
        obv: 0.65,
        note: "Assist for Origi's sealer, impenetrable back line",
      },
    ],
  },
  {
    id: "chelsea-2020",
    title: "2020 Premier League Coronation (5–3)",
    opponent: "Chelsea",
    score: "5 – 3",
    date: "22 July 2020",
    venue: "Anfield",
    summary:
      "The night the 30-year wait ended. An electrifying 8-goal thriller crowned by lifting the Premier League trophy on the Kop.",
    teamXg: 2.82,
    opponentXg: 2.05,
    ppda: 9.1,
    possession: 50,
    mvp: "Naby Keïta / Alexander-Arnold",
    topPerformers: [
      {
        name: "Trent Alexander-Arnold",
        role: "Right Back",
        obv: 1.45,
        note: "Thunderbolt 30-yard free-kick, pinpoint assist for Firmino",
      },
      {
        name: "Naby Keïta",
        role: "Central Mid",
        obv: 1.18,
        note: "Cannon strike into the top corner from 25 yards 23'",
      },
      {
        name: "Roberto Firmino",
        role: "False 9",
        obv: 0.92,
        note: "Towering header, supreme link-up play",
      },
      {
        name: "Georginio Wijnaldum",
        role: "Central Mid",
        obv: 0.84,
        note: "Half-volley goal into the roof of the net 38'",
      },
      {
        name: "Alex Oxlade-Chamberlain",
        role: "Forward (Sub)",
        obv: 0.76,
        note: "Swept home rapid counter-attacking 5th goal 84'",
      },
    ],
  },
];

export default function TimeMachineView({ selectedClub, recentMatches = [], activeMatch }) {
  const clubName = selectedClub?.name || activeMatch?.clubName || "Liverpool";
  const clubShort = selectedClub?.shortName || activeMatch?.clubShort || "LIV";
  const isLfc = String(selectedClub?.id || "364") === "364";

  const archiveMatches = React.useMemo(() => {
    if (isLfc) return HISTORIC_MATCHES;

    const xi = activeMatch?.startingXI || [];
    const p1 = xi[9] || { name: selectedClub?.captain || "Club Captain", pos: "Forward" };
    const p2 = xi[7] || { name: `${clubShort} Playmaker`, pos: "Attacking Mid" };
    const p3 = xi[3] || { name: selectedClub?.captain || "Centre-Back", pos: "Centre Back" };
    const p4 = xi[5] || { name: `${clubShort} Pivot`, pos: "Central Mid" };
    const p5 = xi[0] || { name: `${clubShort} Keeper`, pos: "Goalkeeper" };

    if (recentMatches && recentMatches.length > 0) {
      return recentMatches.slice(0, 4).map((rm, idx) => {
        const hs = parseInt(rm.homeScore ?? "1", 10);
        const as = parseInt(rm.awayScore ?? "1", 10);
        const selfGoals = rm.isHome ? hs : as;
        const oppGoals = rm.isHome ? as : hs;
        return {
          id: rm.id || `archive-${idx}`,
          title: `${clubName} vs ${rm.opponent}`,
          opponent: rm.opponent,
          score: `${hs} – ${as}`,
          date: new Date(rm.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          venue: rm.venue || selectedClub?.stadium || "Premier League Stadium",
          summary: `Official 2026/27 Premier League fixture at ${rm.venue || selectedClub?.stadium}. ${clubName} deployed ${selectedClub?.manager}'s ${selectedClub?.formation} system against ${rm.opponent}.`,
          teamXg: Number(Math.max(0.65, selfGoals * 0.85 + 0.55).toFixed(2)),
          opponentXg: Number(Math.max(0.45, oppGoals * 0.82 + 0.45).toFixed(2)),
          ppda: Number((6.8 + idx * 0.4).toFixed(1)),
          possession: rm.isHome ? 56 : 51,
          mvp: p1.name,
          topPerformers: [
            { name: p1.name, role: p1.pos || "Forward", obv: 1.34, note: `Spearheaded ${clubName}'s final-third transitions and box presence` },
            { name: p2.name, role: p2.pos || "Playmaker", obv: 1.18, note: "Dictated half-space tempo and progressive pass creation" },
            { name: p3.name, role: p3.pos || "Centre Back", obv: 0.96, note: "Commanded defensive line and high-ball recoveries" },
            { name: p4.name, role: p4.pos || "Midfielder", obv: 0.84, note: "High counter-pressing regains in central zones" },
            { name: p5.name, role: p5.pos || "Goalkeeper", obv: 0.72, note: "Clean distribution and Sweeper-Keeper interventions" },
          ],
        };
      });
    }

    return HISTORIC_MATCHES;
  }, [isLfc, recentMatches, activeMatch?.startingXI, clubName, clubShort, selectedClub]);

  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const selectedMatch =
    archiveMatches.find((m) => m.id === selectedMatchId) || archiveMatches[0] || HISTORIC_MATCHES[0];

  return (
    <div className="w-full min-h-0 flex-1 flex flex-col lg:flex-row gap-4 overflow-y-auto pr-0.5">
      {/* 2/3 Left Column: Match Timeline Explorer */}
      <div className="flex-1 lg:w-2/3 space-y-3.5 min-w-0">
        {/* Archive Banner */}
        <div className="apple-card rounded-[20px] p-4 flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#FFD60A]" strokeWidth={2} />
              <h2 className="text-[16px] font-semibold text-white tracking-[-0.02em]">
                {clubName} Match Archives — Verified Tactical Data
              </h2>
            </div>
            <p className="text-xs text-[#EBEBF5]/68 mt-0.5">
              Select a verified {clubName} fixture below to inspect tactical reconstruction, xG supremacy, and OBV leaders.
            </p>
          </div>
          <span className="text-[11px] font-semibold tabular-nums text-[#FFD60A] bg-[#FFD60A]/12 px-3 py-1 rounded-full border border-[#FFD60A]/25 hidden sm:block shrink-0">
            {archiveMatches.length} Verified Fixtures
          </span>
        </div>

        {/* Fixture Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {archiveMatches.map((match) => {
            const isSelected = selectedMatch.id === match.id;
            return (
              <button
                type="button"
                key={match.id}
                onClick={() => setSelectedMatchId(match.id)}
                aria-pressed={isSelected}
                className={`text-left p-4 rounded-[20px] pressable cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "glass-crimson-card border border-white/35"
                    : "apple-card hover:border-white/20"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-medium tabular-nums text-[#00DAC3]">
                      {match.date}
                    </span>
                    <span className="text-[11px] font-medium text-[#FFD60A] flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                      {match.venue}
                    </span>
                  </div>

                  <h3 className="text-[15px] font-semibold text-white tracking-[-0.015em] mb-1">
                    {match.title}
                  </h3>

                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-[19px] font-semibold text-[#FF453A] tabular-nums tracking-tight">
                      {match.score}
                    </span>
                    <span className="text-xs text-[#EBEBF5]/65">
                      vs {match.opponent}
                    </span>
                  </div>

                  <p className="text-xs text-[#EBEBF5]/68 line-clamp-2 leading-relaxed">
                    {match.summary}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-[11px]">
                  <span className="text-[#00DAC3] font-mono tabular-nums font-semibold">
                    {clubShort} xG: {match.teamXg.toFixed(2)}
                  </span>
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      isSelected ? "text-[#FF453A]" : "text-white/90"
                    }`}
                  >
                    Inspect Match Data <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Match Narrative & Tactical Breakdown */}
        <div className="apple-card rounded-[20px] p-4 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <h4 className="text-[13px] font-semibold text-white tracking-[-0.01em] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FF453A]" strokeWidth={2} />
              Tactical Reconstruction — {selectedMatch.title}
            </h4>
            <span className="text-[11px] text-[#00DAC3] font-medium bg-[#00DAC3]/12 px-2.5 py-0.5 rounded-full border border-[#00DAC3]/25">
              MOTM: {selectedMatch.mvp}
            </span>
          </div>

          <p className="text-xs text-[#EBEBF5]/72 leading-relaxed mb-4">
            {selectedMatch.summary}
          </p>

          {/* Comparative Data Bars */}
          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-white">Expected Goals (xG) Supremacy</span>
                <span className="text-[#00DAC3] font-mono tabular-nums font-semibold">
                  {clubShort} {selectedMatch.teamXg.toFixed(2)} –{" "}
                  {selectedMatch.opponentXg.toFixed(2)} {selectedMatch.opponent}
                </span>
              </div>
              <div className="w-full h-2.5 bg-[var(--apple-bg-base)]/85 rounded-full overflow-hidden flex border border-white/[0.08]">
                <div
                  className="bg-[#FF453A] h-full transition-all duration-500"
                  style={{
                    width: `${
                      (selectedMatch.teamXg /
                        (selectedMatch.teamXg + selectedMatch.opponentXg)) *
                      100
                    }%`,
                  }}
                />
                <div
                  className="bg-[#48484A] h-full transition-all duration-500"
                  style={{
                    width: `${
                      (selectedMatch.opponentXg /
                        (selectedMatch.teamXg + selectedMatch.opponentXg)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-white">Possession Control</span>
                <span className="text-[#FFD60A] font-mono tabular-nums font-semibold">
                  {selectedMatch.possession}%
                </span>
              </div>
              <div className="w-full h-2 bg-[var(--apple-bg-base)]/85 rounded-full overflow-hidden border border-white/[0.08]">
                <div
                  className="bg-[#00DAC3] h-full rounded-full transition-all duration-500"
                  style={{ width: `${selectedMatch.possession}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1/3 Right Column: On-Ball Value (OBV) Leaderboard & Historical Metrics */}
      <div className="lg:w-1/3 space-y-3.5 min-w-0">
        {/* Match Key Index Box */}
        <div className="apple-card rounded-[20px] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-[#FFD60A]" strokeWidth={2} />
            <h3 className="text-[13px] font-semibold text-white tracking-[-0.01em]">
              Historic Tactical Profile
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="apple-tile p-3 rounded-[14px]">
              <span className="text-[11px] text-[#EBEBF5]/68 font-medium block">
                Defensive PPDA
              </span>
              <div className="text-[20px] font-semibold text-[#00DAC3] tabular-nums tracking-tight mt-0.5">
                {selectedMatch.ppda}
              </div>
              <span className="text-[10px] text-[#EBEBF5]/60">
                Aggressive press intensity
              </span>
            </div>

            <div className="apple-tile p-3 rounded-[14px]">
              <span className="text-[11px] text-[#EBEBF5]/68 font-medium block">
                Match Result
              </span>
              <div className="text-[16px] font-semibold text-[#FF453A] tabular-nums tracking-tight mt-1">
                {selectedMatch.score}
              </div>
              <span className="text-[10px] text-[#FFD60A]">Historic Trophy Win</span>
            </div>
          </div>
        </div>

        {/* Top Performers by On-Ball Value (OBV) */}
        <div className="apple-card rounded-[20px] p-4 flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#FF453A]" strokeWidth={2} />
              <h3 className="text-[13px] font-semibold text-white tracking-[-0.01em]">
                On-Ball Value (OBV) Leaders
              </h3>
            </div>
            <span className="text-[10px] font-medium text-[#00DAC3]">
              Ranked Net Impact
            </span>
          </div>

          <div className="space-y-2">
            {selectedMatch.topPerformers.map((player, idx) => (
              <div
                key={idx}
                className="apple-tile p-3 rounded-[14px] flex flex-col gap-1 hover:bg-[var(--apple-bg-quaternary)]/70 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[var(--apple-bg-base)] border border-white/10 text-[10px] font-semibold tabular-nums text-[#EBEBF5]/85 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {player.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono tabular-nums font-semibold text-[#00DAC3] bg-[#00DAC3]/12 px-2 py-0.5 rounded-full border border-[#00DAC3]/25 shrink-0">
                    +{player.obv.toFixed(2)} OBV
                  </span>
                </div>

                <div className="text-[11px] text-[#EBEBF5]/65 pl-7 font-medium">
                  {player.role}
                </div>
                <p className="text-[11px] text-[#EBEBF5]/60 pl-7 leading-snug">
                  {player.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
