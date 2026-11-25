"use client";

import React, { useState, useEffect, useCallback } from "react";
import PreMatchPanel, { getMatchdayPhase, isLineupConfirmed } from "./PreMatchPanel";
import ClubBadge from "./ClubBadge";
import { getTeamManagerInfo } from "../../data/premierLeagueManagers";
import {
  Clock,
  Tv,
  Users,
  Zap,
  Volume2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function computeSecondsUntilKickoff(isoDate) {
  if (!isoDate) return null;
  const ts = new Date(isoDate).getTime();
  if (Number.isNaN(ts)) return null;
  return Math.max(0, Math.floor((ts - Date.now()) / 1000));
}

function formatKickoffTimeUk(isoDate, fallback = "Kick-off TBC") {
  if (!isoDate) return fallback;
  const dt = new Date(isoDate);
  if (Number.isNaN(dt.getTime())) return fallback;
  try {
    return dt.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/London",
      timeZoneName: "short",
    });
  } catch {
    return dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
}

function formatOffsetTimeUk(isoDate, minusMinutes) {
  if (!isoDate) return `T-${minusMinutes}m`;
  const ts = new Date(isoDate).getTime();
  if (Number.isNaN(ts)) return `T-${minusMinutes}m`;
  const dt = new Date(ts - minusMinutes * 60 * 1000);
  try {
    return dt.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/London",
    });
  } catch {
    return dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
}

function isMatchHalfTime(match) {
  if (!match) return false;
  if (match.isHalfTime) return true;
  if (String(match.statusName || "").toUpperCase() === "STATUS_HALFTIME") return true;
  const combined = `${match.displayClock || ""} ${match.shortDetail || ""} ${match.statusText || ""}`.toUpperCase();
  return (
    /\bHT\b/.test(combined) ||
    combined.includes("HALFTIME") ||
    combined.includes("HALF-TIME") ||
    combined.includes("HALF TIME")
  );
}

function formatPeriodLabel(match) {
  if (isMatchHalfTime(match)) return "HT";
  const clock = String(match?.displayClock || match?.shortDetail || "").toUpperCase();
  if (clock === "FT" || clock.includes("FULL")) return "Full-Time";
  if (match?.period === 1) return "1st Half";
  if (match?.period === 2) return "2nd Half";
  if (match?.period >= 3) return "Extra Time";
  return "In Play";
}

function formatLiveClock(rawClock) {
  if (!rawClock) return "LIVE";
  const trimmed = String(rawClock).trim();
  if (/^\d+$/.test(trimmed)) return `${trimmed}'`;
  return trimmed;
}

function groupScorers(scorers = []) {
  const map = new Map();
  for (const s of scorers) {
    const name = String(s?.player || "").trim();
    if (!name || name === "Player") continue;
    const key = `${name.toLowerCase()}::${Boolean(s.isOwnGoal)}`;
    const minuteLabel = [
      s.min || "",
      s.isPenalty ? "pen" : "",
      s.isOwnGoal ? "og" : "",
    ]
      .filter(Boolean)
      .join(" ");

    if (!map.has(key)) {
      map.set(key, {
        player: name,
        isOwnGoal: Boolean(s.isOwnGoal),
        minutes: minuteLabel ? [minuteLabel] : [],
      });
    } else if (minuteLabel) {
      map.get(key).minutes.push(minuteLabel);
    }
  }
  return Array.from(map.values());
}

function groupAssists(assists = []) {
  const map = new Map();
  for (const a of assists) {
    const name = String(a?.player || "").trim();
    if (!name || name === "Player") continue;
    const key = name.toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        player: name,
        minutes: a.min ? [a.min] : [],
      });
    } else if (a.min) {
      map.get(key).minutes.push(a.min);
    }
  }
  return Array.from(map.values());
}

