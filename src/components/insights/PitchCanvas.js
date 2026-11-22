"use client";

import React, { useState } from "react";
import { RotateCcw, Layers, BarChart3, Flame, Crosshair, LayoutGrid } from "lucide-react";
import PreMatchPanel, { getMatchdayPhase } from "./PreMatchPanel";
import { SlidingSegmentedTabs, SlidingTabPanel } from "./SlidingSegmentedTabs";

export default function PitchCanvas({
  activeMatch,
  selectedClub,
  overlayMode,
  setOverlayMode,
  selectedPlayer,
  setSelectedPlayer,
  lineupStatus = null,
  countdownSeconds = 16155,
  onPreviewPhase,
  isPreviewing = false,
  onResetPreview,
}) {
  const isPredicted = lineupStatus === "predicted";
  const clubName =
    selectedClub?.name || activeMatch?.clubName || activeMatch?.homeTeam || "Club";
  const standLabel = (
    selectedClub?.mainStand ||
    activeMatch?.mainStand ||
    `${selectedClub?.stadium || "STADIUM"} STAND`
  ).toUpperCase();

  const rightWingSurname = (
    activeMatch?.startingXI?.[8]?.name ||
    selectedClub?.captain ||
    "Right Wing"
  )
    .split(" ")
    .slice(-1)[0];
  const rightBackSurname = (
    activeMatch?.startingXI?.[1]?.name || "Full-Back"
  )
    .split(" ")
    .slice(-1)[0];
  const leftWingSurname = (
    activeMatch?.startingXI?.[10]?.name || "Left Wing"
  )
    .split(" ")
    .slice(-1)[0];
  const leftBackSurname = (
    activeMatch?.startingXI?.[4]?.name || "Full-Back"
  )
    .split(" ")
    .slice(-1)[0];

  const heatRightLabel =
    activeMatch?.heatmapLabels?.right ||
    `Half-Space Overload (${rightWingSurname} & ${rightBackSurname})`;
  const heatLeftLabel =
    activeMatch?.heatmapLabels?.left ||
    `Cutback Channel (${leftWingSurname} & ${leftBackSurname})`;

  const [hoveredPlayer, setHoveredPlayer] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [selectedShot, setSelectedShot] = useState(null);
  const [showChannels, setShowChannels] = useState(false);
  const [slideDir, setSlideDir] = useState(1);

  const activePlayerId = selectedPlayer?.id || hoveredPlayer?.id || null;

  const startingXI = activeMatch?.startingXI || [];
  const passLinks = activeMatch?.passLinks || [];
  const shots = activeMatch?.shots || [];
  const activeShot = selectedShot || shots[0] || null;

  const isLive = activeMatch?.type === "LIVE" || activeMatch?.isLive;
  const isMatchdayPreMatch =
    activeMatch?.type === "MATCHDAY" ||
    activeMatch?.status === "PRE_MATCH" ||
    (activeMatch?.isMatchday && !activeMatch?.isLive);

  const homeTeam = activeMatch?.homeTeam || clubName;
  const awayTeam = activeMatch?.awayTeam || activeMatch?.opponent || "Opponent";
  const homeScore = isMatchdayPreMatch
    ? null
    : activeMatch?.homeScore ??
      (isLive ? 2 : activeMatch?.score?.split("-")[0]?.trim() || 0);
  const awayScore = isMatchdayPreMatch
    ? null
    : activeMatch?.awayScore ??
      (isLive ? 1 : activeMatch?.score?.split("-")[1]?.trim() || 0);

  const kickoffTime = activeMatch?.kickoffTime || "16:30 GMT";
  const phaseObj = getMatchdayPhase(countdownSeconds);

  const getPlayer = (id) => startingXI.find((p) => p.id === id);

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

  const getShortPos = (pos = "") => {
    if (!pos) return "";
    return pos.split("/")[0].replace(/\(.*\)/, "").trim();
  };

  const getPlayerLabelPlacement = (player, radius) => {
    const placeAbove =
      player.id === "macallister" || player.id === "endo" || player.y >= 50;
    const capsuleHeight = 3.2;
    const capsuleY = placeAbove
      ? player.y - radius - capsuleHeight - 0.9
      : player.y + radius + 1.2;
    return { x: player.x, y: capsuleY, placeAbove };
  };

  const getNodeRadius = (touches = 50) =>
    2.35 + Math.min(Math.max((touches - 40) / 55, 0), 1) * 1.2;

  const modes = [
    { id: "pass", label: "Pass Network", icon: BarChart3 },
    { id: "heat", label: "Heatmap", icon: Flame },
    { id: "shots", label: "Shots & xG", icon: Crosshair },
    { id: "hub", label: "Match Hub", icon: LayoutGrid },
  ];

  const modeLabel =
    overlayMode === "pass"
      ? "Tactical Pass Network"
      : overlayMode === "heat"
      ? "Attacking Heatmap"
      : overlayMode === "shots"
      ? "Shots & xG Map"
      : "Pre-Match & Tactical Hub";

  return (
    <section
      id="pitch-canvas"
      aria-label="Primary tactical visualisation"
      className="glass-card-deep relative w-full flex flex-col justify-between p-5 sm:p-6 select-none"
    >
      {/* ─── Clean Unified Match & Mode Header (Zero Stacked Ribbons) ─── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
        {/* Left: Compact Match Identity & Crisp Tabular Score */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="font-display text-lg sm:text-xl font-semibold tracking-[-0.02em] text-white">
              {homeTeam}
              <span className="mx-2 text-[#5E616B] font-normal">vs</span>
              {awayTeam}
            </h2>

            {isMatchdayPreMatch ? (
              <span className="font-mono text-xs font-medium text-[#D2F865] tabular-nums">
                {kickoffTime}
              </span>
            ) : (
              <span className="font-mono text-base font-semibold text-[#D2F865] tabular-nums">
                {homeScore} – {awayScore}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-xs text-[#8A8D96]">
            <span>{activeMatch?.competition || "Premier League"}</span>
            <span aria-hidden="true">·</span>
            <span>{activeMatch?.venue || selectedClub?.stadium}</span>
            {activeMatch?.expectedShape && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#D4D6DC]/80">
                  {activeMatch.expectedShape}
                </span>
              </>
            )}
            {lineupStatus && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#D4D6DC]/70">
                  {isPredicted ? "Predicted XI" : "Confirmed XI"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Fixed 4-Tab Apple HIG Sliding Segmented Switcher */}
        <div className="flex items-center shrink-0">
          <SlidingSegmentedTabs
            tabs={modes}
            value={overlayMode}
            layoutId="pitch-mode-pill"
            ariaLabel="Visualisation mode"
            onChange={(nextId) => {
              const curIdx = modes.findIndex((m) => m.id === overlayMode);
              const nextIdx = modes.findIndex((m) => m.id === nextId);
              if (nextIdx !== curIdx) setSlideDir(nextIdx > curIdx ? 1 : -1);
              if (setOverlayMode) setOverlayMode(nextId);
            }}
          />
        </div>
      </div>

      {/* ─── Mode Content: Directional Slide Between Pitch Modes & Match Hub ─── */}
      <SlidingTabPanel
        activeKey={overlayMode}
        direction={slideDir}
        axis="x"
        distance={16}
        className="flex-1 flex flex-col justify-between"
      >
      {overlayMode === "hub" ? (
        <div className="pt-5">
          <PreMatchPanel
            activeMatch={activeMatch}
            selectedClub={selectedClub}
            phase={phaseObj}
            countdownSeconds={countdownSeconds}
            onPreviewPhase={onPreviewPhase || (() => {})}
            isPreviewing={isPreviewing}
            onResetPreview={onResetPreview || (() => {})}
          />
        </div>
      ) : (
        <>
          {/* SVG Pitch Canvas */}
          <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden pt-5 pb-3">
            <svg
              role="img"
              aria-label={`Tactical pitch showing ${modeLabel} for ${activeMatch?.title || clubName}`}
              viewBox="0 0 105 68"
              className="w-full h-auto max-h-[470px] object-contain"
            >
              <defs>
                {/* Refined Deep Obsidian-Pine Pitch Surface */}
                <linearGradient id="obsidianTurfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0C1310" />
                  <stop offset="50%" stopColor="#0F1915" />
                  <stop offset="100%" stopColor="#0B110E" />
                </linearGradient>

                <filter id="nodeShadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0.7" stdDeviation="0.9" floodColor="#000000" floodOpacity="0.85" />
                </filter>

                <filter id="limeNodeGlow" x="-40%" y="-40%" width="180%" height="180%">
                  <feDropShadow dx="0" dy="0" stdDeviation="1.4" floodColor="#D2F865" floodOpacity="0.8" />
                </filter>

                <filter id="limeBeamGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="0" stdDeviation="0.75" floodColor="#D2F865" floodOpacity="0.75" />
                </filter>

                {/* Standard Player Node (Dark Obsidian-Graphite Glass) */}
                <radialGradient id="playerNodeBase" cx="35%" cy="30%" r="72%">
                  <stop offset="0%" stopColor="#353944" />
                  <stop offset="60%" stopColor="#1D2027" />
                  <stop offset="100%" stopColor="#121419" />
                </radialGradient>

                {/* Active Highlight Player Node (Electric Lime) */}
                <radialGradient id="playerNodeLime" cx="35%" cy="30%" r="72%">
                  <stop offset="0%" stopColor="#E6FD9C" />
                  <stop offset="55%" stopColor="#D2F865" />
                  <stop offset="100%" stopColor="#A6CE3E" />
                </radialGradient>

                {/* Heatmap Gradients (Lime + Coral + Amber Reference Data Palette) */}
                <radialGradient id="heatLimeRight" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#D2F865" stopOpacity="0.72" />
                  <stop offset="45%" stopColor="#95AC59" stopOpacity="0.34" />
                  <stop offset="82%" stopColor="#5E8359" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#0C1310" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="heatCoralLeft" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#F26E7C" stopOpacity="0.65" />
                  <stop offset="52%" stopColor="#F4BA5B" stopOpacity="0.24" />
                  <stop offset="100%" stopColor="#0C1310" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="heatBoxPeak" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
                  <stop offset="40%" stopColor="#D2F865" stopOpacity="0.58" />
                  <stop offset="80%" stopColor="#D2F865" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#0C1310" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Base Turf */}
              <rect
                x="0"
                y="0"
                width="105"
                height="68"
                fill="url(#obsidianTurfGrad)"
                rx="3"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="0.35"
              />

              {/* Subtle Pitch Bands */}
              {[...Array(10)].map((_, i) => (
                <rect
                  key={`mow-${i}`}
                  x={i * 10.5}
                  y="0"
                  width="5.25"
                  height="68"
                  fill="#FFFFFF"
                  fillOpacity={i % 2 === 0 ? "0.016" : "0.005"}
                />
              ))}

              {/* Five Tactical Vertical Corridors (Optional Toggle) */}
              {showChannels && (
                <g
                  stroke="#FFFFFF"
                  strokeOpacity="0.08"
                  strokeWidth="0.22"
                  strokeDasharray="1.2, 2.2"
                  fill="none"
                >
                  <line x1="2" y1="14.8" x2="103" y2="14.8" />
                  <line x1="2" y1="27.6" x2="103" y2="27.6" />
                  <line x1="2" y1="40.4" x2="103" y2="40.4" />
                  <line x1="2" y1="53.2" x2="103" y2="53.2" />
                  <text x="3.5" y="8.4" fill="#8A8D96" fillOpacity="0.35" fontSize="1.25" fontWeight="500">
                    LEFT FLANK
                  </text>
                  <text x="3.5" y="21.2" fill="#8A8D96" fillOpacity="0.35" fontSize="1.25" fontWeight="500">
                    LEFT HALF-SPACE
                  </text>
                  <text x="3.5" y="34.5" fill="#8A8D96" fillOpacity="0.35" fontSize="1.25" fontWeight="500">
                    CENTRAL CORRIDOR
                  </text>
                  <text x="3.5" y="47.0" fill="#8A8D96" fillOpacity="0.35" fontSize="1.25" fontWeight="500">
                    RIGHT HALF-SPACE
                  </text>
                  <text x="3.5" y="60.0" fill="#8A8D96" fillOpacity="0.35" fontSize="1.25" fontWeight="500">
                    RIGHT FLANK
                  </text>
                </g>
              )}

              {/* Crisp Chalk Lines */}
              <g stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="0.36" fill="none">
                <rect x="2" y="2" width="101" height="64" rx="0.8" />
                <line x1="52.5" y1="2" x2="52.5" y2="66" />
                <circle cx="52.5" cy="34" r="9.15" />
                <circle cx="52.5" cy="34" r="0.5" fill="#FFFFFF" fillOpacity="0.55" stroke="none" />
                <rect x="2" y="13.84" width="16.5" height="40.32" />
                <rect x="2" y="24.84" width="5.5" height="18.32" />
                <path d="M 18.5 28.5 A 9.15 9.15 0 0 1 18.5 39.5" />
                <circle cx="11" cy="34" r="0.45" fill="#FFFFFF" fillOpacity="0.55" stroke="none" />
                <rect x="86.5" y="13.84" width="16.5" height="40.32" />
                <rect x="97.5" y="24.84" width="5.5" height="18.32" />
                <path d="M 86.5 28.5 A 9.15 9.15 0 0 0 86.5 39.5" />
                <circle cx="94" cy="34" r="0.45" fill="#FFFFFF" fillOpacity="0.55" stroke="none" />
                <path d="M 2 3.5 A 1.5 1.5 0 0 1 3.5 2" />
                <path d="M 2 64.5 A 1.5 1.5 0 0 0 3.5 66" />
                <path d="M 101.5 2 A 1.5 1.5 0 0 1 103 3.5" />
                <path d="M 101.5 66 A 1.5 1.5 0 0 0 103 64.5" />
                <rect x="0.6" y="30.34" width="1.4" height="7.32" strokeOpacity="0.32" />
                <rect x="103" y="30.34" width="1.4" height="7.32" strokeOpacity="0.32" />
              </g>

              {/* Quiet Stand Label */}
              <text
                x="5.5"
                y="5.8"
                fill="#8A8D96"
                fillOpacity="0.28"
                fontSize="1.45"
                fontWeight="500"
                letterSpacing="0.08"
              >
                {standLabel}
              </text>

              {/* ═══ OVERLAY 1: PASS NETWORK ═══ */}
              {overlayMode === "pass" && (
                <g id="pass-network-layer">
                  {passLinks.map((link, idx) => {
                    const p1 = getPlayer(link.from);
                    const p2 = getPlayer(link.to);
                    if (!p1 || !p2) return null;

                    const isConnected =
                      activePlayerId === link.from || activePlayerId === link.to;
                    const isDimmed = activePlayerId && !isConnected;

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

                    const baseStroke = Math.min(
                      Math.max(((link.count - 10) / 12) * 0.42 + 0.36, 0.36),
                      1.45
                    );
                    const strokeWidth = isConnected ? baseStroke * 1.45 + 0.5 : baseStroke;
                    const defaultOpacity = Math.min(0.16 + link.count / 145, 0.42);
                    const opacity = isDimmed ? 0.04 : isConnected ? 0.95 : defaultOpacity;
                    const isHovered = hoveredLink === `${link.from}-${link.to}`;

                    return (
                      <g
                        key={`link-${idx}`}
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={() => setHoveredLink(`${link.from}-${link.to}`)}
                        onMouseLeave={() => setHoveredLink(null)}
                      >
                        {isConnected && (
                          <line
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="#D2F865"
                            strokeOpacity="0.32"
                            strokeWidth={strokeWidth + 1.2}
                            strokeLinecap="round"
                            filter="url(#limeBeamGlow)"
                          />
                        )}
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={isConnected ? "#D2F865" : "rgba(255, 255, 255, 0.6)"}
                          strokeOpacity={opacity}
                          strokeWidth={strokeWidth}
                          strokeLinecap="round"
                        />
                        {(isConnected || isHovered) && dist > 14 && (
                          <path
                            d={`M ${x1 + ux * (dist * 0.58) - uy * 0.75} ${
                              y1 + uy * (dist * 0.58) + ux * 0.75
                            } L ${x1 + ux * (dist * 0.58) + ux * 1.05} ${
                              y1 + uy * (dist * 0.58) + uy * 1.05
                            } L ${x1 + ux * (dist * 0.58) + uy * 0.75} ${
                              y1 + uy * (dist * 0.58) - ux * 0.75
                            }`}
                            fill="none"
                            stroke="#FFFFFF"
                            strokeOpacity="0.9"
                            strokeWidth="0.38"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}
                      </g>
                    );
                  })}

                  {/* Player Nodes */}
                  {startingXI.map((player) => {
                    const isActive = activePlayerId === player.id;
                    const radius = getNodeRadius(player.touches);
                    const placement = getPlayerLabelPlacement(player, radius);
                    const displayName = getPlayerDisplayName(player.name);
                    const shortPos = getShortPos(player.pos);

                    return (
                      <g
                        key={player.id}
                        className="cursor-pointer transition-transform duration-200"
                        onClick={() =>
                          setSelectedPlayer(
                            selectedPlayer?.id === player.id ? null : player
                          )
                        }
                        onMouseEnter={() => setHoveredPlayer(player)}
                        onMouseLeave={() => setHoveredPlayer(null)}
                      >
                        {isActive && (
                          <circle
                            cx={player.x}
                            cy={player.y}
                            r={radius + 1.65}
                            fill="none"
                            stroke="#D2F865"
                            strokeWidth="0.4"
                            strokeDasharray="1.4, 1.1"
                          />
                        )}

                        <circle
                          cx={player.x}
                          cy={player.y}
                          r={radius}
                          fill={isActive ? "url(#playerNodeLime)" : "url(#playerNodeBase)"}
                          fillOpacity={isPredicted && !isActive ? 0.85 : 1}
                          stroke={isActive ? "#FFFFFF" : "#D2F865"}
                          strokeOpacity={isActive ? "0.95" : "0.65"}
                          strokeWidth={isActive ? "0.55" : "0.38"}
                          filter={isActive ? "url(#limeNodeGlow)" : "url(#nodeShadow)"}
                        />

                        <text
                          x={player.x}
                          y={player.y + 0.68}
                          textAnchor="middle"
                          fill={isActive ? "#0E100C" : "#F7F8FA"}
                          fontSize="1.8"
                          fontWeight="700"
                          className="pointer-events-none select-none font-mono tabular-nums"
                        >
                          {player.number}
                        </text>

                        <g className="pointer-events-none select-none">
                          <text
                            x={player.x}
                            y={placement.y + 1.85}
                            textAnchor="middle"
                            fontSize={isActive ? "1.38" : "1.22"}
                            fontWeight={isActive ? "700" : "500"}
                            fill={isActive ? "#FFFFFF" : "#D4D6DC"}
                            filter="drop-shadow(0 1px 3px rgba(0,0,0,0.95))"
                          >
                            {displayName}
                            {isActive && (
                              <tspan fill="#D2F865" fontSize="1.0" fontWeight="600">
                                {" "}
                                · {shortPos}
                              </tspan>
                            )}
                          </text>
                        </g>
                      </g>
                    );
                  })}

                  {/* Focused Pass Volume Counters */}
                  <g id="pass-volume-badges-layer">
                    {passLinks.map((link, idx) => {
                      const p1 = getPlayer(link.from);
                      const p2 = getPlayer(link.to);
                      if (!p1 || !p2) return null;

                      const isConnected =
                        activePlayerId &&
                        (link.from === activePlayerId || link.to === activePlayerId);
                      const isHovered = hoveredLink === `${link.from}-${link.to}`;
                      if (!isConnected && !isHovered) return null;

                      const bx = (p1.x + p2.x) / 2;
                      const by = (p1.y + p2.y) / 2;
                      const badgeW = link.count >= 100 ? 6.6 : 5.6;

                      return (
                        <g
                          key={`badge-${idx}`}
                          className="pointer-events-none select-none"
                          filter="url(#nodeShadow)"
                        >
                          <rect
                            x={bx - badgeW / 2}
                            y={by - 1.55}
                            width={badgeW}
                            height="3.1"
                            rx="1.55"
                            fill="#101216"
                            stroke="#D2F865"
                            strokeWidth="0.35"
                          />
                          <text
                            x={bx}
                            y={by + 0.62}
                            textAnchor="middle"
                            fill="#D2F865"
                            fontSize="1.4"
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

              {/* ═══ OVERLAY 2: HEATMAP ═══ */}
              {overlayMode === "heat" && (
                <g id="heatmap-layer">
                  <ellipse cx="80" cy="54" rx="16" ry="10" fill="url(#heatLimeRight)" />
                  <ellipse cx="76" cy="16" rx="14" ry="9" fill="url(#heatCoralLeft)" />
                  <circle cx="89" cy="34" r="11" fill="url(#heatBoxPeak)" />
                  <ellipse cx="48" cy="34" rx="12" ry="14" fill="#637AE0" fillOpacity="0.14" />

                  <text x="80" y="58" textAnchor="middle" fill="#FFFFFF" fontSize="2.0" fontWeight="600">
                    {heatRightLabel}
                  </text>
                  <text x="76" y="20" textAnchor="middle" fill="#FFFFFF" fontSize="2.0" fontWeight="600">
                    {heatLeftLabel}
                  </text>
                </g>
              )}

              {/* ═══ OVERLAY 3: SHOTS & xG BUBBLE MAP (Echoes reference bubble chart palette) ═══ */}
              {overlayMode === "shots" && (
                <g id="shots-layer">
                  {shots.map((shot) => {
                    const shotXG =
                      typeof shot.xG === "number"
                        ? shot.xG
                        : typeof shot.xg === "number"
                        ? shot.xg
                        : 0.15;
                    const radius = 1.6 + shotXG * 4.2;
                    const isGoal = shot.outcome === "goal";
                    const isSaved = shot.outcome === "saved";
                    const isSelectedShot = activeShot?.id === shot.id;
                    const bubbleFill = isGoal
                      ? "#D2F865"
                      : isSaved
                      ? "#F4BA5B"
                      : "#F26E7C";

                    return (
                      <g
                        key={shot.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedShot(shot)}
                        onMouseEnter={() => setSelectedShot(shot)}
                      >
                        {isSelectedShot && (
                          <circle
                            cx={shot.x}
                            cy={shot.y}
                            r={radius + 1.3}
                            fill="none"
                            stroke="#FFFFFF"
                            strokeWidth="0.45"
                            strokeDasharray="1.1, 1"
                          />
                        )}
                        <circle
                          cx={shot.x}
                          cy={shot.y}
                          r={radius}
                          fill={bubbleFill}
                          fillOpacity={isGoal ? 0.92 : 0.82}
                          stroke={isSelectedShot ? "#FFFFFF" : "rgba(0,0,0,0.45)"}
                          strokeWidth={isSelectedShot ? "0.65" : "0.3"}
                        />
                        <text
                          x={shot.x}
                          y={shot.y + radius + 2.3}
                          textAnchor="middle"
                          fill={isSelectedShot ? "#D2F865" : "#E5E7EB"}
                          fontSize="1.55"
                          fontWeight="500"
                        >
                          {shot.player} ({shotXG.toFixed(2)})
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}
            </svg>
          </div>

          {/* ─── Quiet Bottom Legend, Pitch Controls & Active Focus Readout ─── */}
          <div className="pt-3.5 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#8A8D96]">
            {overlayMode === "shots" ? (
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D2F865]" />
                  Goal
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F4BA5B]" />
                  Saved
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F26E7C]" />
                  Off Target
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                {overlayMode === "pass" && (
                  <button
                    type="button"
                    onClick={() => setShowChannels((prev) => !prev)}
                    aria-pressed={showChannels}
                    title="Toggle five tactical vertical corridors"
                    className={`min-h-[30px] px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 border transition-colors cursor-pointer whitespace-nowrap ${
                      showChannels
                        ? "bg-[#D2F865]/15 text-[#D2F865] border-[#D2F865]/35"
                        : "bg-white/[0.03] text-[#9A9DA6] border-white/[0.09] hover:text-white hover:border-white/[0.16]"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Corridors</span>
                  </button>
                )}
                <span>Click any player node for full dossier</span>
                <span aria-hidden="true" className="hidden md:inline text-white/20">
                  ·
                </span>
                <span className="hidden md:inline">Node diameter reflects touch volume</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2.5">
              {overlayMode === "shots" && activeShot ? (
                <div className="flex items-center gap-2 text-xs text-white font-medium tabular-nums">
                  <span className="text-[#D2F865]">{activeShot.player}</span>
                  <span className="text-white/25">·</span>
                  <span className="font-mono">
                    {(
                      typeof activeShot.xG === "number"
                        ? activeShot.xG
                        : typeof activeShot.xg === "number"
                        ? activeShot.xg
                        : 0.15
                    ).toFixed(2)}{" "}
                    xG
                  </span>
                  <span className="text-white/25">·</span>
                  <span className="capitalize text-[#8A8D96]">{activeShot.outcome}</span>
                </div>
              ) : selectedPlayer ? (
                <div className="flex items-center gap-2 text-xs text-white font-medium tabular-nums">
                  <span className="text-[#D2F865]">
                    #{selectedPlayer.number} {selectedPlayer.name}
                  </span>
                  <span className="text-white/25">·</span>
                  <span className="font-mono">
                    OBV +{(typeof selectedPlayer.obv === "number" ? selectedPlayer.obv : 0.42).toFixed(2)}
                  </span>
                  <span className="text-white/25">·</span>
                  <span>{selectedPlayer.touches} touches</span>
                  <button
                    type="button"
                    onClick={() => setSelectedPlayer(null)}
                    className="ml-1 min-h-[28px] px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/[0.08] hover:bg-[#D2F865] text-white hover:text-[#0E100C] flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </>
      )}
      </SlidingTabPanel>
    </section>
  );
}
