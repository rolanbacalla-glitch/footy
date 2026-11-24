"use client";

import React, { useEffect, useState } from "react";
import { PREMIER_LEAGUE_MANAGERS } from "../../data/premierLeagueManagers";

export default function LiveMatchTicker({ selectedClubId, onSelectClub }) {
  const [liveMatches, setLiveMatches] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function fetchScores() {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await fetch("/api/live-scores");
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) {
          setLiveMatches(data.liveMatches || []);
        }
      } catch {
        // Silent fallback
      }
    }

    fetchScores();
    const interval = setInterval(fetchScores, liveMatches.length > 0 ? 15000 : 60000);

    const handleVisibility = () => {
      if (typeof document !== "undefined" && !document.hidden) fetchScores();
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibility);
    }

    return () => {
      mounted = false;
      clearInterval(interval);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibility);
      }
    };
  }, [liveMatches.length]);

  if (liveMatches.length === 0) return null;

  return (
    <div
      aria-label="Live matchday scores ticker"
      className="w-full rounded-2xl border border-[#FF2636]/25 bg-[#19161A]/90 backdrop-blur-md px-3 py-2 flex items-center gap-3 overflow-x-auto"
    >
      <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-white/10">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2636] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF2636]" />
        </span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#FF4D5A] whitespace-nowrap">
          LIVE ({liveMatches.length})
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto">
        {liveMatches.map((m) => {
          const clickableClubId = PREMIER_LEAGUE_MANAGERS[m.homeTeamId]
            ? m.homeTeamId
            : PREMIER_LEAGUE_MANAGERS[m.awayTeamId]
              ? m.awayTeamId
              : null;
          const isSelected =
            String(selectedClubId) === String(m.homeTeamId) ||
            String(selectedClubId) === String(m.awayTeamId);

          return (
            <button
              key={m.id}
              type="button"
              disabled={!clickableClubId}
              onClick={() => clickableClubId && onSelectClub && onSelectClub(clickableClubId)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs shrink-0 transition-colors ${
                isSelected
                  ? "bg-[#FF2636]/15 border-[#FF4D5A]/50 text-white"
                  : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-white/90"
              } ${clickableClubId ? "cursor-pointer" : "cursor-default opacity-80"}`}
            >
              <span
                className={`px-1 py-0.5 rounded font-mono text-[9px] font-bold uppercase ${
                  m.isEuropean
                    ? "bg-[#637AE0]/25 text-[#A5B8FF]"
                    : "bg-[#D2F865]/15 text-[#D2F865]"
                }`}
              >
                {m.competitionCode}
              </span>
              <span className="font-semibold">{m.homeShort}</span>
              <span className="font-mono font-bold text-white tabular-nums">
                {m.homeScore}–{m.awayScore}
              </span>
              <span className="font-semibold">{m.awayShort}</span>
              <span className="font-mono text-[10px] text-[#FF4D5A] tabular-nums">
                {m.displayClock || "LIVE"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
