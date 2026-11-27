"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Radio,
  Trophy,
  Flame,
  Shield,
  MapPin,
  Sparkles,
} from "lucide-react";
import { SlidingSegmentedTabs, SlidingTabPanel } from "./SlidingSegmentedTabs";

const MATCHDAY_STEPS = [
  {
    id: "GATES",
    time: "14:30",
    title: "Turnstiles Open",
    detail: "Supporters arriving at stadium",
    icon: MapPin,
    theme: "bg-[#637AE0]/18 text-[#9BB0FF] border-[#637AE0]/30",
  },
  {
    id: "LINEUPS",
    time: "15:15",
    title: "Official Line-ups",
    detail: "Starting XIs locked (T-75 rule)",
    icon: Shield,
    theme: "bg-[#38BDF8]/18 text-[#7DD3FC] border-[#38BDF8]/30",
  },
  {
    id: "WARMUPS",
    time: "15:45",
    title: "Pitch Warm-ups",
    detail: "Rondos & sprint activations",
    icon: Flame,
    theme: "bg-[#D2F865]/15 text-[#D2F865] border-[#D2F865]/30",
  },
  {
    id: "TUNNEL",
    time: "16:25",
    title: "Tunnel & Anthem",
    detail: "Captains assemble in tunnel",
    icon: Radio,
    theme: "bg-[#F4BA5B]/18 text-[#FCD38D] border-[#F4BA5B]/30",
  },
  {
    id: "KICKOFF",
    time: "16:30",
    title: "Scheduled Kick-off",
    detail: "Live spatial telemetry begins",
    icon: Trophy,
    theme: "bg-[#D2F865]/20 text-[#D2F865] border-[#D2F865]/40",
  },
];

function parseMatchOutcome(fx) {
  let homeGoals =
    fx.homeScore !== null && fx.homeScore !== undefined
      ? Number(fx.homeScore)
      : NaN;
  let awayGoals =
    fx.awayScore !== null && fx.awayScore !== undefined
      ? Number(fx.awayScore)
      : NaN;

  if (Number.isNaN(homeGoals) || Number.isNaN(awayGoals)) {
    const match = String(fx.statusText || "").match(/(\d+)\s*[-–]\s*(\d+)/);
    if (match) {
      homeGoals = Number(match[1]);
      awayGoals = Number(match[2]);
    }
  }

  const hasScore = !Number.isNaN(homeGoals) && !Number.isNaN(awayGoals);
  const scoreDisplay = hasScore
    ? `${homeGoals}–${awayGoals}`
    : fx.statusText || "FT";

  if (!hasScore) {
    return {
      code: "FT",
      label: "Finished",
      scoreDisplay,
      badgeCls: "bg-white/[0.06] text-[#9A9DA6] border-white/[0.12]",
      scoreCls: "text-white/75",
    };
  }

  const clubGoals = fx.isHome ? homeGoals : awayGoals;
  const oppGoals = fx.isHome ? awayGoals : homeGoals;

  if (clubGoals > oppGoals) {
    return {
      code: "W",
      label: "Win",
      scoreDisplay,
      badgeCls: "bg-[#D2F865]/12 text-[#D2F865] border-[#D2F865]/28",
      scoreCls: "text-[#D2F865]",
    };
  }
  if (clubGoals < oppGoals) {
    return {
      code: "L",
      label: "Loss",
      scoreDisplay,
      badgeCls: "bg-[#F26E7C]/12 text-[#F26E7C] border-[#F26E7C]/28",
      scoreCls: "text-[#F26E7C]",
    };
  }
  return {
    code: "D",
    label: "Draw",
    scoreDisplay,
    badgeCls: "bg-white/[0.07] text-[#B7BAC3] border-white/[0.14]",
    scoreCls: "text-[#D5D8E0]",
  };
}

