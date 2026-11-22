"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

export default function Footer() {
  const [modalType, setModalType] = useState(null);

  const links = [
    { id: "about", label: "About" },
    { id: "privacy", label: "Privacy & UK GDPR" },
    { id: "cookies", label: "Cookies" },
    { id: "terms", label: "Terms" },
    { id: "disclaimer", label: "Editorial Notice" },
  ];

  return (
    <>
      <footer className="w-full pt-8 pb-6 mt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6F727C] select-none">
        <div>
          © {new Date().getFullYear()} Football Insights · Independent Premier League analytics publication
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {links.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setModalType(item.id)}
              className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              {item.label}
            </button>
          ))}
        </div>
      </footer>

      {modalType && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          onClick={() => setModalType(null)}
        >
          <div
            className="glass-card-deep relative w-full max-w-lg p-6 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
              <h3 className="font-display text-lg font-semibold text-white">
                {modalType === "about" && "About Football Insights"}
                {modalType === "cookies" && "Cookie & Storage Preferences"}
                {modalType === "privacy" && "Privacy Notice & UK GDPR"}
                {modalType === "terms" && "Terms of Service"}
                {modalType === "disclaimer" && "Trademark & Editorial Notice"}
              </h3>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[#8A8D96] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-sm text-[#B7BAC3] space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              {modalType === "about" && (
                <>
                  <p>
                    <strong className="text-white">Football Insights</strong> is an independent digital analytics publication dedicated to providing supporters, analysts, and tacticians with rigorous, data-driven match intelligence for Premier League football.
                  </p>
                  <p>
                    We combine live Premier League fixtures, spatial pass visualisations, and expected goals (xG) telemetry into a calm, distraction-free analytical workspace.
                  </p>
                </>
              )}
              {modalType === "cookies" && (
                <p>
                  Football Insights uses minimal local browser storage solely to remember your active workspace tab and selected club between sessions. No third-party advertising cookies or marketing trackers are deployed.
                </p>
              )}
              {modalType === "privacy" && (
                <p>
                  Processed in full compliance with UK GDPR and the Data Protection Act 2018. No personally identifiable information is sold, leased, or shared with third parties.
                </p>
              )}
              {modalType === "terms" && (
                <p>
                  All mathematical projections, Expected Goals (xG), and On-Ball Value (OBV) visualisations are provided strictly for journalistic and educational analysis, not betting advice.
                </p>
              )}
              {modalType === "disclaimer" && (
                <p>
                  Football Insights is an independent sports analytics publication and is not affiliated, associated, authorised, or endorsed by any football club or the Premier League.
                </p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.08] flex justify-end">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="px-5 py-2 rounded-full lime-pill text-xs font-semibold cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
