"use client";

import React, { useState, useEffect } from "react";
import { MotionConfig } from "motion/react";
import SidebarNav from "../components/insights/SidebarNav";
import { SlidingTabPanel } from "../components/insights/SlidingSegmentedTabs";
import WorkspaceHeader from "../components/insights/WorkspaceHeader";
import LiveMatchTicker from "../components/insights/LiveMatchTicker";
import LiveScoreboard from "../components/insights/LiveScoreboard";
import PitchCanvas from "../components/insights/PitchCanvas";
import TacticalKpiDeck from "../components/insights/TacticalKpiDeck";
import FixturesTimelineRail from "../components/insights/FixturesTimelineRail";
import StandingsTable from "../components/insights/StandingsTable";
import ClubNewsView from "../components/insights/ClubNewsView";
import PostMatchTacticalArchive from "../components/insights/PostMatchTacticalArchive";
import TimeMachineView from "../components/insights/TimeMachineView";
import TransferScoutView from "../components/insights/TransferScoutView";
import PlayerDossierDrawer from "../components/insights/PlayerDossierDrawer";
import FixturesView from "../components/insights/FixturesView";
import Footer from "../components/insights/Footer";
import {
  MATCHDAY_PHASES,
  getMatchdayPhase,
  isLineupConfirmed,
} from "../components/insights/PreMatchPanel";
import { MATCH_LIBRARY } from "../data/matchLibrary";
import { PREMIER_LEAGUE_MANAGERS } from "../data/premierLeagueManagers";

const VALID_TABS = [
  "boot-room",
  "standings",
  "club-news",
  "match-archives",
  "transfer-scout",
  "fixtures",
];

function isSameCalendarDay(isoDate) {
  if (!isoDate) return false;
  const target = new Date(isoDate);
  if (Number.isNaN(target.getTime())) return false;
  const now = new Date();
  return (
    target.getFullYear() === now.getFullYear() &&
    target.getMonth() === now.getMonth() &&
    target.getDate() === now.getDate()
  );
}

