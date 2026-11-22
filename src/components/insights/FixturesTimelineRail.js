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
  CheckCircle2,
  MapPin,
} from "lucide-react";

const ICON_BADGE_THEMES = [
  "bg-[#5E5CE6]/20 text-[#9B99FF] border-[#5E5CE6]/30",
  "bg-[#38BDF8]/20 text-[#7DD3FC] border-[#38BDF8]/30",
  "bg-[#34D399]/20 text-[#6EE7B7] border-[#34D399]/30",
  "bg-[#F26E7C]/20 text-[#FCA5AE] border-[#F26E7C]/30",
  "bg-[#F4BA5B]/20 text-[#FCD38D] border-[#F4BA5B]/30",
];

const MATCHDAY_STEPS = [
  { id: "GATES", time: "14:30", title: "Turnstiles Open", detail: "Supporters arriving at stadium", icon: MapPin, themeIdx: 0 },
  { id: "LINEUPS", time: "15:15", title: "Official Line-ups", detail: "Starting XIs locked (T-75 rule)", icon: Shield, themeIdx: 1 },
  { id: "WARMUPS", time: "15:45", title: "Pitch Warm-ups", detail: "Rondos & sprint activations", icon: Flame, themeIdx: 2 },
  { id: "TUNNEL", time: "16:25", title: "Tunnel & Anthem", detail: "Captains assemble in tunnel", icon: Radio, themeIdx: 3 },
  { id: "KICKOFF", time: "16:30", title: "Scheduled Kick-off", detail: "Live spatial telemetry begins", icon: Trophy, themeIdx: 4 },
];

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

  const upcoming = liveSchedule?.upcoming || [];
  const recent = liveSchedule?.recent || [];

  // Combine immediate context into a clean chronological timeline
  const timelineFixtures = [
    ...(recent.slice(0, 2).map((fx) => ({ ...fx, bucket: "recent" }))),
    ...(upcoming.slice(0, 4).map((fx, i) => ({ ...fx, bucket: i === 0 ? "next" : "upcoming" }))),
  ];

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
        {/* Top Bar (Mirrors reference right-rail header: lime toggle, date nav, utility trigger) */}
        <div className="flex items-center justify-between gap-2 pb-5 border-b border-white/[0.06]">
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

          {/* Date Navigation */}
          <div className="flex items-center gap-1.5 text-xs text-white font-medium">
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
          <div className="mt-5 space-y-4">
            {/* Active Match Indicator Line (Signature Electric Lime Horizon Line) */}
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#D2F865] text-[#0E100C] text-[10px] font-semibold font-mono tabular-nums shrink-0">
                {activeMatch?.isLive ? "LIVE" : activeMatch?.kickoffTime || "ACTIVE"}
              </span>
              <div className="h-[1.5px] flex-1 bg-gradient-to-r from-[#D2F865] via-[#D2F865]/40 to-transparent" />
            </div>

            {/* Primary Active Fixture Highlight Card */}
            {activeMatch && (
              <div className="glass-tile p-3.5 rounded-[20px] border-[#D2F865]/30 bg-[#1B1E18]/75">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#D2F865]/15 border border-[#D2F865]/35 flex items-center justify-center text-[#D2F865] shrink-0">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-white truncate">
                      {activeMatch.title}
                    </div>
                    <div className="text-[11px] text-[#8A8D96] truncate mt-0.5">
                      {activeMatch.statusText} · {activeMatch.venue || selectedClub?.stadium}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chronological Fixture Stream */}
            <div className="space-y-2.5 pt-1">
              {timelineFixtures.length === 0 ? (
                <div className="glass-tile p-5 text-center text-xs text-[#8A8D96]">
                  Loading live {selectedClub?.name} schedule…
                </div>
              ) : (
                timelineFixtures.map((fx, idx) => {
                  const isSelected = fx.id === selectedMatchId;
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
                    : "";
                  const theme = ICON_BADGE_THEMES[idx % ICON_BADGE_THEMES.length];
                  const isRecent = fx.bucket === "recent";

                  return (
                    <div key={fx.id} className="grid grid-cols-[52px_1fr] items-center gap-2.5">
                      <span className="text-[11px] font-mono tabular-nums text-[#6F727C] text-right pr-1">
                        {shortDate}
                      </span>

                      <button
                        type="button"
                        onClick={() => onSelectMatch(fx.id)}
                        className={`w-full text-left p-3 rounded-[20px] border transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? "bg-[#24272F]/90 border-[#D2F865]/45 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]"
                            : "bg-[#1A1B20]/75 hover:bg-[#22242C]/85 border-white/[0.06] hover:border-white/[0.12]"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${theme}`}
                        >
                          {isRecent ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-white truncate">
                            {fx.isHome ? `vs ${fx.opponent}` : `@ ${fx.opponent}`}
                          </div>
                          <div className="text-[11px] text-[#8A8D96] truncate mt-0.5 tabular-nums">
                            {isRecent
                              ? `${fx.statusText} · Result`
                              : `${shortTime} · ${fx.broadcast || fx.competition}`}
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          /* ─── Matchday T-75 Itinerary Mode ─── */
          <div className="mt-5 space-y-3">
            <div className="text-[11px] text-[#8A8D96] pb-1">
              {selectedClub?.stadium} Matchday Protocol · Select a stage to inspect
            </div>

            {MATCHDAY_STEPS.map((step) => {
              const Icon = step.icon;
              const isCurrent = matchdayPhase === step.id;
              const theme = ICON_BADGE_THEMES[step.themeIdx];

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
                      onClick={() => onSelectPhasePreview && onSelectPhasePreview(step.id)}
                      className={`w-full text-left p-3 rounded-[20px] border transition-all cursor-pointer flex items-center gap-3 ${
                        isCurrent
                          ? "bg-[#23262E]/90 border-[#D2F865]/40"
                          : "bg-[#1A1B20]/75 hover:bg-[#22242C]/85 border-white/[0.06]"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${theme}`}
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
          {upcoming.length} upcoming fixtures
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
