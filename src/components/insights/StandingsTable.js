"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw, Search } from "lucide-react";
import { PREMIER_LEAGUE_MANAGERS } from "../../data/premierLeagueManagers";
import { SlidingSegmentedTabs } from "./SlidingSegmentedTabs";

export default function StandingsTable({ selectedClubId = "364", onSelectClub }) {
  const [standings, setStandings] = useState([]);
  const [source, setSource] = useState("Live Premier League Feed");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoneFilter, setZoneFilter] = useState("all"); // "all" | "europe" | "relegation"
  const [search, setSearch] = useState("");

  const fetchStandings = useCallback(() => {
    setIsLoading(true);
    fetch("/api/standings")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.standings) {
          setStandings(data.standings);
          setSource(data.source || "Live Standings Feed");
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

  const selectedTeamInfo =
    PREMIER_LEAGUE_MANAGERS[selectedClubId] || PREMIER_LEAGUE_MANAGERS["364"];
  const selectedRow = standings.find((t) => String(t.id) === String(selectedClubId));

  const filteredRows = standings.filter((team) => {
    if (zoneFilter === "europe" && team.rank > 6) return false;
    if (zoneFilter === "relegation" && team.rank < 15) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        team.name?.toLowerCase().includes(q) ||
        team.manager?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <section
      aria-label="Premier League standings"
      className="glass-card-deep p-5 sm:p-6 space-y-5"
    >
      {/* Top Bar: Clean Title, Filters & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
        <div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h2 className="font-display text-lg font-semibold text-white tracking-tight">
              2026/27 Premier League Table
            </h2>
            {selectedRow && (
              <span className="text-xs font-mono text-[#D2F865] tabular-nums">
                {selectedTeamInfo.shortName} #{selectedRow.rank} · {selectedRow.points} pts
              </span>
            )}
          </div>
          <p className="text-xs text-[#8A8D96] mt-1">
            {source}
            {lastUpdated && (
              <>
                <span aria-hidden="true" className="mx-2 text-white/20">
                  ·
                </span>
                <span className="font-mono tabular-nums">
                  Updated{" "}
                  {new Date(lastUpdated).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Apple HIG Sliding Segmented Zone Filter */}
          <SlidingSegmentedTabs
            tabs={[
              { id: "all", label: "All 20" },
              { id: "europe", label: "Top 6" },
              { id: "relegation", label: "Bottom 6" },
            ]}
            value={zoneFilter}
            onChange={setZoneFilter}
            layoutId="standings-zone-pill"
            ariaLabel="Filter table by league zone"
            size="sm"
          />

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8A8D96] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter club…"
              className="h-9 pl-8 pr-3 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder:text-[#5E616B] focus:outline-none focus:border-[#D2F865]/50 w-40"
            />
          </div>

          <button
            type="button"
            onClick={fetchStandings}
            disabled={isLoading}
            aria-label="Refresh league standings"
            className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-[#D4D6DC] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#D2F865]" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-[11px] font-medium text-[#8A8D96]">
              <th className="py-3 pl-3 pr-2 w-12 text-center">Pos</th>
              <th className="py-3 px-3">Club &amp; Head Coach</th>
              <th className="py-3 px-2 text-right font-mono w-14">P</th>
              <th className="py-3 px-2 text-right font-mono w-14">W</th>
              <th className="py-3 px-2 text-right font-mono w-14">D</th>
              <th className="py-3 px-2 text-right font-mono w-14">L</th>
              <th className="py-3 px-2 text-right font-mono w-16">GD</th>
              <th className="py-3 pl-2 pr-4 text-right font-mono text-white w-16">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {isLoading && standings.length === 0 ? (
              Array.from({ length: 8 }).map((_, idx) => (
                <tr key={`skel-${idx}`} className="animate-pulse">
                  <td colSpan={8} className="py-3.5 px-3">
                    <div className="h-4 bg-white/[0.05] rounded-lg w-full" />
                  </td>
                </tr>
              ))
            ) : (
              filteredRows.map((team) => {
                const rank = team.rank;
                const isSelected = String(team.id) === String(selectedClubId);
                const zoneLabel =
                  rank <= 4
                    ? "UCL"
                    : rank === 5
                    ? "UEL"
                    : rank === 6
                    ? "UECL"
                    : rank >= 18
                    ? "REL"
                    : null;

                return (
                  <tr
                    key={team.id || team.name}
                    onClick={() => onSelectClub && team.id && onSelectClub(String(team.id))}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#D2F865]/[0.08] text-white"
                        : "hover:bg-white/[0.03] text-[#D4D6DC]"
                    }`}
                  >
                    <td className="py-3 pl-3 pr-2 text-center font-mono tabular-nums text-xs font-semibold">
                      <span
                        className={
                          isSelected
                            ? "text-[#D2F865]"
                            : rank <= 4
                            ? "text-[#8BA3F5]"
                            : rank >= 18
                            ? "text-[#F26E7C]"
                            : "text-[#8A8D96]"
                        }
                      >
                        {team.rank}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`text-sm ${
                            isSelected ? "font-semibold text-white" : "font-medium text-white/90"
                          }`}
                        >
                          {team.name}
                        </span>
                        {zoneLabel && (
                          <span className="text-[10px] font-mono text-[#6F727C]">
                            {zoneLabel}
                          </span>
                        )}
                      </div>
                      {team.manager && (
                        <div className="text-[11px] text-[#8A8D96] mt-0.5">
                          {team.manager}
                          {team.formation && (
                            <span className="font-mono text-[#6F727C]">
                              {" "}
                              · {team.formation}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-2 text-right font-mono tabular-nums text-xs text-[#8A8D96]">
                      {team.played}
                    </td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums text-xs text-[#A7E87A]">
                      {team.wins}
                    </td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums text-xs text-[#8A8D96]">
                      {team.draws}
                    </td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums text-xs text-[#F2858E]">
                      {team.losses}
                    </td>
                    <td
                      className={`py-3 px-2 text-right font-mono tabular-nums text-xs font-medium ${
                        team.goalDiff > 0
                          ? "text-[#A7E87A]"
                          : team.goalDiff < 0
                          ? "text-[#F2858E]"
                          : "text-[#8A8D96]"
                      }`}
                    >
                      {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
                    </td>
                    <td className="py-3 pl-2 pr-4 text-right font-mono tabular-nums text-sm font-semibold text-white">
                      {team.points}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Quiet Legend & Guidance */}
      <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs text-[#8A8D96]">
        <span>Select any club row to switch active tactical intelligence</span>
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#6F727C]">
          <span>UCL 1–4</span>
          <span>·</span>
          <span>UEL 5</span>
          <span>·</span>
          <span>UECL 6</span>
          <span>·</span>
          <span>REL 18–20</span>
        </div>
      </div>
    </section>
  );
}
