"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import PreMatchPanel, { getMatchdayPhase, isLineupConfirmed } from "./PreMatchPanel";
import {
  Shield,
  Clock,
  Flame,
  Activity,
  Zap,
  Volume2,
  ChevronDown,
  ChevronUp,
  Radio,
  Calendar,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export function getTeamCrest(teamName = "") {
  const norm = (teamName || "").toLowerCase().trim();
  if (norm.includes("liverpool")) return "/crests/liverpool.svg";
  if (norm.includes("united") || norm.includes("man utd") || norm.includes("manutd") || norm === "man united") return "/crests/manutd.svg";
  if (norm.includes("city") || norm.includes("man city")) return "/crests/man-city.svg";
  if (norm.includes("chelsea")) return "/crests/chelsea.svg";
  if (norm.includes("palace") || norm.includes("crystal palace")) return "/crests/crystal-palace.svg";
  if (norm.includes("brighton")) return "/crests/brighton.svg";
  if (norm.includes("villarreal")) return "/crests/villarreal.svg";
  return null;
}

export default function LiveScoreboard({ activeMatch, onPhaseChange }) {
  const [seconds, setSeconds] = useState(42);
  const [countdownSeconds, setCountdownSeconds] = useState(16155); // ~4 hours 29 mins 15 secs
  const [previewOffset, setPreviewOffset] = useState(null);
  const [realCountdown, setRealCountdown] = useState(null);
  const [expandedStats, setExpandedStats] = useState(false);
  const [activeIncidentIndex, setActiveIncidentIndex] = useState(0);
  const [liveFactData, setLiveFactData] = useState(null);

  const isLive = activeMatch?.type === "LIVE" || activeMatch?.isLive;
  const isMatchdayPreMatch =
    activeMatch?.type === "MATCHDAY" ||
    activeMatch?.status === "PRE_MATCH" ||
    (activeMatch?.isMatchday && !activeMatch?.isLive);
  const isFinished = activeMatch?.type === "RECENT";

  // Adaptive Live Fact-Checking Polling
  // 15s during live in-play; 60s during pre-match countdown; 5m for finished/archive matches
  useEffect(() => {
    let isMounted = true;
    async function checkLiveFacts() {
      // Pause network requests if the user has minimized or switched tabs
      if (typeof document !== "undefined" && document.hidden) return;

      try {
        const res = await fetch("/api/live-fixtures");
        if (res.ok) {
          const json = await res.json();
          if (isMounted) setLiveFactData(json);
        }
      } catch (e) {
        // Silent fallback
      }
    }

    checkLiveFacts();

    const pollIntervalMs = isLive ? 15000 : isMatchdayPreMatch ? 60000 : 300000;
    const interval = setInterval(checkLiveFacts, pollIntervalMs);

    // Refresh immediately when tab regains focus
    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && !document.hidden) checkLiveFacts();
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
  }, [isLive, isMatchdayPreMatch]);

  // Match clock seconds ticker for live match
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setSeconds((prev) => (prev >= 59 ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  // Pre-match countdown ticker towards kick-off
  useEffect(() => {
    if (!isMatchdayPreMatch) return;
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isMatchdayPreMatch]);

  const countdownHours = Math.floor(countdownSeconds / 3600);
  const countdownMinutes = Math.floor((countdownSeconds % 3600) / 60);
  const countdownSecs = countdownSeconds % 60;

  // Matchday phase (Predicted XI until line-ups are published at T-75)
  const phase = getMatchdayPhase(countdownSeconds);
  const lineupConfirmed = isLineupConfirmed(phase.id);
  const isPreviewing = previewOffset !== null;

  useEffect(() => {
    if (isMatchdayPreMatch && onPhaseChange) onPhaseChange(phase.id);
  }, [isMatchdayPreMatch, phase.id, onPhaseChange]);

  const handlePreviewPhase = (secondsBeforeKickoff) => {
    if (previewOffset === null) setRealCountdown(countdownSeconds);
    setPreviewOffset(secondsBeforeKickoff);
    setCountdownSeconds(secondsBeforeKickoff);
  };

  const handleResetPreview = () => {
    setCountdownSeconds(realCountdown ?? 16155);
    setPreviewOffset(null);
  };

  const PHASE_ATMOSPHERE = {
    BUILD_UP: "Matchday build-up • Turnstiles open 14:30",
    GATES: "Turnstiles open • Fans arriving",
    LINEUPS: "Team news is in",
    WARMUPS: "Warm-ups underway",
    TUNNEL: "Teams in the tunnel • YNWA",
    KICKOFF: "Kick-off",
  };

  // Timeline events: in-play match incidents OR pre-match matchday itinerary
  const preMatchNotes = isMatchdayPreMatch && activeMatch?.preMatch?.milestones
    ? activeMatch.preMatch.milestones.map((text) => ({ min: "★", type: "note", text, team: "info" }))
    : null;
  const incidents = preMatchNotes || activeMatch?.incidents || (
    isMatchdayPreMatch
      ? [
          { min: "15:30", type: "news", text: "Official starting lineups submitted & confirmed to Premier League", team: "info" },
          { min: "15:55", type: "warmup", text: "Liverpool & Man United squads emerge onto Anfield turf for warm-up drills", team: "info" },
          { min: "16:15", type: "atmosphere", text: "The Kop stand fills to capacity as heritage flags and banners are unfurled", team: "home" },
          { min: "16:25", type: "hymn", text: "'You'll Never Walk Alone' sung in unison across all 4 stands; teams line up in tunnel", team: "home" },
          { min: "16:30", type: "kickoff", text: "Scheduled Kick-Off • Live match data, xG, and pass networks will start streaming", team: "info" },
        ]
      : [
          { min: "67'", type: "chance", text: "Alexander Isak strikes crossbar from Florian Wirtz through-ball", team: "home" },
          { min: "58'", type: "goal", text: "GOAL! Florian Wirtz finishes clinical cutback from Bradley Barcola (2-1)", team: "home" },
          { min: "41'", type: "goal", text: "GOAL! Bruno Fernandes converts penalty into bottom corner (1-1)", team: "away" },
          { min: "34'", type: "card", text: "Milos Kerkez receives yellow card for tactical foul on Diallo", team: "home" },
          { min: "28'", type: "goal", text: "GOAL! Alexander Isak breaks deadlock with low drive past Onana (1-0)", team: "home" },
          { min: "19'", type: "card", text: "Casemiro cautioned for late challenge on Dominik Szoboszlai", team: "away" },
        ]
  );

  // Auto-cycle through timeline events
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIncidentIndex((prev) => (prev + 1) % incidents.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [incidents.length]);

  const homeScore = isMatchdayPreMatch ? 0 : (activeMatch?.homeScore ?? (isLive ? 2 : activeMatch?.score?.split("-")[0]?.trim() || 0));
  const awayScore = isMatchdayPreMatch ? 0 : (activeMatch?.awayScore ?? (isLive ? 1 : activeMatch?.score?.split("-")[1]?.trim() || 0));

  const homeTeam = activeMatch?.homeTeam || "Liverpool";
  const awayTeam = activeMatch?.awayTeam || activeMatch?.opponent || "Man United";
  const homeCrest = activeMatch?.homeCrest || getTeamCrest(homeTeam);
  const awayCrest = activeMatch?.awayCrest || getTeamCrest(awayTeam);

  const homeScorers = isMatchdayPreMatch ? [] : (activeMatch?.homeScorers || [
    { player: "A. Isak", min: "28'" },
    { player: "F. Wirtz", min: "58'" },
  ]);

  const awayScorers = isMatchdayPreMatch ? [] : (activeMatch?.awayScorers || [
    { player: "B. Fernandes", min: "41' (P)" },
  ]);

  const possession = activeMatch?.liveStats?.possession || [64, 36];
  const shots = activeMatch?.liveStats?.shots || [14, 5];
  const shotsOnTarget = activeMatch?.liveStats?.shotsOnTarget || [7, 2];
  const xG = activeMatch?.liveStats?.xg || [activeMatch?.metrics?.teamXg || 2.14, activeMatch?.metrics?.opponentXg || 0.88];
  const corners = activeMatch?.liveStats?.corners || [6, 2];

  const currentMinute = activeMatch?.minute || 68;
  const kickoffTime = activeMatch?.kickoffTime || "16:30 GMT";

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
          <div className="flex items-center gap-2 flex-wrap">
            {isMatchdayPreMatch ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white font-bold text-[11px] tracking-wide shadow-sm">
                <Clock className="w-3.5 h-3.5 text-white animate-pulse" />
                {phase.id === "BUILD_UP" ? "MATCHDAY" : phase.label.toUpperCase()} • KICK-OFF {kickoffTime}
                <span className="text-white/80 font-mono text-[10px] ml-1 bg-black/50 px-2 py-0.5 rounded-full border border-white/10 tabular-nums">
                  T-{countdownHours}h {countdownMinutes}m {countdownSecs < 10 ? `0${countdownSecs}` : countdownSecs}s
                </span>
              </span>
            ) : isLive ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF2636]/20 border border-[#FF2636]/40 text-[#FF4D5A] font-bold text-[11px] tracking-wide shadow-[0_0_12px_rgba(255,38,54,0.35)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2636] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF2636]" />
                </span>
                LIVE {currentMinute}&apos;
                <span className="text-white/60 font-mono text-[10px] tabular-nums">
                  ({currentMinute}:{seconds < 10 ? `0${seconds}` : seconds})
                </span>
              </span>
            ) : isFinished ? (
              <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white font-bold text-[11px] tracking-wide">
                FULL-TIME
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white font-bold text-[11px] tracking-wide">
                UPCOMING
              </span>
            )}

            <span className="font-semibold text-white/90 tracking-[-0.01em]">
              {activeMatch?.competition || "Premier League • Matchday 12"}
            </span>
            <span className="text-white/20 hidden sm:inline">•</span>
            <span className="text-[#8E8E93] text-[11px] hidden sm:inline">
              Anfield, Liverpool • Att: 61,276 (Sold Out)
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            {liveFactData?.standings?.lfc && (
              <span className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#8E8E93]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
                <span className="text-white font-semibold">4th</span> ({liveFactData.standings.lfc.points} pts)
                <span className="text-white/30">vs</span>
                <span className="text-white/80 font-medium">18th</span> ({liveFactData.standings.mufc?.points || 8} pts)
              </span>
            )}

            <span className="flex items-center gap-1 text-[#8E8E93]">
              <Volume2 className="w-3.5 h-3.5 text-[#FF2636] animate-pulse" />
              <span className="hidden md:inline">Atmosphere:</span>
              <strong className="text-white font-medium">
                {isMatchdayPreMatch ? PHASE_ATMOSPHERE[phase.id] : "104 dB (The Kop Singing)"}
              </strong>
            </span>

            <button
              type="button"
              onClick={() => setExpandedStats(!expandedStats)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer border ${
                expandedStats
                  ? "bg-[#FF2636]/15 text-[#FF6961] border-[#FF2636]/30 shadow-[0_0_10px_rgba(255,38,54,0.15)]"
                  : "bg-white/[0.06] hover:bg-white/[0.12] text-white/80 hover:text-white border-white/[0.08]"
              }`}
              aria-label={expandedStats ? "Collapse pre-match analysis" : "Expand pre-match analysis"}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                {expandedStats ? "Hide Pre-Match Hub" : "Pre-Match Hub"}
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

              {/* Status / Scorers */}
              {isMatchdayPreMatch ? (
                <div className="flex items-center md:justify-end gap-1.5 mt-2 text-[11px] font-semibold text-white/80">
                  <span className={`w-1.5 h-1.5 rounded-full ${lineupConfirmed ? "bg-white" : "border border-white/60 border-dashed"} animate-pulse`} />
                  <span>{lineupConfirmed ? "Confirmed XI" : "Predicted XI • Line-ups at 15:15"}</span>
                </div>
              ) : (
                homeScorers.length > 0 && (
                  <div className="flex flex-wrap md:justify-end gap-x-2.5 gap-y-1 mt-2 text-xs text-[#EBEBF5]/90 font-medium">
                    {homeScorers.map((s, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="text-[#FF2636] font-bold">⚽</span>
                        <strong className="text-white">{s.player}</strong>
                        <span className="text-white/60 text-[11px]">{s.min}</span>
                      </span>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Central Live Score Display */}
          <div className="md:col-span-1 flex flex-col items-center justify-center order-2 py-1">
            <div className="flex items-center gap-2 sm:gap-3 bg-black/60 px-4 sm:px-5 py-1.5 sm:py-2 rounded-2xl border border-white/[0.14] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),0_4px_20px_rgba(0,0,0,0.5)]">
              <span className={`text-3xl sm:text-4xl md:text-5xl font-black font-mono tabular-nums ${isMatchdayPreMatch ? "text-white/40" : "text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)]"}`}>
                {homeScore}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-white/30">:</span>
              <span className={`text-3xl sm:text-4xl md:text-5xl font-black font-mono tabular-nums ${isMatchdayPreMatch ? "text-white/40" : "text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)]"}`}>
                {awayScore}
              </span>
            </div>

            {isMatchdayPreMatch ? (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70 mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                Awaiting Kick-off
              </span>
            ) : (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#FF2636] mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF2636] animate-ping" />
                Attacking The Kop
              </span>
            )}
          </div>

          {/* Away Team (Manchester United) */}
          <div className="md:col-span-3 flex items-center justify-start gap-3 sm:gap-4 order-3">
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
                Mauricio Pochettino • 4-2-3-1
              </p>

              {/* Status / Scorers */}
              {isMatchdayPreMatch ? (
                <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-white/80">
                  <span className={`w-1.5 h-1.5 rounded-full ${lineupConfirmed ? "bg-white" : "border border-white/60 border-dashed"} animate-pulse`} />
                  <span>{lineupConfirmed ? "Confirmed XI" : "Predicted XI • Line-ups at 15:15"}</span>
                </div>
              ) : (
                awayScorers.length > 0 && (
                  <div className="flex flex-wrap gap-x-2.5 gap-y-1 mt-2 text-xs text-[#EBEBF5]/90 font-medium">
                    {awayScorers.map((s, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="text-[#FF2636] font-bold">⚽</span>
                        <strong className="text-white">{s.player}</strong>
                        <span className="text-white/60 text-[11px]">{s.min}</span>
                      </span>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* ── Matchday Telemetry Section ── */}
        {expandedStats && (
          <div className="pt-3 border-t border-white/[0.08] space-y-3">
            {isMatchdayPreMatch ? (
              <PreMatchPanel
                activeMatch={activeMatch}
                phase={phase}
                countdownSeconds={countdownSeconds}
                onPreviewPhase={handlePreviewPhase}
                isPreviewing={isPreviewing}
                onResetPreview={handleResetPreview}
              />
            ) : (
              /* Live In-Play Match Telemetry */
              <div className="space-y-3">
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
                      <span className="font-bold text-sm text-white font-mono">{corners[0]}</span>
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
          </div>
        )}

        {/* ── Matchday Timeline Ticker Strip ── */}
        <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 border flex items-center gap-1 ${
              isMatchdayPreMatch
                ? "bg-white/10 text-white/90 border-white/20"
                : "bg-[#E31B23]/20 text-[#FF4D5A] border-[#E31B23]/30"
            }`}>
              <Zap className="w-3 h-3 text-[#FF2636]" />
              {isMatchdayPreMatch ? "Matchday Notes" : "Match Incident"}
            </span>
            <span className="font-mono text-[11px] font-bold text-white shrink-0">
              {incidents[activeIncidentIndex]?.min}
            </span>
            <p className="text-white/90 truncate font-medium text-[11px]">
              {incidents[activeIncidentIndex]?.text}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[10px] text-[#8E8E93] shrink-0 pl-2">
            <span>{activeIncidentIndex + 1} of {incidents.length} {isMatchdayPreMatch ? "notes" : "events"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
