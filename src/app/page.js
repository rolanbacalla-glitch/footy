"use client";

import React, { useState } from "react";
import Header from "../components/insights/Header";
import PitchCanvas from "../components/insights/PitchCanvas";
import MomentumChart from "../components/insights/MomentumChart";
import TimeMachineView from "../components/insights/TimeMachineView";
import TransferScoutView from "../components/insights/TransferScoutView";
import ClubNewsView from "../components/insights/ClubNewsView";
import { MATCH_LIBRARY } from "../data/matchLibrary";
import { Calendar } from "lucide-react";

export default function AnfieldInsightsDashboard() {
  const [activeTab, setActiveTab] = useState("boot-room");
  const [selectedMatchId, setSelectedMatchId] = useState(MATCH_LIBRARY[0].id);
  const [overlayMode, setOverlayMode] = useState("pass"); // 'pass' | 'heat' | 'shots'
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const activeMatch =
    MATCH_LIBRARY.find((m) => m.id === selectedMatchId) || MATCH_LIBRARY[0];

  return (
    <main className="min-h-screen lg:h-screen w-full flex flex-col bg-[#000000] text-white overflow-x-hidden lg:overflow-hidden select-none">
      {/* 1. Persistent Apple Liquid Glass Navigation Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. Main Body Dashboard Viewport */}
      <div className="flex-1 px-3 py-3 sm:px-5 sm:py-4 flex flex-col overflow-y-auto lg:overflow-hidden gap-3.5 max-w-[1680px] w-full mx-auto">
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

              return (
                <button
                  key={m.id}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => {
                    setSelectedMatchId(m.id);
                    setSelectedPlayer(null);
                  }}
                  className={`min-h-[38px] flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer border ${
                    isSelected
                      ? "glass-crimson-pill text-white"
                      : "bg-[#181818] border-white/[0.08] text-[#8E8E93] hover:text-white hover:bg-[#222222]"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isUpcoming
                        ? "bg-[#FFD60A] shadow-[0_0_8px_rgba(255,214,10,0.65)]"
                        : isSelected
                          ? "bg-white shadow-[0_0_8px_#FFFFFF]"
                          : "bg-[#E31B23]"
                    }`}
                  />
                  <span className="tracking-[-0.01em]">{m.title}</span>
                  <span
                    className={`text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-full ${
                      isSelected
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
          <div className="w-full flex-1 flex flex-col lg:flex-row gap-4 overflow-y-auto lg:overflow-hidden min-h-0">
            {/* Left 2/3 Tactical Pitch Canvas */}
            <div className="flex-1 lg:w-2/3 h-[460px] lg:h-full">
              <PitchCanvas
                activeMatch={activeMatch}
                overlayMode={overlayMode}
                selectedPlayer={selectedPlayer}
                setSelectedPlayer={setSelectedPlayer}
              />
            </div>

            {/* Right 1/3 Metrics & Match Momentum Controller */}
            <div className="lg:w-1/3 overflow-y-auto pr-0.5">
              <MomentumChart
                activeMatch={activeMatch}
                overlayMode={overlayMode}
                setOverlayMode={setOverlayMode}
                selectedPlayer={selectedPlayer}
                setSelectedPlayer={setSelectedPlayer}
              />
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
