"use client";

import React, { useId } from "react";
import { getTeamManagerInfo } from "../../data/premierLeagueManagers";

/**
 * Curated club colour & monogram lookup for major European & cup opponents
 * (Zero copyrighted crests or trademarked logos — geometric monogram shields only)
 */
const EUROPEAN_BADGE_PALETTE = {
  "club brugge": { short: "BRU", primary: "#005CA9", secondary: "#111318" },
  brugge: { short: "BRU", primary: "#005CA9", secondary: "#111318" },
  "real madrid": { short: "RMA", primary: "#F3F4F6", secondary: "#D4AF37" },
  barcelona: { short: "BAR", primary: "#004D98", secondary: "#A50044" },
  "fc barcelona": { short: "BAR", primary: "#004D98", secondary: "#A50044" },
  "bayern munich": { short: "BAY", primary: "#DC052D", secondary: "#0066B2" },
  "paris saint-germain": { short: "PSG", primary: "#004170", secondary: "#DA291C" },
  psg: { short: "PSG", primary: "#004170", secondary: "#DA291C" },
  "inter milan": { short: "INT", primary: "#010E80", secondary: "#111318" },
  internazionale: { short: "INT", primary: "#010E80", secondary: "#111318" },
  "ac milan": { short: "MIL", primary: "#C8102E", secondary: "#111318" },
  "borussia dortmund": { short: "BVB", primary: "#FDE100", secondary: "#111318" },
  "atletico madrid": { short: "ATM", primary: "#CB3524", secondary: "#1B3F8B" },
  "atlético madrid": { short: "ATM", primary: "#CB3524", secondary: "#1B3F8B" },
  juventus: { short: "JUV", primary: "#181A20", secondary: "#F3F4F6" },
  fenerbahce: { short: "FEN", primary: "#002D72", secondary: "#FFDD00" },
  "fenerbahçe": { short: "FEN", primary: "#002D72", secondary: "#FFDD00" },
  villarreal: { short: "VIL", primary: "#F7D417", secondary: "#005187" },
  ajax: { short: "AJA", primary: "#D2122E", secondary: "#F3F4F6" },
  benfica: { short: "SLB", primary: "#E30613", secondary: "#F3F4F6" },
  "sporting cp": { short: "SCP", primary: "#008057", secondary: "#F3F4F6" },
  porto: { short: "FCP", primary: "#00428C", secondary: "#F3F4F6" },
  napoli: { short: "NAP", primary: "#0067B1", secondary: "#9FD4FF" },
  "bayer leverkusen": { short: "B04", primary: "#E32221", secondary: "#111318" },
  "rb leipzig": { short: "RBL", primary: "#DD0741", secondary: "#001F47" },
  psv: { short: "PSV", primary: "#ED1C24", secondary: "#111318" },
  "psv eindhoven": { short: "PSV", primary: "#ED1C24", secondary: "#111318" },
  celtic: { short: "CEL", primary: "#018749", secondary: "#F3F4F6" },
  rangers: { short: "RAN", primary: "#1B458F", secondary: "#E30613" },
  atalanta: { short: "ATA", primary: "#1E71B8", secondary: "#111318" },
  "as roma": { short: "ROM", primary: "#8E1F2F", secondary: "#F0BC42" },
  lazio: { short: "LAZ", primary: "#87D8F7", secondary: "#182436" },
  galatasaray: { short: "GAL", primary: "#A90432", secondary: "#FDB912" },
  marseille: { short: "OM", primary: "#2FAEE0", secondary: "#F3F4F6" },
  monaco: { short: "ASM", primary: "#E51B22", secondary: "#F3F4F6" },
  lille: { short: "LOS", primary: "#E01E13", secondary: "#1E2640" },
  "athletic club": { short: "ATH", primary: "#EE2523", secondary: "#111318" },
  sevilla: { short: "SEV", primary: "#D4002A", secondary: "#F3F4F6" },
  feyenoord: { short: "FEY", primary: "#EE1C25", secondary: "#111318" },
};

const FALLBACK_PALETTES = [
  { primary: "#1D4ED8", secondary: "#93C5FD" },
  { primary: "#B91C1C", secondary: "#FCA5A5" },
  { primary: "#047857", secondary: "#6EE7B7" },
  { primary: "#6D28D9", secondary: "#C4B5FD" },
  { primary: "#0F766E", secondary: "#5EEAD4" },
  { primary: "#B45309", secondary: "#FCD34D" },
];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function isLightHex(hex) {
  if (!hex || !hex.startsWith("#")) return false;
  const clean = hex.slice(1);
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  if (full.length !== 6) return false;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.68;
}

