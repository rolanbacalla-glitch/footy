"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Clock,
  Flame,
  Activity,
  Zap,
  CornerDownRight,
  TrendingUp,
  Volume2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function LiveScoreboard({ activeMatch }) {
  const [seconds, setSeconds] = useState(42);
  const [expandedStats, setExpandedStats] = useState(true);
  const [activeIncidentIndex, setActiveIncidentIndex] = useState(0);

  const isLive = activeMatch?.type === "LIVE" || activeMatch?.isLive;
  const isFinished = activeMatch?.type === "RECENT";

  // Match clock seconds ticker for live match atmosphere
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setSeconds((prev) => (prev >= 59 ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  // Key match incidents timeline
  const incidents = activeMatch?.incidents || [
    { min: "67'", type: "chance", text: "Alexander Isak strikes the crossbar from Florian Wirtz through-ball", team: "home" },
    { min: "58'", type: "goal", text: "GOAL! Florian Wirtz finishes clinical cutback from Bradley Barcola (2-1)", team: "home" },
    { min: "41'", type: "goal", text: "GOAL! Bruno Fernandes converts penalty into bottom corner (1-1)", team: "away" },
    { min: "34'", type: "card", text: "Milos Kerkez receives yellow card for tactical foul on Diallo", team: "home" },
    { min: "28'", type: "goal", text: "GOAL! Alexander Isak breaks the deadlock with low finish past Onana (1-0)", team: "home" },
    { min: "19'", type: "card", text: "Casemiro cautioned for late challenge on Dominik Szoboszlai", team: "away" },
  ];

  // Auto-cycle through incidents
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIncidentIndex((prev) => (prev + 1) % incidents.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [incidents.length]);

  const homeScore = activeMatch?.homeScore ?? (isLive ? 2 : activeMatch?.score?.split("-")[0]?.trim() || 0);
  const awayScore = activeMatch?.awayScore ?? (isLive ? 1 : activeMatch?.score?.split("-")[1]?.trim() || 0);

  const homeTeam = activeMatch?.homeTeam || "Liverpool";
  const awayTeam = activeMatch?.awayTeam || activeMatch?.opponent || "Man United";

  const homeScorers = activeMatch?.homeScorers || [
    { player: "A. Isak", min: "28'" },
    { player: "F. Wirtz", min: "58'" },
  ];

  const awayScorers = activeMatch?.awayScorers || [
    { player: "B. Fernandes", min: "41' (P)" },
  ];

  const possession = activeMatch?.liveStats?.possession || [64, 36];
  const shots = activeMatch?.liveStats?.shots || [14, 5];
  const shotsOnTarget = activeMatch?.liveStats?.shotsOnTarget || [7, 2];
  const xG = activeMatch?.liveStats?.xg || [activeMatch?.metrics?.teamXg || 2.14, activeMatch?.metrics?.opponentXg || 0.88];
  const corners = activeMatch?.liveStats?.corners || [6, 2];

  const currentMinute = activeMatch?.minute || 68;

  return (
    <div className="w-full relative rounded-[22px] overflow-hidden apple-card border border-white/[0.12] bg-[#0A0D12]/90 shadow-[0_12px_40px_rgba(0,0,0,0.65)] select-none">
      {/* Dynamic Ambient Crimson & Emerald Stadium Floodlight Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden z-0"
      >
        <div className="absolute -top-16 left-12 w-96 h-48 bg-[#E31B23]/18 rounded-full blur-[70px]" />
        <div className="absolute -top-16 right-12 w-80 h-48 bg-white/5 rounded-full blur-[80px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-black/60" />
      </div>

      <div className="relative z-10 p-3.5 sm:p-4 md:p-5">
        {/* ── Top Match Meta Strip ── */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.08] text-xs">
          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF2636]/20 border border-[#FF2636]/40 text-[#FF4D5A] font-bold text-[11px] tracking-wide shadow-[0_0_12px_rgba(255,38,54,0.35)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2636] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF2636]" />
                </span>
                LIVE {currentMinute}&apos;
                <span className="text-white/60 font-mono text-[10px]">
                  ({currentMinute}:{seconds < 10 ? `0${seconds}` : seconds})
                </span>
              </span>
            ) : isFinished ? (
              <span className="px-2.5 py-1 rounded-full bg-[#30D158]/15 border border-[#30D158]/35 text-[#30D158] font-bold text-[11px] tracking-wide">
                FULL-TIME
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-[#F1B82D]/15 border border-[#F1B82D]/35 text-[#F1B82D] font-bold text-[11px] tracking-wide">
                UPCOMING
              </span>
            )}

            <span className="font-semibold text-white/90 tracking-[-0.01em]">
              {activeMatch?.competition || "Premier League • Gameweek 12"}
            </span>
            <span className="text-white/20 hidden sm:inline">•</span>
            <span className="text-[#8E8E93] text-[11px] hidden sm:inline">
              Anfield, Liverpool • Att: 61,276
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="flex items-center gap-1 text-[#8E8E93]">
              <Volume2 className="w-3.5 h-3.5 text-[#FF2636] animate-pulse" />
              <span className="hidden md:inline">Atmosphere:</span>
              <strong className="text-white font-medium">104 dB (The Kop Singing)</strong>
            </span>

            <button
              type="button"
              onClick={() => setExpandedStats(!expandedStats)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white/80 hover:text-white transition-colors cursor-pointer border border-white/[0.08]"
              aria-label={expandedStats ? "Collapse live match statistics" : "Expand live match statistics"}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                {expandedStats ? "Less" : "Stats"}
              </span>
              {expandedStats ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* ── Main Scoreboard Visual Display ── */}
        <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-4 py-4 sm:py-5">
          {/* Home Team (Liverpool FC) */}
          <div className="md:col-span-3 flex items-center justify-start md:justify-end gap-3 sm:gap-4 order-1">
            <div className="text-left md:text-right">
              <div className="flex items-center md:justify-end gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#E31B23]/25 text-[#FF4D5A] border border-[#E31B23]/35">
                  HOME
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-[-0.02em]">
                  {homeTeam}
                </h2>
              </div>
              <p className="text-[11px] text-[#8E8E93] mt-0.5 font-medium">
                Andoni Iraola • 4-2-3-1
              </p>

              {/* Home Scorers List */}
              {homeScorers.length > 0 && (
                <div className="flex flex-wrap md:justify-end gap-x-2.5 gap-y-1 mt-2 text-xs text-[#EBEBF5]/90 font-medium">
                  {homeScorers.map((s, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="text-[#FF2636] font-bold">⚽</span>
                      <strong className="text-white">{s.player}</strong>
                      <span className="text-[#F1B82D] text-[11px]">{s.min}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Liverpool Crest Monogram */}
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-[18px] bg-gradient-to-br from-[#E31B23] via-[#C8102E] to-[#800A1A] p-0.5 shadow-[0_8px_24px_rgba(227,27,35,0.45)] shrink-0 flex items-center justify-center border border-white/25">
              <div className="w-full h-full rounded-[16px] bg-[#140204]/70 flex flex-col items-center justify-center text-white">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-[#E31B23]" strokeWidth={1.8} />
                <span className="text-[9px] font-black tracking-widest text-[#F1B82D]">LFC</span>
              </div>
            </div>
          </div>

          {/* Central Live Score Display */}
          <div className="md:col-span-1 flex flex-col items-center justify-center order-2 py-1">
            <div className="flex items-center gap-2 sm:gap-3 bg-black/60 px-4 sm:px-5 py-1.5 sm:py-2 rounded-2xl border border-white/[0.14] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),0_4px_20px_rgba(0,0,0,0.5)]">
              <span className="text-3xl sm:text-4xl md:text-5xl font-black font-mono tabular-nums text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)]">
                {homeScore}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-white/30">:</span>
              <span className="text-3xl sm:text-4xl md:text-5xl font-black font-mono tabular-nums text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)]">
                {awayScore}
              </span>
            </div>

            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#FF2636] mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2636] animate-ping" />
              Attacking The Kop
            </span>
          </div>

          {/* Away Team (Manchester United) */}
          <div className="md:col-span-3 flex items-center justify-start gap-3 sm:gap-4 order-3">
            {/* Away Crest Monogram */}
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-[18px] bg-gradient-to-br from-[#2E2E38] via-[#1E1E24] to-[#121216] p-0.5 shadow-[0_8px_24px_rgba(0,0,0,0.5)] shrink-0 flex items-center justify-center border border-white/20">
              <div className="w-full h-full rounded-[16px] bg-[#121214]/80 flex flex-col items-center justify-center text-white">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-[#C8102E]" strokeWidth={1.8} />
                <span className="text-[9px] font-black tracking-widest text-[#F1B82D]">MUFC</span>
              </div>
            </div>

            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-[-0.02em]">
                  {awayTeam}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/70 border border-white/15">
                  AWAY
                </span>
              </div>
              <p className="text-[11px] text-[#8E8E93] mt-0.5 font-medium">
                Ruben Amorim • 3-4-2-1
              </p>

              {/* Away Scorers List */}
              {awayScorers.length > 0 && (
                <div className="flex flex-wrap gap-x-2.5 gap-y-1 mt-2 text-xs text-[#EBEBF5]/90 font-medium">
                  {awayScorers.map((s, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="text-[#FF2636] font-bold">⚽</span>
                      <strong className="text-white">{s.player}</strong>
                      <span className="text-[#F1B82D] text-[11px]">{s.min}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Live In-Play Quick Telemetry Bar ── */}
        {expandedStats && (
          <div className="pt-3 border-t border-white/[0.08] space-y-3">
            {/* Possession Duel Gauge */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E31B23]" />
                  Liverpool <strong className="font-mono text-sm ml-1 text-white">{possession[0]}%</strong>
                </span>
                <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-widest">
                  Live Match Possession
                </span>
                <span className="text-white/80 flex items-center gap-1.5">
                  <strong className="font-mono text-sm mr-1 text-white">{possession[1]}%</strong>
                  Man United
                  <span className="w-2 h-2 rounded-full bg-white/40" />
                </span>
              </div>

              {/* Gradient Split Progress Bar */}
              <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden flex border border-white/10 shadow-inner">
                <div
                  style={{ width: `${possession[0]}%` }}
                  className="bg-gradient-to-r from-[#800A1A] via-[#C8102E] to-[#FF2636] h-full shadow-[0_0_8px_#FF2636] transition-all duration-500"
                />
                <div
                  style={{ width: `${possession[1]}%` }}
                  className="bg-gradient-to-r from-white/30 to-white/60 h-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="apple-tile p-2.5 rounded-xl border border-white/[0.06] text-center">
                <span className="text-[10px] text-[#8E8E93] font-medium block uppercase tracking-wider">
                  Live xG
                </span>
                <div className="flex items-center justify-center gap-2 mt-0.5">
                  <span className="font-bold text-sm text-[#FF2636] font-mono">{xG[0].toFixed(2)}</span>
                  <span className="text-[10px] text-white/30">-</span>
                  <span className="font-bold text-sm text-[#8E8E93] font-mono">{xG[1].toFixed(2)}</span>
                </div>
              </div>

              <div className="apple-tile p-2.5 rounded-xl border border-white/[0.06] text-center">
                <span className="text-[10px] text-[#8E8E93] font-medium block uppercase tracking-wider">
                  Shots (On Target)
                </span>
                <div className="flex items-center justify-center gap-2 mt-0.5">
                  <span className="font-bold text-sm text-white font-mono">{shots[0]} ({shotsOnTarget[0]})</span>
                  <span className="text-[10px] text-white/30">-</span>
                  <span className="font-bold text-sm text-[#8E8E93] font-mono">{shots[1]} ({shotsOnTarget[1]})</span>
                </div>
              </div>

              <div className="apple-tile p-2.5 rounded-xl border border-white/[0.06] text-center">
                <span className="text-[10px] text-[#8E8E93] font-medium block uppercase tracking-wider">
                  Corner Kicks
                </span>
                <div className="flex items-center justify-center gap-2 mt-0.5">
                  <span className="font-bold text-sm text-[#F1B82D] font-mono">{corners[0]}</span>
                  <span className="text-[10px] text-white/30">-</span>
                  <span className="font-bold text-sm text-[#8E8E93] font-mono">{corners[1]}</span>
                </div>
              </div>

              <div className="apple-tile p-2.5 rounded-xl border border-white/[0.06] text-center">
                <span className="text-[10px] text-[#8E8E93] font-medium block uppercase tracking-wider">
                  Territory Tilt
                </span>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <Flame className="w-3.5 h-3.5 text-[#FF2636]" />
                  <span className="font-bold text-sm text-white font-mono">72.4%</span>
                  <span className="text-[10px] text-[#FF4D5A] font-semibold">LFC</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Live Match Incident Ticker Strip ── */}
        <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E31B23]/20 text-[#FF4D5A] shrink-0 border border-[#E31B23]/30 flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#FF2636]" />
              Match Incident
            </span>
            <span className="font-mono text-[11px] font-bold text-[#F1B82D] shrink-0">
              {incidents[activeIncidentIndex].min}
            </span>
            <p className="text-white/90 truncate font-medium text-[11px]">
              {incidents[activeIncidentIndex].text}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[10px] text-[#8E8E93] shrink-0 pl-2">
            <span>{activeIncidentIndex + 1} of {incidents.length} events</span>
          </div>
        </div>
      </div>
    </div>
  );
}
