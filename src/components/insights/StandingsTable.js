"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Trophy,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  TrendingUp,
  Shield,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { PREMIER_LEAGUE_MANAGERS } from "../../data/premierLeagueManagers";

export default function StandingsTable({ selectedClubId = "364", onSelectClub }) {
  const [standings, setStandings] = useState([]);
  const [source, setSource] = useState("Connecting to live feed...");
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchStandings = useCallback(() => {
    setIsLoading(true);
    fetch("/api/standings")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.standings) {
          setStandings(data.standings);
          setSource(data.source || "Live Standings Feed");
          setIsLive(Boolean(data.isLive));
          setLastUpdated(data.lastUpdated);
        }
      })
      .catch((err) => {
        console.error("Failed to load live standings:", err);
        setSource("Feed temporarily unavailable");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      fetchStandings();
    }, 0);

    const interval = setInterval(() => {
      fetchStandings();
    }, 3 * 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [fetchStandings]);

  const displayedRows = isExpanded ? standings : standings.slice(0, 6);
  const selectedTeamInfo = PREMIER_LEAGUE_MANAGERS[selectedClubId] || PREMIER_LEAGUE_MANAGERS["364"];
  const currentClubRank = standings.find((t) => String(t.id) === String(selectedClubId))?.rank || null;

  return (
    <div className="apple-tile rounded-2xl border border-white/[0.08] p-4 bg-[#0B0E14] text-white">
      {/* Table Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#E31B23]/15 border border-[#E31B23]/30 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-[#FF2636]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-white">
                Premier League Live Standings
              </h3>
              {currentClubRank && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FF2636]/20 text-[#FF4D5A] border border-[#FF2636]/30">
                  {selectedTeamInfo.shortName} Pos: #{currentClubRank}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/50">
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-400" : "bg-amber-400"}`} />
                {source}
              </span>
              <span>•</span>
              <span>2026/27 Official Season</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchStandings}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer disabled:opacity-50"
            title="Refresh live table"
            aria-label="Refresh live table"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#FF2636]" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-medium px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white transition flex items-center gap-1 cursor-pointer border border-white/10"
          >
            {isExpanded ? (
              <>
                <span>Top 6 View</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Full 20 Teams</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Qualification Line Legend */}
      <div className="flex flex-wrap items-center gap-3 py-2 text-[10px] text-white/40 border-b border-white/[0.04]">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Champions League (1-4)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Europa League (5)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Conference League (6)</span>
        </div>
        {isExpanded && (
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Relegation Zone (18-20)</span>
          </div>
        )}
      </div>

      {/* Standings Table Grid */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/[0.06] text-[10px] font-semibold text-[#8E8E93] uppercase tracking-wider">
              <th className="py-2 pl-2 w-8 text-center">Pos</th>
              <th className="py-2 pl-2">Club &amp; Head Coach</th>
              <th className="py-2 text-center w-10">P</th>
              <th className="py-2 text-center w-8">W</th>
              <th className="py-2 text-center w-8">D</th>
              <th className="py-2 text-center w-8">L</th>
              <th className="py-2 text-center w-12 font-mono">GD</th>
              <th className="py-2 text-center w-12 font-mono font-bold text-white">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {displayedRows.map((team) => {
              const rank = team.rank;
              const isUcl = rank <= 4;
              const isUel = rank === 5;
              const isUecl = rank === 6;
              const isRelegation = rank >= 18;
              const isCurrentSelected = String(team.id) === String(selectedClubId);

              return (
                <tr
                  key={team.id || team.name}
                  onClick={() => {
                    if (onSelectClub && team.id) {
                      onSelectClub(String(team.id));
                    }
                  }}
                  className={`transition-colors cursor-pointer ${
                    isCurrentSelected
                      ? "bg-[#FF2636]/15 font-semibold text-white shadow-inner"
                      : "hover:bg-white/[0.04] text-white/85"
                  }`}
                >
                  {/* Position with qualification badge stripe */}
                  <td className="py-2.5 pl-2 text-center font-mono font-bold text-xs relative">
                    <span
                      className={`inline-block w-1 h-3.5 rounded-full absolute left-0.5 top-3 ${
                        isUcl
                          ? "bg-blue-500"
                          : isUel
                          ? "bg-amber-500"
                          : isUecl
                          ? "bg-emerald-500"
                          : isRelegation
                          ? "bg-rose-500"
                          : "bg-transparent"
                      }`}
                    />
                    {team.rank}
                  </td>

                  {/* Club Name & Head Coach */}
                  <td className="py-2.5 pl-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${isCurrentSelected ? "font-bold text-white" : "font-medium"}`}>
                          {team.name}
                        </span>
                        {isCurrentSelected && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#FF2636] text-white">
                            Selected
                          </span>
                        )}
                      </div>
                      {team.manager && (
                        <div className="text-[10px] text-white/50 flex items-center gap-1.5 mt-0.5">
                          <span className="text-[#8E8E93]">{team.manager}</span>
                          {team.formation && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-white/40">{team.formation}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Played, Won, Drawn, Lost */}
                  <td className="py-2.5 text-center font-mono tabular-nums text-white/70">
                    {team.played}
                  </td>
                  <td className="py-2.5 text-center font-mono tabular-nums text-emerald-400">
                    {team.wins}
                  </td>
                  <td className="py-2.5 text-center font-mono tabular-nums text-white/50">
                    {team.draws}
                  </td>
                  <td className="py-2.5 text-center font-mono tabular-nums text-rose-400/80">
                    {team.losses}
                  </td>

                  {/* Goal Difference */}
                  <td
                    className={`py-2.5 text-center font-mono tabular-nums font-semibold ${
                      team.goalDiff > 0
                        ? "text-emerald-400"
                        : team.goalDiff < 0
                        ? "text-rose-400"
                        : "text-white/40"
                    }`}
                  >
                    {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
                  </td>

                  {/* Points */}
                  <td className="py-2.5 text-center font-mono tabular-nums font-bold text-sm text-white">
                    {team.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer Insight / Navigation Link */}
      <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-white/40">
        <span>Click any row to switch active tactical intelligence</span>
        {lastUpdated && (
          <span className="font-mono text-[10px]">
            Updated: {new Date(lastUpdated).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>
    </div>
  );
}
