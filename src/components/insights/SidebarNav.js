"use client";

import React, { useState } from "react";
import {
  Activity,
  Trophy,
  Newspaper,
  History,
  SlidersHorizontal,
  Calendar,
  Menu,
  X,
} from "lucide-react";
import FootballLogo from "./FootballLogo";

export const NAV_WORKSPACES = [
  { id: "boot-room", label: "Match Centre", icon: Activity },
  { id: "standings", label: "League Table", icon: Trophy },
  { id: "club-news", label: "Club News", icon: Newspaper },
  { id: "match-archives", label: "Match Archives", icon: History },
  { id: "transfer-scout", label: "Transfer Scout", icon: SlidersHorizontal },
];

export default function SidebarNav({
  activeTab,
  setActiveTab,
  selectedClub,
  onOpenCalendar,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ─── Desktop Slim Left Rail (Matches reference dark obsidian rail) ─── */}
      <aside
        aria-label="Primary workspace navigation"
        className="hidden md:flex fixed top-0 left-0 bottom-0 w-[76px] z-40 flex-col items-center justify-between py-6 bg-[#101114]/90 backdrop-blur-2xl border-r border-white/[0.06]"
      >
        {/* Top Brand Emblem */}
        <button
          type="button"
          onClick={() => setActiveTab("boot-room")}
          aria-label="Football Insights — Match Centre"
          className="group relative w-11 h-11 rounded-2xl flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer"
        >
          <FootballLogo className="w-7 h-7" />
        </button>

        {/* Middle Workspace Icon Stack */}
        <nav className="flex flex-col items-center gap-2.5 w-full px-3">
          {NAV_WORKSPACES.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.id ||
              (item.id === "match-archives" && activeTab === "time-machine");

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                title={item.label}
                className={`group relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#D2F865] text-[#0E100C] shadow-[0_6px_20px_-4px_rgba(210,248,101,0.45)]"
                    : "text-[#8A8D96] hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <Icon className="w-[19px] h-[19px]" strokeWidth={isActive ? 2.2 : 1.8} />

                {/* Clean hover tooltip */}
                <span
                  role="tooltip"
                  className="pointer-events-none opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-150 absolute left-[calc(100%+12px)] whitespace-nowrap px-3 py-1.5 rounded-xl bg-[#1A1C21]/95 backdrop-blur-xl border border-white/10 text-xs font-medium text-white shadow-xl z-50"
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Club Monogram & Fixtures Quick Trigger */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={onOpenCalendar}
            aria-label="Open full fixture schedule"
            title="Full Fixture Schedule"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[#8A8D96] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <Calendar className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("standings")}
            title={`${selectedClub?.name || "Liverpool"} · ${selectedClub?.manager || ""}`}
            aria-label={`Active club: ${selectedClub?.name || "Liverpool"}`}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-mono font-bold text-white border border-white/15 shadow-inner transition-transform hover:scale-105 cursor-pointer"
            style={{
              background: `linear-gradient(145deg, ${selectedClub?.primaryColor || "#4C63B6"}, #1A1C22)`,
            }}
          >
            {(selectedClub?.shortName || "LIV").slice(0, 3)}
          </button>
        </div>
      </aside>

      {/* ─── Mobile Top Utility Bar (< md) ─── */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#101114]/92 backdrop-blur-2xl border-b border-white/[0.07]">
        <button
          type="button"
          onClick={() => setActiveTab("boot-room")}
          className="flex items-center gap-2.5 cursor-pointer"
          aria-label="Football Insights — Match Centre"
        >
          <FootballLogo className="w-7 h-7" />
          <span className="font-display text-base font-semibold tracking-tight text-white whitespace-nowrap">
            Football Insights
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCalendar}
            aria-label="Open fixtures calendar"
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.05] border border-white/[0.08] text-[#D4D6DC] cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.05] border border-white/[0.08] text-white cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ─── Mobile Navigation Drawer ─── */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-0 z-50 md:hidden bg-[#0E0F12]/95 backdrop-blur-2xl p-6 flex flex-col animate-fade-in"
        >
          <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <FootballLogo className="w-7 h-7" />
              <span className="font-display text-lg font-semibold text-white">
                Football Insights
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-2 mt-6">
            {NAV_WORKSPACES.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id ||
                (item.id === "match-archives" && activeTab === "time-machine");
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`min-h-[48px] flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-colors text-left cursor-pointer ${
                    isActive
                      ? "bg-[#D2F865] text-[#0E100C] font-semibold"
                      : "text-[#D4D6DC] hover:bg-white/[0.06]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-5 border-t border-white/[0.08] text-xs text-[#8A8D96]">
            {selectedClub?.name} · {selectedClub?.manager} · {selectedClub?.formation}
          </div>
        </div>
      )}
    </>
  );
}
