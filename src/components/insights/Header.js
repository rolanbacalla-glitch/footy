"use client";

import React, { useState, useEffect } from "react";
import { Shield, Activity, Newspaper, Clock, UserSearch, Radio } from "lucide-react";

export default function Header({ activeTab, setActiveTab }) {
  const [matchData, setMatchData] = useState({
    nextMatch: null,
    lastMatch: null,
  });

  useEffect(() => {
    async function fetchLiveStatus() {
      try {
        const res = await fetch("/api/live-fixtures");
        if (res.ok) {
          const data = await res.json();
          setMatchData({
            nextMatch:
              data.nextMatch ||
              (data.matches && data.matches.find((m) => m.status === "SCHEDULED")),
            lastMatch:
              data.lastMatch ||
              (data.matches &&
                data.matches.filter((m) => m.status === "FINISHED").pop()),
          });
        }
      } catch (e) {
        // Silent degrade
      }
    }
    fetchLiveStatus();
  }, []);

  const tabs = [
    { id: "boot-room", label: "Boot Room", icon: Activity },
    { id: "club-news", label: "Club News", icon: Newspaper },
    { id: "match-archives", label: "Match Archives", icon: Clock },
    { id: "transfer-scout", label: "Transfer Scout", icon: UserSearch },
  ];

  const nextMatch = matchData.nextMatch;
  const lastMatch = matchData.lastMatch;

  return (
    <header className="sticky top-0 z-50 apple-glass border-b px-3 sm:px-5 md:px-6 py-2.5">
      <div className="max-w-[1680px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand Emblem & SF Pro Wordmark */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-[11px] bg-gradient-to-b from-[#C8102E] to-[#8A0A1D] shadow-[0_4px_16px_rgba(200,16,46,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] shrink-0">
              <Shield className="w-[18px] h-[18px] text-white" strokeWidth={2.2} />
              <span
                aria-hidden="true"
                className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5"
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30D158] opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#30D158] ring-2 ring-[#13141B]" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[17px] sm:text-[19px] font-semibold tracking-[-0.025em] text-white leading-tight">
                  Anfield <span className="text-[#E03535]">Insights</span>
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-medium tracking-[0.02em] rounded-full bg-[#00BFA5]/14 text-[#00BFA5] border border-[#00BFA5]/25">
                  2026/27 • Iraola Era
                </span>
              </div>
              <p className="text-[11px] text-[#EBEBF5]/65 tracking-[-0.005em] hidden xs:block">
                Liverpool FC Tactical &amp; Recruitment Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Apple Sports-Style Live Match Pill */}
        <div className="hidden xl:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#13141B]/92 border border-white/[0.08] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.08)] text-xs">
          <Radio
            className="w-3.5 h-3.5 text-[#E03535] animate-pulse shrink-0"
            strokeWidth={2.2}
          />

          {nextMatch ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#E5B338] tracking-[0.04em] uppercase text-[10px] bg-[#E5B338]/12 px-2 py-0.5 rounded-full border border-[#E5B338]/25">
                Next
              </span>
              <span className="font-semibold text-white tracking-[-0.01em]">
                {nextMatch.homeTeam} vs {nextMatch.awayTeam}
              </span>
              <span className="text-[#EBEBF5]/35">•</span>
              <span className="text-[#00BFA5] font-medium">{nextMatch.competition}</span>
              <span className="text-[#EBEBF5]/35">•</span>
              <span className="text-[#EBEBF5]/68 text-[11px]">{nextMatch.venue}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Anfield • The Kop Stand</span>
              <span className="text-[#EBEBF5]/35">•</span>
              <span className="text-[#00BFA5] font-medium">
                Andoni Iraola (4-2-3-1 Vertical Press)
              </span>
            </div>
          )}

          {lastMatch && (
            <div className="flex items-center gap-1.5 pl-2.5 border-l border-white/10 text-[11px] text-[#EBEBF5]/68">
              <span>Last</span>
              <span className="text-white font-semibold tabular-nums">
                {lastMatch.homeTeam} {lastMatch.homeScore}–{lastMatch.awayScore}{" "}
                {lastMatch.awayTeam}
              </span>
            </div>
          )}
        </div>

        {/* Apple iOS/macOS Segmented Navigation Control */}
        <nav
          aria-label="Primary workspaces"
          className="apple-segmented flex items-center gap-1 p-1 rounded-full w-full sm:w-auto justify-between sm:justify-start overflow-x-auto"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-current={isActive ? "page" : undefined}
                className={`min-h-[36px] flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-[-0.01em] transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-[#C8102E] text-white shadow-[0_2px_12px_rgba(200,16,46,0.45),inset_0_0.5px_0_rgba(255,255,255,0.25)]"
                    : "text-[#EBEBF5]/72 hover:text-white hover:bg-white/[0.07]"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2.1} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