function resolveTabName(raw) {
  if (!raw) return null;
  const clean = String(raw).replace(/^#/, "").toLowerCase().trim();
  if (VALID_TABS.includes(clean)) return clean;
  if (clean === "table" || clean === "league-table") return "standings";
  if (clean === "calendar" || clean === "schedule") return "fixtures";
  if (clean === "time-machine" || clean === "archives" || clean === "archive")
    return "match-archives";
  if (clean === "news" || clean === "clubnews") return "club-news";
  if (clean === "scout" || clean === "transfers") return "transfer-scout";
  return null;
}

export default function FootballInsightsDashboard() {
  const [activeTab, setActiveTabState] = useState(() => {
    if (typeof window === "undefined") return "boot-room";
    const fromHash = resolveTabName(window.location.hash);
    let fromQuery = null;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      fromQuery = resolveTabName(urlParams.get("tab"));
    } catch {
      // Ignore
    }
    let fromStorage = null;
    try {
      fromStorage = resolveTabName(
        localStorage.getItem("football_active_tab") ||
          localStorage.getItem("anfield_active_tab")
      );
    } catch {
      // Storage unavailable
    }
    return fromHash || fromQuery || fromStorage || "boot-room";
  });

  const [selectedClubId, setSelectedClubIdState] = useState(() => {
    if (typeof window === "undefined") return "364";
    try {
      return localStorage.getItem("football_selected_club") || "364";
    } catch {
      return "364";
    }
  });

  const selectedClub =
    PREMIER_LEAGUE_MANAGERS[selectedClubId] || PREMIER_LEAGUE_MANAGERS["364"];

  const [selectedMatchId, setSelectedMatchId] = useState(MATCH_LIBRARY[0].id);
  const [overlayMode, setOverlayMode] = useState("pass"); // "pass" | "heat" | "shots" | "hub"
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [countdownSeconds, setCountdownSeconds] = useState(() => {
    const defaultIso = "2026-11-29T12:00:00Z";
    const ts = new Date(defaultIso).getTime();
    return Math.max(0, Math.floor((ts - Date.now()) / 1000));
  });
  const [previewOffset, setPreviewOffset] = useState(null);
  const [realCountdown, setRealCountdown] = useState(null);
  const [liveSchedule, setLiveSchedule] = useState({ live: [], upcoming: [], recent: [] });
  const [clubContextMatch, setClubContextMatch] = useState(null);
  const [liveFactData, setLiveFactData] = useState(null);

  const currentPhase = getMatchdayPhase(countdownSeconds);

  const setSelectedClubId = (clubId) => {
    const validId = String(clubId || "364");
    setSelectedClubIdState(validId);
    setSelectedPlayer(null);
    setClubContextMatch(null);
    if (validId === "364") {
      setSelectedMatchId(MATCH_LIBRARY[0].id);
    } else {
      setSelectedMatchId("");
    }
    try {
      localStorage.setItem("football_selected_club", validId);
    } catch {
      // Ignore
    }
  };

  // Fetch club schedule from ESPN live endpoint
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/schedule?teamId=${selectedClubId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data && data.isLive) {
          const live = data.live || [];
          const up = data.upcoming || [];
          const rec = data.recent || [];
          setLiveSchedule({ live, upcoming: up, recent: rec });
          if (live.length > 0) {
            setSelectedMatchId((prev) =>
              prev && prev.startsWith("espn-") ? prev : live[0].id
            );
          } else {
            const firstMatch = up[0] || rec[0];
            if (firstMatch) {
              setSelectedMatchId((prev) =>
                prev && prev.startsWith("espn-") ? prev : firstMatch.id
              );
            }
          }
        }
      })
      .catch((err) => console.error("Error fetching live schedule:", err));
    return () => {
      cancelled = true;
    };
  }, [selectedClubId]);

  // Fetch full tactical club context
  useEffect(() => {
    let cancelled = false;
    const eventQuery =
      selectedMatchId && selectedMatchId.startsWith("espn-")
        ? `&eventId=${encodeURIComponent(selectedMatchId)}`
        : "";

    fetch(`/api/club-context?teamId=${selectedClubId}${eventQuery}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data && !data.error) {
          setClubContextMatch(data);
        }
      })
      .catch((err) =>
        console.error("Error fetching club tactical context:", err)
      );
    return () => {
      cancelled = true;
    };
  }, [selectedClubId, selectedMatchId]);

  // Fetch live facts & league rank summary
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/live-fixtures?teamId=${encodeURIComponent(selectedClubId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json) setLiveFactData(json);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [selectedClubId]);

  // Pre-match countdown ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync URL hash with active tab
  useEffect(() => {
    if (window.location.hash !== `#${activeTab}`) {
      window.history.replaceState(null, "", `#${activeTab}`);
    }
    const handleHashChange = () => {
      const newTab = resolveTabName(window.location.hash);
      if (newTab) setActiveTabState(newTab);
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [activeTab]);

  const [workspaceDir, setWorkspaceDir] = useState(1);

  const setActiveTab = (tabId) => {
    const valid = resolveTabName(tabId) || tabId;
    const curIdx = VALID_TABS.indexOf(activeTab);
    const nextIdx = VALID_TABS.indexOf(valid);
    if (curIdx >= 0 && nextIdx >= 0 && curIdx !== nextIdx) {
      setWorkspaceDir(nextIdx > curIdx ? 1 : -1);
    }
    setActiveTabState(valid);
    try {
      localStorage.setItem("football_active_tab", valid);
      if (window.location.hash !== `#${valid}`) {
        window.history.replaceState(null, "", `#${valid}`);
      }
    } catch {
      // Ignore
    }
  };

  const handlePreviewPhase = (secondsBeforeKickoff) => {
    if (previewOffset === null) setRealCountdown(countdownSeconds);
    setPreviewOffset(secondsBeforeKickoff);
    setCountdownSeconds(secondsBeforeKickoff);
  };

  const handleResetPreview = () => {
    setCountdownSeconds(realCountdown ?? 16155);
    setPreviewOffset(null);
  };

  const handleSelectPhaseById = (phaseId) => {
    const found = MATCHDAY_PHASES.find((p) => p.id === phaseId);
    if (found && Number.isFinite(found.at)) {
      handlePreviewPhase(found.at);
      setOverlayMode("hub");
    }
  };

  // Build activeMatch with synchronous fallback
  const activeMatch = (() => {
    if (
      selectedClubId === "364" &&
      !String(selectedMatchId).startsWith("espn-")
    ) {
      const libMatch =
        MATCH_LIBRARY.find((m) => m.id === selectedMatchId) || MATCH_LIBRARY[0];
      return {
        ...libMatch,
        teamId: "364",
        clubName: selectedClub.name,
        clubShort: selectedClub.shortName,
        city: selectedClub.city,
        capacity: selectedClub.capacity,
        mainStand: selectedClub.mainStand,
        anthem: selectedClub.anthem,
        lat: selectedClub.lat,
        lon: selectedClub.lon,
        selectedManager: selectedClub.manager,
        selectedFormation: selectedClub.formation,
        selectedStyle: selectedClub.tacticalStyle,
        selectedCaptain: selectedClub.captain,
        fullSquad: clubContextMatch?.fullSquad || [],
        standings: clubContextMatch?.standings || null,
      };
    }

    if (
      clubContextMatch &&
      String(clubContextMatch.teamId) === String(selectedClubId)
    ) {
      return clubContextMatch;
    }

    const liveFixture = liveSchedule.live?.[0] || null;
    const nextFixture = liveSchedule.upcoming[0];
    const recentFixture = liveSchedule.recent[0];
    const targetFixture =
      (selectedMatchId && selectedMatchId.startsWith("espn-")
        ? (liveSchedule.live || [])
            .concat(liveSchedule.upcoming)
            .concat(liveSchedule.recent)
            .find((f) => f.id === selectedMatchId)
        : null) ||
      liveFixture ||
      nextFixture ||
      recentFixture;

    const liveOverride =
      liveFactData?.activeLiveMatch &&
      (!targetFixture || targetFixture.id === liveFactData.activeLiveMatch.id || targetFixture.isLive)
        ? liveFactData.activeLiveMatch
        : null;
    const matchdayOverride =
      !liveOverride && liveFactData?.matchdayFixture ? liveFactData.matchdayFixture : null;
    const isMatchLive = Boolean(targetFixture?.isLive || liveOverride?.isLive);
    const rawKickoffIso =
      liveOverride?.date ||
      matchdayOverride?.date ||
      targetFixture?.date ||
      liveFactData?.nextFixture?.date ||
      null;
    const isTodayUpcoming =
      !isMatchLive &&
      Boolean(
        matchdayOverride ||
          (targetFixture?.isUpcoming !== false && isSameCalendarDay(rawKickoffIso))
      );

    const oppName = targetFixture?.opponent || matchdayOverride?.awayTeam || "Premier League Opponent";
    const oppInfo =
      Object.values(PREMIER_LEAGUE_MANAGERS).find(
        (c) => c.name.toLowerCase() === oppName.toLowerCase()
      ) || PREMIER_LEAGUE_MANAGERS["360"];

    const isHome = targetFixture?.isHome ?? true;
    const homeInfo = isHome ? selectedClub : oppInfo;
    const awayInfo = isHome ? oppInfo : selectedClub;
    const formattedDate = rawKickoffIso
      ? new Date(rawKickoffIso).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Upcoming Matchday";

    return {
      id: targetFixture?.id || matchdayOverride?.id || `club-${selectedClubId}`,
      teamId: selectedClubId,
      clubName: selectedClub.name,
      clubShort: selectedClub.shortName,
      type: isMatchLive ? "LIVE" : targetFixture?.isUpcoming !== false ? "MATCHDAY" : "RECENT",
      isLive: isMatchLive,
      isMatchday: !isMatchLive && targetFixture?.isUpcoming !== false,
      isMatchdayToday: isTodayUpcoming,
      kickoffIso: rawKickoffIso,
      broadcast: liveOverride?.broadcast || matchdayOverride?.broadcast || targetFixture?.broadcast || liveFactData?.nextFixture?.broadcast || null,
      competitionCode: liveOverride?.competitionCode || matchdayOverride?.competitionCode || targetFixture?.competitionCode || null,
      title: `${liveOverride?.homeTeam || matchdayOverride?.homeTeam || homeInfo.name} vs ${liveOverride?.awayTeam || matchdayOverride?.awayTeam || awayInfo.name}`,
      opponent: oppName,
      competition: liveOverride?.competition || matchdayOverride?.competition || targetFixture?.competition || "Premier League",
      date: formattedDate,
      venue: liveOverride?.venue || matchdayOverride?.venue || targetFixture?.venue || homeInfo.stadium,
      city: homeInfo.city,
      capacity: homeInfo.capacity,
      mainStand: homeInfo.mainStand,
      anthem: homeInfo.anthem,
      lat: homeInfo.lat,
      lon: homeInfo.lon,
      score: isMatchLive
        ? `${liveOverride?.homeScore ?? targetFixture?.homeScore ?? 0} - ${liveOverride?.awayScore ?? targetFixture?.awayScore ?? 0}`
        : targetFixture?.isUpcoming
        ? null
        : targetFixture?.statusText,
      homeScore: isMatchLive ? (liveOverride?.homeScore ?? targetFixture?.homeScore ?? 0) : targetFixture?.homeScore,
      awayScore: isMatchLive ? (liveOverride?.awayScore ?? targetFixture?.awayScore ?? 0) : targetFixture?.awayScore,
      minute: liveOverride?.displayClock || targetFixture?.displayClock || undefined,
      homeTeam: liveOverride?.homeTeam || matchdayOverride?.homeTeam || homeInfo.name,
      awayTeam: liveOverride?.awayTeam || matchdayOverride?.awayTeam || awayInfo.name,
      homeShort: homeInfo.shortName,
      awayShort: awayInfo.shortName,
      selectedManager: selectedClub.manager,
      selectedFormation: selectedClub.formation,
      selectedStyle: selectedClub.tacticalStyle,
      selectedCaptain: selectedClub.captain,
      statusText: targetFixture?.statusText || "Matchday Preview",
      expectedShape: `${selectedClub.formation} (${selectedClub.manager})`,
      keyTacticalBattle: `${selectedClub.captain} orchestrating ${selectedClub.formation} build-up against ${oppInfo.name}`,
      metrics: {
        teamXg: 2.18,
        opponentXg: 1.05,
        fieldTilt: 64.5,
        ppda: 7.4,
        counterPressRegains: 22,
      },
      startingXI: [
        { id: "gk", name: `${selectedClub.shortName} Goalkeeper`, number: 1, pos: "GK", x: 11, y: 34, touches: 44, obv: 0.31, comp: 89 },
        { id: "rb", name: `${selectedClub.shortName} Right-Back`, number: 2, pos: "RB", x: 28, y: 56, touches: 68, obv: 0.42, comp: 88 },
        { id: "rcb", name: `${selectedClub.shortName} Stopper`, number: 5, pos: "RCB", x: 24, y: 42, touches: 76, obv: 0.48, comp: 93 },
        { id: "lcb", name: selectedClub.captain, number: 4, pos: "LCB", x: 24, y: 26, touches: 84, obv: 0.64, comp: 94 },
        { id: "lb", name: `${selectedClub.shortName} Left-Back`, number: 3, pos: "LB", x: 28, y: 12, touches: 70, obv: 0.44, comp: 87 },
        { id: "rdm", name: `${selectedClub.shortName} Pivot`, number: 6, pos: "RDM", x: 44, y: 43, touches: 78, obv: 0.52, comp: 91 },
        { id: "ldm", name: `${selectedClub.shortName} Controller`, number: 8, pos: "LDM", x: 44, y: 25, touches: 74, obv: 0.55, comp: 90 },
        { id: "cam", name: `${selectedClub.shortName} Playmaker`, number: 10, pos: "CAM", x: 64, y: 34, touches: 66, obv: 0.68, comp: 86 },
        { id: "rw", name: `${selectedClub.shortName} Right Wing`, number: 7, pos: "RW", x: 76, y: 54, touches: 56, obv: 0.59, comp: 82 },
        { id: "st", name: `${selectedClub.shortName} Striker`, number: 9, pos: "ST", x: 85, y: 34, touches: 46, obv: 0.72, comp: 80 },
        { id: "lw", name: `${selectedClub.shortName} Left Wing`, number: 11, pos: "LW", x: 76, y: 14, touches: 58, obv: 0.57, comp: 83 },
      ],
      passLinks: [
        { from: "lcb", to: "rcb", count: 28 },
        { from: "lcb", to: "lb", count: 22 },
        { from: "rcb", to: "rb", count: 20 },
        { from: "lcb", to: "ldm", count: 24 },
        { from: "rdm", to: "ldm", count: 26 },
        { from: "rdm", to: "cam", count: 22 },
        { from: "cam", to: "lw", count: 18 },
        { from: "cam", to: "rw", count: 19 },
        { from: "cam", to: "st", count: 15 },
      ],
      shots: [
        { id: "s1", x: 89, y: 34, outcome: "goal", xg: 0.42, xG: 0.42, min: "24'", player: selectedClub.captain },
        { id: "s2", x: 82, y: 42, outcome: "saved", xg: 0.24, xG: 0.24, min: "51'", player: `${selectedClub.shortName} Playmaker` },
      ],
    };
  })();

  const [nowMs, setNowMs] = useState(() => Date.now());
  const recentFullTimeMatch = liveFactData?.recentFullTimeMatch || null;
  const recentFullTimeHideMs = recentFullTimeMatch?.hideAtIso
    ? new Date(recentFullTimeMatch.hideAtIso).getTime()
    : null;

  useEffect(() => {
    if (!recentFullTimeHideMs || Number.isNaN(recentFullTimeHideMs)) return;
    const remaining = recentFullTimeHideMs - Date.now();
    if (remaining <= 0) return;
    const timer = setTimeout(() => setNowMs(Date.now()), remaining + 1000);
    return () => clearTimeout(timer);
  }, [recentFullTimeHideMs]);

  const isWithinPostMatchHour = Boolean(
    recentFullTimeMatch &&
      recentFullTimeHideMs &&
      !Number.isNaN(recentFullTimeHideMs) &&
      nowMs <= recentFullTimeHideMs
  );

  const isTodayLive = Boolean(
    (activeMatch?.isLive &&
      (!activeMatch?.kickoffIso || isSameCalendarDay(activeMatch.kickoffIso))) ||
      (liveFactData?.activeLiveMatch?.isLive &&
        (!liveFactData.activeLiveMatch.date ||
          isSameCalendarDay(liveFactData.activeLiveMatch.date)))
  );

  const isMatchdayToday = Boolean(
    !isTodayLive &&
      !isWithinPostMatchHour &&
      ((liveFactData?.matchdayFixture?.state === "pre" &&
        liveFactData?.matchdayFixture?.date &&
        isSameCalendarDay(liveFactData.matchdayFixture.date)) ||
        (liveSchedule.upcoming?.[0]?.date &&
          isSameCalendarDay(liveSchedule.upcoming[0].date)) ||
        (liveFactData?.nextFixture?.state === "pre" &&
          liveFactData?.nextFixture?.date &&
          isSameCalendarDay(liveFactData.nextFixture.date)))
  );

  // Display scoreboard on matchday (upcoming today, live, or for 1 hour after full-time); hide on all other days
  const shouldShowScoreboard = Boolean(
    isTodayLive || isMatchdayToday || isWithinPostMatchHour
  );

  const matchdayKickoffIso =
    liveFactData?.matchdayFixture?.date ||
    activeMatch?.kickoffIso ||
    (liveSchedule.upcoming?.[0]?.date &&
    isSameCalendarDay(liveSchedule.upcoming[0].date)
      ? liveSchedule.upcoming[0].date
      : null) ||
    (liveFactData?.nextFixture?.date &&
    isSameCalendarDay(liveFactData.nextFixture.date)
      ? liveFactData.nextFixture.date
      : null);



  const lineupStatus =
    activeMatch?.type === "MATCHDAY" || activeMatch?.isMatchday || isMatchdayToday
      ? isLineupConfirmed(currentPhase.id)
        ? "confirmed"
        : "predicted"
      : null;

  return (
    <MotionConfig reducedMotion="user">
    <div className="relative min-h-screen w-full bg-[#141518] text-[#F2F3F5] overflow-x-clip">
      {/* Subtle Ambient Liquid Glass Backlight Pools (Low-intensity, calm atmospheric depth) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden z-0"
      >
        <div className="absolute -top-[180px] left-[16%] w-[520px] h-[520px] rounded-full bg-[#637AE0]/[0.07] blur-[140px]" />
        <div className="absolute top-[38%] right-[12%] w-[480px] h-[480px] rounded-full bg-[#D2F865]/[0.05] blur-[150px]" />
        <div className="absolute -bottom-[140px] left-[32%] w-[560px] h-[560px] rounded-full bg-[#4594A1]/[0.06] blur-[150px]" />
      </div>

      {/* 1. Slim Obsidian Left Rail (Desktop) & Clean Mobile Top Bar */}
      <SidebarNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedClub={selectedClub}
        onOpenCalendar={() => setActiveTab("fixtures")}
      />

      {/* 2. Main Fluid Workspace Canvas (Offset cleanly for the 76px desktop rail & mobile bottom tab bar) */}
      <main className="relative z-10 md:pl-[76px] min-h-screen flex flex-col">
        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-24 md:py-8 flex-1 flex flex-col gap-4 sm:gap-6">
          {/* Clean Workspace Header Row: Title + Subtitle (Left) & Club Selector Pill (Right) */}
          <WorkspaceHeader
            activeTab={activeTab}
            selectedClubId={selectedClubId}
            setSelectedClubId={setSelectedClubId}
          />

          {/* Shared Multi-Match Live Ticker (Final Day & European Matchnights) */}
          <LiveMatchTicker
            selectedClubId={selectedClubId}
            onSelectClub={(id) => {
              setSelectedClubId(id);
              setActiveTab("boot-room");
            }}
          />

          {/* ═══ ACTIVE WORKSPACE PANEL (Apple HIG Directional Slide Transition) ═══ */}
          <SlidingTabPanel
            activeKey={activeTab}
            direction={workspaceDir}
            axis="y"
            distance={12}
          >
          {/* ═══ TAB 1: MATCH CENTRE (Clean 2-Column Analytical Canvas + Fixtures Timeline Rail) ═══ */}
          {activeTab === "boot-room" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Main Left-Centre 8/9 Cols: Live / Matchday Countdown Scoreboard + Hero Pitch Visualisation + 4 Stacked Atmospheric KPI Deck */}
              <div className="xl:col-span-8 2xl:col-span-9 space-y-6 min-w-0">
                {shouldShowScoreboard && (
                  <LiveScoreboard
                    activeMatch={
                      matchdayKickoffIso && !activeMatch?.kickoffIso
                        ? { ...activeMatch, kickoffIso: matchdayKickoffIso, isMatchdayToday }
                        : activeMatch
                    }
                    selectedClub={selectedClub}
                    initialLiveFactData={liveFactData}
                  />
                )}

                <PitchCanvas
                  activeMatch={activeMatch}
                  selectedClub={selectedClub}
                  overlayMode={overlayMode}
                  setOverlayMode={setOverlayMode}
                  selectedPlayer={selectedPlayer}
                  setSelectedPlayer={setSelectedPlayer}
                  lineupStatus={lineupStatus}
                  matchdayPhase={currentPhase.id}
                  countdownSeconds={countdownSeconds}
                  onPreviewPhase={handlePreviewPhase}
                  isPreviewing={previewOffset !== null}
                  onResetPreview={handleResetPreview}
                />

                <TacticalKpiDeck
                  activeMatch={activeMatch}
                  selectedClub={selectedClub}
                  liveFactData={liveFactData}
                  onOpenStandings={() => setActiveTab("standings")}
                />
              </div>

              {/* Right 4/3 Cols: Matchday & Fixtures Timeline Rail */}
              <div className="xl:col-span-4 2xl:col-span-3 min-w-0">
                <FixturesTimelineRail
                  selectedClub={selectedClub}
                  liveSchedule={liveSchedule}
                  activeMatch={activeMatch}
                  selectedMatchId={selectedMatchId}
                  onSelectMatch={(id) => {
                    setSelectedMatchId(id);
                    setSelectedPlayer(null);
                  }}
                  onOpenCalendar={() => setActiveTab("fixtures")}
                  matchdayPhase={currentPhase.id}
                  onSelectPhasePreview={handleSelectPhaseById}
                />
              </div>
            </div>
          )}

          {/* ═══ TAB 2: DEDICATED FULL-WIDTH LEAGUE TABLE ═══ */}
          {activeTab === "standings" && (
            <StandingsTable
              selectedClubId={selectedClubId}
              onSelectClub={(id) => setSelectedClubId(id)}
            />
          )}

          {/* ═══ TAB 3: CLUB NEWS WIRE ═══ */}
          {activeTab === "club-news" && (
            <ClubNewsView selectedClubId={selectedClubId} />
          )}

          {/* ═══ TAB 4: MATCH ARCHIVES ═══ */}
          {(activeTab === "match-archives" || activeTab === "time-machine") && (
            <div className="space-y-6">
              <PostMatchTacticalArchive
                match={activeMatch}
                selectedClub={selectedClub}
              />
              <TimeMachineView
                selectedClub={selectedClub}
                recentMatches={liveSchedule.recent}
                activeMatch={activeMatch}
              />
            </div>
          )}

          {/* ═══ TAB 5: TRANSFER SCOUT ═══ */}
          {activeTab === "transfer-scout" && (
            <TransferScoutView
              selectedClub={selectedClub}
              activeMatch={activeMatch}
            />
          )}

          {/* ═══ TAB 6: FULL-PAGE FIXTURES & RESULTS CALENDAR ═══ */}
          {activeTab === "fixtures" && (
            <FixturesView
              selectedClub={selectedClub}
              liveSchedule={liveSchedule}
              onSelectFixture={(id) => {
                setSelectedMatchId(id);
                setSelectedPlayer(null);
                setActiveTab("boot-room");
              }}
            />
          )}
          </SlidingTabPanel>

          {/* Quiet Utility Footer */}
          <Footer />
        </div>
      </main>

      {/* Slide-over Tactical Player Dossier Drawer */}
      <PlayerDossierDrawer
        player={selectedPlayer}
        selectedClub={selectedClub}
        isOpen={Boolean(selectedPlayer)}
        onClose={() => setSelectedPlayer(null)}
      />
    </div>
    </MotionConfig>
  );
}
