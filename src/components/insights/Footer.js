"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Cookie, FileText, Lock, Activity, Radio, ExternalLink, X } from "lucide-react";

export default function Footer({ setActiveTab }) {
  const [modalType, setModalType] = useState(null); // "cookies" | "privacy" | "terms" | "disclaimer" | null

  return (
    <>
      <footer className="w-full bg-[#080B0E] border-t border-white/[0.08] text-white pt-16 pb-12 px-4 sm:px-6 md:px-8 mt-16 select-none relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Main 4-Column Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Col 1 & 2: Brand & Tactical Mission Statement */}
            <div className="col-span-1 md:col-span-2">
              <Link
                href="/"
                className="text-2xl sm:text-3xl font-extrabold tracking-[-0.03em] text-white mb-4 block"
              >
                Anfield <span className="text-[#FF2636]">Insights</span>
              </Link>
              <p className="text-[#8E8E93] text-sm max-w-md mb-6 leading-relaxed">
                Independent real-time tactical intelligence, spatial pass telemetry, and performance analytics for Liverpool FC. Engineered with live Premier League feeds, Opta spatial matrices, and DeepMind TacticAI set-piece evaluation models.
              </p>

              {/* Real-Time Engine Trust Indicators */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/80">
                  <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse" />
                  Live Feeds Verified
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#8E8E93]">
                  <Activity className="w-3 h-3 text-[#FF2636]" />
                  Adaptive 15s / 60s Stream
                </span>
              </div>
            </div>

            {/* Col 3: Intelligence Workspaces */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-[0.16em] text-[#FF2636] mb-5">
                Tactical Workspaces
              </h4>
              <ul className="space-y-3 text-sm">
                {[
                  { id: "boot-room", label: "Tactical Pitch & Pass Network" },
                  { id: "news", label: "Club News & Press Wire" },
                  { id: "archive", label: "Historical Match Archives" },
                  { id: "transfers", label: "Transfer & Scout Terminal" },
                ].map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (setActiveTab) setActiveTab(item.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-[#8E8E93] hover:text-white transition-colors cursor-pointer text-left"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Platform Compliance & Data Sources */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-[0.16em] text-[#FF2636] mb-5">
                Data & Governance
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <button
                    type="button"
                    onClick={() => setModalType("cookies")}
                    className="text-[#8E8E93] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Cookie className="w-3.5 h-3.5 text-white/60" />
                    Cookie Preferences
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setModalType("privacy")}
                    className="text-[#8E8E93] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-white/60" />
                    Privacy & GDPR
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setModalType("terms")}
                    className="text-[#8E8E93] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-white/60" />
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setModalType("disclaimer")}
                    className="text-[#8E8E93] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#FF2636]" />
                    Trademark Notice
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Utility Bar: Copyright & Mandatory Legal Disclaimers */}
          <div className="pt-8 border-t border-white/[0.08] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#8E8E93]">
            <div className="flex items-center gap-2">
              <span>© {new Date().getFullYear()} Anfield Insights. All rights reserved.</span>
            </div>

            {/* Editorial Disclaimer */}
            <div className="text-[11px] text-[#8E8E93]/70 text-center md:text-right max-w-xl">
              Anfield Insights is an independent analytical publication and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Liverpool FC or the Premier League.
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Compliance Modal Dialog */}
      {modalType && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setModalType(null)}
        >
          <div
            className="apple-card relative w-full max-w-lg bg-[#0F1318] border border-white/15 rounded-[24px] p-6 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                {modalType === "cookies" && <Cookie className="w-5 h-5 text-[#FF2636]" />}
                {modalType === "privacy" && <Lock className="w-5 h-5 text-[#FF2636]" />}
                {modalType === "terms" && <FileText className="w-5 h-5 text-[#FF2636]" />}
                {modalType === "disclaimer" && <ShieldCheck className="w-5 h-5 text-[#FF2636]" />}
                <span>
                  {modalType === "cookies" && "Cookie & Storage Preferences"}
                  {modalType === "privacy" && "Privacy Notice & Data Protection"}
                  {modalType === "terms" && "Terms of Service"}
                  {modalType === "disclaimer" && "Trademark & Editorial Notice"}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-sm text-[#8E8E93] space-y-3 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              {modalType === "cookies" && (
                <>
                  <p>
                    Anfield Insights uses strict minimal local storage (<code className="text-white text-xs bg-white/10 px-1 py-0.5 rounded">anfield_active_tab</code>) to preserve your workspace navigation state between sessions.
                  </p>
                  <p>
                    We do not deploy intrusive third-party cross-site tracking cookies or marketing pixels. Any external telemetry queries are transmitted directly through edge APIs to public football feeds.
                  </p>
                </>
              )}

              {modalType === "privacy" && (
                <>
                  <p>
                    We take your privacy seriously in full compliance with the UK General Data Protection Regulation (UK GDPR) and Data Protection Act 2018.
                  </p>
                  <p>
                    No personal identifiable information (PII) is sold, bartered, or leased to third parties. All server-side requests are anonymised and processed strictly for telemetry performance verification.
                  </p>
                </>
              )}

              {modalType === "terms" && (
                <>
                  <p>
                    By accessing Anfield Insights, you acknowledge that all mathematical projections, Expected Goals (xG), and On-Ball Value (OBV) data models are provided strictly for educational and journalistic analysis.
                  </p>
                  <p>
                    Anfield Insights does not offer betting advice or gambling facilitation. Content may not be scraped or mirrored for commercial exploitation without prior written consent.
                  </p>
                </>
              )}

              {modalType === "disclaimer" && (
                <>
                  <p>
                    <strong>Editorial Independence:</strong> Anfield Insights is an independent sports analytics platform.
                  </p>
                  <p>
                    All club trademarks, team names, and stadium references are used solely for descriptive, nominative, and identification purposes under UK Fair Dealing provisions. No official affiliation or licensing agreement with Liverpool Football Club or the Premier League is implied.
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="px-4 py-2 bg-[#FF2636] hover:bg-[#E31B23] text-white text-xs font-bold uppercase tracking-wider rounded-full cursor-pointer transition-all active:scale-95"
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