function deriveShortCode(name) {
  if (!name) return "CLB";
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter((w) => !["fc", "afc", "cf", "sc", "ac", "as", "rb", "club"].includes(w.toLowerCase()));
  if (words.length >= 2) {
    return (words[0][0] + words[1].slice(0, 2)).toUpperCase();
  }
  return (words[0] || name).slice(0, 3).toUpperCase();
}

function resolveBadgeMeta(clubId, name, shortName, primaryColor, secondaryColor) {
  const info =
    (clubId ? getTeamManagerInfo(String(clubId)) : null) ||
    (name ? getTeamManagerInfo(name) : null);

  const key = (name || "").toLowerCase().trim();
  const euro =
    EUROPEAN_BADGE_PALETTE[key] ||
    Object.entries(EUROPEAN_BADGE_PALETTE).find(([k]) => key.includes(k))?.[1] ||
    null;

  const fallback = FALLBACK_PALETTES[hashString(key || String(clubId || "club")) % FALLBACK_PALETTES.length];

  const primary = primaryColor || info?.primaryColor || euro?.primary || fallback.primary;
  const secondary = secondaryColor || info?.secondaryColor || euro?.secondary || fallback.secondary;
  const code = (shortName || info?.shortName || euro?.short || deriveShortCode(name)).slice(0, 3).toUpperCase();

  return { primary, secondary, code };
}

const SIZE_MAP = {
  xs: { width: 20, height: 22, fontSize: 11.5 },
  sm: { width: 26, height: 28, fontSize: 11 },
  md: { width: 34, height: 38, fontSize: 11 },
  lg: { width: 44, height: 48, fontSize: 11 },
  xl: { width: 52, height: 56, fontSize: 11 },
};

export default function ClubBadge({
  clubId,
  name,
  shortName,
  primaryColor,
  secondaryColor,
  size = "md",
  className = "",
}) {
  const uid = useId().replace(/:/g, "");
  const { primary, secondary, code } = resolveBadgeMeta(
    clubId,
    name,
    shortName,
    primaryColor,
    secondaryColor
  );
  const dims = SIZE_MAP[size] || SIZE_MAP.md;
  const textColor = isLightHex(primary) ? "#0B0D11" : "#FFFFFF";
  const clipId = `shield-clip-${uid}`;
  const sheenId = `shield-sheen-${uid}`;

  return (
    <svg
      width={dims.width}
      height={dims.height}
      viewBox="0 0 40 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${name || code} club badge`}
      className={`shrink-0 select-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)] ${className}`}
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M20 2L36 7.2V21.5C36 31.6 29.1 38.9 20 42C10.9 38.9 4 31.6 4 21.5V7.2L20 2Z" />
        </clipPath>
        <linearGradient id={sheenId} x1="4" y1="2" x2="36" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Shield Body */}
      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="0" width="40" height="44" fill={primary} />
        {/* Secondary Accent Sash */}
        <path d="M25 0H40V44H17L25 0Z" fill={secondary} fillOpacity="0.28" />
        {/* Top Crown Bar */}
        <rect x="0" y="0" width="40" height="9" fill={secondary} fillOpacity="0.45" />
        {/* Subtle Glass Sheen */}
        <rect x="0" y="0" width="40" height="44" fill={`url(#${sheenId})`} />
      </g>

      {/* Outer & Inner Metallic Shield Rim */}
      <path
        d="M20 2L36 7.2V21.5C36 31.6 29.1 38.9 20 42C10.9 38.9 4 31.6 4 21.5V7.2L20 2Z"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.4"
      />
      <path
        d="M20 4.2L33.8 8.7V21.4C33.8 30.2 27.8 36.6 20 39.4C12.2 36.6 6.2 30.2 6.2 21.4V8.7L20 4.2Z"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="0.75"
      />

      {/* Crisp Club Monogram */}
      <text
        x="20"
        y="25.5"
        textAnchor="middle"
        fill={textColor}
        fontSize={dims.fontSize}
        fontWeight="800"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        letterSpacing="0.04em"
      >
        {code}
      </text>
    </svg>
  );
}
