"use client";

import React, { useState } from "react";
import { Sparkles, RotateCcw } from "lucide-react";

export default function PitchCanvas({
  activeMatch,
  overlayMode,
  selectedPlayer,
  setSelectedPlayer,
}) {
  const [hoveredPlayer, setHoveredPlayer] = useState(null);
  const [selectedShot, setSelectedShot] = useState(null);

  const activePlayerId = selectedPlayer?.id || hoveredPlayer?.id || null;

  const startingXI = activeMatch?.startingXI || [];
  const passLinks = activeMatch?.passLinks || [];
  const shots = activeMatch?.shots || [];
  const activeShot = selectedShot || shots[0] || null;

  const getPlayer = (id) => startingXI.find((p) => p.id === id);

  const modeLabel =
    overlayMode === "pass"
      ? "Pass Network"
      : overlayMode === "heat"
        ? "Attacking Heatmap"
        : "Shots & xG Map";

  return (
    <div className="apple-card relative w-full h-full min-h-[380px] sm:min-h-[440px] flex flex-col justify-between rounded-[24px] overflow-hidden p-3 sm:p-4 md:p-5 select-none">
      {/* Recessed Stadium Pitch Backdrop Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(14,34,24,0.65)_0%,rgba(11,25,18,0.92)_62%,rgba(19,20,27,1)_100%)]"
      />

      {/* Top Floating Liquid Glass HUD Bar */}
      <div className="relative flex flex-col gap-2 z-10 mb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="apple-glass-hud flex items-center gap-2 px-3 py-1.5 rounded-full self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse shrink-0" />
            <span className="text-[11px] sm:text-xs font-semibold text-white tracking-[-0.01em]">
              {activeMatch?.title}
              <span className="text-[#EBEBF5]/40 mx-1.5">•</span>
              <span className="text-[#00DAC3]">{modeLabel}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            {activeMatch?.expectedShape && (
              <div className="hidden md:flex items-center text-[11px] font-medium tabular-nums text-[#00DAC3] px-3 py-1 rounded-full bg-[#00DAC3]/12 border border-[#00DAC3]/25">
                Shape: {activeMatch.expectedShape}
              </div>
            )}
            <div className="apple-glass-hud text-[11px] font-medium text-[#EBEBF5]/75 px-3 py-1 rounded-full">
              The Kop: <span className="text-[#FF453A] font-semibold">Right ➔</span>
            </div>
            {selectedPlayer && (
              <button
                onClick={() => setSelectedPlayer(null)}
                className="min-h-[30px] flex items-center gap-1 text-[11px] font-semibold text-[#00DAC3] hover:text-white cursor-pointer bg-[#00DAC3]/14 hover:bg-[#00DAC3]/25 px-2.5 py-1 rounded-full border border-[#00DAC3]/30 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Tactical Battle Brief Pill */}
        {activeMatch?.keyTacticalBattle && (
          <div className="apple-glass-hud flex items-center gap-2 px-3 py-1.5 rounded-2xl text-[11px] text-[#EBEBF5]/72">
            <Sparkles className="w-3.5 h-3.5 text-[#FFD60A] shrink-0" strokeWidth={2} />
            <span className="font-semibold text-white shrink-0">Key Tactical Battle:</span>
            <span className="truncate text-[#00DAC3] font-medium">
              {activeMatch.keyTacticalBattle}
            </span>
          </div>
        )}
      </div>

      {/* SVG Pitch Canvas Area */}
      <div className="relative z-10 flex-1 w-full flex items-center justify-center overflow-x-auto">
        <svg
          role="img"
          aria-label={`Anfield tactical pitch showing ${modeLabel} for ${activeMatch?.title || "Liverpool FC"}`}
          viewBox="0 0 105 68"
          className="w-full h-auto min-w-[320px] max-h-[480px] object-contain"
        >
          <defs>
            <linearGradient id="appleTurfGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0B1912" />
              <stop offset="50%" stopColor="#10251B" />
              <stop offset="100%" stopColor="#0B1912" />
            </linearGradient>

            <radialGradient id="heatKopRight" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E03535" stopOpacity="0.82" />
              <stop offset="42%" stopColor="#FF9F0A" stopOpacity="0.48" />
              <stop offset="78%" stopColor="#00BFA5" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#0B1912" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="heatKopLeft" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E03535" stopOpacity="0.68" />
              <stop offset="52%" stopColor="#FF9F0A" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#0B1912" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="heatBoxCentre" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E5B338" stopOpacity="0.78" />
              <stop offset="38%" stopColor="#E03535" stopOpacity="0.56" />
              <stop offset="80%" stopColor="#E03535" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0B1912" stopOpacity="0" />
            </radialGradient>

            <filter id="nodeShadow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0.8" stdDeviation="1.1" floodColor="#07080B" floodOpacity="0.6" />
            </filter>
            <filter id="activeNodeHalo" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.8" floodColor="#00BFA5" floodOpacity="0.75" />
            </filter>
          </defs>

          {/* Turf Base */}
          <rect
            x="0"
            y="0"
            width="105"
            height="68"
            fill="url(#appleTurfGrad)"
            rx="2.5"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.35"
          />

          {/* Subtle Stadium Mow Stripes */}
          {[...Array(9)].map((_, i) => (
            <rect
              key={i}
              x={i * 11.66}
              y="0"
              width="5.83"
              height="68"
              fill="#FFFFFF"
              fillOpacity="0.018"
            />
          ))}

          {/* Authentic Stadium Chalk Pitch Lines */}
          <g stroke="#FFFFFF" strokeOpacity="0.22" strokeWidth="0.45" fill="none">
            <rect x="2" y="2" width="101" height="64" rx="1" />
            <line x1="52.5" y1="2" x2="52.5" y2="66" />
            <circle cx="52.5" cy="34" r="9.15" />
            <circle cx="52.5" cy="34" r="0.6" fill="#00DAC3" fillOpacity="0.75" stroke="none" />

            {/* Left penalty box */}
            <rect x="2" y="13.84" width="16.5" height="40.32" />
            <rect x="2" y="24.84" width="5.5" height="18.32" />
            <path d="M 18.5 28.5 A 9.15 9.15 0 0 1 18.5 39.5" />
            <circle cx="11" cy="34" r="0.55" fill="#FFFFFF" fillOpacity="0.45" stroke="none" />

            {/* The Kop penalty box */}
            <rect x="86.5" y="13.84" width="16.5" height="40.32" />
            <rect x="97.5" y="24.84" width="5.5" height="18.32" />
            <path d="M 86.5 28.5 A 9.15 9.15 0 0 0 86.5 39.5" />
            <circle cx="94" cy="34" r="0.55" fill="#FFFFFF" fillOpacity="0.45" stroke="none" />

            {/* Goals */}
            <rect x="0.5" y="30.34" width="1.5" height="7.32" strokeOpacity="0.35" />
            <rect x="103" y="30.34" width="1.5" height="7.32" strokeOpacity="0.35" />
          </g>

          {/* Subtle Stand Labels */}
          <text
            x="6.5"
            y="7.5"
            fill="#EBEBF5"
            fillOpacity="0.28"
            fontSize="2.4"
            fontWeight="600"
            letterSpacing="0.18"
          >
            ANFIELD ROAD STAND
          </text>
          <text
            x="76.5"
            y="7.5"
            fill="#FF453A"
            fillOpacity="0.55"
            fontSize="2.4"
            fontWeight="600"
            letterSpacing="0.18"
          >
            THE KOP STAND ➔
          </text>

          {/* ═══════ OVERLAY 1: PASS NETWORK ═══════ */}
          {overlayMode === "pass" && (
            <g id="pass-network-layer">
              {passLinks.map((link, idx) => {
                const p1 = getPlayer(link.from);
                const p2 = getPlayer(link.to);
                if (!p1 || !p2) return null;

                const isConnected =
                  activePlayerId === link.from || activePlayerId === link.to;
                const isDimmed = activePlayerId && !isConnected;
                const baseStroke = Math.min(Math.max(link.count / 8, 0.55), 3.0);

                return (
                  <line
                    key={idx}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={isConnected ? "#00DAC3" : "#FF453A"}
                    strokeOpacity={isDimmed ? 0.08 : isConnected ? 0.92 : 0.44}
                    strokeWidth={isConnected ? baseStroke * 1.45 : baseStroke}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                );
              })}

              {startingXI.map((player) => {
                const isActive = activePlayerId === player.id;
                const radius = 2.2 + (player.touches / 100) * 1.35;

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
                    {isActive && (
                      <circle
                        cx={player.x}
                        cy={player.y}
                        r={radius + 2.3}
                        fill="none"
                        stroke="#00DAC3"
                        strokeWidth="0.55"
                        strokeDasharray="1.5, 1.1"
                        className="animate-spin"
                        style={{
                          transformOrigin: `${player.x}px ${player.y}px`,
                          animationDuration: "8s",
                        }}
                      />
                    )}

                    <circle
                      cx={player.x}
                      cy={player.y}
                      r={radius}
                      fill={isActive ? "#00DAC3" : "#D70015"}
                      stroke="#FFFFFF"
                      strokeOpacity={isActive ? 1 : 0.9}
                      strokeWidth={isActive ? "0.75" : "0.45"}
                      filter={isActive ? "url(#activeNodeHalo)" : "url(#nodeShadow)"}
                    />

                    <text
                      x={player.x}
                      y={player.y + 0.72}
                      textAnchor="middle"
                      fill={isActive ? "#000000" : "#FFFFFF"}
                      fontSize="1.8"
                      fontWeight="700"
                      className="pointer-events-none select-none"
                    >
                      {player.number}
                    </text>

                    <text
                      x={player.x}
                      y={player.y + radius + 2.8}
                      textAnchor="middle"
                      fill={isActive ? "#00DAC3" : "#F5F5F7"}
                      fontSize="1.85"
                      fontWeight="600"
                      className="pointer-events-none select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]"
                    >
                      {player.name}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* ═══════ OVERLAY 2: ATTACKING HEATMAP ═══════ */}
          {overlayMode === "heat" && (
            <g id="heatmap-layer">
              <ellipse cx="80" cy="54" rx="16" ry="10" fill="url(#heatKopRight)" />
              <ellipse cx="76" cy="16" rx="14" ry="9" fill="url(#heatKopLeft)" />
              <circle cx="89" cy="34" r="11" fill="url(#heatBoxCentre)" />
              <ellipse cx="48" cy="34" rx="12" ry="14" fill="#00DAC3" fillOpacity="0.12" />

              <text
                x="80"
                y="58"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="2.1"
                fontWeight="600"
              >
                Half-Space Penetration
              </text>
              <text
                x="76"
                y="20"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="2.1"
                fontWeight="600"
              >
                Cutback Channel
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
                        stroke="#00DAC3"
                        strokeWidth="0.5"
                        strokeDasharray="1.1, 1"
                      />
                    )}
                    <circle
                      cx={shot.x}
                      cy={shot.y}
                      r={radius}
                      fill={isGoal ? "#FF453A" : "#8E8E93"}
                      fillOpacity={isGoal ? 0.92 : 0.65}
                      stroke={
                        isSelectedShot
                          ? "#00DAC3"
                          : isGoal
                            ? "#FFD60A"
                            : "rgba(255,255,255,0.85)"
                      }
                      strokeWidth={isSelectedShot ? "0.85" : isGoal ? "0.7" : "0.4"}
                    />
                    <text
                      x={shot.x}
                      y={shot.y + radius + 2.3}
                      textAnchor="middle"
                      fill={isSelectedShot ? "#00DAC3" : "#F5F5F7"}
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

      {/* Bottom Legend & Active Telemetry Pill */}
      <div className="relative z-10 mt-2.5 pt-2.5 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#EBEBF5]/68 gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF453A]" />
            <span>LFC Player / Goal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 rounded-full bg-[#FF453A]" />
            <span>Passing Dyad</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00DAC3]" />
            <span>Active Spotlight</span>
          </div>
        </div>

        {overlayMode === "shots" && activeShot ? (
          <div className="apple-glass-hud flex items-center gap-2 px-3 py-1 rounded-full text-white self-start sm:self-auto flex-wrap">
            <span className="text-[#FFD60A] font-semibold">{activeShot.player}</span>
            <span className="text-[#EBEBF5]/35">•</span>
            <span className="text-[#00DAC3] font-mono tabular-nums font-semibold">
              {activeShot.xG.toFixed(2)} xG
            </span>
            <span className="text-[#EBEBF5]/35">•</span>
            <span className="uppercase text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FF453A]/18 text-[#FF6961] border border-[#FF453A]/30">
              {activeShot.outcome}
            </span>
            {activeShot.desc && (
              <span className="text-[#EBEBF5]/68 text-[11px]">{activeShot.desc}</span>
            )}
          </div>
        ) : (
          selectedPlayer && (
            <div className="apple-glass-hud flex items-center gap-2 px-3 py-1 rounded-full text-white self-start sm:self-auto flex-wrap">
              <span className="text-[#FF453A] font-semibold">
                #{selectedPlayer.number} {selectedPlayer.name}
              </span>
              <span className="text-[#EBEBF5]/35">•</span>
              <span className="text-[#00DAC3] font-mono tabular-nums">
                OBV +{selectedPlayer.obv.toFixed(2)}
              </span>
              <span className="text-[#EBEBF5]/35">•</span>
              <span className="tabular-nums">Acc {selectedPlayer.comp}%</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
