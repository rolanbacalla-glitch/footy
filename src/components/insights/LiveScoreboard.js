"use client";

import React, { useState, useEffect } from "react";
import PreMatchPanel, { getMatchdayPhase, isLineupConfirmed } from "./PreMatchPanel";
import { getTeamManagerInfo } from "../../data/premierLeagueManagers";
import {
  Clock,
  Flame,
  Zap,
  Volume2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function LiveScoreboard({ activeMatch, selectedClub, onPhaseChange }) {
  const [seconds, setSeconds] = useState(42);
  const [countdownSeconds, setCountdownSeconds] = useState(16155); // ~4 hours 29 mins 15 secs
  const [previewOffset, setPreviewOffset] = useState(null);
  const [realCountdown, setRealCountdown] = useState(null);
  const [expandedStats, setExpandedStats] = useState(false);
  const [activeIncidentIndex, setActiveIncidentIndex] = useState(0);
  const [liveFactData, setLiveFactData] = useState(null);

  const club = selectedClub || getTeamManagerInfo(activeMatch?.teamId || "364") || getTeamManagerInfo("364");
  const liveMatchFromApi = liveFactData?.activeLiveMatch || null;
  const isLive = Boolean(activeMatch?.type === "LIVE" || activeMatch?.isLive || liveMatchFromApi?.isLive);
  const isMatchdayPreMatch =
    !isLive &&
    (activeMatch?.type === "MATCHDAY" ||
      activeMatch?.status === "PRE_MATCH" ||
      (activeMatch?.isMatchday && !activeMatch?.isLive));
  const isFinished = !isLive && activeMatch?.type === "RECENT";

  // Adaptive Live Fact-Checking Polling scoped to the selected club
  useEffect(() => {
    let isMounted = true;
    const teamId = club?.id || activeMatch?.teamId || "364";

    async function checkLiveFacts() {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await fetch(`/api/live-fixtures?teamId=${encodeURIComponent(teamId)}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted) setLiveFactData(json);
        }
      } catch {
        // Silent fallback
      }
    }

    checkLiveFacts();

    const pollIntervalMs = isLive ? 15000 : isMatchdayPreMatch ? 60000 : 300000;
    const interval = setInterval(checkLiveFacts, pollIntervalMs);

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
  }, [isLive, isMatchdayPreMatch, club?.id, activeMatch?.teamId]);

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

  const homeTeam = activeMatch?.homeTeam || club.name;
  const awayTeam = activeMatch?.awayTeam || activeMatch?.opponent || "Opponent";
  const homeInfo = getTeamManagerInfo(homeTeam) || club;
  const awayInfo = getTeamManagerInfo(awayTeam) || {
    name: awayTeam,
    shortName: (awayTeam || "OPP").slice(0, 3).toUpperCase(),
    manager: "Head Coach",
    formation: "4-2-3-1",
    stadium: "Premier League Stadium",
    city: "England",
    capacity: "45,000",
    mainStand: "Main Stand",
    anthem: "Club Anthem",
  };

  const venueName = activeMatch?.venue || homeInfo.stadium || club.stadium;
  const venueCity = activeMatch?.city || homeInfo.city || club.city;
  const venueCapacity = activeMatch?.capacity || homeInfo.capacity || club.capacity;
  const venueMainStand = activeMatch?.mainStand || homeInfo.mainStand || club.mainStand;
  const venueAnthem = activeMatch?.anthem || homeInfo.anthem || club.anthem;

  const PHASE_ATMOSPHERE = {
    BUILD_UP: `Matchday build-up • ${venueName} turnstiles open 14:30`,
    GATES: `Turnstiles open • Supporters arriving at ${venueName}`,
    LINEUPS: "Official Premier League team news is in",
    WARMUPS: `Warm-ups underway at ${venueName}`,
    TUNNEL: `Teams in the tunnel • ${venueAnthem}`,
    KICKOFF: "Kick-off",
  };

  const strikerName = activeMatch?.startingXI?.[9]?.name || club.captain;
  const playmakerName = activeMatch?.startingXI?.[7]?.name || club.captain;
  const wingerName = activeMatch?.startingXI?.[8]?.name || club.captain;

  // Timeline events: in-play match incidents OR pre-match matchday itinerary
  const preMatchNotes = isMatchdayPreMatch && activeMatch?.preMatch?.milestones
    ? activeMatch.preMatch.milestones.map((text) => ({ min: "★", type: "note", text, team: "info" }))
    : null;
  const incidents = preMatchNotes || activeMatch?.incidents || (
    isMatchdayPreMatch
      ? [
          { min: "15:15", type: "news", text: "Official starting line-ups submitted & confirmed to the Premier League", team: "info" },
          { min: "15:45", type: "warmup", text: `${homeTeam} & ${awayTeam} squads emerge onto the ${venueName} pitch for warm-up drills`, team: "info" },
          { min: "16:15", type: "atmosphere", text: `${venueMainStand} fills to ${venueCapacity} capacity as club banners are unfurled`, team: "home" },
          { min: "16:25", type: "hymn", text: `'${venueAnthem}' rings out across ${venueName}; captains line up in the tunnel`, team: "home" },
          { min: "16:30", type: "kickoff", text: "Scheduled Kick-Off • Live match telemetry, xG, and pass networks stream live", team: "info" },
        ]
      : [
          { min: "74'", type: "chance", text: `${strikerName} forces a fingertip save after ${playmakerName}'s through-ball`, team: "home" },
          { min: "61'", type: "goal", text: `GOAL! ${playmakerName} finishes clinical cutback from ${wingerName}`, team: "home" },
          { min: "24'", type: "goal", text: `GOAL! ${strikerName} opens the scoring with a composed finish inside the box`, team: "home" },
        ]
  );

  // Auto-cycle through timeline events
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIncidentIndex((prev) => (prev + 1) % incidents.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [incidents.length]);

  const homeScore = isMatchdayPreMatch
    ? 0
    : (liveMatchFromApi?.homeScore ?? activeMatch?.homeScore ?? (isLive ? 0 : activeMatch?.score?.split("-")[0]?.trim() || 0));
  const awayScore = isMatchdayPreMatch
    ? 0
    : (liveMatchFromApi?.awayScore ?? activeMatch?.awayScore ?? (isLive ? 0 : activeMatch?.score?.split("-")[1]?.trim() || 0));

  const homeScorers = isMatchdayPreMatch
    ? []
    : (activeMatch?.homeScorers?.length
        ? activeMatch.homeScorers
        : [{ player: strikerName, min: "24'" }, { player: playmakerName, min: "61'" }].slice(0, Number(homeScore) || 0));

  const awayScorers = isMatchdayPreMatch
    ? []
    : (activeMatch?.awayScorers?.length
        ? activeMatch.awayScorers
        : [{ player: awayInfo.captain || "Visitor", min: "52'" }].slice(0, Number(awayScore) || 0));

  const possession = activeMatch?.liveStats?.possession || [58, 42];
  const shots = activeMatch?.liveStats?.shots || [15, 8];
  const shotsOnTarget = activeMatch?.liveStats?.shotsOnTarget || [6, 3];
  const xG = activeMatch?.liveStats?.xg || [activeMatch?.metrics?.teamXg || 2.18, activeMatch?.metrics?.opponentXg || 1.04];
  const corners = activeMatch?.liveStats?.corners || [6, 3];

  const currentMinute =
    liveMatchFromApi?.displayClock || activeMatch?.minute || "LIVE";
  const kickoffTime = activeMatch?.kickoffTime || "16:30 GMT";

  const selectedRank = liveFactData?.standings?.selected?.rank || activeMatch?.standings?.selected?.rank;
  const selectedPts = liveFactData?.standings?.selected?.points || activeMatch?.standings?.selected?.points;
  const oppRank = liveFactData?.standings?.opponent?.rank || activeMatch?.standings?.opponent?.rank;
  const oppPts = liveFactData?.standings?.opponent?.points || activeMatch?.standings?.opponent?.points;

  return (
    <div className="w-full relative rounded-[22px] overflow-hidden apple-card border border-white/[0.12] bg-[#0A0D12]/90 shadow-[0_12px_40px_rgba(0,0,0,0.65)] select-none">
      {/* Dynamic Ambient Stadium Floodlight Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden z-0"
      >
        <div
          className="absolute -top-16 left-12 w-96 h-48 rounded-full blur-[70px] opacity-20"
          style={{ backgroundColor: club.primaryColor || "#E31B23" }}
        />
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
              {activeMatch?.competition || "Premier League"}
            </span>
            <span className="text-white/20 hidden sm:inline">•</span>
            <span className="text-[#8E8E93] text-[11px] hidden sm:inline">
              {venueName}, {venueCity} • Att: {venueCapacity} (Capacity)
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            {selectedRank && (
              <span className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#8E8E93]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
                <span className="text-white font-semibold">{club.shortName} #{selectedRank}</span> ({selectedPts} pts)
                {oppRank && (
                  <>
                    <span className="text-white/30">vs</span>
                    <span className="text-white/80 font-medium">#{oppRank}</span> ({oppPts} pts)
                  </>
                )}
              </span>
            )}

            <span className="flex items-center gap-1 text-[#8E8E93]">
              <Volume2 className="w-3.5 h-3.5 text-[#FF2636] animate-pulse" />
              <span className="hidden md:inline">Atmosphere:</span>
              <strong className="text-white font-medium">
                {isMatchdayPreMatch ? PHASE_ATMOSPHERE[phase.id] : `102 dB (${venueMainStand})`}
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
                {isMatchdayPreMatch
                  ? expandedStats
                    ? "Hide Pre-Match Hub"
                    : "Pre-Match Hub"
                  : expandedStats
                    ? "Hide Match Telemetry"
                    : "Match Telemetry"}
              </span>
              {expandedStats ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* ── Main Scoreboard Visual Display ── */}
        <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-4 py-4 sm:py-5">
          {/* Home Team */}
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
                {homeInfo.manager} • {homeInfo.formation}
              </p>

              {/* Status / Scorers */}
              {isMatchdayPreMatch ? (
                <div className="flex items-center md:justify-end gap-1.5 mt-2 text-[11px] font-semibold text-white/80">
                  <span className={`w-1.5 h-1.5 rounded-full ${lineupConfirmed ? "bg-white" : "border border-white/60 border-dashed"} animate-pulse`} />
                  <span>{lineupConfirmed ? "Confirmed XI" : "Predicted XI • Official line-ups at T-75m"}</span>
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
                Attacking {venueMainStand}
              </span>
            )}
          </div>

          {/* Away Team */}
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
                {awayInfo.manager} • {awayInfo.formation}
              </p>

              {/* Status / Scorers */}
              {isMatchdayPreMatch ? (
                <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-white/80">
                  <span className={`w-1.5 h-1.5 rounded-full ${lineupConfirmed ? "bg-white" : "border border-white/60 border-dashed"} animate-pulse`} />
                  <span>{lineupConfirmed ? "Confirmed XI" : "Predicted XI • Official line-ups at T-75m"}</span>
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
                selectedClub={club}
                phase={phase}
                countdownSeconds={countdownSeconds}
                onPreviewPhase={handlePreviewPhase}
                isPreviewing={isPreviewing}
                onResetPreview={handleResetPreview}
              />
            ) : (
              /* Live / Full-Time Match Telemetry */
              <div className="space-y-3">
                {/* Possession Duel Gauge */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#E31B23]" />
                      {homeTeam} <strong className="font-mono text-sm ml-1 text-white">{possession[0]}%</strong>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-widest">
                      Match Possession
                    </span>
                    <span className="text-white/80 flex items-center gap-1.5">
                      <strong className="font-mono text-sm mr-1 text-white">{possession[1]}%</strong>
                      {awayTeam}
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
                      Expected Goals (xG)
                    </span>
                    <div className="flex items-center justify-center gap-2 mt-0.5">
                      <span className="font-bold text-sm text-[#FF2636] font-mono">{Number(xG[0] || 1.8).toFixed(2)}</span>
                      <span className="text-[10px] text-white/30">-</span>
                      <span className="font-bold text-sm text-[#8E8E93] font-mono">{Number(xG[1] || 1.0).toFixed(2)}</span>
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
                      <span className="font-bold text-sm text-white font-mono">{activeMatch?.metrics?.fieldTilt || 65.4}%</span>
                      <span className="text-[10px] text-[#FF4D5A] font-semibold">{club.shortName}</span>
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
