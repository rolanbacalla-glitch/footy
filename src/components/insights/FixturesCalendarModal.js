"use client";

import React, { useState } from "react";
import { Calendar, X, Tv, MapPin, Clock, ArrowUpRight } from "lucide-react";

export default function FixturesCalendarModal({
  isOpen,
  onClose,
  fixtures = [],
  onSelectFixture,
  clubName = "Liverpool",
}) {
  const [filter, setFilter] = useState("all");

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
      aria-label="Full season fixtures schedule"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-card-deep relative w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D2F865]/15 border border-[#D2F865]/30 flex items-center justify-center text-[#D2F865]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-semibold text-white tracking-tight">
                {clubName} Fixture Schedule
              </h3>
              <p className="text-xs text-[#8A8D96] mt-0.5">
                Official Premier League &amp; Cup calendar · {fixtures.length} upcoming matches
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-[#8A8D96] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close fixtures schedule"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-5 sm:px-6 py-3 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
          <div className="glass-segmented inline-flex items-center p-1 rounded-full gap-0.5">
            {[
              { id: "all", label: `All (${fixtures.length})` },
              { id: "home", label: "Home" },
              { id: "away", label: "Away" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`min-h-[30px] px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  filter === tab.id
                    ? "bg-[#D2F865] text-[#0E100C] font-semibold"
                    : "text-[#8A8D96] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-[#6F727C] font-mono">
            All times UK (GMT)
          </span>
        </div>

        {/* Fixtures List */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-2.5 flex-1">
          {filteredFixtures.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#8A8D96]">
              No fixtures found for this filter.
            </div>
          ) : (
            filteredFixtures.map((fx) => {
              const dateObj = new Date(fx.date);
              const dateStr = dateObj.toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
                month: "short",
              });
              const timeStr = dateObj.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={fx.id}
                  className="glass-tile p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-semibold ${
                          fx.isHome ? "text-[#D2F865]" : "text-[#8BA3F5]"
                        }`}
                      >
                        {fx.isHome ? "HOME" : "AWAY"}
                      </span>
                      <span className="text-sm font-medium text-white truncate">
                        {fx.isHome
                          ? `${clubName} vs ${fx.opponent}`
                          : `${fx.opponent} vs ${clubName}`}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1 text-xs text-[#8A8D96]">
                      <span className="flex items-center gap-1 font-mono tabular-nums">
                        <Clock className="w-3 h-3" />
                        {dateStr} · {timeStr}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {fx.venue}
                      </span>
                      {fx.broadcast && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1">
                            <Tv className="w-3 h-3 shrink-0" />
                            {fx.broadcast}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectFixture) onSelectFixture(fx.id);
                      onClose();
                    }}
                    className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-[#D2F865] text-white hover:text-[#0E100C] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title="Load into Match Centre"
                    aria-label={`Load ${fx.opponent} fixture into Match Centre`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-white/[0.07] flex items-center justify-between text-xs text-[#6F727C]">
          <span>Fixture dates subject to UK broadcast scheduling</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-white/[0.07] hover:bg-white/[0.12] text-white font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
