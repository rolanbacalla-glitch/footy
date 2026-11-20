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

  const [selectedMatchId, setSelectedMatchId] = useState(MATCH_LIBRARY[0].id);
  const [overlayMode, setOverlayMode] = useState("pass"); // 'pass' | 'heat' | 'shots'
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [matchdayPhase, setMatchdayPhase] = useState("BUILD_UP");
  const [liveSchedule, setLiveSchedule] = useState({ upcoming: [], recent: [] });
  const [scheduleFilter, setScheduleFilter] = useState("all"); // 'all' | 'upcoming' | 'recent'
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Hydrate real fixture schedule from ESPN live endpoint
  useEffect(() => {
    let cancelled = false;
    fetch("/api/schedule")
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
  }, []);

  // Restore & persist active tab across reloads, browser hibernation, and navigation
  useEffect(() => {
    // Keep URL hash in sync with active tab on mount without scrolling
    if (window.location.hash !== `#${activeTab}`) {
      window.history.replaceState(null, "", `#${activeTab}`);
    }

    // Listen to browser navigation / hashchange (Back and Forward buttons)
    const handleHashChange = () => {
      const newTab = resolveTabName(window.location.hash);
      if (newTab) {
        setActiveTabState(newTab);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [activeTab]);

  // Public setter that persists state to localStorage and keeps URL hash updated
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

  const activeMatch =
    MATCH_LIBRARY.find((m) => m.id === selectedMatchId) || MATCH_LIBRARY[0];

  return (
    <main className="relative min-h-screen w-full flex flex-col bg-[#050608] text-white overflow-x-hidden select-none">
      {/* Dynamic Ambient Glassmorphism Light Pools (Subtle LFC Crimson & Deep Emerald Atmosphere) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden z-0"
      >
        <div className="absolute -top-[140px] left-[8%] w-[540px] h-[540px] rounded-full bg-gradient-to-br from-[#E31B23]/14 via-[#C8102E]/8 to-transparent blur-[130px] animate-ambient-pulse" />
        <div className="absolute top-[32%] -right-[100px] w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-[#FF2636]/12 via-[#8A0713]/6 to-transparent blur-[140px] animate-ambient-pulse" style={{ animationDelay: '-4s' }} />
        <div className="absolute -bottom-[120px] left-[25%] w-[620px] h-[620px] rounded-full bg-gradient-to-tr from-[#0E281A]/18 via-[#103020]/8 to-transparent blur-[150px]" />
      </div>

      {/* 1. Persistent Apple Liquid Glass Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeMatch={activeMatch}
      />

      {/* 2. Main Body Dashboard Viewport (pt-20 sm:pt-24 for fixed travel-kin header) */}
      <div className="relative z-10 flex-1 px-3 py-3 sm:px-5 sm:py-4 pt-20 sm:pt-24 flex flex-col gap-3.5 max-w-[1680px] w-full mx-auto">
        {/* Universal Match Centre Fixture Ribbon (Apple Sports inspired pill bar) */}
        {activeTab === "boot-room" && (
          <div className="flex flex-col gap-1.5 shrink-0">
            <div className="flex items-center justify-between gap-2 px-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8E8E93] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#E31B23]" strokeWidth={2} />
                Match Centre • Real ESPN Fixtures
              </span>

              {/* Live source attribution badge */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/50 flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/[0.06]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Live Official Feed ({liveSchedule.upcoming.length + liveSchedule.recent.length} Matches)
                </span>
              </div>
            </div>

            <div
              role="tablist"
              aria-label="Match Centre fixtures"
              className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
            >
              {/* 1. Next Single Upcoming Fixture (Left of Upcoming) */}
              {(() => {
                const nextFx = liveSchedule.upcoming.find(
                  (fx) => !fx.opponent?.toLowerCase().includes("manchester united")
                );
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

              {/* 2. Primary Focus Match (Today's Live or Upcoming Derby) */}
              {(() => {
                const primaryMatch = MATCH_LIBRARY.find((m) => m.isMatchday || m.type === "MATCHDAY" || m.isLive);
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

              {/* 3. Immediate Last Result (Right of Upcoming/Focus Match) */}
              {(() => {
                const lastGame = MATCH_LIBRARY.find((m) => m.type === "RECENT");
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
            {/* Live Match Scoreboard View — Available during matchday and live in-play */}
            {(activeMatch?.type === "LIVE" || activeMatch?.type === "MATCHDAY" || activeMatch?.isMatchday) && (
              <LiveScoreboard
                key={activeMatch.id}
                activeMatch={activeMatch}
                onPhaseChange={setMatchdayPhase}
              />
            )}

            {/* Tactical Pitch Canvas & Match Momentum */}
            <div className="w-full flex flex-col lg:flex-row gap-4">
              {/* Left 2/3 Tactical Pitch Canvas — Zero inner scrolling */}
              <div className="flex-1 lg:w-2/3 flex flex-col overflow-hidden">
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
              <div className="lg:w-1/3 flex flex-col gap-4">
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
                <StandingsTable />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Latest Club News (Top 10 Most Recent Free Sources) */}
        {activeTab === "club-news" && <ClubNewsView />}

        {/* Tab 3: Anfield Match Archives */}
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
      />

      {/* Global Apple & travel-kin Styled Footer */}
      <Footer setActiveTab={setActiveTab} />
    </main>
  );
}