export default function LiveScoreboard({
  activeMatch,
  selectedClub,
  onPhaseChange,
  initialLiveFactData = null,
}) {
  const [liveFactData, setLiveFactData] = useState(initialLiveFactData);
  const [previewOffset, setPreviewOffset] = useState(null);
  const [expandedStats, setExpandedStats] = useState(false);
  const [showLineups, setShowLineups] = useState(false);
  const [activeIncidentIndex, setActiveIncidentIndex] = useState(0);

  useEffect(() => {
    if (initialLiveFactData) setLiveFactData(initialLiveFactData);
  }, [initialLiveFactData]);

  const club =
    selectedClub ||
    getTeamManagerInfo(activeMatch?.teamId || "364") ||
    getTeamManagerInfo("364");

  const liveMatchFromApi = liveFactData?.activeLiveMatch || null;
  const recentFullTimeFromApi = liveFactData?.recentFullTimeMatch || null;
  const matchFromApi = liveMatchFromApi || recentFullTimeFromApi || null;
  const matchdayFromApi = liveFactData?.matchdayFixture || null;

  const isLive = Boolean(
    activeMatch?.type === "LIVE" || activeMatch?.isLive || liveMatchFromApi?.isLive
  );
  const isPostMatchFullTime = !isLive && Boolean(recentFullTimeFromApi);
  const isMatchdayPreMatch =
    !isLive &&
    !isPostMatchFullTime &&
    Boolean(
      matchdayFromApi ||
        activeMatch?.isMatchdayToday ||
        activeMatch?.type === "MATCHDAY" ||
        activeMatch?.status === "PRE_MATCH" ||
        (activeMatch?.isMatchday && !activeMatch?.isLive)
    );
  const isFinished =
    !isLive && (isPostMatchFullTime || (!isMatchdayPreMatch && activeMatch?.type === "RECENT"));

  const kickoffIso =
    liveMatchFromApi?.date ||
    recentFullTimeFromApi?.date ||
    matchdayFromApi?.date ||
    activeMatch?.kickoffIso ||
    liveFactData?.nextFixture?.date ||
    null;

  const [countdownSeconds, setCountdownSeconds] = useState(() => {
    const computed = computeSecondsUntilKickoff(kickoffIso);
    return computed !== null ? computed : 0;
  });

  const checkLiveFacts = useCallback(async () => {
    if (typeof document !== "undefined" && document.hidden) return;
    const teamId = club?.id || activeMatch?.teamId || "364";
    try {
      const res = await fetch(`/api/live-fixtures?teamId=${encodeURIComponent(teamId)}`);
      if (res.ok) {
        const json = await res.json();
        setLiveFactData(json);
      }
    } catch {
      // Silent fallback
    }
  }, [club?.id, activeMatch?.teamId]);

  // Adaptive Live Fact-Checking Polling scoped to the selected club
  useEffect(() => {
    checkLiveFacts();

    const pollIntervalMs = isLive ? 15000 : isMatchdayPreMatch ? 45000 : 300000;
    const interval = setInterval(checkLiveFacts, pollIntervalMs);

    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && !document.hidden) checkLiveFacts();
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      clearInterval(interval);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
  }, [isLive, isMatchdayPreMatch, checkLiveFacts]);

  // Real-time kick-off countdown anchored to ISO timestamp (zero drift)
  useEffect(() => {
    if (!isMatchdayPreMatch || previewOffset !== null) return;

    const syncCountdown = () => {
      const remaining = computeSecondsUntilKickoff(kickoffIso);
      if (remaining !== null) {
        setCountdownSeconds(remaining);
        if (remaining === 0) {
          checkLiveFacts();
        }
      }
    };

    syncCountdown();
    const interval = setInterval(syncCountdown, 1000);
    return () => clearInterval(interval);
  }, [isMatchdayPreMatch, kickoffIso, previewOffset, checkLiveFacts]);

  // Preview mode ticker when user inspects matchday phases
  useEffect(() => {
    if (!isMatchdayPreMatch || previewOffset === null) return;
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isMatchdayPreMatch, previewOffset]);

  const countdownHours = Math.floor(countdownSeconds / 3600);
  const countdownMinutes = Math.floor((countdownSeconds % 3600) / 60);
  const countdownSecs = countdownSeconds % 60;
  const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);
  const formattedCountdown = `${pad2(countdownHours)}:${pad2(countdownMinutes)}:${pad2(countdownSecs)}`;

  // Matchday phase (Predicted XI until line-ups are published at T-75m)
  const phase = getMatchdayPhase(countdownSeconds);
  const lineupConfirmed = isLineupConfirmed(phase.id);
  const isPreviewing = previewOffset !== null;

  useEffect(() => {
    if (isMatchdayPreMatch && onPhaseChange) onPhaseChange(phase.id);
  }, [isMatchdayPreMatch, phase.id, onPhaseChange]);

  const handlePreviewPhase = (secondsBeforeKickoff) => {
    setPreviewOffset(secondsBeforeKickoff);
    setCountdownSeconds(secondsBeforeKickoff);
  };

  const handleResetPreview = () => {
    setPreviewOffset(null);
    const real = computeSecondsUntilKickoff(kickoffIso);
    setCountdownSeconds(real !== null ? real : 0);
  };

  const authoritativeMatch = liveMatchFromApi || recentFullTimeFromApi || matchdayFromApi || null;
  const officialLineups =
    authoritativeMatch?.lineups || liveFactData?.matchLineups || null;
  const hasOfficialLineups = Boolean(officialLineups?.isConfirmed);

  const homeTeam = authoritativeMatch?.homeTeam || activeMatch?.homeTeam || club.name;
  const awayTeam =
    authoritativeMatch?.awayTeam ||
    activeMatch?.awayTeam ||
    activeMatch?.opponent ||
    "Opponent";

  const isClubHome =
    String(authoritativeMatch?.homeTeamId || "") === String(club.id) ||
    homeTeam.toLowerCase() === club.name.toLowerCase();
  const isClubAway =
    String(authoritativeMatch?.awayTeamId || "") === String(club.id) ||
    awayTeam.toLowerCase() === club.name.toLowerCase();

  const makeNeutralTeamInfo = (name, officialFormation) => ({
    name,
    shortName: (name || "OPP").slice(0, 3).toUpperCase(),
    manager: "Head Coach",
    formation: officialFormation || "TBC",
    stadium: "Stadium",
    city: "",
    capacity: "",
    mainStand: "Main Stand",
    anthem: "Club Anthem",
  });

  const homeInfo =
    (isClubHome ? club : getTeamManagerInfo(homeTeam)) ||
    makeNeutralTeamInfo(homeTeam, officialLineups?.home?.formation);
  const awayInfo =
    (isClubAway ? club : getTeamManagerInfo(awayTeam)) ||
    makeNeutralTeamInfo(awayTeam, officialLineups?.away?.formation);

  const homeFormationDisplay =
    officialLineups?.home?.formation || homeInfo.formation;
  const awayFormationDisplay =
    officialLineups?.away?.formation || awayInfo.formation;

  const matchPreMatch =
    authoritativeMatch?.preMatchData || liveFactData?.matchPreMatch || null;

  const venueName =
    authoritativeMatch?.venue ||
    matchPreMatch?.venue?.name ||
    activeMatch?.venue ||
    (isClubHome ? club.stadium : homeInfo.stadium) ||
    "Stadium";
  const venueCity =
    authoritativeMatch?.venueCity ||
    matchPreMatch?.venue?.city ||
    (isClubHome ? club.city : homeInfo.city) ||
    "";
  const venueCountry =
    authoritativeMatch?.venueCountry || matchPreMatch?.venue?.country || "";
  const venueLocation =
    venueCity && venueCountry && venueCountry !== "England"
      ? `${venueCity}, ${venueCountry}`
      : venueCity;
  const venueCapacity = authoritativeMatch?.attendance
    ? `${Number(authoritativeMatch.attendance).toLocaleString("en-GB")} Att.`
    : authoritativeMatch?.venueCapacity
      ? Number(authoritativeMatch.venueCapacity).toLocaleString("en-GB")
      : isClubHome
        ? club.capacity
        : homeInfo.capacity || "";
  const venueMainStand = isClubHome
    ? club.mainStand
    : homeInfo.mainStand || "Main Stand";
  const venueAnthem = isClubHome
    ? club.anthem
    : homeInfo.anthem || "Club Anthem";
  const competitionName =
    authoritativeMatch?.competition || activeMatch?.competition || "Premier League";
  const competitionCode =
    authoritativeMatch?.competitionCode ||
    activeMatch?.competitionCode ||
    (competitionName.toLowerCase().includes("champions")
      ? "UCL"
      : competitionName.toLowerCase().includes("europa")
        ? "UEL"
        : competitionName.toLowerCase().includes("conference")
          ? "UECL"
          : "PL");
  const isEuropean =
    authoritativeMatch?.isEuropean ?? competitionCode !== "PL";
  const broadcastChannel =
    authoritativeMatch?.broadcast ||
    activeMatch?.broadcast ||
    liveFactData?.nextFixture?.broadcast ||
    null;

  const kickoffTime = formatKickoffTimeUk(
    kickoffIso,
    activeMatch?.kickoffTime || "Kick-off TBC"
  );

  const PHASE_ATMOSPHERE = {
    BUILD_UP: `Matchday build-up • Turnstiles open ${formatOffsetTimeUk(kickoffIso, 120)}`,
    GATES: `Turnstiles open • Supporters arriving at ${venueName}`,
    LINEUPS: "Official team news confirmed",
    WARMUPS: `Warm-ups underway at ${venueName}`,
    TUNNEL: `Teams in the tunnel • ${venueAnthem}`,
    KICKOFF: "Kick-off imminent",
  };

  // Timeline events: real in-play match incidents OR real-time-anchored pre-match itinerary
  const liveIncidents = authoritativeMatch?.incidents?.length
    ? authoritativeMatch.incidents
    : activeMatch?.incidents?.length
      ? activeMatch.incidents
      : null;

  const isSameFixtureContext =
    !authoritativeMatch ||
    !activeMatch?.id ||
    activeMatch.id === authoritativeMatch.id;

  const preMatchNotes =
    isMatchdayPreMatch && isSameFixtureContext && activeMatch?.preMatch?.milestones
      ? activeMatch.preMatch.milestones.map((text) => ({
          min: "★",
          type: "note",
          text,
          team: "info",
        }))
      : null;

  const incidents = isMatchdayPreMatch
    ? preMatchNotes || [
        {
          min: formatOffsetTimeUk(kickoffIso, 75),
          type: "news",
          text: "Official starting line-ups & substitutes published (T-75m)",
          team: "info",
        },
        {
          min: formatOffsetTimeUk(kickoffIso, 45),
          type: "warmup",
          text: `${homeTeam} & ${awayTeam} squads emerge onto the ${venueName} pitch for warm-up drills`,
          team: "info",
        },
        {
          min: formatOffsetTimeUk(kickoffIso, 15),
          type: "atmosphere",
          text: `${venueMainStand} fills ahead of kick-off at ${venueName}`,
          team: "home",
        },
        {
          min: formatOffsetTimeUk(kickoffIso, 5),
          type: "hymn",
          text: `Teams line up in the tunnel at ${venueName}`,
          team: "home",
        },
        {
          min: kickoffTime,
          type: "kickoff",
          text: `Scheduled Kick-Off • Live score, scorers, cards & telemetry update automatically`,
          team: "info",
        },
      ]
    : liveIncidents || [
        {
          min: formatLiveClock(
            liveMatchFromApi?.displayClock || activeMatch?.minute || "LIVE"
          ),
          type: "info",
          text: `${homeTeam} vs ${awayTeam} — Live match feed connected (${competitionName})`,
          team: "info",
        },
      ];

  // Auto-cycle through timeline events
  useEffect(() => {
    setActiveIncidentIndex(0);
  }, [incidents.length, isLive, isMatchdayPreMatch]);

  useEffect(() => {
    if (incidents.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIncidentIndex((prev) => (prev + 1) % incidents.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [incidents.length]);

  const homeScore = isMatchdayPreMatch
    ? 0
    : (matchFromApi?.homeScore ??
      activeMatch?.homeScore ??
      (isLive ? 0 : activeMatch?.score?.split("-")[0]?.trim() || 0));
  const awayScore = isMatchdayPreMatch
    ? 0
    : (matchFromApi?.awayScore ??
      activeMatch?.awayScore ??
      (isLive ? 0 : activeMatch?.score?.split("-")[1]?.trim() || 0));

  const homeScorers = isMatchdayPreMatch
    ? []
    : matchFromApi?.homeScorers || activeMatch?.homeScorers || [];
  const awayScorers = isMatchdayPreMatch
    ? []
    : matchFromApi?.awayScorers || activeMatch?.awayScorers || [];
  const homeAssists = isMatchdayPreMatch
    ? []
    : matchFromApi?.homeAssists || activeMatch?.homeAssists || [];
  const awayAssists = isMatchdayPreMatch
    ? []
    : matchFromApi?.awayAssists || activeMatch?.awayAssists || [];
  const homeCards = isMatchdayPreMatch
    ? []
    : matchFromApi?.homeCards || activeMatch?.homeCards || [];
  const awayCards = isMatchdayPreMatch
    ? []
    : matchFromApi?.awayCards || activeMatch?.awayCards || [];
  const groupedHomeScorers = groupScorers(homeScorers);
  const groupedAwayScorers = groupScorers(awayScorers);
  const groupedHomeAssists = groupAssists(homeAssists);
  const groupedAwayAssists = groupAssists(awayAssists);
  const homeRedCards = homeCards.filter(
    (c) => c?.type === "red" && c?.player && c.player !== "Player"
  );
  const awayRedCards = awayCards.filter(
    (c) => c?.type === "red" && c?.player && c.player !== "Player"
  );

  const realStats = matchFromApi?.liveStats || activeMatch?.liveStats || null;
  const possession = realStats?.possession || null;
  const shots = realStats?.shots || null;
  const shotsOnTarget = realStats?.shotsOnTarget || null;
  const corners = realStats?.corners || null;
  const fouls = realStats?.fouls || null;
  const saves = realStats?.saves || null;

  const liveClockDisplay = formatLiveClock(
    liveMatchFromApi?.displayClock || activeMatch?.minute || "LIVE"
  );
  const periodLabel = formatPeriodLabel(liveMatchFromApi || activeMatch);

  const selectedRank =
    liveFactData?.standings?.selected?.rank || activeMatch?.standings?.selected?.rank;
  const selectedPts =
    liveFactData?.standings?.selected?.points || activeMatch?.standings?.selected?.points;
  const oppRank =
    liveFactData?.standings?.opponent?.rank || activeMatch?.standings?.opponent?.rank;
  const oppPts =
    liveFactData?.standings?.opponent?.points || activeMatch?.standings?.opponent?.points;

  const safeIncident = incidents[activeIncidentIndex] || incidents[0];

  return (
    <div
      aria-label={isLive ? "Live match scoreboard" : "Matchday countdown scoreboard"}
      className="w-full relative rounded-[22px] overflow-hidden apple-card border border-white/[0.12] bg-[#0A0D12]/90 shadow-[0_12px_40px_rgba(0,0,0,0.65)] select-none"
    >
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
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D2F865]/15 border border-[#D2F865]/35 text-[#D2F865] font-bold text-[11px] tracking-wide shadow-sm">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                {phase.id === "BUILD_UP" ? "MATCHDAY" : phase.label.toUpperCase()} • KICK-OFF{" "}
                {kickoffTime}
              </span>
            ) : isLive ? null : isFinished ? (
              <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white font-bold text-[11px] tracking-wide">
                FULL-TIME
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white font-bold text-[11px] tracking-wide">
                UPCOMING
              </span>
            )}

            <span
              className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                isEuropean
                  ? "bg-[#637AE0]/25 text-[#A5B8FF] border border-[#637AE0]/35"
                  : "bg-white/10 text-white/90 border border-white/15"
              }`}
            >
              {competitionCode}
            </span>

            <span className="font-semibold text-white/90 tracking-[-0.01em]">
              {competitionName}
            </span>
            <span className="text-white/20 hidden sm:inline">•</span>
            <span className="text-[#8E8E93] text-[11px] hidden sm:inline">
              {venueName}
              {venueLocation ? `, ${venueLocation}` : ""}
              {venueCapacity ? ` • ${venueCapacity}` : ""}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] flex-wrap">
            {!isEuropean && selectedRank && (
              <span className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#8E8E93]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
                <span className="text-white font-semibold">
                  {club.shortName} #{selectedRank}
                </span>{" "}
                ({selectedPts} pts)
                {oppRank && (
                  <>
                    <span className="text-white/30">vs</span>
                    <span className="text-white/80 font-medium">#{oppRank}</span> ({oppPts} pts)
                  </>
                )}
              </span>
            )}

            <span className="hidden xl:flex items-center gap-1 text-[#8E8E93]">
              <Volume2 className="w-3.5 h-3.5 text-[#FF2636] animate-pulse" />
              <strong className="text-white font-medium">
                {isMatchdayPreMatch ? PHASE_ATMOSPHERE[phase.id] : `${venueName} Live`}
              </strong>
            </span>

            {(hasOfficialLineups || lineupConfirmed || isLive) && (
              <button
                type="button"
                onClick={() => setShowLineups((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer border ${
                  showLineups
                    ? "bg-[#30D158]/20 text-[#30D158] border-[#30D158]/40 shadow-[0_0_10px_rgba(48,209,88,0.18)]"
                    : hasOfficialLineups
                      ? "bg-[#30D158]/10 hover:bg-[#30D158]/20 text-[#30D158] border-[#30D158]/30"
                      : "bg-white/[0.06] hover:bg-white/[0.12] text-white/80 hover:text-white border-white/[0.08]"
                }`}
                aria-expanded={showLineups}
                aria-label={showLineups ? "Hide match line-ups" : "View match line-ups"}
              >
                <Users className="w-3 h-3" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  {hasOfficialLineups
                    ? showLineups
                      ? "Hide Confirmed XI"
                      : "Confirmed XI"
                    : showLineups
                      ? "Hide Line-ups"
                      : "Line-ups"}
                </span>
                {showLineups ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}

            {isMatchdayPreMatch && (
              <button
                type="button"
                onClick={() => setExpandedStats(!expandedStats)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer border ${
                  expandedStats
                    ? "bg-[#FF2636]/15 text-[#FF6961] border-[#FF2636]/30 shadow-[0_0_10px_rgba(255,38,54,0.15)]"
                    : "bg-white/[0.06] hover:bg-white/[0.12] text-white/80 hover:text-white border-white/[0.08]"
                }`}
                aria-label={
                  expandedStats ? "Collapse pre-match hub" : "Expand pre-match hub"
                }
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  {expandedStats ? "Hide Pre-Match Hub" : "Pre-Match Hub"}
                </span>
                {expandedStats ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* ── Main Scoreboard Visual Display ── */}
        <div className="py-3.5 sm:py-5">
          {/* Primary Aligned Lockup: Compact 3-col horizontal on mobile (FotMob/Apple Sports style), Top-aligned Club Names + Badges + Score on desktop */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2 sm:gap-4 md:gap-6">
            {/* Home Team */}
            <div className="flex flex-col md:flex-row items-center md:items-start justify-start md:justify-end gap-1.5 sm:gap-3 md:gap-4 order-1 min-w-0">
              <div className="flex flex-col items-center md:items-end text-center md:text-right min-w-0 w-full md:w-auto">
                <div className="md:min-h-[56px] flex items-center justify-center md:justify-end">
                  <h2 className="text-sm sm:text-xl md:text-3xl font-extrabold text-white tracking-[-0.02em] leading-tight md:leading-none text-balance">
                    {homeTeam}
                  </h2>
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#8E8E93] mt-0.5 md:mt-1 font-medium truncate max-w-full">
                  <span className="hidden sm:inline">{homeInfo.manager}</span>
                  {homeFormationDisplay && homeFormationDisplay !== "TBC" ? (
                    <>
                      <span className="hidden sm:inline"> • </span>
                      <span>{homeFormationDisplay}</span>
                    </>
                  ) : null}
                </p>
              </div>
              <div className="min-h-[40px] sm:min-h-[48px] md:min-h-[56px] flex items-center shrink-0 order-first md:order-last">
                <ClubBadge
                  clubId={authoritativeMatch?.homeTeamId}
                  name={homeTeam}
                  shortName={authoritativeMatch?.homeShort || homeInfo.shortName}
                  logoUrl={authoritativeMatch?.homeLogo}
                  primaryColor={homeInfo.primaryColor}
                  secondaryColor={homeInfo.secondaryColor}
                  size="lg"
                />
              </div>
            </div>

            {/* Central Score & Match Clock */}
            <div className="flex flex-col items-center justify-start order-2 shrink-0">
              <div className="min-h-[44px] sm:min-h-[48px] md:min-h-[56px] flex items-center">
                <div className="flex items-center gap-1.5 sm:gap-3 bg-black/60 px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border border-white/[0.14] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),0_4px_20px_rgba(0,0,0,0.5)]">
                  <span
                    className={`text-2xl sm:text-4xl md:text-5xl font-black font-mono tabular-nums leading-none ${
                      isMatchdayPreMatch
                        ? "text-white/35"
                        : "text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)]"
                    }`}
                  >
                    {homeScore}
                  </span>
                  <span className="text-lg sm:text-2xl font-bold text-white/30 leading-none">:</span>
                  <span
                    className={`text-2xl sm:text-4xl md:text-5xl font-black font-mono tabular-nums leading-none ${
                      isMatchdayPreMatch
                        ? "text-white/35"
                        : "text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)]"
                    }`}
                  >
                    {awayScore}
                  </span>
                </div>
              </div>

              {isMatchdayPreMatch ? (
                <div className="mt-1.5 sm:mt-2 flex flex-col items-center gap-0.5">
                  <span className="font-mono text-[11px] sm:text-sm font-bold text-[#D2F865] tabular-nums tracking-wider">
                    {countdownSeconds > 0 ? formattedCountdown : "00:00:00"}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-white/65">
                    {countdownSeconds > 0 ? "To Kick-off" : "Kick-off Imminent"}
                  </span>
                </div>
              ) : isMatchHalfTime(liveMatchFromApi || activeMatch) ? (
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-white/80 mt-1.5 sm:mt-2 px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.1]">
                  HT
                </span>
              ) : (
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#FF4D5A] mt-1.5 sm:mt-2 flex items-center gap-1.5 whitespace-nowrap">
                  {isLive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF2636] animate-ping" />
                  )}
                  {isLive ? `${periodLabel} • ${liveClockDisplay}` : "Full-Time"}
                </span>
              )}
            </div>

            {/* Away Team */}
            <div className="flex flex-col md:flex-row items-center md:items-start justify-start gap-1.5 sm:gap-3 md:gap-4 order-3 min-w-0">
              <div className="min-h-[40px] sm:min-h-[48px] md:min-h-[56px] flex items-center shrink-0">
                <ClubBadge
                  clubId={authoritativeMatch?.awayTeamId}
                  name={awayTeam}
                  shortName={authoritativeMatch?.awayShort || awayInfo.shortName}
                  logoUrl={authoritativeMatch?.awayLogo}
                  primaryColor={awayInfo.primaryColor}
                  secondaryColor={awayInfo.secondaryColor}
                  size="lg"
                />
              </div>
              <div className="flex flex-col items-center md:items-start text-center md:text-left min-w-0 w-full md:w-auto">
                <div className="md:min-h-[56px] flex items-center justify-center md:justify-start">
                  <h2 className="text-sm sm:text-xl md:text-3xl font-extrabold text-white tracking-[-0.02em] leading-tight md:leading-none text-balance">
                    {awayTeam}
                  </h2>
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#8E8E93] mt-0.5 md:mt-1 font-medium truncate max-w-full">
                  <span className="hidden sm:inline">{awayInfo.manager}</span>
                  {awayFormationDisplay && awayFormationDisplay !== "TBC" ? (
                    <>
                      <span className="hidden sm:inline"> • </span>
                      <span>{awayFormationDisplay}</span>
                    </>
                  ) : null}
                </p>
              </div>
            </div>
          </div>

          {/* Dedicated Aligned Scorers & Red Cards Row (Inline horizontal flow, BBC Sport / PL standard) */}
          {!isMatchdayPreMatch &&
            (groupedHomeScorers.length > 0 ||
              groupedAwayScorers.length > 0 ||
              homeRedCards.length > 0 ||
              awayRedCards.length > 0) && (
              <div className="grid grid-cols-[1fr_auto_1fr] items-baseline gap-2 sm:gap-6 mt-3 pt-2.5 border-t border-white/[0.06] text-[11px] sm:text-xs font-medium">
                {/* Home Scorers & Red Cards */}
                <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-right min-w-0">
                  {groupedHomeScorers.map((s, i) => (
                    <span key={`hs-${i}`} className="inline-flex items-center gap-1 text-[#EBEBF5]/95 whitespace-nowrap">
                      <strong className="text-white font-semibold">{s.player}</strong>
                      {s.minutes.length > 0 && (
                        <span className="font-mono text-white/60 text-[10px] sm:text-[11px] tabular-nums">
                          ({s.minutes.join(", ")})
                        </span>
                      )}
                    </span>
                  ))}
                  {homeRedCards.map((c, i) => (
                    <span key={`hc-${i}`} className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] whitespace-nowrap">
                      <span>🟥</span>
                      <span className="text-white/80">{c.player}</span>
                      {c.min && <span className="font-mono text-white/50 tabular-nums">({c.min})</span>}
                    </span>
                  ))}
                </div>

                {/* Balanced Centre Gutter */}
                <div className="flex justify-center min-w-[44px] sm:min-w-[104px] text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-white/40">
                  Goals
                </div>

                {/* Away Scorers & Red Cards */}
                <div className="flex flex-wrap items-center justify-start gap-x-3 gap-y-1 text-left min-w-0">
                  {groupedAwayScorers.map((s, i) => (
                    <span key={`as-${i}`} className="inline-flex items-center gap-1 text-[#EBEBF5]/95 whitespace-nowrap">
                      <strong className="text-white font-semibold">{s.player}</strong>
                      {s.minutes.length > 0 && (
                        <span className="font-mono text-white/60 text-[10px] sm:text-[11px] tabular-nums">
                          ({s.minutes.join(", ")})
                        </span>
                      )}
                    </span>
                  ))}
                  {awayRedCards.map((c, i) => (
                    <span key={`ac-${i}`} className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] whitespace-nowrap">
                      <span>🟥</span>
                      <span className="text-white/80">{c.player}</span>
                      {c.min && <span className="font-mono text-white/50 tabular-nums">({c.min})</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* Dedicated Aligned Assists Row Underneath Scorers (Inline horizontal comma-separated flow) */}
          {!isMatchdayPreMatch && (groupedHomeAssists.length > 0 || groupedAwayAssists.length > 0) && (
            <div className="grid grid-cols-[1fr_auto_1fr] items-baseline gap-2 sm:gap-6 mt-2.5 pt-2.5 border-t border-white/[0.06] text-[11px] sm:text-xs">
              {/* Home Assists */}
              <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1 text-right min-w-0">
                {groupedHomeAssists.map((a, i) => (
                  <span key={`ha-${i}`} className="inline-flex items-center gap-1 text-white/80 whitespace-nowrap">
                    <span>{a.player}</span>
                    {a.minutes.length > 0 && (
                      <span className="font-mono text-white/50 text-[10px] sm:text-[11px] tabular-nums">
                        ({a.minutes.join(", ")})
                      </span>
                    )}
                    {i < groupedHomeAssists.length - 1 && (
                      <span className="text-white/35">,</span>
                    )}
                  </span>
                ))}
              </div>

              {/* Centred Assists Label */}
              <div className="flex justify-center min-w-[44px] sm:min-w-[104px] text-[10px] sm:text-[11px] font-semibold text-white/70 tracking-wide">
                Assists
              </div>

              {/* Away Assists */}
              <div className="flex flex-wrap items-center justify-start gap-x-2 gap-y-1 text-left min-w-0">
                {groupedAwayAssists.map((a, i) => (
                  <span key={`aa-${i}`} className="inline-flex items-center gap-1 text-white/80 whitespace-nowrap">
                    <span>{a.player}</span>
                    {a.minutes.length > 0 && (
                      <span className="font-mono text-white/50 text-[10px] sm:text-[11px] tabular-nums">
                        ({a.minutes.join(", ")})
                      </span>
                    )}
                    {i < groupedAwayAssists.length - 1 && (
                      <span className="text-white/35">,</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Interactive Confirmed XI / Official Line-ups Panel ── */}
        {showLineups && (
          <div className="pt-3.5 pb-1 border-t border-white/[0.08] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#30D158]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  {hasOfficialLineups
                    ? "Official Confirmed Starting XI & Substitutes"
                    : "Matchday Team Sheets"}
                </h3>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {!isMatchdayPreMatch && hasOfficialLineups && (
                  <div className="hidden sm:flex items-center gap-2.5 text-[10px] text-[#8E8E93] font-medium">
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-block w-2 h-2.5 rounded-[1.5px] bg-[#FACC15]" />
                      Yellow
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-block w-2 h-2.5 rounded-[1.5px] bg-[#EF4444]" />
                      Red
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[#30D158]">
                      ↑ Sub On
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[#F26E7C]">
                      ↓ Sub Off
                    </span>
                  </div>
                )}
                <span
                  className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase border ${
                    hasOfficialLineups
                      ? "bg-[#30D158]/15 text-[#30D158] border-[#30D158]/35"
                      : "bg-[#F4BA5B]/15 text-[#F4BA5B] border-[#F4BA5B]/35"
                  }`}
                >
                  {hasOfficialLineups ? "OFFICIAL FEED" : "AWAITING OFFICIAL FEED"}
                </span>
              </div>
            </div>

            {hasOfficialLineups ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    side: "HOME",
                    team: officialLineups.home,
                    fallbackName: homeTeam,
                    badgeClass:
                      "bg-[#E31B23]/25 text-[#FF4D5A] border-[#E31B23]/35",
                  },
                  {
                    side: "AWAY",
                    team: officialLineups.away,
                    fallbackName: awayTeam,
                    badgeClass: "bg-white/10 text-white/80 border-white/15",
                  },
                ].map(({ side, team, fallbackName, badgeClass }) => (
                  <div
                    key={side}
                    className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-3.5 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2 min-w-0">
                        <ClubBadge
                          clubId={side === "HOME" ? authoritativeMatch?.homeTeamId : authoritativeMatch?.awayTeamId}
                          name={team?.teamName || fallbackName}
                          logoUrl={side === "HOME" ? authoritativeMatch?.homeLogo : authoritativeMatch?.awayLogo}
                          size="xs"
                        />
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${badgeClass}`}
                        >
                          {side}
                        </span>
                        <span className="text-sm font-bold text-white truncate">
                          {team?.teamName || fallbackName}
                        </span>
                      </div>
                      {team?.formation && (
                        <span className="font-mono text-[11px] font-bold text-[#D2F865] bg-[#D2F865]/10 border border-[#D2F865]/25 px-2 py-0.5 rounded-md shrink-0">
                          {team.formation}
                        </span>
                      )}
                    </div>

                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {(team?.starters || []).map((p) => {
                        const hasRed = Boolean(p.redCard);
                        const hasYellow = (p.yellowCards?.length || 0) > 0;
                        const hasGoals = (p.goals?.length || 0) > 0;
                        const isSubbedOut = Boolean(p.subbedOut);

                        return (
                          <li
                            key={p.id}
                            className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl border text-xs transition-opacity ${
                              hasRed
                                ? "bg-[#EF4444]/10 border-[#EF4444]/35"
                                : "bg-black/35 border-white/[0.05]"
                            } ${isSubbedOut ? "opacity-70" : ""}`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono text-[11px] font-bold text-white/60 w-5 text-right tabular-nums shrink-0">
                                {p.jersey || "·"}
                              </span>
                              <span className="text-white font-medium truncate">
                                {p.name}
                                {p.isCaptain && (
                                  <span className="ml-1 text-[10px] font-bold text-[#D2F865]">
                                    (C)
                                  </span>
                                )}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {hasGoals && (
                                <span
                                  title={`Goal: ${p.goals.join(", ")}`}
                                  className="inline-flex items-center gap-0.5 font-mono text-[10px] font-bold text-[#D2F865] tabular-nums"
                                >
                                  <span>⚽</span>
                                  <span>{p.goals.length > 1 ? `×${p.goals.length}` : p.goals[0]}</span>
                                </span>
                              )}
                              {hasYellow && (
                                <span
                                  title={`Yellow card${p.yellowCards[0] ? ` (${p.yellowCards.join(", ")})` : ""}`}
                                  className="inline-flex items-center gap-0.5 font-mono text-[10px] text-[#FACC15] tabular-nums"
                                >
                                  <span className="inline-block w-2 h-3 rounded-[2px] bg-[#FACC15] shadow-[0_0_6px_rgba(250,204,21,0.4)]" />
                                  {p.yellowCards[0] && <span>{p.yellowCards[0]}</span>}
                                </span>
                              )}
                              {hasRed && (
                                <span
                                  title={`Red card (${p.redCard})`}
                                  className="inline-flex items-center gap-0.5 font-mono text-[10px] text-[#EF4444] font-bold tabular-nums"
                                >
                                  <span className="inline-block w-2 h-3 rounded-[2px] bg-[#EF4444] shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                                  {p.redCard !== "RC" && <span>{p.redCard}</span>}
                                </span>
                              )}
                              {isSubbedOut && (
                                <span
                                  title={`Substituted off${p.subbedOutMin ? ` (${p.subbedOutMin})` : ""}`}
                                  className="inline-flex items-center gap-0.5 font-mono text-[10px] font-semibold text-[#F26E7C] tabular-nums"
                                >
                                  <span>↓</span>
                                  {p.subbedOutMin && <span>{p.subbedOutMin}</span>}
                                </span>
                              )}
                              {p.position && (
                                <span className="font-mono text-[10px] text-[#8E8E93] uppercase">
                                  {p.position}
                                </span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>

                    {team?.substitutes?.length > 0 && (() => {
                      const usedSubs = team.substitutes.filter((s) => Boolean(s.subbedIn));
                      const unusedSubs = team.substitutes.filter((s) => !s.subbedIn);
                      const hasUsedSubs = usedSubs.length > 0;

                      const renderSubPill = (s, isUsed) => {
                        const hasRed = Boolean(s.redCard);
                        const hasYellow = (s.yellowCards?.length || 0) > 0;
                        const hasGoals = (s.goals?.length || 0) > 0;

                        return (
                          <span
                            key={s.id}
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[11px] ${
                              hasRed
                                ? "bg-[#EF4444]/15 border-[#EF4444]/40 text-white"
                                : isUsed
                                  ? "bg-white/[0.05] border-white/[0.09] text-white/90"
                                  : "bg-white/[0.03] border-white/[0.05] text-white/60"
                            }`}
                          >
                            {s.jersey && (
                              <span className="font-mono text-[10px] text-white/40 tabular-nums">
                                #{s.jersey}
                              </span>
                            )}
                            <span>{s.shortName || s.name}</span>
                            {isUsed && s.subbedInMin && (
                              <span
                                title={`Came on in ${s.subbedInMin}`}
                                className="font-mono text-[10px] text-white/45 tabular-nums"
                              >
                                {s.subbedInMin}
                              </span>
                            )}
                            {hasGoals && (
                              <span className="font-mono text-[10px] font-bold text-[#D2F865] tabular-nums">
                                ⚽{s.goals.length > 1 ? `×${s.goals.length}` : s.goals[0]}
                              </span>
                            )}
                            {hasYellow && (
                              <span
                                title={`Yellow card${s.yellowCards[0] ? ` (${s.yellowCards.join(", ")})` : ""}`}
                                className="inline-block w-1.5 h-2.5 rounded-[1.5px] bg-[#FACC15]"
                              />
                            )}
                            {hasRed && (
                              <span
                                title={`Red card (${s.redCard})`}
                                className="inline-block w-1.5 h-2.5 rounded-[1.5px] bg-[#EF4444]"
                              />
                            )}
                          </span>
                        );
                      };

                      return (
                        <div className="pt-2 border-t border-white/[0.06] space-y-2.5">
                          {hasUsedSubs ? (
                            <>
                              <div>
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E8E93] block mb-1.5">
                                  Used Substitutes ({usedSubs.length})
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {usedSubs.map((s) => renderSubPill(s, true))}
                                </div>
                              </div>
                              {unusedSubs.length > 0 && (
                                <div>
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E8E93]/75 block mb-1.5">
                                    Unused Substitutes ({unusedSubs.length})
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {unusedSubs.map((s) => renderSubPill(s, false))}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div>
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E8E93] block mb-1.5">
                                Substitutes ({team.substitutes.length})
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {team.substitutes.map((s) => renderSubPill(s, false))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-4 text-xs text-[#B7BAC3] space-y-2">
                <p>
                  Official starting XIs have not been published by the match feed yet.
                  This scoreboard checks automatically every 45 seconds and will populate
                  both starting line-ups, formations, and substitutes as soon as they are released.
                </p>
                {activeMatch?.startingXI?.length > 0 && (
                  <div className="pt-2 border-t border-white/[0.06]">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E8E93] block mb-2">
                      {club.name} Projected XI (Pre-Confirmation)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeMatch.startingXI.map((p) => (
                        <span
                          key={p.id || p.name}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 border border-white/[0.06] text-[11px] text-white/85"
                        >
                          <span className="font-mono text-[10px] text-[#D2F865]">
                            {p.pos}
                          </span>
                          <span>{p.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Expandable Pre-Match Hub OR Always-On Live / Full-Time Match Telemetry ── */}
        {(isLive || isFinished || expandedStats) && (
          <div className="pt-3 border-t border-white/[0.08] space-y-3">
            {isMatchdayPreMatch ? (
              <PreMatchPanel
                activeMatch={
                  isSameFixtureContext
                    ? activeMatch
                    : {
                        ...activeMatch,
                        id: authoritativeMatch?.id || activeMatch?.id,
                        homeTeam,
                        awayTeam,
                        opponent: isClubHome ? awayTeam : homeTeam,
                        competition: competitionName,
                        venue: venueName,
                        city: venueLocation || venueCity,
                        capacity: venueCapacity,
                        preMatch: null,
                      }
                }
                selectedClub={club}
                phase={phase}
                countdownSeconds={countdownSeconds}
                onPreviewPhase={handlePreviewPhase}
                isPreviewing={isPreviewing}
                onResetPreview={handleResetPreview}
                matchPreMatch={matchPreMatch}
                kickoffIso={kickoffIso}
              />
            ) : realStats ? (
              <div className="space-y-3">
                {/* Possession Duel Gauge */}
                {possession && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#E31B23]" />
                        {homeTeam}{" "}
                        <strong className="font-mono text-sm ml-1 text-white tabular-nums">
                          {possession[0]}%
                        </strong>
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-widest">
                        Possession
                      </span>
                      <span className="text-white/80 flex items-center gap-1.5">
                        <strong className="font-mono text-sm mr-1 text-white tabular-nums">
                          {possession[1]}%
                        </strong>
                        {awayTeam}
                        <span className="w-2 h-2 rounded-full bg-white/40" />
                      </span>
                    </div>

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
                )}

                {/* Real Live Match Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="apple-tile p-2.5 rounded-xl border border-white/[0.06] text-center">
                    <span className="text-[10px] text-[#8E8E93] font-medium block uppercase tracking-wider">
                      Shots (On Target)
                    </span>
                    <div className="flex items-center justify-center gap-2 mt-0.5 font-mono text-sm font-bold tabular-nums">
                      <span className="text-white">
                        {shots ? `${shots[0]} (${shotsOnTarget?.[0] ?? 0})` : "—"}
                      </span>
                      <span className="text-[10px] text-white/30">-</span>
                      <span className="text-[#8E8E93]">
                        {shots ? `${shots[1]} (${shotsOnTarget?.[1] ?? 0})` : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="apple-tile p-2.5 rounded-xl border border-white/[0.06] text-center">
                    <span className="text-[10px] text-[#8E8E93] font-medium block uppercase tracking-wider">
                      Corner Kicks
                    </span>
                    <div className="flex items-center justify-center gap-2 mt-0.5 font-mono text-sm font-bold tabular-nums">
                      <span className="text-white">{corners ? corners[0] : "—"}</span>
                      <span className="text-[10px] text-white/30">-</span>
                      <span className="text-[#8E8E93]">{corners ? corners[1] : "—"}</span>
                    </div>
                  </div>

                  <div className="apple-tile p-2.5 rounded-xl border border-white/[0.06] text-center">
                    <span className="text-[10px] text-[#8E8E93] font-medium block uppercase tracking-wider">
                      Fouls
                    </span>
                    <div className="flex items-center justify-center gap-2 mt-0.5 font-mono text-sm font-bold tabular-nums">
                      <span className="text-white">{fouls ? fouls[0] : "—"}</span>
                      <span className="text-[10px] text-white/30">-</span>
                      <span className="text-[#8E8E93]">{fouls ? fouls[1] : "—"}</span>
                    </div>
                  </div>

                  <div className="apple-tile p-2.5 rounded-xl border border-white/[0.06] text-center">
                    <span className="text-[10px] text-[#8E8E93] font-medium block uppercase tracking-wider">
                      Goalkeeper Saves
                    </span>
                    <div className="flex items-center justify-center gap-2 mt-0.5 font-mono text-sm font-bold tabular-nums">
                      <span className="text-white">{saves ? saves[0] : "—"}</span>
                      <span className="text-[10px] text-white/30">-</span>
                      <span className="text-[#8E8E93]">{saves ? saves[1] : "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-3 px-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center text-xs text-[#8E8E93]">
                Live match statistics are awaiting publication from the official match feed.
              </div>
            )}
          </div>
        )}

        {/* ── Matchday / Live Incident Ticker Strip ── */}
        {safeIncident && (
          <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 border flex items-center gap-1 ${
                  isMatchdayPreMatch
                    ? "bg-white/10 text-white/90 border-white/20"
                    : "bg-[#E31B23]/20 text-[#FF4D5A] border-[#E31B23]/30"
                }`}
              >
                <Zap className="w-3 h-3 text-[#FF2636]" />
                {isMatchdayPreMatch ? "Matchday Schedule" : "Match Event"}
              </span>
              <span className="font-mono text-[11px] font-bold text-white shrink-0 tabular-nums">
                {safeIncident.min}
              </span>
              <p className="text-white/90 truncate font-medium text-[11px]">
                {safeIncident.text}
              </p>
            </div>

            {incidents.length > 1 && (
              <div className="hidden sm:flex items-center gap-1 text-[10px] text-[#8E8E93] shrink-0 pl-2">
                <span>
                  {activeIncidentIndex + 1} of {incidents.length}{" "}
                  {isMatchdayPreMatch ? "milestones" : "events"}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
