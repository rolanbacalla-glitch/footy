"use client";

import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import ClubBadge from "./ClubBadge";

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
      "Overcoming a 3–0 first-leg deficit without Salah or Firmino, Anfield witnessed relentless counter-pressing and one of football's most iconic corners.",
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
        note: "Opening goal 7', decisive winner 79'",
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
      "Liverpool captured their 6th European Cup with disciplined defensive control and clinical transition execution.",
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
        note: "Assist for Origi's sealer, composed back line",
      },
    ],
  },
  {
    id: "chelsea-2020",
    title: "2020 Premier League Coronation",
    opponent: "Chelsea",
    score: "5 – 3",
    date: "22 July 2020",
    venue: "Anfield",
    summary:
      "An electrifying 8-goal thriller crowned by lifting the Premier League trophy on the Kop.",
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
        note: "30-yard free-kick, pinpoint assist for Firmino",
      },
      {
        name: "Naby Keïta",
        role: "Central Mid",
        obv: 1.18,
        note: "Long-range strike into the top corner 23'",
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

export default function TimeMachineView({
  selectedClub,
  recentMatches = [],
  activeMatch,
}) {
  const clubName = selectedClub?.name || activeMatch?.clubName || "Liverpool";
  const clubShort = selectedClub?.shortName || activeMatch?.clubShort || "LIV";
  const isLfc = String(selectedClub?.id || "364") === "364";

  const archiveMatches = React.useMemo(() => {
    const xi = activeMatch?.startingXI || [];
    const p1 = xi[9] || {
      name: selectedClub?.captain || "Club Captain",
      pos: "Forward",
    };
    const p2 = xi[7] || {
      name: `${clubShort} Playmaker`,
      pos: "Attacking Mid",
    };
    const p3 = xi[3] || {
      name: selectedClub?.captain || "Centre-Back",
      pos: "Centre Back",
    };
    const p4 = xi[5] || { name: `${clubShort} Pivot`, pos: "Central Mid" };
    const p5 = xi[0] || { name: `${clubShort} Keeper`, pos: "Goalkeeper" };

    // Always surface the most recently played 2026/27 matches first (PL + European)
    const sortedRecent = [...(recentMatches || [])]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 6);

    const recentArchiveCards = sortedRecent.map((rm, idx) => {
      const hs = parseInt(rm.homeScore ?? "1", 10);
      const as = parseInt(rm.awayScore ?? "1", 10);
      const isHome = Boolean(rm.isHome);
      const selfGoals = isHome ? hs : as;
      const oppGoals = isHome ? as : hs;
      const outcome =
        selfGoals > oppGoals ? "W" : selfGoals < oppGoals ? "L" : "D";
      const compLabel = rm.competition || "Premier League";
      return {
        id: rm.id || `archive-${idx}`,
        title: `${clubName} ${isHome ? "vs" : "at"} ${rm.opponent}`,
        opponent: rm.opponent,
        opponentId: rm.opponentId || null,
        opponentLogo: rm.opponentLogo || null,
        isHome,
        outcome,
        selfGoals,
        oppGoals,
        score: `${selfGoals} – ${oppGoals}`,
        date: new Date(rm.date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        venue: rm.venue || selectedClub?.stadium || "Premier League Stadium",
        summary: `Official 2026/27 ${compLabel} fixture at ${
          rm.venue || selectedClub?.stadium
        }. ${clubName} deployed ${selectedClub?.manager}'s ${
          selectedClub?.formation
        } system against ${rm.opponent}.`,
        teamXg: Number(Math.max(0.65, selfGoals * 0.85 + 0.55).toFixed(2)),
        opponentXg: Number(Math.max(0.45, oppGoals * 0.82 + 0.45).toFixed(2)),
        ppda: Number((6.8 + idx * 0.4).toFixed(1)),
        possession: rm.isHome ? 56 : 51,
        mvp: p1.name,
        topPerformers: [
          {
            name: p1.name,
            role: p1.pos || "Forward",
            obv: 1.34,
            note: `Spearheaded ${clubName}'s final-third transitions and box presence`,
          },
          {
            name: p2.name,
            role: p2.pos || "Playmaker",
            obv: 1.18,
            note: "Dictated half-space tempo and progressive pass creation",
          },
          {
            name: p3.name,
            role: p3.pos || "Centre Back",
            obv: 0.96,
            note: "Commanded defensive line and high-ball recoveries",
          },
          {
            name: p4.name,
            role: p4.pos || "Midfielder",
            obv: 0.84,
            note: "High counter-pressing regains in central zones",
          },
          {
            name: p5.name,
            role: p5.pos || "Goalkeeper",
            obv: 0.72,
            note: "Clean distribution and sweeper-keeper interventions",
          },
        ],
      };
    });

    if (recentArchiveCards.length > 0) {
      return recentArchiveCards;
    }

    return HISTORIC_MATCHES;
  }, [
    recentMatches,
    activeMatch?.startingXI,
    clubName,
    clubShort,
    selectedClub,
  ]);

  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const selectedMatch =
    archiveMatches.find((m) => m.id === selectedMatchId) ||
    archiveMatches[0] ||
    HISTORIC_MATCHES[0];

  const getOutcomeStyles = (outcome) => {
    if (outcome === "L") {
      return {
        label: "LOSS",
        badge: "bg-[#F26E7C]/15 text-[#F26E7C] border-[#F26E7C]/35",
        score: "text-[#F26E7C]",
        accent: "border-l-[#F26E7C]/70",
      };
    }
    if (outcome === "D") {
      return {
        label: "DRAW",
        badge: "bg-[#F4BA5B]/15 text-[#F4BA5B] border-[#F4BA5B]/35",
        score: "text-[#F4BA5B]",
        accent: "border-l-[#F4BA5B]/70",
      };
    }
    return {
      label: "WIN",
      badge: "bg-[#D2F865]/15 text-[#D2F865] border-[#D2F865]/35",
      score: "text-[#D2F865]",
      accent: "border-l-[#D2F865]/70",
    };
  };

  const selectedOutcomeStyle = getOutcomeStyles(selectedMatch.outcome || "W");

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
      {/* Left 8 Cols: Archive Selector & Breakdown */}
      <div className="xl:col-span-8 space-y-5 min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {archiveMatches.map((match) => {
            const isSelected = selectedMatch.id === match.id;
            const style = getOutcomeStyles(match.outcome || "W");
            return (
              <button
                type="button"
                key={match.id}
                onClick={() => setSelectedMatchId(match.id)}
                aria-pressed={isSelected}
                className={`text-left p-5 rounded-[24px] transition-all cursor-pointer flex flex-col justify-between border border-l-2 ${
                  style.accent
                } ${
                  isSelected
                    ? "glass-crimson-card"
                    : "glass-card hover:border-white/15"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-[#8A8D96] mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono tabular-nums shrink-0">{match.date}</span>
                      {typeof match.isHome === "boolean" && (
                        <span className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] font-mono text-[10px] font-semibold uppercase tracking-wider text-white/75 shrink-0">
                          {match.isHome ? "HOME" : "AWAY"}
                        </span>
                      )}
                    </div>
                    <span className="truncate ml-1">{match.venue}</span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <ClubBadge
                        clubId={selectedClub?.id}
                        name={clubName}
                        shortName={clubShort}
                        primaryColor={selectedClub?.primaryColor}
                        secondaryColor={selectedClub?.secondaryColor}
                        size="sm"
                      />
                      <h3 className="font-display text-base font-semibold text-white tracking-tight truncate">
                        {match.title}
                      </h3>
                      <ClubBadge
                        clubId={match.opponentId}
                        name={match.opponent}
                        logoUrl={match.opponentLogo}
                        size="xs"
                      />
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full border font-mono text-[10px] font-bold uppercase tracking-wider shrink-0 ${style.badge}`}
                    >
                      {style.label}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2.5 mt-2">
                    <span className={`font-display text-2xl font-light tabular-nums ${style.score}`}>
                      {match.score}
                    </span>
                    <span className="text-xs text-[#8A8D96]">
                      {clubShort} {match.isHome === false ? "away at" : "vs"} {match.opponent}
                    </span>
                  </div>

                  <p className="text-xs text-[#B7BAC3] line-clamp-2 leading-relaxed mt-2.5">
                    {match.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="font-mono text-[#8A8D96] tabular-nums">
                    {clubShort} xG {match.teamXg.toFixed(2)}
                  </span>
                  <span className="text-white/90 font-medium flex items-center gap-1">
                    Inspect <ArrowUpRight className="w-3.5 h-3.5 text-[#D2F865]" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tactical Reconstruction Card */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-base font-semibold text-white">
              Tactical Reconstruction · {selectedMatch.title}
            </h3>
            <span className="text-xs text-[#D2F865] font-medium">
              MOTM: {selectedMatch.mvp}
            </span>
          </div>

          <p className="text-sm text-[#B7BAC3] leading-relaxed">
            {selectedMatch.summary}
          </p>

          <div className="space-y-4 pt-1">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-[#8A8D96]">Expected Goals (xG)</span>
                <span className="font-mono text-white tabular-nums">
                  {clubShort} {selectedMatch.teamXg.toFixed(2)} –{" "}
                  {selectedMatch.opponentXg.toFixed(2)} {selectedMatch.opponent}
                </span>
              </div>
              <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden flex">
                <div
                  className="bg-[#D2F865] h-full transition-all duration-500"
                  style={{
                    width: `${
                      (selectedMatch.teamXg /
                        (selectedMatch.teamXg + selectedMatch.opponentXg)) *
                      100
                    }%`,
                  }}
                />
                <div
                  className="bg-white/25 h-full transition-all duration-500"
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
              <div className="flex justify-between text-xs mb-2">
                <span className="text-[#8A8D96]">Possession Control</span>
                <span className="font-mono text-white tabular-nums">
                  {selectedMatch.possession}%
                </span>
              </div>
              <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="bg-[#637AE0] h-full rounded-full transition-all duration-500"
                  style={{ width: `${selectedMatch.possession}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right 4 Cols: OBV Leaderboard */}
      <div className="xl:col-span-4 space-y-5">
        <div className="glass-card p-5 grid grid-cols-2 divide-x divide-white/[0.07]">
          <div className="pr-4">
            <span className="text-[11px] text-[#8A8D96] block">
              Defensive PPDA
            </span>
            <span className="font-display text-2xl font-light text-[#D2F865] tabular-nums mt-1 block">
              {selectedMatch.ppda}
            </span>
          </div>
          <div className="pl-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-[#8A8D96] block">Final Score</span>
              <span
                className={`px-1.5 py-0.5 rounded-full border font-mono text-[9px] font-bold uppercase tracking-wider ${selectedOutcomeStyle.badge}`}
              >
                {selectedOutcomeStyle.label}
              </span>
            </div>
            <span className={`font-display text-xl font-medium tabular-nums mt-1.5 block ${selectedOutcomeStyle.score}`}>
              {selectedMatch.score}
            </span>
          </div>
        </div>

        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <h3 className="font-display text-sm font-semibold text-white">
              On-Ball Value Leaders
            </h3>
            <span className="text-[11px] text-[#8A8D96]">Net OBV</span>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {selectedMatch.topPerformers.map((player, idx) => (
              <div key={idx} className="py-3 first:pt-0.5 last:pb-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-white">
                    {idx + 1}. {player.name}
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#D2F865] tabular-nums shrink-0">
                    +{player.obv.toFixed(2)}
                  </span>
                </div>
                <div className="text-[11px] text-[#8A8D96]">{player.role}</div>
                <p className="text-xs text-[#B7BAC3]/80 leading-snug">
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
