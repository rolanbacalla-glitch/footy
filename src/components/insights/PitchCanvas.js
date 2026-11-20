"use client";

import React, { useState } from "react";
import { Sparkles, RotateCcw, Compass, Layers } from "lucide-react";

export default function PitchCanvas({
  activeMatch,
  overlayMode,
  selectedPlayer,
  setSelectedPlayer,
}) {
  const [hoveredPlayer, setHoveredPlayer] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [selectedShot, setSelectedShot] = useState(null);
  const [showChannels, setShowChannels] = useState(true);
  const [pillMode, setPillMode] = useState("pills"); // "pills" | "minimal"

  const activePlayerId = selectedPlayer?.id || hoveredPlayer?.id || null;

  const startingXI = activeMatch?.startingXI || [];
  const passLinks = activeMatch?.passLinks || [];
  const shots = activeMatch?.shots || [];
  const activeShot = selectedShot || shots[0] || null;

  const getPlayer = (id) => startingXI.find((p) => p.id === id);

  // Helper to extract proper full surname/display name without chopping compound names
  const getPlayerDisplayName = (fullName = "") => {
    if (!fullName) return "";
    if (fullName.startsWith("Van ") || fullName.startsWith("van ")) return fullName;
    if (fullName.startsWith("Mac ") || fullName.startsWith("Mc ")) return fullName;
    const parts = fullName.split(" ");
    if (parts.length > 2) {
      const secondToLast = parts[parts.length - 2].toLowerCase();
      if (secondToLast === "van" || secondToLast === "mac" || secondToLast === "mc") {
        return `${parts[parts.length - 2]} ${parts[parts.length - 1]}`;
      }
    }
    return parts[parts.length - 1];
  };

  // Helper to produce clean concise tactical position label
  const getShortPos = (pos = "") => {
    if (!pos) return "";
    return pos.split("/")[0].replace(/\(.*\)/, "").trim();
  };

  // Smart placement to ensure player info pills never overlap pass lines or pass volume badges
  const getPlayerLabelPlacement = (player, radius) => {
    // Mac Allister (#10) and Endo (#3) have heavy pass links directly below them (badge 34) -> place label ABOVE
    // Players near the bottom touchline (y > 61) -> place label ABOVE
    const placeAbove =
      player.id === "macallister" ||
      player.id === "endo" ||
      player.y > 61;

    const capsuleHeight = 3.2;
    const capsuleY = placeAbove
      ? player.y - radius - capsuleHeight - 0.9
      : player.y + radius + 1.2;

    return { x: player.x, y: capsuleY, placeAbove };
  };

  const modeLabel =
    overlayMode === "pass"
      ? "Tactical Pass Network"
      : overlayMode === "heat"
        ? "Attacking Heatmap"
        : "Shots & xG Map";

  // Helper to compute node radius based on touch involvement
  const getNodeRadius = (touches = 50) => {
    return 2.3 + Math.min(Math.max((touches - 40) / 55, 0), 1) * 1.25;
  };

  return (
    <div className="apple-card relative w-full h-full min-h-[400px] sm:min-h-[460px] flex flex-col justify-between rounded-[24px] overflow-hidden p-3 sm:p-4 md:p-5 select-none bg-[#0D120F] border border-white/[0.08]">
      {/* Stadium Pitch Atmospheric Vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(16,36,26,0.55)_0%,rgba(9,18,13,0.92)_70%,rgba(6,10,8,0.98)_100%)]"
      />

      {/* Top Floating Glass HUD Bar */}
      <div className="relative flex flex-col gap-2 z-10 mb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Match & Overlay Title Pill */}
          <div className="apple-glass-hud flex items-center gap-2 px-3 py-1.5 rounded-full self-start sm:self-auto bg-[#121212]/90 border border-white/[0.08]">
            <span className="w-2 h-2 rounded-full bg-[#FF2636] animate-pulse shrink-0 shadow-[0_0_8px_#FF2636]" />
            <span className="text-[11px] sm:text-xs font-semibold text-white tracking-[-0.01em]">
              {activeMatch?.title}
              <span className="text-[#8E8E93] mx-1.5">•</span>
              <span className="text-[#FF2636] font-medium">{modeLabel}</span>
            </span>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {overlayMode === "pass" && (
              <>
                <button
                  type="button"
                  onClick={() => setShowChannels(!showChannels)}
                  className={`min-h-[28px] flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    showChannels
                      ? "bg-[#1A1A1A] text-white border-white/20"
                      : "bg-transparent text-[#8E8E93] border-white/[0.08] hover:text-white"
                  }`}
                  title="Toggle 5 tactical vertical channels (UEFA/PL standard)"
                >
                  <Layers className="w-3 h-3 text-[#FF2636]" />
                  <span className="hidden sm:inline">5 Tactical Corridors</span>
                  <span className="sm:hidden">Corridors</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPillMode(pillMode === "pills" ? "minimal" : "pills")}
                  className={`min-h-[28px] flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    pillMode === "pills"
                      ? "bg-[#1A1A1A] text-white border-white/20"
                      : "bg-transparent text-[#8E8E93] border-white/[0.08] hover:text-white"
                  }`}
                  title="Toggle between sleek glass pills and minimal labels"
                >
                  <Sparkles className="w-3 h-3 text-[#FF2636]" />
                  <span>{pillMode === "pills" ? "Glass Pills" : "Minimal Labels"}</span>
                </button>
              </>
            )}

            {activeMatch?.expectedShape && (
              <div className="hidden lg:flex items-center text-[11px] font-medium tabular-nums text-white/90 px-3 py-1 rounded-full bg-[#181818] border border-white/[0.08]">
                Shape: <span className="text-[#FF2636] ml-1 font-semibold">{activeMatch.expectedShape}</span>
              </div>
            )}

            {/* The Kop Direction Indicator */}
            <div className="apple-glass-hud text-[11px] font-medium text-white/85 px-3 py-1 rounded-full flex items-center gap-1.5 bg-[#121212]/90 border border-white/[0.08]">
              <Compass className="w-3 h-3 text-[#FF2636]" />
              The Kop: <span className="text-[#FF2636] font-bold">Right ➔</span>
            </div>

            {selectedPlayer && (
              <button
                type="button"
                onClick={() => setSelectedPlayer(null)}
                className="min-h-[28px] flex items-center gap-1.5 text-[11px] font-semibold text-white glass-crimson-pill px-3 py-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Focus
              </button>
            )}
          </div>
        </div>

        {/* Tactical Battle Brief */}
        {activeMatch?.keyTacticalBattle && (
          <div className="apple-glass-hud flex items-center gap-2 px-3 py-1.5 rounded-2xl text-[11px] text-[#8E8E93] bg-[#121212]/80 border border-white/[0.06]">
            <Sparkles className="w-3.5 h-3.5 text-[#F1B82D] shrink-0" strokeWidth={2} />
            <span className="font-semibold text-white shrink-0">Tactical Focus:</span>
            <span className="truncate text-white/80 font-medium">
              {activeMatch.keyTacticalBattle}
            </span>
          </div>
        )}
      </div>

      {/* SVG Pitch Canvas Area */}
      <div className="relative z-10 flex-1 w-full flex items-center justify-center overflow-x-auto py-1">
        <svg
          role="img"
          aria-label={`Anfield tactical pitch showing ${modeLabel} for ${activeMatch?.title || "Liverpool FC"}`}
          viewBox="0 0 105 68"
          className="w-full h-auto min-w-[320px] max-h-[500px] object-contain drop-shadow-[0_12px_32px_rgba(0,0,0,0.65)]"
        >
          <defs>
            {/* Authentic Pitch Turf Gradient */}
            <linearGradient id="anfieldTurfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#08140E" />
              <stop offset="50%" stopColor="#0B1C13" />
              <stop offset="100%" stopColor="#07120C" />
            </linearGradient>

            {/* Glowing Chalk Filter */}
            <filter id="chalkGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="0.25" floodColor="#FFFFFF" floodOpacity="0.35" />
            </filter>

            {/* Active Player Halo */}
            <filter id="activePlayerHalo" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#FF2636" floodOpacity="0.9" />
            </filter>

            {/* Standard Node Drop Shadow */}
            <filter id="nodeDropShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0.8" stdDeviation="0.9" floodColor="#000000" floodOpacity="0.8" />
            </filter>

            {/* Pass Beam Electric Glow */}
            <filter id="passBeamGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="0.8" floodColor="#FF2636" floodOpacity="0.85" />
            </filter>

            {/* Player Crest Radial Gradient (Anfield Red) */}
            <radialGradient id="playerBadgeRed" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FF3848" />
              <stop offset="50%" stopColor="#E31B23" />
              <stop offset="100%" stopColor="#8A0713" />
            </radialGradient>

            {/* Active Highlight Player Gradient */}
            <radialGradient id="playerBadgeActive" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FF6B78" />
              <stop offset="50%" stopColor="#FF2636" />
              <stop offset="100%" stopColor="#A80916" />
            </radialGradient>

            {/* SVG Crimson Glassmorphism Pill Gradient */}
            <linearGradient id="glassCrimsonPillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF3848" stopOpacity="0.92" />
              <stop offset="50%" stopColor="#E31B23" stopOpacity="0.84" />
              <stop offset="100%" stopColor="#9E0A16" stopOpacity="0.94" />
            </linearGradient>

            {/* Heatmap Gradients */}
            <radialGradient id="heatKopRight" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E31B23" stopOpacity="0.85" />
              <stop offset="42%" stopColor="#FF9F0A" stopOpacity="0.48" />
              <stop offset="80%" stopColor="#FF2636" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0B1912" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="heatKopLeft" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E31B23" stopOpacity="0.75" />
              <stop offset="52%" stopColor="#FF9F0A" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#0B1912" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="heatBoxCentre" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F1B82D" stopOpacity="0.85" />
              <stop offset="38%" stopColor="#E31B23" stopOpacity="0.62" />
              <stop offset="80%" stopColor="#E31B23" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#0B1912" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 1. Base Pitch Turf */}
          <rect
            x="0"
            y="0"
            width="105"
            height="68"
            fill="url(#anfieldTurfGrad)"
            rx="3"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.4"
          />

          {/* 2. Alternating Premier League Mowing Bands */}
          {[...Array(10)].map((_, i) => (
            <rect
              key={`mow-${i}`}
              x={i * 10.5}
              y="0"
              width="5.25"
              height="68"
              fill="#FFFFFF"
              fillOpacity={i % 2 === 0 ? "0.022" : "0.008"}
            />
          ))}

          {/* 3. Five Tactical Vertical Corridors (UEFA / Premier League Standard) */}
          {showChannels && (
            <g id="tactical-channels" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="0.25" strokeDasharray="1.2, 2.2" fill="none">
              {/* Left Wing / Left Half-Space boundary */}
              <line x1="2" y1="14.8" x2="103" y2="14.8" />
              {/* Left Half-Space / Central Channel boundary */}
              <line x1="2" y1="27.6" x2="103" y2="27.6" />
              {/* Central Channel / Right Half-Space boundary */}
              <line x1="2" y1="40.4" x2="103" y2="40.4" />
              {/* Right Half-Space / Right Wing boundary */}
              <line x1="2" y1="53.2" x2="103" y2="53.2" />

              {/* Channel Watermark Labels - Centered Vertically in Corridors */}
              <text x="3.5" y="8.4" fill="#8E8E93" fillOpacity="0.25" fontSize="1.3" fontWeight="600" letterSpacing="0.08">LEFT FLANK</text>
              <text x="3.5" y="21.2" fill="#8E8E93" fillOpacity="0.25" fontSize="1.3" fontWeight="600" letterSpacing="0.08">LEFT HALF-SPACE</text>
              <text x="3.5" y="29.0" fill="#8E8E93" fillOpacity="0.25" fontSize="1.3" fontWeight="600" letterSpacing="0.08">CENTRAL CORRIDOR</text>
              <text x="3.5" y="47.0" fill="#8E8E93" fillOpacity="0.25" fontSize="1.3" fontWeight="600" letterSpacing="0.08">RIGHT HALF-SPACE</text>
              <text x="3.5" y="60.0" fill="#8E8E93" fillOpacity="0.25" fontSize="1.3" fontWeight="600" letterSpacing="0.08">RIGHT FLANK</text>
            </g>
          )}

          {/* 4. Authentic Stadium Chalk Markings */}
          <g stroke="#FFFFFF" strokeOpacity="0.26" strokeWidth="0.4" fill="none" filter="url(#chalkGlow)">
            {/* Outer Pitch Boundary */}
            <rect x="2" y="2" width="101" height="64" rx="0.8" />

            {/* Halfway Line */}
            <line x1="52.5" y1="2" x2="52.5" y2="66" />

            {/* Centre Circle & Spot */}
            <circle cx="52.5" cy="34" r="9.15" />
            <circle cx="52.5" cy="34" r="0.55" fill="#FFFFFF" fillOpacity="0.8" stroke="none" />

            {/* Left Penalty Box (Anfield Road End) */}
            <rect x="2" y="13.84" width="16.5" height="40.32" />
            <rect x="2" y="24.84" width="5.5" height="18.32" />
            <path d="M 18.5 28.5 A 9.15 9.15 0 0 1 18.5 39.5" />
            <circle cx="11" cy="34" r="0.5" fill="#FFFFFF" fillOpacity="0.7" stroke="none" />

            {/* Right Penalty Box (The Kop End) */}
            <rect x="86.5" y="13.84" width="16.5" height="40.32" />
            <rect x="97.5" y="24.84" width="5.5" height="18.32" />
            <path d="M 86.5 28.5 A 9.15 9.15 0 0 0 86.5 39.5" />
            <circle cx="94" cy="34" r="0.5" fill="#FFFFFF" fillOpacity="0.7" stroke="none" />

            {/* 4 Corner Arcs */}
            <path d="M 2 3.5 A 1.5 1.5 0 0 1 3.5 2" />
            <path d="M 2 64.5 A 1.5 1.5 0 0 0 3.5 66" />
            <path d="M 101.5 2 A 1.5 1.5 0 0 1 103 3.5" />
            <path d="M 101.5 66 A 1.5 1.5 0 0 0 103 64.5" />

            {/* Goal Net Outlines */}
            <rect x="0.5" y="30.34" width="1.5" height="7.32" strokeOpacity="0.4" />
            <rect x="103" y="30.34" width="1.5" height="7.32" strokeOpacity="0.4" />
          </g>

          {/* 5. Stand Identity & Tactical Direction */}
          <text
            x="6.5"
            y="6.2"
            fill="#8E8E93"
            fillOpacity="0.55"
            fontSize="2.1"
            fontWeight="700"
            letterSpacing="0.14"
          >
            ANFIELD ROAD STAND
          </text>

          {/* Attacking Direction Crimson Glass HUD Pill */}
          <g>
            <rect
              x="69"
              y="3.2"
              width="32"
              height="4.2"
              rx="2.1"
              fill="url(#glassCrimsonPillGrad)"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="0.3"
              filter="url(#passBeamGlow)"
            />
            {/* Top specular highlight rim */}
            <path
              d="M 71.1 3.5 L 98.9 3.5"
              stroke="#FFFFFF"
              strokeOpacity="0.65"
              strokeWidth="0.35"
              strokeLinecap="round"
            />
            <text
              x="85"
              y="6.0"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="1.8"
              fontWeight="700"
              letterSpacing="0.06"
              className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
            >
              THE KOP • ATTACKING ➔
            </text>
          </g>

          {/* ═══════ OVERLAY 1: TACTICAL PASS NETWORK ═══════ */}
          {overlayMode === "pass" && (
            <g id="pass-network-layer">
              {/* Pass Connections (Vectors) */}
              {passLinks.map((link, idx) => {
                const p1 = getPlayer(link.from);
                const p2 = getPlayer(link.to);
                if (!p1 || !p2) return null;

                const isConnected =
                  activePlayerId === link.from || activePlayerId === link.to;
                const isDimmed = activePlayerId && !isConnected;

                // Vector geometry: offset endpoints to meet node edges cleanly
                const r1 = getNodeRadius(p1.touches);
                const r2 = getNodeRadius(p2.touches);
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const ux = dx / dist;
                const uy = dy / dist;

                const x1 = p1.x + ux * (r1 + 0.35);
                const y1 = p1.y + uy * (r1 + 0.35);
                const x2 = p2.x - ux * (r2 + 0.35);
                const y2 = p2.y - uy * (r2 + 0.35);

                const mx = (x1 + x2) / 2;
                const my = (y1 + y2) / 2;

                // Scaled stroke width based on pass count
                const baseStroke = Math.min(Math.max((link.count - 10) / 12 * 0.9 + 0.65, 0.7), 2.5);
                const strokeWidth = isConnected ? baseStroke * 1.35 : baseStroke;

                // Opacity based on pass frequency
                const defaultOpacity = Math.min(0.42 + link.count / 65, 0.82);
                const opacity = isDimmed ? 0.06 : isConnected ? 0.98 : defaultOpacity;

                const isHovered = hoveredLink === `${link.from}-${link.to}`;

                return (
                  <g
                    key={`link-${idx}`}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredLink(`${link.from}-${link.to}`)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    {/* Underlying Glow Line when Connected */}
                    {isConnected && (
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#FF2636"
                        strokeOpacity="0.45"
                        strokeWidth={strokeWidth + 1.8}
                        strokeLinecap="round"
                        filter="url(#passBeamGlow)"
                      />
                    )}

                    {/* Main Dynamic Pass Vector */}
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isConnected ? "#FF2636" : "#E31B23"}
                      strokeOpacity={opacity}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                    />

                    {/* Directional Chevron at 62% along the vector */}
                    {dist > 15 && !isDimmed && (
                      <path
                        d={`M ${x1 + ux * (dist * 0.62) - uy * 1.0} ${y1 + uy * (dist * 0.62) + ux * 1.0} L ${x1 + ux * (dist * 0.62) + ux * 1.2} ${y1 + uy * (dist * 0.62) + uy * 1.2} L ${x1 + ux * (dist * 0.62) + uy * 1.0} ${y1 + uy * (dist * 0.62) - ux * 1.0}`}
                        fill="none"
                        stroke={isConnected ? "#FFFFFF" : "#FF3848"}
                        strokeOpacity={isConnected ? 0.95 : 0.65}
                        strokeWidth="0.45"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                  </g>
                );
              })}

              {/* ═══════ LAYER 2 & 3: PLAYER NODES & TACTICAL LABELS ═══════ */}
              {startingXI.map((player) => {
                const isActive = activePlayerId === player.id;
                const radius = getNodeRadius(player.touches);

                const placement = getPlayerLabelPlacement(player, radius);
                const displayName = getPlayerDisplayName(player.name);
                const shortPos = getShortPos(player.pos);
                const fullLabel = `${displayName} • ${shortPos}`;
                const capsuleWidth = Math.max(fullLabel.length * 0.96 + 3.2, 11);

                return (
                  <g
                    key={player.id}
                    className="cursor-pointer transition-transform duration-200"
                    onClick={() =>
                      setSelectedPlayer(selectedPlayer?.id === player.id ? null : player)
                    }
                    onMouseEnter={() => setHoveredPlayer(player)}
                    onMouseLeave={() => setHoveredPlayer(null)}
                  >
                    {/* Outer Concentric Touch Halo (Touch Volume Metric) */}
                    <circle
                      cx={player.x}
                      cy={player.y}
                      r={radius + 1.1}
                      fill="none"
                      stroke={isActive ? "#FF2636" : "rgba(255,255,255,0.24)"}
                      strokeWidth="0.32"
                      strokeDasharray="1.2, 1.2"
                      className={isActive ? "animate-spin" : ""}
                      style={{
                        transformOrigin: `${player.x}px ${player.y}px`,
                        animationDuration: "10s",
                      }}
                    />

                    {/* Active Spotlight Animated Halo */}
                    {isActive && (
                      <circle
                        cx={player.x}
                        cy={player.y}
                        r={radius + 2.4}
                        fill="none"
                        stroke="#FF2636"
                        strokeWidth="0.45"
                        strokeDasharray="1.5, 1.2"
                        className="animate-pulse"
                      />
                    )}

                    {/* Core Anfield Crest Circle Badge */}
                    <circle
                      cx={player.x}
                      cy={player.y}
                      r={radius}
                      fill={isActive ? "url(#playerBadgeActive)" : "url(#playerBadgeRed)"}
                      stroke="#FFFFFF"
                      strokeOpacity="0.95"
                      strokeWidth={isActive ? "0.65" : "0.45"}
                      filter={isActive ? "url(#activePlayerHalo)" : "url(#nodeDropShadow)"}
                    />

                    {/* Subtle Glass Specular Crescent */}
                    <path
                      d={`M ${player.x - radius * 0.75} ${player.y - radius * 0.2} A ${radius * 0.8} ${radius * 0.8} 0 0 1 ${player.x + radius * 0.75} ${player.y - radius * 0.2} A ${radius} ${radius * 0.5} 0 0 0 ${player.x - radius * 0.75} ${player.y - radius * 0.2}`}
                      fill="#FFFFFF"
                      fillOpacity="0.22"
                    />

                    {/* Bold Jersey Number */}
                    <text
                      x={player.x}
                      y={player.y + 0.72}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="1.85"
                      fontWeight="800"
                      className="pointer-events-none select-none font-mono tabular-nums"
                    >
                      {player.number}
                    </text>

                    {/* Tactical Info Pill or Clean Text Label */}
                    {pillMode === "pills" ? (
                      /* Refined Sleek Glass Capsule (Semi-translucent, non-occluding) */
                      <g className="pointer-events-none select-none" filter="url(#nodeDropShadow)">
                        <rect
                          x={player.x - capsuleWidth / 2}
                          y={placement.y}
                          width={capsuleWidth}
                          height={3.2}
                          rx={1.6}
                          fill={isActive ? "rgba(45, 10, 14, 0.88)" : "rgba(10, 14, 18, 0.76)"}
                          stroke={isActive ? "#FF2636" : "rgba(255,255,255,0.18)"}
                          strokeWidth="0.25"
                        />
                        <text
                          x={player.x}
                          y={placement.y + 2.15}
                          textAnchor="middle"
                          fontSize="1.3"
                          fontWeight="600"
                          fill="#FFFFFF"
                          className="tracking-[-0.01em]"
                        >
                          {displayName}{" "}
                          <tspan fill="#8E8E93" fontSize="1.0" fontWeight="500">
                            • {shortPos}
                          </tspan>
                        </text>
                      </g>
                    ) : (
                      /* Clean Minimal Pitch Text (Direct names on pitch) */
                      <g className="pointer-events-none select-none">
                        <text
                          x={player.x}
                          y={placement.y + 2.15}
                          textAnchor="middle"
                          fontSize="1.45"
                          fontWeight="700"
                          fill="#FFFFFF"
                          filter="drop-shadow(0 1px 2px rgba(0,0,0,0.95))"
                          className="tracking-[-0.01em]"
                        >
                          {displayName}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* ═══════ LAYER 4: DEDICATED FOREGROUND PASS VOLUME BADGES (NEVER OCCLUDED) ═══════ */}
              <g id="pass-volume-badges-layer">
                {passLinks.map((link, idx) => {
                  const p1 = getPlayer(link.from);
                  const p2 = getPlayer(link.to);
                  if (!p1 || !p2) return null;

                  const isConnected =
                    activePlayerId &&
                    (link.from === activePlayerId || link.to === activePlayerId);
                  const isDimmed = activePlayerId && !isConnected;
                  const isHovered = hoveredLink === `${link.from}-${link.to}`;

                  // Show badge for high volume (count >= 25) or when focused/hovered
                  if (!((link.count >= 25 || isConnected || isHovered) && !isDimmed)) {
                    return null;
                  }

                  // Smart positioning along link vector to guarantee clearance from player capsules
                  let t = 0.5;
                  if (
                    (link.from === "gravenberch" && link.to === "macallister") ||
                    (link.from === "macallister" && link.to === "gravenberch") ||
                    (link.from === "endo" && link.to === "gravenberch") ||
                    (link.from === "gravenberch" && link.to === "endo")
                  ) {
                    t = 0.44;
                  }

                  const bx = p1.x + (p2.x - p1.x) * t;
                  const by = p1.y + (p2.y - p1.y) * t;
                  const badgeW = link.count >= 100 ? 7.2 : 6.4;

                  return (
                    <g
                      key={`top-badge-${idx}`}
                      className="pointer-events-none select-none transition-all duration-200"
                      filter="url(#nodeDropShadow)"
                    >
                      <rect
                        x={bx - badgeW / 2}
                        y={by - 1.8}
                        width={badgeW}
                        height="3.6"
                        rx="1.8"
                        fill={isConnected || isHovered ? "#240406" : "#0D0E12"}
                        fillOpacity="0.96"
                        stroke={isConnected || isHovered ? "#FF2636" : "rgba(255,255,255,0.24)"}
                        strokeWidth={isConnected || isHovered ? "0.45" : "0.3"}
                      />
                      <text
                        x={bx}
                        y={by + 0.72}
                        textAnchor="middle"
                        fill={isConnected || isHovered ? "#FF2636" : "#FFFFFF"}
                        fontSize="1.6"
                        fontWeight="700"
                        className="tabular-nums font-mono"
                      >
                        {link.count}
                      </text>
                    </g>
                  );
                })}
              </g>
            </g>
          )}

          {/* ═══════ OVERLAY 2: ATTACKING HEATMAP ═══════ */}
          {overlayMode === "heat" && (
            <g id="heatmap-layer">
              <ellipse cx="80" cy="54" rx="16" ry="10" fill="url(#heatKopRight)" />
              <ellipse cx="76" cy="16" rx="14" ry="9" fill="url(#heatKopLeft)" />
              <circle cx="89" cy="34" r="11" fill="url(#heatBoxCentre)" />
              <ellipse cx="48" cy="34" rx="12" ry="14" fill="#FF2636" fillOpacity="0.12" />

              <text
                x="80"
                y="58"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="2.1"
                fontWeight="700"
              >
                Half-Space Overload (Frimpong &amp; Barcola)
              </text>
              <text
                x="76"
                y="20"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="2.1"
                fontWeight="700"
              >
                Cutback Channel (Wirtz &amp; Kerkez)
              </text>
            </g>
          )}

          {/* ═══════ OVERLAY 3: SHOTS & xG MAP ═══════ */}
          {overlayMode === "shots" && (
            <g id="shots-layer">
              {shots.map((shot) => {
                const radius = 1.4 + shot.xG * 3.8;
                const isGoal = shot.outcome === "goal";
                const isSelectedShot = activeShot?.id === shot.id;
                return (
                  <g
                    key={shot.id}
                    className="cursor-pointer group"
                    onClick={() => setSelectedShot(shot)}
                    onMouseEnter={() => setSelectedShot(shot)}
                  >
                    {isSelectedShot && (
                      <circle
                        cx={shot.x}
                        cy={shot.y}
                        r={radius + 1.4}
                        fill="none"
                        stroke="#FF2636"
                        strokeWidth="0.55"
                        strokeDasharray="1.1, 1"
                      />
                    )}
                    <circle
                      cx={shot.x}
                      cy={shot.y}
                      r={radius}
                      fill={isGoal ? "#FF2636" : "#8E8E93"}
                      fillOpacity={isGoal ? 0.95 : 0.65}
                      stroke={
                        isSelectedShot
                          ? "#FFFFFF"
                          : isGoal
                            ? "#F1B82D"
                            : "rgba(255,255,255,0.85)"
                      }
                      strokeWidth={isSelectedShot ? "0.85" : isGoal ? "0.7" : "0.4"}
                    />
                    <text
                      x={shot.x}
                      y={shot.y + radius + 2.3}
                      textAnchor="middle"
                      fill={isSelectedShot ? "#FF2636" : "#F5F5F7"}
                      fontSize="1.6"
                      fontWeight="600"
                    >
                      {shot.player} ({shot.xG.toFixed(2)})
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>

      {/* Bottom Professional Tactical Legend Bar */}
      <div className="relative z-10 mt-2.5 pt-2.5 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#8E8E93] gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E31B23] border border-white/60 shadow-[0_0_6px_rgba(227,27,35,0.5)]" />
            <span className="text-white/80">Node Size = Touch Volume</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 rounded-full bg-[#FF2636]" />
            <span className="text-white/80">Vector Thickness = Pass Frequency</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full border border-dashed border-[#FF2636]" />
            <span className="text-white/80">Pill Badge = Total Dyad Passes</span>
          </div>
        </div>

        {/* Dynamic Focus Telemetry Card / Pill */}
        {overlayMode === "shots" && activeShot ? (
          <div className="apple-glass-hud flex flex-col justify-center px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-[16px] text-white self-start sm:self-auto bg-[#141414]/95 border border-white/[0.12] shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[#F1B82D] text-xs font-semibold">{activeShot.player}</span>
              <span className="text-white/30 text-xs">•</span>
              <span className="text-[#FF2636] text-xs font-mono tabular-nums font-bold">
                {activeShot.xG.toFixed(2)} xG
              </span>
              <span className="text-white/30 text-xs">•</span>
              <span className="uppercase text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E31B23]/25 text-[#FF6B78] border border-[#E31B23]/40 tracking-wider">
                {activeShot.outcome}
              </span>
            </div>
            {activeShot.desc && (
              <span className="text-[#EBEBF5]/75 text-[11px] font-normal mt-1 leading-snug">
                {activeShot.desc}
              </span>
            )}
          </div>
        ) : (
          selectedPlayer && (
            <div className="apple-glass-hud flex items-center gap-2.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-[16px] text-white self-start sm:self-auto flex-wrap bg-[#141414]/95 border border-white/[0.12] shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
              <span className="text-[#FF2636] text-xs font-bold">
                #{selectedPlayer.number} {selectedPlayer.name}
              </span>
              <span className="text-white/30 text-xs">•</span>
              <span className="text-white text-xs font-mono tabular-nums">
                OBV +{selectedPlayer.obv.toFixed(2)}
              </span>
              <span className="text-white/30 text-xs">•</span>
              <span className="text-[#F1B82D] text-xs font-mono tabular-nums font-semibold">
                {selectedPlayer.touches} Touches
              </span>
              <span className="text-white/30 text-xs">•</span>
              <span className="tabular-nums text-xs text-white/85">Pass Acc {selectedPlayer.comp}%</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
