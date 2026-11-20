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

export default function AnfieldInsightsDashboard() {
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
      fromStorage = resolveTabName(localStorage.getItem("anfield_active_tab"));
    } catch {
      // Storage unavailable
    }
    return fromHash || fromQuery || fromStorage || "boot-room";
  });

  const [selectedMatchId, setSelectedMatchId] = useState(MATCH_LIBRARY[0].id);
  const [overlayMode, setOverlayMode] = useState("pass"); // 'pass' | 'heat' | 'shots'
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [matchdayPhase, setMatchdayPhase] = useState("BUILD_UP");

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
      localStorage.setItem("anfield_active_tab", valid);
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

      {/* 2. Main Body Dashboard Viewport */}
      <div className="relative z-10 flex-1 px-3 py-3 sm:px-5 sm:py-4 flex flex-col gap-3.5 max-w-[1680px] w-full mx-auto">
        {/* Universal Match Centre Fixture Ribbon (Apple Sports inspired pill bar) */}
        {activeTab === "boot-room" && (
          <div
            role="tablist"
            aria-label="Match Centre fixtures"
            className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8E8E93] shrink-0 flex items-center gap-1.5 pl-1 pr-1">
              <Calendar className="w-3.5 h-3.5 text-[#E31B23]" strokeWidth={2} />
              Match Centre
            </span>

            {MATCH_LIBRARY.map((m) => {
              const isSelected = m.id === selectedMatchId;
              const isUpcoming = m.type === "UPCOMING";
              const isLive = m.type === "LIVE" || m.isLive;
              const isMatchday = m.type === "MATCHDAY" || m.isMatchday;

              return (
                <button
                  key={m.id}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => {
                    setSelectedMatchId(m.id);
                    setSelectedPlayer(null);
                  }}
                  className={`min-h-[38px] pressable flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer border ${
                    isSelected
                      ? "glass-crimson-pill text-white"
                      : "apple-tile border-white/[0.08] text-[#8E8E93] hover:text-white"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isLive
                        ? "bg-[#FF2636] animate-pulse shadow-[0_0_10px_#FF2636]"
                        : isMatchday
                          ? "bg-[#F1B82D] animate-pulse shadow-[0_0_8px_rgba(241,184,45,0.7)]"
                          : isUpcoming
                            ? "bg-[#FFD60A] shadow-[0_0_8px_rgba(255,214,10,0.65)]"
                            : isSelected
                              ? "bg-white shadow-[0_0_8px_#FFFFFF]"
                              : "bg-[#E31B23]"
                    }`}
                  />
                  <span className="tracking-[-0.01em] flex items-center gap-1.5">
                    {m.awayCrest && (
                      <Image
                        src={m.awayCrest}
                        alt=""
                        width={14}
                        height={14}
                        unoptimized
                        className="w-3.5 h-3.5 object-contain inline-block opacity-85"
                      />
                    )}
                    {m.title}
                  </span>
                  <span
                    className={`text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-full ${
                      isLive
                        ? "bg-[#FF2636]/25 text-[#FF6961] border border-[#FF2636]/40 font-bold animate-pulse"
                        : isMatchday
                          ? "bg-[#F1B82D]/20 text-[#F1B82D] border border-[#F1B82D]/35 font-bold"
                          : isSelected
                            ? "bg-black/40 text-white border border-white/25 shadow-inner"
                            : "bg-black/40 text-[#8E8E93] border border-white/[0.06]"
                    }`}
                  >
                    {m.statusText}
                  </span>
                </button>
              );
            })}
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
              <div className="lg:w-1/3">
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
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Latest Club News (Top 10 Most Recent Free Sources) */}
        {activeTab === "club-news" && <ClubNewsView />}

        {/* Tab 3: Anfield Match Archives */}
        {(activeTab === "match-archives" || activeTab === "time-machine") && (
          <TimeMachineView />
        )}

        {/* Tab 4: Transfer Scout Simulator */}
        {activeTab === "transfer-scout" && <TransferScoutView />}
      </div>
    </main>
  );
}
