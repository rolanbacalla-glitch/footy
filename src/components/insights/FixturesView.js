"use client";

import React, { useMemo, useState } from "react";
import { Calendar, MapPin, Clock, Tv, ArrowUpRight } from "lucide-react";
import ClubBadge from "./ClubBadge";
import { SlidingSegmentedTabs } from "./SlidingSegmentedTabs";

function formatMonthKey(isoDate) {
  if (!isoDate) return "Scheduled";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "Scheduled";
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export default function FixturesView({
  selectedClub,
  liveSchedule,
  onSelectFixture,
}) {
  const [scope, setScope] = useState("upcoming");
  const [venueFilter, setVenueFilter] = useState("all");
  const [compFilter, setCompFilter] = useState("all");

  const upcoming = liveSchedule?.upcoming || [];
  const recent = liveSchedule?.recent || [];
  const baseList = scope === "upcoming" ? upcoming : recent;

  const filteredFixtures = useMemo(() => {
    return baseList.filter((fx) => {
      if (venueFilter === "home" && !fx.isHome) return false;
      if (venueFilter === "away" && fx.isHome) return false;
      if (compFilter === "pl") {
        const comp = String(fx.competition || "").toLowerCase();
        if (!comp.includes("premier")) return false;
      }
      if (compFilter === "cups") {
        const comp = String(fx.competition || "").toLowerCase();
        if (comp.includes("premier")) return false;
      }
      return true;
    });
  }, [baseList, venueFilter, compFilter]);

  const groupedByMonth = useMemo(() => {
    const groups = new Map();
    for (const fx of filteredFixtures) {
      const monthLabel = formatMonthKey(fx.date);
      if (!groups.has(monthLabel)) groups.set(monthLabel, []);
      groups.get(monthLabel).push(fx);
    }
    return Array.from(groups.entries());
  }, [filteredFixtures]);

  const clubName = selectedClub?.name || "Liverpool";

  return (
    <section
      aria-label={`${clubName} full fixture calendar`}
      className="space-y-5"
    >
      {/* Top Filter & Controls Bar */}
      <div className="glass-card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <SlidingSegmentedTabs
            tabs={[
              { id: "upcoming", label: `Upcoming (${upcoming.length})` },
              { id: "recent", label: `Results (${recent.length})` },
            ]}
            value={scope}
            onChange={setScope}
            layoutId="fixtures-scope-pill"
            ariaLabel="Toggle upcoming fixtures or recent results"
            size="sm"
          />

          <SlidingSegmentedTabs
            tabs={[
              { id: "all", label: "All Venues" },
              { id: "home", label: "Home" },
              { id: "away", label: "Away" },
            ]}
            value={venueFilter}
            onChange={setVenueFilter}
            layoutId="fixtures-venue-pill"
            ariaLabel="Filter fixtures by home or away"
            size="sm"
          />

          <SlidingSegmentedTabs
            tabs={[
              { id: "all", label: "All Comps" },
              { id: "pl", label: "Premier League" },
              { id: "cups", label: "Europe & Cups" },
            ]}
            value={compFilter}
            onChange={setCompFilter}
            layoutId="fixtures-comp-pill"
            ariaLabel="Filter fixtures by competition"
            size="sm"
          />
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#8A8D96] font-mono shrink-0">
          <Calendar className="w-3.5 h-3.5 text-[#D2F865]" />
          <span>All kick-offs UK (GMT)</span>
        </div>
      </div>

      {/* Month-by-Month Fixture Groups */}
      {groupedByMonth.length === 0 ? (
        <div className="glass-card p-10 text-center text-sm text-[#8A8D96]">
          No {scope === "upcoming" ? "upcoming fixtures" : "recent results"} match the selected filters.
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByMonth.map(([monthLabel, items]) => (
            <div key={monthLabel} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="font-display text-sm sm:text-base font-semibold text-white tracking-tight">
                  {monthLabel}
                </h2>
                <span className="font-mono text-[11px] text-[#8A8D96]">
                  {items.length} {items.length === 1 ? "match" : "matches"}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {items.map((fx) => {
                  const dateObj = fx.date ? new Date(fx.date) : null;
                  const dateStr =
                    dateObj && !Number.isNaN(dateObj.getTime())
                      ? dateObj.toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })
                      : "TBC";
                  const timeStr =
                    dateObj && !Number.isNaN(dateObj.getTime())
                      ? dateObj.toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Europe/London",
                        })
                      : "TBC";
                  const isEuropean = !String(fx.competition || "")
                    .toLowerCase()
                    .includes("premier");
                  const oppName = fx.opponent || (fx.isHome ? fx.awayTeam : fx.homeTeam) || "Opponent";

                  const isLive = Boolean(fx.isLive);
                  const isFinished = scope === "recent" && !isLive;

                  return (
                    <button
                      key={fx.id}
                      type="button"
                      onClick={() => onSelectFixture && onSelectFixture(fx.id)}
                      className="glass-tile p-4 text-left flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ClubBadge
                          clubId={fx.opponentId}
                          name={oppName}
                          logoUrl={fx.opponentLogo}
                          size="md"
                          className="shrink-0"
                        />

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span
                              className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider shrink-0 ${
                                isLive
                                  ? "text-[#FF4D5A] font-bold"
                                  : isFinished
                                    ? "text-[#8A8D96]"
                                    : "text-[#D2F865]"
                              }`}
                            >
                              {isLive ? (
                                <span
                                  className="relative flex h-1.5 w-1.5 shrink-0"
                                  aria-hidden="true"
                                >
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2636] opacity-75" />
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#FF2636]" />
                                </span>
                              ) : (
                                <span
                                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                    isFinished ? "bg-[#6F727C]" : "bg-[#D2F865]"
                                  }`}
                                  aria-hidden="true"
                                />
                              )}
                              <span>
                                {isLive
                                  ? "Live"
                                  : isFinished
                                    ? "Finished"
                                    : "Upcoming"}
                              </span>
                            </span>
                            <span className="text-white/20" aria-hidden="true">
                              ·
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                                isEuropean
                                  ? "bg-[#637AE0]/20 text-[#A5B8FF] border border-[#637AE0]/30"
                                  : "bg-white/[0.06] text-white/80 border border-white/[0.08]"
                              }`}
                            >
                              {fx.competitionCode || (isEuropean ? "UEFA" : "PL")}
                            </span>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A8D96]">
                              {fx.isHome ? "Home" : "Away"}
                            </span>
                            {fx.venue && (
                              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#6F727C] truncate">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span className="truncate max-w-[160px]">{fx.venue}</span>
                              </span>
                            )}
                          </div>

                          <div className="text-sm sm:text-[15px] font-semibold text-white group-hover:text-[#D2F865] transition-colors truncate">
                            {fx.isHome ? `${clubName} vs ${oppName}` : `${oppName} vs ${clubName}`}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[11px] text-[#8A8D96]">
                            <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                              <Clock className="w-3 h-3 text-[#6F727C]" />
                              {dateStr} · {timeStr}
                            </span>
                            {fx.broadcast && scope === "upcoming" && (
                              <span className="inline-flex items-center gap-1 text-[#A5B8FF]/85">
                                <Tv className="w-3 h-3" />
                                {fx.broadcast}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {scope === "recent" && fx.score ? (
                          <span
                            className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold tabular-nums border ${
                              fx.result === "W"
                                ? "bg-[#30D158]/15 border-[#30D158]/35 text-[#A7E87A]"
                                : fx.result === "L"
                                  ? "bg-[#FF453A]/15 border-[#FF453A]/35 text-[#F2858E]"
                                  : "bg-white/[0.06] border-white/[0.1] text-white/85"
                            }`}
                          >
                            {fx.score}
                          </span>
                        ) : (
                          <span className="w-8 h-8 rounded-xl bg-white/[0.04] group-hover:bg-[#D2F865]/15 border border-white/[0.07] group-hover:border-[#D2F865]/35 flex items-center justify-center text-[#8A8D96] group-hover:text-[#D2F865] transition-colors">
                            <ArrowUpRight className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
