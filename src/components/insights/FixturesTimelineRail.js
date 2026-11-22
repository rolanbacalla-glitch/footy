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

  const rawUpcoming = liveSchedule?.upcoming || [];
  const rawRecent = liveSchedule?.recent || [];

  // Sort past results chronologically (oldest -> most recent) so time flows smoothly top-to-bottom
  const recentResults = [...rawRecent]
    .slice(0, 2)
    .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))
    .map((fx) => ({ ...fx, bucket: "recent" }));

  // Sort upcoming fixtures chronologically (soonest -> later)
  const upcomingFixtures = [...rawUpcoming]
    .slice(0, 4)
    .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))
    .map((fx, i) => ({ ...fx, bucket: i === 0 ? "next" : "upcoming" }));

  const timelineFixtures = [...recentResults, ...upcomingFixtures];
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
          {/* Mode Switcher */}
          <div className="inline-flex items-center p-1 rounded-full bg-[#1C1D22] border border-white/[0.07]">
            <button
              type="button"
              onClick={() => setRailMode("fixtures")}
              aria-pressed={railMode === "fixtures"}
              title="Club fixtures timeline"
              className={`h-7 px-3 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                railMode === "fixtures"
                  ? "bg-[#D2F865] text-[#0E100C]"
                  : "text-[#8A8D96] hover:text-white"
              }`}
            >
              Fixtures
            </button>
            <button
              type="button"
              onClick={() => setRailMode("matchday")}
              aria-pressed={railMode === "matchday"}
              title="Matchday T-75 itinerary"
              className={`h-7 px-3 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                railMode === "matchday"
                  ? "bg-[#D2F865] text-[#0E100C]"
                  : "text-[#8A8D96] hover:text-white"
              }`}
            >
              Matchday
            </button>
          </div>

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

        {/* ─── Timeline Body ─── */}
        {railMode === "fixtures" ? (
          <div className="mt-4 space-y-4">
            {/* Only show external selection banner if user picked a match outside the visible window */}
            {activeMatch && !isSelectedInTimeline && (
              <div className="p-3 rounded-[18px] border border-[#D2F865]/35 bg-[#1C2017]/80 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#D2F865]/15 border border-[#D2F865]/35 flex items-center justify-center text-[#D2F865] shrink-0">
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

            {timelineFixtures.length === 0 ? (
              <div className="glass-tile p-5 text-center text-xs text-[#8A8D96]">
                Loading live {selectedClub?.name} schedule…
              </div>
            ) : (
              <>
                {/* ═══ 1. PLAYED RESULTS (Recessed, Muted Glass, Semantic W/D/L + Bold Scoreline) ═══ */}
                {recentResults.length > 0 && (
                  <section aria-label="Played results" className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F727C]">
                        Played · Full Time
                      </span>
                      <span className="text-[10px] font-mono tabular-nums text-[#5A5D66]">
                        {recentResults.length} recent
                      </span>
                    </div>

                    <div className="space-y-2">
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
                          <div
                            key={fx.id}
                            className="grid grid-cols-[48px_1fr] items-center gap-2.5"
                          >
                            <span className="text-[11px] font-mono tabular-nums text-[#5A5D66] text-right pr-0.5">
                              {shortDate}
                            </span>

                            <button
                              type="button"
                              onClick={() => onSelectMatch(fx.id)}
                              aria-pressed={isSelected}
                              aria-label={`Played result: ${fx.isHome ? "vs" : "at"} ${fx.opponent}, ${outcome.scoreDisplay}, ${outcome.label}`}
                              className={`relative w-full text-left px-3 py-2.5 rounded-[18px] border transition-all cursor-pointer flex items-center gap-2.5 min-h-[54px] ${
                                isSelected
                                  ? "bg-[#1D201B]/85 border-[#D2F865]/55 shadow-[0_6px_20px_-8px_rgba(210,248,101,0.22)]"
                                  : "bg-white/[0.02] hover:bg-white/[0.045] border-white/[0.05] hover:border-white/[0.10]"
                              }`}
                            >
                              {/* Semantic W / D / L Outcome Circle */}
                              <div
                                className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 font-mono text-[11px] font-bold ${outcome.badgeCls}`}
                                title={outcome.label}
                              >
                                {outcome.code}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium text-white/75 truncate">
                                  {fx.isHome
                                    ? `vs ${fx.opponent}`
                                    : `@ ${fx.opponent}`}
                                </div>
                                <div className="text-[10px] text-[#6F727C] truncate mt-0.5">
                                  {fx.isHome ? "Home" : "Away"} ·{" "}
                                  {fx.competition || "Premier League"}
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
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* ═══ CHRONOLOGICAL HORIZON DIVIDER (Past Above · Upcoming Below) ═══ */}
                <div
                  className="flex items-center gap-2.5 py-1"
                  role="separator"
                  aria-label="Today divider between played results and upcoming fixtures"
                >
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D2F865] text-[#0E100C] text-[10px] font-bold font-mono tracking-wide uppercase tabular-nums shrink-0 shadow-[0_0_16px_rgba(210,248,101,0.3)]">
                    {activeMatch?.isLive ? "LIVE NOW" : `TODAY · ${todayLabel}`}
                  </span>
                  <div className="h-[1.5px] flex-1 bg-gradient-to-r from-[#D2F865] via-[#D2F865]/40 to-transparent" />
                </div>

                {/* ═══ 2. UPCOMING FIXTURES (Bright Elevated Glass, Kick-off Time + Broadcast) ═══ */}
                {upcomingFixtures.length > 0 && (
                  <section aria-label="Upcoming fixtures" className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#D2F865]">
                        Upcoming · Scheduled
                      </span>
                      <span className="text-[10px] font-mono tabular-nums text-[#8A8D96]">
                        {upcomingFixtures.length} next
                      </span>
                    </div>

                    <div className="space-y-2.5">
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
                          <div
                            key={fx.id}
                            className="grid grid-cols-[48px_1fr] items-center gap-2.5"
                          >
                            <span
                              className={`text-[11px] font-mono tabular-nums text-right pr-0.5 ${
                                isNextUp
                                  ? "text-[#D2F865] font-semibold"
                                  : "text-[#B7BAC3]"
                              }`}
                            >
                              {shortDate}
                            </span>

                            <button
                              type="button"
                              onClick={() => onSelectMatch(fx.id)}
                              aria-pressed={isSelected}
                              aria-label={`Upcoming fixture: ${fx.isHome ? "vs" : "at"} ${fx.opponent} on ${shortDate} at ${shortTime}`}
                              className={`relative w-full text-left px-3 py-3 rounded-[18px] border transition-all cursor-pointer flex items-center gap-2.5 min-h-[58px] ${
                                isSelected
                                  ? "bg-[#232722]/95 border-[#D2F865]/65 shadow-[0_10px_26px_-8px_rgba(0,0,0,0.65),0_0_0_1px_rgba(210,248,101,0.18)]"
                                  : isNextUp
                                  ? "bg-[#20232B]/95 hover:bg-[#262A34] border-[#D2F865]/28 hover:border-[#D2F865]/50 shadow-[0_8px_22px_-10px_rgba(0,0,0,0.65)]"
                                  : "bg-[#1C1E26]/90 hover:bg-[#232631] border-white/[0.09] hover:border-white/[0.18] shadow-[0_6px_18px_-10px_rgba(0,0,0,0.55)]"
                              }`}
                            >
                              {/* Semantic Upcoming Icon Well */}
                              <div
                                className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
                                  isNextUp
                                    ? "bg-[#D2F865]/15 text-[#D2F865] border-[#D2F865]/35"
                                    : "bg-[#637AE0]/16 text-[#9BB0FF] border-[#637AE0]/30"
                                }`}
                              >
                                {isNextUp ? (
                                  <Sparkles className="w-3.5 h-3.5" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="text-[12.5px] font-semibold text-white truncate">
                                  {fx.isHome
                                    ? `vs ${fx.opponent}`
                                    : `@ ${fx.opponent}`}
                                </div>
                                <div className="text-[11px] text-[#9A9DA6] truncate mt-0.5">
                                  {fx.broadcast || fx.competition}
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
                                <div className="text-[9px] font-mono uppercase tracking-wider text-[#8A8D96] mt-1">
                                  {isNextUp ? "Next" : "UK"}
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
          <div className="mt-5 space-y-3">
            <div className="text-[11px] text-[#8A8D96] pb-1">
              {selectedClub?.stadium} Matchday Protocol · Select a stage to
              inspect
            </div>

            {MATCHDAY_STEPS.map((step) => {
              const Icon = step.icon;
              const isCurrent = matchdayPhase === step.id;

              return (
                <div key={step.id} className="space-y-2">
                  {isCurrent && (
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#D2F865] text-[#0E100C] text-[10px] font-semibold font-mono tabular-nums">
                        {step.time}
                      </span>
                      <div className="h-[1.5px] flex-1 bg-gradient-to-r from-[#D2F865] via-[#D2F865]/35 to-transparent" />
                    </div>
                  )}

                  <div className="grid grid-cols-[44px_1fr] items-center gap-2.5">
                    <span className="text-[11px] font-mono tabular-nums text-[#6F727C] text-right">
                      {step.time}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onSelectPhasePreview && onSelectPhasePreview(step.id)
                      }
                      className={`w-full text-left p-3 rounded-[18px] border transition-all cursor-pointer flex items-center gap-3 ${
                        isCurrent
                          ? "bg-[#23262E]/90 border-[#D2F865]/45"
                          : "bg-[#1A1B20]/75 hover:bg-[#22242C]/85 border-white/[0.06]"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${step.theme}`}
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
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
