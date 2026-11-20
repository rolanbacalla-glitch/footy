"use client";

import React, { useState } from "react";
import {
  Calendar,
  X,
  Tv,
  MapPin,
  ChevronRight,
  Clock,
  Shield,
  ArrowUpRight,
} from "lucide-react";

export default function FixturesCalendarModal({ isOpen, onClose, fixtures = [], onSelectFixture, clubName = "Liverpool FC" }) {
  const [filter, setFilter] = useState("all"); // 'all' | 'home' | 'away'

  if (!isOpen) return null;

  const filteredFixtures = fixtures.filter((fx) => {
    if (filter === "home") return fx.isHome;
    if (filter === "away") return !fx.isHome;
    return true;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Full Season Fixtures Schedule"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] bg-[#0D1117] border border-white/[0.12] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E31B23]/15 border border-[#E31B23]/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#FF2636]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {clubName} Full Fixture Schedule
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                Official Premier League &amp; Cup campaigns • Real ESPN feed ({fixtures.length} matches)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
            aria-label="Close fixtures modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/[0.06]">
            {[
              { id: "all", label: `All (${fixtures.length})` },
              { id: "home", label: "Anfield Home" },
              { id: "away", label: "Away" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`text-[11px] px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  filter === tab.id
                    ? "bg-[#FF2636] text-white font-semibold shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-white/40 font-mono">
            All times UK (GMT)
          </span>
        </div>

        {/* Fixtures List */}
        <div className="overflow-y-auto p-5 space-y-2.5 flex-1 divide-y divide-white/[0.04]">
          {filteredFixtures.map((fx) => {
            const dateObj = new Date(fx.date);
            const dateStr = dateObj.toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const timeStr = dateObj.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={fx.id}
                className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Home / Away badge */}
                  <span
                    className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded-md shrink-0 border ${
                      fx.isHome
                        ? "bg-[#FF2636]/15 text-[#FF6961] border-[#FF2636]/30"
                        : "bg-sky-500/15 text-sky-400 border-sky-500/30"
                    }`}
                  >
                    {fx.isHome ? "HOME" : "AWAY"}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white tracking-tight truncate">
                        {fx.isHome ? `Liverpool vs ${fx.opponent}` : `${fx.opponent} vs Liverpool`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 mt-1 text-[11px] text-white/50">
                      <span className="flex items-center gap-1 font-mono text-white/70">
                        <Clock className="w-3 h-3 text-[#FF2636]" />
                        {dateStr} • {timeStr}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {fx.venue}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Broadcast & Action */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/80 flex items-center gap-1.5">
                    <Tv className="w-3 h-3 text-[#FF2636]" />
                    {fx.broadcast}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectFixture) onSelectFixture(fx.id);
                      onClose();
                    }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-[#FF2636] text-white transition cursor-pointer"
                    title="Load into tactical match centre"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-black/40 flex items-center justify-between text-xs text-white/50">
          <span>Official Premier League fixture dates subject to UK broadcast scheduling.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
