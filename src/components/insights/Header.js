"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Shield, Activity, Newspaper, Clock, UserSearch, Radio } from "lucide-react";

export default function Header({ activeTab, setActiveTab, activeMatch }) {
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
    <header className="sticky top-0 z-50 bg-[#08090D]/80 backdrop-blur-2xl border-b border-white/[0.09] shadow-[0_4px_30px_rgba(0,0,0,0.5)] px-3 sm:px-5 md:px-6 py-2.5">
      <div className="max-w-[1680px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand Emblem & SF Pro Wordmark */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-[12px] glass-crimson-card shrink-0 p-1">
              <Shield
                className="w-5 h-5 text-white fill-white/10"
                strokeWidth={2}
              />
              <span
                aria-hidden="true"
                className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5"
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2636] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF2636] ring-2 ring-[#121212]" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[17px] sm:text-[19px] font-bold tracking-[-0.025em] text-white leading-tight">
                  Anfield <span className="text-[#FF2636]">Insights</span>
                </h1>
                <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.02em] rounded-full bg-[#E31B23]/15 text-[#FF4D5A] border border-[#E31B23]/30">
                  2026/27 • Iraola Era
                </span>
              </div>
              <p className="text-[11px] text-[#8E8E93] tracking-[-0.005em] hidden xs:block">
                Liverpool FC Tactical &amp; Recruitment Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Frosted Liquid Glass Segmented Navigation */}
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
                className={`min-h-[36px] pressable flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-[-0.01em] cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "glass-crimson-pill text-white"
                    : "text-[#8E8E93] hover:text-white hover:bg-white/[0.08]"
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
