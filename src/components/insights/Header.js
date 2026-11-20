"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Activity, Newspaper, Clock, UserSearch, Menu, X } from "lucide-react";
import FootballLogo from "./FootballLogo";

export default function Header({ activeTab, setActiveTab }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tabs = [
    { id: "boot-room", label: "Boot Room", icon: Activity },
    { id: "club-news", label: "Club News", icon: Newspaper },
    { id: "match-archives", label: "Match Archives", icon: Clock },
    { id: "transfer-scout", label: "Transfer Scout", icon: UserSearch },
  ];

  return (
    <>
      <header
        aria-label="Main navigation"
        className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow,backdrop-filter,padding,margin] duration-300 flex justify-center ${
          isScrolled
            ? "px-4 pt-3"
            : "px-4 sm:px-8 py-3.5 bg-[#050608]/90 backdrop-blur-xl border-b border-white/[0.08]"
        }`}
      >
        <div
          className={`w-full max-w-[1680px] flex items-center justify-between transition-all duration-300 ${
            isScrolled
              ? "rounded-2xl bg-[#0B0C10]/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.7)] px-4 sm:px-6 py-2.5 border border-white/15"
              : ""
          }`}
        >
          {/* Logo Brand / Emblem (travel-kin layout pattern) */}
          <Link
            href="#boot-room"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("boot-room");
            }}
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2636] rounded-xl"
            aria-label="Football Insights — home"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#E31B23]/25 via-white/[0.05] to-black/80 border border-white/15 shrink-0 p-1 group-hover:border-[#FF2636]/60 transition-colors shadow-sm">
              <FootballLogo className="w-8 h-8" isLive={true} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
                  Football <span className="text-[#FF2636]">Insights</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-full bg-[#E31B23]/15 text-white/90 border border-[#E31B23]/30">
                  2026/27 • Premier League
                </span>
              </div>
              <p className="text-[11px] text-[#8E8E93] tracking-tight hidden md:block">
                Tactical, Statistical &amp; Recruitment Intelligence
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links (travel-kin spaced pill style) */}
          <nav
            aria-label="Primary workspaces"
            className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-white/[0.04] p-1 rounded-full border border-white/[0.08] backdrop-blur-md"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#FF2636] text-white shadow-[0_0_12px_rgba(255,38,54,0.4)]"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Desktop Right Action Area (Matchday Hub indicator pill inspired by travel-kin profile/explore) */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => setActiveTab("boot-room")}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-full border border-white/10 backdrop-blur-md transition-all active:scale-95 cursor-pointer text-xs font-semibold"
            >
              <span className="w-2 h-2 rounded-full bg-[#FF2636] animate-pulse" />
              <span>North-West Derby</span>
            </button>
            <button
              onClick={() => setActiveTab("boot-room")}
              className="px-4 py-1.5 bg-[#FF2636] hover:bg-[#E31B23] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-[0_0_14px_rgba(255,38,54,0.35)] transition-all duration-200 active:scale-95 cursor-pointer"
            >
              Tactical Hub
            </button>
          </div>

          {/* Mobile Menu Toggle Button (travel-kin pattern) */}
          <button
            aria-label="Open navigation menu"
            className="md:hidden text-white p-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-[#FF2636] cursor-pointer"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay (travel-kin MobileMenu pattern) */}
      {isMobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          className="fixed inset-0 z-[100] bg-[#08090D]/95 backdrop-blur-2xl text-white flex flex-col p-6 animate-fade-in md:hidden"
        >
          <div className="flex items-center justify-between pb-5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <FootballLogo className="w-7 h-7" isLive={false} />
              <span className="text-lg font-bold tracking-tight">
                Football <span className="text-[#FF2636]">Insights</span>
              </span>
            </div>
            <button
              aria-label="Close navigation menu"
              className="p-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <nav className="flex flex-col space-y-2 mt-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left cursor-pointer ${
                    isActive
                      ? "bg-[#FF2636] text-white shadow-lg"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-2.5">
            <div className="text-xs text-white/50 text-center font-mono">
              2026/27 Season • Andoni Iraola Era
            </div>
          </div>
        </div>
      )}
    </>
  );
}
