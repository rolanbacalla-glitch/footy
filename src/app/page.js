"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Header from "../components/insights/Header";
import LiveScoreboard from "../components/insights/LiveScoreboard";
import { isLineupConfirmed } from "../components/insights/PreMatchPanel";
import PitchCanvas from "../components/insights/PitchCanvas";
import MomentumChart from "../components/insights/MomentumChart";
import TimeMachineView from "../components/insights/TimeMachineView";
import TransferScoutView from "../components/insights/TransferScoutView";
import ClubNewsView from "../components/insights/ClubNewsView";
import PlayerDossierDrawer from "../components/insights/PlayerDossierDrawer";
import StandingsTable from "../components/insights/StandingsTable";
import PostMatchTacticalArchive from "../components/insights/PostMatchTacticalArchive";
import FixturesCalendarModal from "../components/insights/FixturesCalendarModal";
import Footer from "../components/insights/Footer";
import { MATCH_LIBRARY } from "../data/matchLibrary";
import { PREMIER_LEAGUE_MANAGERS } from "../data/premierLeagueManagers";
import { Calendar } from "lucide-react";

const VALID_TABS = ["boot-room", "club-news", "match-archives", "transfer-scout"];

function resolveTabName(raw) {
  if (!raw) return null;
  const clean = String(raw).replace(/^#/, "").toLowerCase().trim();
  if (VALID_TABS.includes(clean)) return clean;
  if (clean === "time-machine" || clean === "archives") return "match-archives";
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
        localStorage.getItem("football_active_tab") || localStorage.getItem("anfield_active_tab")
      );
    } catch {
      // Storage unavailable
    }
    return fromHash || fromQuery || fromStorage || "boot-room";
  });

  // Selected Club State (Defaults to Liverpool 364, restored from localStorage)
  const [selectedClubId, setSelectedClubIdState] = useState(() => {
    if (typeof window === "undefined") return "364";
    try {
      return localStorage.getItem("football_selected_club") || "364";
    } catch {
      return "364";
    }
  });

  const setSelectedClubId = (clubId) => {
    const validId = String(clubId || "364");
    setSelectedClubIdState(validId);
    try {
      localStorage.setItem("football_selected_club", validId);
    } catch {
      // Storage unavailable
    }
  };

  const selectedClub = PREMIER_LEAGUE_MANAGERS[selectedClubId] || PREMIER_LEAGUE_MANAGERS["364"];

  const [selectedMatchId, setSelectedMatchId] = useState(MATCH_LIBRARY[0].id);
  const [overlayMode, setOverlayMode] = useState("pass"); // 'pass' | 'heat' | 'shots'
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [matchdayPhase, setMatchdayPhase] = useState("BUILD_UP");
  const [liveSchedule, setLiveSchedule] = useState({ upcoming: [], recent: [] });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Hydrate real fixture schedule for the active club from ESPN live endpoint
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/schedule?teamId=${selectedClubId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data && data.isLive) {
          setLiveSchedule({
            upcoming: data.upcoming || [],
            recent: data.recent || [],
          });
        }
      })
      .catch((err) => console.error("Error fetching live schedule:", err));

    return () => {
      cancelled = true;
    };
  }, [selectedClubId]);

  // Restore & persist active tab across reloads, browser hibernation, and navigation
  useEffect(() => {
    if (window.location.hash !== `#${activeTab}`) {
      window.history.replaceState(null, "", `#${activeTab}`);
    }

    const handleHashChange = () => {
      const newTab = resolveTabName(window.location.hash);
      if (newTab) {
        setActiveTabState(newTab);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [activeTab]);

  const setActiveTab = (tabId) => {
    const valid = resolveTabName(tabId) || tabId;
    setActiveTabState(valid);
    try {
      localStorage.setItem("football_active_tab", valid);
      if (window.location.hash !== `#${valid}`) {
        window.history.replaceState(null, "", `#${valid}`);
      }
    } catch {
      // Storage error ignored
    }
  };

  // Build dynamic activeMatch: if chosen club is Liverpool, use detailed MATCH_LIBRARY tactical dossier;
  // for any other Premier League club, build authoritative tactical match container from live schedule
  const activeMatch = (() => {
    if (selectedClubId === "364") {
      return MATCH_LIBRARY.find((m) => m.id === selectedMatchId) || MATCH_LIBRARY[0];
    }

    // Dynamic match container for selected non-Liverpool Premier League club
    const nextFixture = liveSchedule.upcoming[0];
    const recentFixture = liveSchedule.recent[0];
    const targetFixture =
      (selectedMatchId.startsWith("espn-")
        ? liveSchedule.upcoming.concat(liveSchedule.recent).find((f) => f.id === selectedMatchId)
        : null) || nextFixture || recentFixture;

    const oppName = targetFixture?.opponent || "Opponent";
    const oppInfo = Object.values(PREMIER_LEAGUE_MANAGERS).find((c) => c.name.toLowerCase() === oppName.toLowerCase()) || {
      name: oppName,
      formation: "4-2-3-1",
      tacticalStyle: "Premier League System",
    };

    const isHome = targetFixture?.isHome ?? true;
    const formattedDate = targetFixture?.date
      ? new Date(targetFixture.date).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "22 Nov 2026 • 16:30";

    return {
      id: targetFixture?.id || `club-${selectedClubId}`,
      type: targetFixture?.isUpcoming ? "MATCHDAY" : "RECENT",
      isMatchday: Boolean(targetFixture?.isUpcoming),
      title: `${selectedClub.name} vs ${oppName}`,
      opponent: oppName,
      competition: targetFixture?.competition || "Premier League",
      date: formattedDate,
      venue: targetFixture?.venue || selectedClub.stadium,
      score: targetFixture?.isUpcoming ? null : targetFixture?.statusText,
      homeTeam: isHome ? selectedClub.name : oppName,
      awayTeam: isHome ? oppName : selectedClub.name,
      statusText: targetFixture?.statusText || "UPCOMING FIXTURE",
      isLiveOrNext: true,
      expectedShape: `${selectedClub.formation} (${selectedClub.manager} System)`,
      keyTacticalBattle: `${selectedClub.captain} orchestrating ${selectedClub.formation} build-up against ${oppInfo.name}`,
      metrics: {
        teamXg: 2.12,
        opponentXg: 1.05,
        fieldTilt: 64.5,
        ppda: 7.8,
        counterPressRegains: 21,
      },
      startingXI: [
        { id: "gk", name: "Starting Goalkeeper", number: 1, pos: "GK", x: 12, y: 50, touches: 48 },
        { id: "rb", name: "Right Back", number: 2, pos: "RB", x: 28, y: 82, touches: 64 },
        { id: "rcb", name: "Right Centre Back", number: 5, pos: "CB", x: 26, y: 62, touches: 78 },
        { id: "lcb", name: selectedClub.captain, number: 4, pos: "CB", x: 26, y: 38, touches: 88 },
        { id: "lb", name: "Left Back", number: 3, pos: "LB", x: 28, y: 18, touches: 70 },
        { id: "cdm", name: "Holding Midfielder", number: 6, pos: "DM", x: 42, y: 50, touches: 82 },
        { id: "rcm", name: "Box-to-Box Midfielder", number: 8, pos: "CM", x: 54, y: 65, touches: 74 },
        { id: "lcm", name: "Playmaker", number: 10, pos: "CM", x: 54, y: 35, touches: 80 },
        { id: "rw", name: "Right Winger", number: 7, pos: "RW", x: 74, y: 80, touches: 58 },
        { id: "cf", name: "Centre Forward", number: 9, pos: "ST", x: 82, y: 50, touches: 52 },
        { id: "lw", name: "Left Winger", number: 11, pos: "LW", x: 74, y: 20, touches: 62 },
      ],
      passLinks: [
        { from: "lcb", to: "rcb", count: 28 },
        { from: "lcb", to: "lb", count: 22 },
        { from: "rcb", to: "rb", count: 20 },
        { from: "lcb", to: "cdm", count: 24 },
        { from: "cdm", to: "lcm", count: 26 },
        { from: "cdm", to: "rcm", count: 22 },
        { from: "lcm", to: "lw", count: 18 },
        { from: "rcm", to: "rw", count: 19 },
        { from: "lcm", to: "cf", count: 14 },
      ],
      shots: [
        { id: "s1", x: 86, y: 48, outcome: "goal", xg: 0.38, minute: "24'", player: "Centre Forward" },
        { id: "s2", x: 78, y: 36, outcome: "saved", xg: 0.14, minute: "38'", player: "Playmaker" },
        { id: "s3", x: 82, y: 62, outcome: "blocked", xg: 0.09, minute: "55'", player: "Right Winger" },
      ],
    };
  })();

  return (
    <main className="relative min-h-screen w-full flex flex-col bg-[#050608] text-white overflow-x-hidden select-none">
      {/* Dynamic Ambient Glassmorphism Light Pools (Adaptive to selected club primary colours) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden z-0"
      >
        <div
          className="absolute -top-[140px] left-[8%] w-[540px] h-[540px] rounded-full blur-[140px] animate-ambient-pulse opacity-20"
          style={{ backgroundColor: selectedClub.primaryColor || "#E31B23" }}
        />
        <div
          className="absolute top-[32%] -right-[100px] w-[500px] h-[500px] rounded-full blur-[150px] animate-ambient-pulse opacity-15"
          style={{ backgroundColor: selectedClub.secondaryColor || "#003399", animationDelay: "-4s" }}
        />
        <div className="absolute -bottom-[120px] left-[25%] w-[620px] h-[620px] rounded-full bg-gradient-to-tr from-[#0E281A]/18 via-[#103020]/8 to-transparent blur-[150px]" />
      </div>

      {/* 1. Persistent Apple Liquid Glass Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedClubId={selectedClubId}
        setSelectedClubId={setSelectedClubId}
      />

      {/* 2. Main Body Dashboard Viewport */}
      <div className="relative z-10 flex-1 px-3 py-3 sm:px-5 sm:py-4 pt-20 sm:pt-24 flex flex-col gap-3.5 max-w-[1680px] w-full mx-auto">
        {/* Universal Match Centre Fixture Ribbon (Apple Sports inspired pill bar) */}
        {activeTab === "boot-room" && (
          <div className="flex flex-col gap-1.5 shrink-0">
            <div className="flex items-center justify-between gap-2 px-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8E8E93] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#E31B23]" strokeWidth={2} />
                Match Centre • {selectedClub.name} Real ESPN Fixtures
              </span>
            </div>

            <div
              role="tablist"
              aria-label="Match Centre fixtures"
              className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
            >
              {/* 1. Next Single Upcoming Fixture */}
              {(() => {
                const nextFx = liveSchedule.upcoming[0];
                if (!nextFx) return null;
                const isSelected = selectedMatchId === nextFx.id;
                const formattedDate = new Date(nextFx.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                });

                return (
                  <button
                    key={nextFx.id}
                    type="button"
                    onClick={() => {
                      setSelectedMatchId(nextFx.id);
                      setSelectedPlayer(null);
                    }}
                    className={`min-h-[38px] pressable flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer border ${
                      isSelected
                        ? "glass-crimson-pill text-white"
                        : "apple-tile border-white/[0.08] text-[#8E8E93] hover:text-white"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                    <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                      Next:
                    </span>
                    <span className="tracking-[-0.01em]">
                      {nextFx.isHome ? `vs ${nextFx.opponent}` : `@ ${nextFx.opponent}`}
                    </span>
                    <span className="text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-full bg-white/[0.04] text-white/70 border border-white/[0.08]">
                      {formattedDate} • {nextFx.broadcast}
                    </span>
                  </button>
                );
              })()}

              {/* 2. Primary Focus Match */}
              {(() => {
                const primaryMatch = activeMatch;
                if (!primaryMatch) return null;
                const isSelected = primaryMatch.id === selectedMatchId;
                const isLive = primaryMatch.type === "LIVE" || primaryMatch.isLive;

                return (
                  <button
                    key={primaryMatch.id}
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => {
                      setSelectedMatchId(primaryMatch.id);
                      setSelectedPlayer(null);
                    }}
                    className={`min-h-[38px] pressable flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer border ${
                      isSelected
                        ? "glass-crimson-pill text-white shadow-[0_0_12px_rgba(255,38,54,0.4)]"
                        : "apple-tile border-[#FF2636]/40 text-white hover:border-[#FF2636]/80"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isLive
                          ? "bg-[#FF2636] animate-pulse shadow-[0_0_10px_#FF2636]"
                          : "bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                      }`}
                    />
                    <span className="tracking-tight text-white">
                      {primaryMatch.title}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FF2636]/25 text-[#FF6961] border border-[#FF2636]/40 font-bold">
                      {primaryMatch.statusText}
                    </span>
                  </button>
                );
              })()}

              {/* 3. Immediate Last Result */}
              {(() => {
                const lastGame = liveSchedule.recent[0];
                if (!lastGame) return null;
                const isSelected = lastGame.id === selectedMatchId;
                return (
                  <button
                    key={lastGame.id}
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => {
                      setSelectedMatchId(lastGame.id);
                      setSelectedPlayer(null);
                    }}
                    className={`min-h-[38px] pressable flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer border ${
                      isSelected
                        ? "glass-crimson-pill text-white"
                        : "apple-tile border-white/[0.08] text-[#8E8E93] hover:text-white"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />
                    <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">
                      Last:
                    </span>
                    <span className="tracking-[-0.01em]">
                      {lastGame.title}
                    </span>
                    <span className="text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-full bg-black/40 text-white border border-white/10 font-bold">
                      {lastGame.statusText}
                    </span>
                  </button>
                );
              })()}

              {/* 4. Section Launcher: All Upcoming Matches Calendar Modal */}
              <button
                type="button"
                onClick={() => setIsCalendarOpen(true)}
                className="min-h-[38px] pressable flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white transition"
              >
                <Calendar className="w-3.5 h-3.5 text-[#FF2636]" />
                <span>All Fixtures ({liveSchedule.upcoming.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Boot Room Live (Tactical Visualisation + Momentum Split) */}
        {activeTab === "boot-room" && (
          <div className="w-full flex flex-col gap-3.5 min-h-0">
            {/* Live Match Scoreboard View */}
            {(activeMatch?.type === "LIVE" || activeMatch?.type === "MATCHDAY" || activeMatch?.isMatchday) && (
              <LiveScoreboard
                key={activeMatch.id}
                activeMatch={activeMatch}
                onPhaseChange={setMatchdayPhase}
              />
            )}

            {/* Tactical Pitch Canvas & Match Momentum */}
            <div className="w-full flex flex-col lg:flex-row items-start gap-4">
              {/* Left 2/3 Tactical Pitch Canvas */}
              <div className="flex-1 lg:w-2/3 w-full flex flex-col overflow-hidden">
                <PitchCanvas
                  activeMatch={activeMatch}
                  overlayMode={overlayMode}
                  selectedPlayer={selectedPlayer}
                  setSelectedPlayer={setSelectedPlayer}
                  lineupStatus={
                    activeMatch?.type === "MATCHDAY" || activeMatch?.isMatchday
                      ? isLineupConfirmed(matchdayPhase)
                        ? "confirmed"
                        : "predicted"
                      : null
                  }
                />
              </div>

              {/* Right 1/3 Metrics & Match Momentum Controller */}
              <div className="lg:w-1/3 w-full flex flex-col gap-4">
                <MomentumChart
                  activeMatch={activeMatch}
                  overlayMode={overlayMode}
                  setOverlayMode={setOverlayMode}
                  selectedPlayer={selectedPlayer}
                  setSelectedPlayer={setSelectedPlayer}
                  lineupStatus={
                    activeMatch?.type === "MATCHDAY" || activeMatch?.isMatchday
                      ? isLineupConfirmed(matchdayPhase)
                        ? "confirmed"
                        : "predicted"
                      : null
                  }
                />

                {/* Real Live Premier League Standings */}
                <StandingsTable
                  selectedClubId={selectedClubId}
                  onSelectClub={(id) => setSelectedClubId(id)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Latest Club News */}
        {activeTab === "club-news" && (
          <ClubNewsView selectedClubId={selectedClubId} />
        )}

        {/* Tab 3: Match Archives */}
        {(activeTab === "match-archives" || activeTab === "time-machine") && (
          <div className="flex flex-col gap-4">
            <PostMatchTacticalArchive match={activeMatch} />
            <TimeMachineView />
          </div>
        )}

        {/* Tab 4: Transfer Scout Simulator */}
        {activeTab === "transfer-scout" && <TransferScoutView />}
      </div>

      {/* Slide-over Tactical Player Dossier Drawer */}
      <PlayerDossierDrawer
        player={selectedPlayer}
        isOpen={Boolean(selectedPlayer)}
        onClose={() => setSelectedPlayer(null)}
      />

      {/* Full Season Fixtures Calendar Modal */}
      <FixturesCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        fixtures={liveSchedule.upcoming}
        onSelectFixture={(id) => setSelectedMatchId(id)}
        clubName={selectedClub.name}
      />

      {/* Global Apple & travel-kin Styled Footer */}
      <Footer setActiveTab={setActiveTab} />
    </main>
  );
}