export default function FixturesTimelineRail({
  selectedClub,
  liveSchedule,
  activeMatch,
  selectedMatchId,
  onSelectMatch,
  onOpenCalendar,
  matchdayPhase,
  onSelectPhasePreview,
}) {
  const [railMode, setRailMode] = useState("fixtures"); // "fixtures" | "matchday"
  const [compFilter, setCompFilter] = useState("all"); // "all" | "pl" | "europe"

  const rawLive = liveSchedule?.live || [];
  const rawUpcoming = liveSchedule?.upcoming || [];
  const rawRecent = liveSchedule?.recent || [];

  const hasEuropeanFixtures =
    rawLive.some((fx) => fx.isEuropean) ||
    rawUpcoming.some((fx) => fx.isEuropean) ||
    rawRecent.some((fx) => fx.isEuropean);

  const matchesCompFilter = (fx) => {
    if (compFilter === "pl") return !fx.isEuropean;
    if (compFilter === "europe") return Boolean(fx.isEuropean);
    return true;
  };

  const liveFixtures = [...rawLive]
    .filter(matchesCompFilter)
    .map((fx) => ({ ...fx, bucket: "live" }));

  // Take the 3 most recent played results, then sort chronologically (oldest -> newest) so time flows top-to-bottom into Today
  const recentResults = [...rawRecent]
    .filter(matchesCompFilter)
    .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))
    .slice(-3)
    .map((fx) => ({ ...fx, bucket: "recent" }));

  // Sort upcoming fixtures chronologically (soonest -> later)
  const upcomingFixtures = [...rawUpcoming]
    .filter(matchesCompFilter)
    .slice(0, 5)
    .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))
    .map((fx, i) => ({ ...fx, bucket: i === 0 ? "next" : "upcoming" }));

  const timelineFixtures = [...recentResults, ...liveFixtures, ...upcomingFixtures];
  const isSelectedInTimeline = timelineFixtures.some(
    (fx) => fx.id === selectedMatchId
  );

  const todayLabel = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  const handleStepFixture = (dir) => {
    if (!timelineFixtures.length) return;
    const idx = timelineFixtures.findIndex((f) => f.id === selectedMatchId);
    const nextIdx =
      idx < 0
        ? 0
        : (idx + dir + timelineFixtures.length) % timelineFixtures.length;
    onSelectMatch(timelineFixtures[nextIdx].id);
  };

  return (
    <aside
      aria-label="Matchday schedule and fixtures timeline"
      className="glass-card-deep flex flex-col justify-between p-5 sm:p-6 h-full min-h-[580px] relative"
    >
      <div>
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/[0.06]">
          {/* Apple HIG Sliding Mode Switcher */}
          <SlidingSegmentedTabs
            tabs={[
              { id: "fixtures", label: "Fixtures", title: "Club fixtures timeline" },
              { id: "matchday", label: "Matchday", title: "Matchday T-75 itinerary" },
            ]}
            value={railMode}
            onChange={setRailMode}
            layoutId="rail-mode-pill"
            ariaLabel="Schedule view mode"
            size="xs"
          />

          {/* Fixture Stepping */}
          <div className="flex items-center gap-1 text-xs text-white font-medium">
            <button
              type="button"
              onClick={() => handleStepFixture(-1)}
              aria-label="Previous fixture"
              className="w-7 h-7 rounded-full hover:bg-white/[0.07] flex items-center justify-center text-[#8A8D96] hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="whitespace-nowrap tabular-nums">{todayLabel}</span>
            <button
              type="button"
              onClick={() => handleStepFixture(1)}
              aria-label="Next fixture"
              className="w-7 h-7 rounded-full hover:bg-white/[0.07] flex items-center justify-center text-[#8A8D96] hover:text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenCalendar}
            aria-label="View full fixture calendar"
            title="Full fixture calendar"
            className="w-8 h-8 rounded-full hover:bg-white/[0.07] flex items-center justify-center text-[#8A8D96] hover:text-white transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4" strokeWidth={1.8} />
          </button>
        </div>

        {/* ─── Timeline Body (Directional Slide Transition) ─── */}
        <SlidingTabPanel
          activeKey={railMode}
          direction={railMode === "matchday" ? 1 : -1}
          axis="x"
          distance={16}
        >
        {railMode === "fixtures" ? (
          <div className="mt-4 space-y-4">
            {/* Only show external selection banner if user picked a match outside the visible window */}
            {activeMatch && !isSelectedInTimeline && (
              <div className="px-3 py-2.5 rounded-xl bg-[#D2F865]/[0.07] flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#D2F865]/15 flex items-center justify-center text-[#D2F865] shrink-0">
                  <Radio className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white truncate">
                    {activeMatch.title}
                  </div>
                  <div className="text-[11px] text-[#B7BAC3] truncate">
                    Currently loaded · {activeMatch.statusText}
                  </div>
                </div>
              </div>
            )}

            {hasEuropeanFixtures && (
              <div
                role="group"
                aria-label="Filter fixtures by competition"
                className="flex items-center gap-1.5"
              >
                {[
                  { id: "all", label: "All" },
                  { id: "pl", label: "PL" },
                  { id: "europe", label: "Europe" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCompFilter(opt.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                      compFilter === opt.id
                        ? "bg-[#D2F865]/15 text-[#D2F865] border border-[#D2F865]/35"
                        : "bg-white/[0.04] text-[#8A8D96] border border-white/[0.06] hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {timelineFixtures.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#8A8D96]">
                Loading live {selectedClub?.name} schedule…
              </div>
            ) : (
              <>
                {/* ═══ 1. PLAYED RESULTS (Flat Hairline-Divided Schedule Rows) ═══ */}
                {recentResults.length > 0 && (
                  <section aria-label="Played results" className="space-y-1.5">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F727C]">
                        Played · Full Time
                      </span>
                      <span className="text-[10px] font-mono tabular-nums text-[#5A5D66]">
                        {recentResults.length} recent
                      </span>
                    </div>

                    <div className="divide-y divide-white/[0.05]">
                      {recentResults.map((fx) => {
                        const isSelected = fx.id === selectedMatchId;
                        const dateObj = fx.date ? new Date(fx.date) : null;
                        const shortDate = dateObj
                          ? dateObj.toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })
                          : "FT";
                        const outcome = parseMatchOutcome(fx);

                        return (
                          <div key={fx.id} className="py-0.5 first:pt-0 last:pb-0">
                            <button
                              type="button"
                              onClick={() => onSelectMatch(fx.id)}
                              aria-pressed={isSelected}
                              aria-label={`Played result: ${fx.isHome ? "vs" : "at"} ${fx.opponent}, ${outcome.scoreDisplay}, ${outcome.label}`}
                              className={`w-full text-left px-2 py-2.5 rounded-xl transition-colors cursor-pointer grid grid-cols-[46px_1fr] items-center gap-2.5 ${
                                isSelected
                                  ? "bg-[#D2F865]/[0.08]"
                                  : "hover:bg-white/[0.035]"
                              }`}
                            >
                              <span
                                className={`text-[11px] font-mono tabular-nums text-right ${
                                  isSelected ? "text-[#D2F865]" : "text-[#6F727C]"
                                }`}
                              >
                                {shortDate}
                              </span>

                              <div className="flex items-center gap-2.5 min-w-0">
                                {/* Semantic W / D / L Outcome Indicator */}
                                <div
                                  className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 font-mono text-[10px] font-bold ${outcome.badgeCls}`}
                                  title={outcome.label}
                                >
                                  {outcome.code}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div
                                    className={`text-[12.5px] font-medium truncate transition-colors ${
                                      isSelected ? "text-white" : "text-white/80"
                                    }`}
                                  >
                                    {fx.isHome
                                      ? `vs ${fx.opponent}`
                                      : `@ ${fx.opponent}`}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10.5px] text-[#6F727C] truncate mt-0.5">
                                    {fx.isEuropean && (
                                      <span className="font-mono text-[9.5px] font-semibold uppercase tracking-wider text-[#9BB0FF] shrink-0">
                                        {fx.competitionCode || "EUR"} ·
                                      </span>
                                    )}
                                    <span className="truncate">
                                      {fx.isHome ? "Home" : "Away"} ·{" "}
                                      {fx.competition || "Premier League"}
                                    </span>
                                  </div>
                                </div>

                                {/* Right-aligned Final Score */}
                                <div className="text-right shrink-0 pl-1">
                                  <div
                                    className={`font-mono text-[13px] font-semibold tabular-nums leading-none ${outcome.scoreCls}`}
                                  >
                                    {outcome.scoreDisplay}
                                  </div>
                                  <div className="text-[9px] font-mono uppercase tracking-wider text-[#5A5D66] mt-1">
                                    FT
                                  </div>
                                </div>
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* ═══ CHRONOLOGICAL HORIZON DIVIDER (Past Above · Live / Upcoming Below) ═══ */}
                <div
                  className="flex items-center gap-2.5 py-1"
                  role="separator"
                  aria-label="Today divider between played results and upcoming fixtures"
                >
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wide uppercase tabular-nums shrink-0 ${
                      liveFixtures.length > 0 || activeMatch?.isLive
                        ? "bg-[#FF2636] text-white shadow-[0_0_16px_rgba(255,38,54,0.45)]"
                        : "bg-[#D2F865] text-[#0E100C] shadow-[0_0_16px_rgba(210,248,101,0.3)]"
                    }`}
                  >
                    {liveFixtures.length > 0 || activeMatch?.isLive ? "LIVE NOW" : `TODAY · ${todayLabel}`}
                  </span>
                  <div
                    className={`h-[1.5px] flex-1 bg-gradient-to-r to-transparent ${
                      liveFixtures.length > 0 || activeMatch?.isLive
                        ? "from-[#FF2636] via-[#FF2636]/40"
                        : "from-[#D2F865] via-[#D2F865]/40"
                    }`}
                  />
                </div>

                {/* ═══ LIVE IN-PLAY FIXTURES (PL & European UCL/UEL/UECL) ═══ */}
                {liveFixtures.length > 0 && (
                  <section aria-label="Live matches in play" className="divide-y divide-white/[0.05]">
                    {liveFixtures.map((fx) => {
                      const isSelected = fx.id === selectedMatchId;
                      const scoreDisplay =
                        fx.homeScore !== null && fx.awayScore !== null
                          ? `${fx.homeScore}–${fx.awayScore}`
                          : fx.statusText || "LIVE";

                      return (
                        <div key={fx.id} className="py-0.5 first:pt-0 last:pb-0">
                          <button
                            type="button"
                            onClick={() => onSelectMatch(fx.id)}
                            aria-pressed={isSelected}
                            aria-label={`Live match: ${fx.isHome ? "vs" : "at"} ${fx.opponent}, ${scoreDisplay}, ${fx.displayClock || "Live"}`}
                            className={`w-full text-left px-2 py-2.5 rounded-xl transition-colors cursor-pointer grid grid-cols-[46px_1fr] items-center gap-2.5 ${
                              isSelected
                                ? "bg-[#FF2636]/[0.12]"
                                : "hover:bg-[#FF2636]/[0.06]"
                            }`}
                          >
                            <span className="text-[11px] font-mono font-bold tabular-nums text-[#FF4D5A] text-right">
                              {fx.displayClock || "LIVE"}
                            </span>

                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-[#FF2636]/18 flex items-center justify-center shrink-0">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2636] opacity-75" />
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF2636]" />
                                </span>
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="text-[12.5px] font-semibold text-white truncate">
                                  {fx.isHome ? `vs ${fx.opponent}` : `@ ${fx.opponent}`}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10.5px] text-[#B7BAC3] truncate mt-0.5">
                                  {fx.isEuropean && (
                                    <span className="font-mono text-[9.5px] font-semibold uppercase tracking-wider text-[#A5B8FF] shrink-0">
                                      {fx.competitionCode || "EUR"} ·
                                    </span>
                                  )}
                                  <span className="truncate">
                                    {fx.competition || "Premier League"}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right shrink-0 pl-1">
                                <div className="font-mono text-[14px] font-bold tabular-nums leading-none text-white">
                                  {scoreDisplay}
                                </div>
                                <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#FF4D5A] mt-1">
                                  LIVE
                                </div>
                              </div>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </section>
                )}

                {/* ═══ 2. UPCOMING FIXTURES (Clean Cardless Schedule List) ═══ */}
                {upcomingFixtures.length > 0 && (
                  <section aria-label="Upcoming fixtures" className="space-y-1.5">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#D2F865]">
                        Upcoming · Scheduled
                      </span>
                      <span className="text-[10px] font-mono tabular-nums text-[#8A8D96]">
                        {upcomingFixtures.length} next
                      </span>
                    </div>

                    <div className="divide-y divide-white/[0.05]">
                      {upcomingFixtures.map((fx, idx) => {
                        const isSelected = fx.id === selectedMatchId;
                        const isNextUp = idx === 0;
                        const dateObj = fx.date ? new Date(fx.date) : null;
                        const shortDate = dateObj
                          ? dateObj.toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })
                          : "TBC";
                        const shortTime = dateObj
                          ? dateObj.toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "TBC";

                        return (
                          <div key={fx.id} className="py-0.5 first:pt-0 last:pb-0">
                            <button
                              type="button"
                              onClick={() => onSelectMatch(fx.id)}
                              aria-pressed={isSelected}
                              aria-label={`Upcoming fixture: ${fx.isHome ? "vs" : "at"} ${fx.opponent} on ${shortDate} at ${shortTime}`}
                              className={`w-full text-left px-2 py-2.5 rounded-xl transition-colors cursor-pointer grid grid-cols-[46px_1fr] items-center gap-2.5 ${
                                isSelected
                                  ? "bg-[#D2F865]/[0.08]"
                                  : "hover:bg-white/[0.04]"
                              }`}
                            >
                              <span
                                className={`text-[11px] font-mono tabular-nums text-right ${
                                  isNextUp || isSelected
                                    ? "text-[#D2F865] font-semibold"
                                    : "text-[#9A9DA6]"
                                }`}
                              >
                                {shortDate}
                              </span>

                              <div className="flex items-center gap-2.5 min-w-0">
                                {/* Semantic Upcoming Icon Indicator */}
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                    isNextUp
                                      ? "bg-[#D2F865]/15 text-[#D2F865]"
                                      : "bg-white/[0.05] text-[#8A8D96]"
                                  }`}
                                >
                                  {isNextUp ? (
                                    <Sparkles className="w-3.5 h-3.5" />
                                  ) : (
                                    <Clock className="w-3.5 h-3.5" />
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div
                                    className={`text-[12.5px] truncate ${
                                      isNextUp || isSelected
                                        ? "font-semibold text-white"
                                        : "font-medium text-white/90"
                                    }`}
                                  >
                                    {fx.isHome
                                      ? `vs ${fx.opponent}`
                                      : `@ ${fx.opponent}`}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[11px] text-[#8A8D96] truncate mt-0.5">
                                    {fx.isEuropean && (
                                      <span className="font-mono text-[9.5px] font-semibold uppercase tracking-wider text-[#A5B8FF] shrink-0">
                                        {fx.competitionCode || "EUR"} ·
                                      </span>
                                    )}
                                    <span className="truncate">
                                      {fx.broadcast || fx.competition}
                                    </span>
                                  </div>
                                </div>

                                {/* Right-aligned Kick-off Time */}
                                <div className="text-right shrink-0 pl-1">
                                  <div
                                    className={`font-mono text-xs font-semibold tabular-nums leading-none ${
                                      isNextUp ? "text-[#D2F865]" : "text-white"
                                    }`}
                                  >
                                    {shortTime}
                                  </div>
                                  <div className="text-[9px] font-mono uppercase tracking-wider text-[#7D808B] mt-1">
                                    {isNextUp ? "Next" : "UK"}
                                  </div>
                                </div>
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        ) : (
          /* ─── Matchday T-75 Itinerary Mode ─── */
          <div className="mt-5 space-y-2.5">
            <div className="text-[11px] text-[#8A8D96] pb-1">
              {selectedClub?.stadium} Matchday Protocol · Select a stage to
              inspect
            </div>

            <div className="divide-y divide-white/[0.05]">
              {MATCHDAY_STEPS.map((step) => {
                const Icon = step.icon;
                const isCurrent = matchdayPhase === step.id;

                return (
                  <div key={step.id} className="py-1 first:pt-0 last:pb-0">
                    {isCurrent && (
                      <div className="flex items-center gap-2 pb-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#D2F865] text-[#0E100C] text-[10px] font-semibold font-mono tabular-nums">
                          {step.time}
                        </span>
                        <div className="h-[1.5px] flex-1 bg-gradient-to-r from-[#D2F865] via-[#D2F865]/35 to-transparent" />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        onSelectPhasePreview && onSelectPhasePreview(step.id)
                      }
                      className={`w-full text-left px-2 py-2.5 rounded-xl transition-colors cursor-pointer grid grid-cols-[44px_1fr] items-center gap-2.5 ${
                        isCurrent
                          ? "bg-[#D2F865]/[0.08]"
                          : "hover:bg-white/[0.035]"
                      }`}
                    >
                      <span
                        className={`text-[11px] font-mono tabular-nums text-right ${
                          isCurrent ? "text-[#D2F865] font-semibold" : "text-[#6F727C]"
                        }`}
                      >
                        {step.time}
                      </span>

                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ${step.theme}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-white truncate">
                            {step.title}
                          </div>
                          <div className="text-[11px] text-[#8A8D96] truncate mt-0.5">
                            {step.detail}
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </SlidingTabPanel>
      </div>

      {/* Bottom Footer + Signature Electric Lime Circular Floating Action Button */}
      <div className="pt-5 mt-6 border-t border-white/[0.06] flex items-center justify-between gap-3">
        <div className="text-[11px] text-[#8A8D96] tabular-nums">
          {rawRecent.length} played · {rawUpcoming.length} upcoming
        </div>

        <button
          type="button"
          onClick={onOpenCalendar}
          aria-label="Open full season fixture schedule"
          title="Open full fixture calendar"
          className="w-11 h-11 rounded-full bg-[#D2F865] hover:bg-[#DCFA7A] text-[#0E100C] flex items-center justify-center shadow-[0_8px_24px_-4px_rgba(210,248,101,0.45)] transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-5 h-5" strokeWidth={2.4} />
        </button>
      </div>
    </aside>
  );
}
