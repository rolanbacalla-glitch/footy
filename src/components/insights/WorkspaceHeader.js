"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { PREMIER_LEAGUE_MANAGERS } from "../../data/premierLeagueManagers";
import ClubBadge from "./ClubBadge";

const WORKSPACE_META = {
  "boot-room": {
    title: "Match Centre",
    subtitle: "Live tactical intelligence & spatial telemetry",
  },
  standings: {
    title: "League Table",
    subtitle: "2026/27 Premier League live standings & form",
  },
  "club-news": {
    title: "Club News",
    subtitle: "Verified press wire & squad headlines",
  },
  "match-archives": {
    title: "Match Archives",
    subtitle: "Post-match shot maps & historical reconstructions",
  },
  "time-machine": {
    title: "Match Archives",
    subtitle: "Post-match shot maps & historical reconstructions",
  },
  "transfer-scout": {
    title: "Transfer Scout",
    subtitle: "Recruitment radar & pressing profile filters",
  },
};

export default function WorkspaceHeader({
  activeTab,
  selectedClubId,
  setSelectedClubId,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const currentClubId = selectedClubId || "364";
  const selectedClub =
    PREMIER_LEAGUE_MANAGERS[currentClubId] || PREMIER_LEAGUE_MANAGERS["364"];
  const meta = WORKSPACE_META[activeTab] || WORKSPACE_META["boot-room"];

  const clubList = Object.entries(PREMIER_LEAGUE_MANAGERS)
    .map(([id, info]) => ({ id, ...info }))
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((club) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        club.name.toLowerCase().includes(q) ||
        club.manager.toLowerCase().includes(q) ||
        club.shortName.toLowerCase().includes(q)
      );
    });

  return (
    <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-1">
      {/* Left: Crisp Display Title + Quiet Subtitle (Matches reference "Stats / MONTHLY UPDATES") */}
      <div className="min-w-0">
        <h1 className="font-display text-2xl sm:text-[32px] font-semibold tracking-[-0.025em] text-white leading-tight text-balance">
          {meta.title}
        </h1>
        <p className="text-xs sm:text-[13px] text-[#8A8D96] mt-1 tracking-wide">
          {meta.subtitle}
          <span aria-hidden="true" className="mx-2 text-white/20">
            ·
          </span>
          <span className="text-[#D4D6DC]/80">{selectedClub.manager}</span>
          <span aria-hidden="true" className="mx-2 text-white/20">
            ·
          </span>
          <span className="font-mono text-[#8A8D96]">{selectedClub.formation}</span>
        </p>
      </div>

      {/* Right: Clean Obsidian Glass Club Selector Pill (Matches reference "iOS App Project ⌄") */}
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={`Selected club: ${selectedClub.name}. Change Premier League club.`}
          className="min-h-[44px] flex items-center justify-between gap-4 pl-4 pr-4 py-2 rounded-full bg-[#0E0F12]/90 hover:bg-[#16181D] border border-white/[0.09] hover:border-white/[0.16] backdrop-blur-xl text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.65)] transition-all cursor-pointer min-w-[205px]"
        >
          <span className="flex items-center gap-2.5 truncate">
            <ClubBadge
              clubId={selectedClub.id}
              name={selectedClub.name}
              shortName={selectedClub.shortName}
              primaryColor={selectedClub.primaryColor}
              secondaryColor={selectedClub.secondaryColor}
              size="xs"
            />
            <span className="truncate whitespace-nowrap">{selectedClub.name}</span>
          </span>
          <ChevronDown
            className={`w-4 h-4 text-[#8A8D96] shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-white" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div
            role="listbox"
            aria-label="Premier League clubs"
            className="absolute right-0 top-full mt-2.5 w-72 sm:w-80 rounded-[22px] bg-[#14151A]/95 backdrop-blur-2xl border border-white/[0.12] p-2.5 shadow-[0_24px_60px_rgba(0,0,0,0.85)] z-50 animate-fade-in"
          >
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-[#8A8D96] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search club or head coach..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-xs text-white placeholder:text-[#5E616B] focus:outline-none focus:border-[#D2F865]/50"
              />
            </div>

            <div className="max-h-[340px] overflow-y-auto space-y-0.5 pr-0.5">
              {clubList.map((club) => {
                const isSelected = club.id === currentClubId;
                return (
                  <button
                    key={club.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setSelectedClubId(club.id);
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-[#D2F865]/15 text-white border border-[#D2F865]/30"
                        : "text-[#D4D6DC] hover:bg-white/[0.05] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ClubBadge
                        clubId={club.id}
                        name={club.name}
                        shortName={club.shortName}
                        primaryColor={club.primaryColor}
                        secondaryColor={club.secondaryColor}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-white truncate">
                          {club.name}
                        </div>
                        <div className="text-[11px] text-[#8A8D96] truncate">
                          {club.manager} · {club.formation}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#D2F865] shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
              {clubList.length === 0 && (
                <div className="py-6 text-center text-xs text-[#8A8D96]">
                  No clubs matching &ldquo;{query}&rdquo;
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
