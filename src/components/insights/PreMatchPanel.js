"use client";

import React, { useEffect, useState } from "react";
import TacticalRadarCard from "./TacticalRadarCard";
import SetPieceModal from "./SetPieceModal";
import { getTeamManagerInfo } from "../../data/premierLeagueManagers";
import {
  ChevronDown,
  ChevronUp,
  CloudRain,
  CornerDownRight,
  Flag,
  HeartPulse,
  History,
  Swords,
  TimerReset,
  Target,
  BatteryMedium,
  Check,
} from "lucide-react";

// ─── Base Matchday Phase Timings (Premier League T-75 Protocol) ──────────────
export const MATCHDAY_PHASES = [
  { id: "BUILD_UP", label: "Matchday", at: Infinity, clock: "", note: "Matchday build-up" },
  { id: "GATES", label: "Turnstiles Open", at: 7200, clock: "14:30", note: "Turnstiles open • Fans arriving" },
  { id: "LINEUPS", label: "Line-ups In", at: 4500, clock: "15:15", note: "Official team sheets published" },
  { id: "WARMUPS", label: "Warm-ups", at: 2700, clock: "15:45", note: "Players out for warm-ups" },
  { id: "TUNNEL", label: "Tunnel & Anthem", at: 300, clock: "16:25", note: "Teams in the tunnel" },
  { id: "KICKOFF", label: "Kick-off", at: 0, clock: "16:30", note: "Kick-off • Live data starts" },
];

export function getMatchdayPhase(countdownSeconds) {
  let current = MATCHDAY_PHASES[0];
  for (const phase of MATCHDAY_PHASES) {
    if (countdownSeconds <= phase.at) current = phase;
  }
  return current;
}

export function isLineupConfirmed(phaseId) {
  return ["LINEUPS", "WARMUPS", "TUNNEL", "KICKOFF"].includes(phaseId);
}

function formatScheduleClock(kickoffIso, minusMinutes, fallback) {
  if (!kickoffIso) return fallback;
  const ts = new Date(kickoffIso).getTime();
  if (Number.isNaN(ts)) return fallback;
  const dt = new Date(ts - minusMinutes * 60 * 1000);
  try {
    return dt.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/London",
    });
  } catch {
    return fallback;
  }
}

function buildDynamicPhases(venue, capacity, mainStand, anthem, manager, kickoffIso) {
  const gatesClock = formatScheduleClock(kickoffIso, 120, "T-2h");
  const lineupsClock = formatScheduleClock(kickoffIso, 75, "T-75m");
  const warmupsClock = formatScheduleClock(kickoffIso, 45, "T-45m");
  const tunnelClock = formatScheduleClock(kickoffIso, 5, "T-5m");
  const kickoffClock = formatScheduleClock(kickoffIso, 0, "Kick-off");

  return [
    {
      id: "BUILD_UP",
      label: "Matchday",
      at: Infinity,
      clock: "",
      note: "Matchday build-up",
      headline: `${venue} Matchday Preparation`,
      summary: `Stadium operations commenced at ${venue}. Match programmes and concourses open ahead of kick-off.`,
      details: [
        "Matchday fan zones and stadium concourses open to ticket holders",
        `Official team coaches depart team hotels en route to ${venue}`,
        "Pitch inspection completed by match officials",
      ],
      actionLabel: "View Match Context",
    },
    {
      id: "GATES",
      label: "Turnstiles Open",
      at: 7200,
      clock: gatesClock,
      note: "Turnstiles open • Fans arriving",
      headline: "Turnstiles Open Across All Stands",
      summary: `${venue} gates open 2 hours prior to kick-off${capacity ? ` (${capacity} capacity)` : ""}.`,
      details: [
        `Access control active at ${venue}; digital passes scanning at turnstiles`,
        "Team coaches arrive at the players' entrance ahead of team sheet submission",
        "Concourse kiosks open for arriving supporters",
      ],
      actionLabel: "Stadium Access Guide",
    },
    {
      id: "LINEUPS",
      label: "Line-ups In",
      at: 4500,
      clock: lineupsClock,
      note: "Official team sheets published",
      headline: "Official Team Sheets Exchanged",
      summary: "Official starting XIs and substitutes benches submitted to match officials and published to the live feed.",
      details: [
        "Confirmed starting line-ups verified and published in the Confirmed XI panel",
        "Substitutes benches and official formations locked into match protocol",
        "Pre-match tactical shapes ready for kick-off",
      ],
      actionLabel: "Inspect Confirmed XI",
    },
    {
      id: "WARMUPS",
      label: "Warm-ups",
      at: 2700,
      clock: warmupsClock,
      note: "Players out for warm-ups",
      headline: `Squads Emerge onto ${venue} Pitch for Drills`,
      summary: `Goalkeepers and outfield squads complete on-pitch warm-up routines at ${venue}.`,
      details: [
        "Rondo possession drills, progressive passing channels, and counter-press triggers",
        "High-intensity sprint activations and finishing routines",
        "Final goalkeeper distribution and shot-stopping drills",
      ],
      actionLabel: "View Tactical Drills",
    },
    {
      id: "TUNNEL",
      label: "Tunnel & Anthem",
      at: 300,
      clock: tunnelClock,
      note: "Teams in the tunnel",
      headline: `Tunnel Assembly at ${venue}`,
      summary: `Captains lead both squads into the ${venue} tunnel ahead of kick-off.`,
      details: [
        `Full stadium atmosphere building across ${venue}`,
        `Final tactical reminders from ${manager} in the tunnel prior to referee bell`,
        "Coin toss with club captains and match referee on the centre circle",
      ],
      actionLabel: "Listen to Atmosphere",
    },
    {
      id: "KICKOFF",
      label: "Kick-off",
      at: 0,
      clock: kickoffClock,
      note: "Kick-off • Live data starts",
      headline: "Referee Whistle & Live Telemetry Ingest",
      summary: "Official kick-off whistle. Live score, scorers, cards, substitutions, and match statistics update automatically.",
      details: [
        "Live feed switches to 15-second high-frequency refresh rate",
        "Real-time goals, yellow/red cards, and substitutions stream onto the scoreboard",
        "Live match statistics and event ticker activated",
      ],
      actionLabel: "Switch to Live Match Centre",
    },
  ];
}

// ─── Open-Meteo (free, no API key) weather for active stadium at kick-off ────
const DEFAULT_CONDITIONS = { tempC: 11, rainPct: 30, windKmh: 16, summary: "Partly cloudy" };

const WEATHER_CODES = {
  0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Freezing fog", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain", 71: "Light snow", 73: "Snow", 75: "Heavy snow",
  80: "Rain showers", 81: "Rain showers", 82: "Violent showers", 95: "Thunderstorm",
};

function useKickoffWeather(kickoffHour, lat, lon, city, fallback) {
  const [weather, setWeather] = useState({ ...fallback, source: `Open-Meteo • ${city || "UK"} forecast` });

  useEffect(() => {
    let cancelled = false;
    const targetLat = typeof lat === "number" ? lat : 53.4308;
    const targetLon = typeof lon === "number" ? lon : -2.9608;
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${targetLat}&longitude=${targetLon}` +
      `&hourly=temperature_2m,precipitation_probability,wind_speed_10m,weather_code` +
      `&timezone=Europe%2FLondon&forecast_days=1`;

    fetch(url)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Weather unavailable"))))
      .then((data) => {
        if (cancelled || !data?.hourly?.time) return;
        const idx = data.hourly.time.findIndex((t) => t.endsWith(`T${String(kickoffHour).padStart(2, "0")}:00`));
        if (idx < 0) return;
        setWeather({
          tempC: Math.round(data.hourly.temperature_2m[idx]),
          rainPct: data.hourly.precipitation_probability?.[idx] ?? fallback.rainPct,
          windKmh: Math.round(data.hourly.wind_speed_10m[idx]),
          summary: WEATHER_CODES[data.hourly.weather_code[idx]] || fallback.summary,
          source: `Open-Meteo • Live ${city || "Stadium"} satellite forecast`,
        });
      })
      .catch(() => {
        // Keep fallback forecast on failure
      });

    return () => {
      cancelled = true;
    };
  }, [kickoffHour, lat, lon, city, fallback]);

  return weather;
}

// ─── Small presentational helpers ────────────────────────────────────────────
const RESULT_STYLES = {
  W: "bg-[#D2F865]/15 text-[#D2F865] border-[#D2F865]/30",
  D: "bg-white/10 text-white/70 border-white/15",
  L: "bg-[#F26E7C]/15 text-[#F26E7C] border-[#F26E7C]/30",
};

function FormPills({ results }) {
  return (
    <div className="flex items-center gap-1">
      {results.map((r, i) => (
        <span
          key={i}
          className={`w-5 h-5 rounded-md border text-[10px] font-bold flex items-center justify-center ${RESULT_STYLES[r]} ${i === results.length - 1 ? "ring-1 ring-white/30" : ""}`}
        >
          {r}
        </span>
      ))}
    </div>
  );
}

function XgSparkline({ series, colour }) {
  const w = 96;
  const h = 26;
  const max = Math.max(...series.flat(), 3);
  const pts = (key) =>
    series
      .map((pair, i) => {
        const x = (i / (series.length - 1)) * (w - 4) + 2;
        const y = h - 2 - (pair[key] / max) * (h - 4);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-24 h-[26px]" aria-hidden="true">
      <polyline points={pts(1)} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" strokeDasharray="2,2" />
      <polyline points={pts(0)} fill="none" stroke={colour} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function trendLabel(series) {
  if (!series || series.length < 2) {
    return { text: "Steady", cls: "text-white/60", arrow: "→" };
  }
  const half = Math.floor(series.length / 2);
  const diff = (arr) => arr.reduce((s, p) => s + (p[0] - p[1]), 0) / arr.length;
  const delta = diff(series.slice(half)) - diff(series.slice(0, half));
  if (delta > 0.2) return { text: "Improving", cls: "text-white", arrow: "↗" };
  if (delta < -0.2) return { text: "Declining", cls: "text-[#FF6961]", arrow: "↘" };
  return { text: "Steady", cls: "text-white/60", arrow: "→" };
}

const NEWS_STYLES = {
  out: { label: "Out", cls: "bg-[#F26E7C]/18 text-[#F26E7C] border-[#F26E7C]/35" },
  doubt: { label: "Doubt", cls: "bg-[#F4BA5B]/15 text-[#F4BA5B] border-[#F4BA5B]/30" },
  booking: { label: "1 off ban", cls: "bg-white/10 text-white/75 border-white/15" },
};

function Card({ icon: Icon, title, children, className = "" }) {
  return (
    <div className={`pt-4 border-t border-white/[0.07] flex flex-col gap-2.5 min-w-0 ${className}`}>
      <div className="flex items-center gap-2 text-xs font-medium text-[#8A8D96]">
        <Icon className="w-3.5 h-3.5 text-[#D2F865]" strokeWidth={2} />
        {title}
      </div>
      {children}
    </div>
  );
}

// ─── Main panel ──────────────────────────────────────────────────────────────
export default function PreMatchPanel({
  activeMatch,
  selectedClub,
  phase,
  countdownSeconds,
  onPreviewPhase,
  isPreviewing,
  onResetPreview,
  matchPreMatch = null,
  kickoffIso = null,
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [h2hHomeVenueOnly, setH2hHomeVenueOnly] = useState(false);
  const [isSetPieceOpen, setIsSetPieceOpen] = useState(false);

  const club = selectedClub || getTeamManagerInfo(activeMatch?.teamId || "364") || getTeamManagerInfo("364");
  const pm = activeMatch?.preMatch || {};
  const homeTeam = activeMatch?.homeTeam || club.name;
  const awayTeam = activeMatch?.awayTeam || activeMatch?.opponent || "Opponent";
  const isClubHome = homeTeam.toLowerCase() === club.name.toLowerCase();
  const homeInfo = (isClubHome ? club : getTeamManagerInfo(homeTeam)) || {
    name: homeTeam,
    manager: "Head Coach",
    captain: homeTeam,
    stadium: "Stadium",
    city: "",
    capacity: "",
    mainStand: "Main Stand",
    anthem: "Club Anthem",
  };
  const venueName = matchPreMatch?.venue?.name || activeMatch?.venue || homeInfo.stadium;
  const venueCity = matchPreMatch?.venue?.city || activeMatch?.city || homeInfo.city || "";
  const venueCapacity =
    (matchPreMatch?.venue?.capacity ? Number(matchPreMatch.venue.capacity).toLocaleString("en-GB") : null) ||
    activeMatch?.capacity ||
    homeInfo.capacity ||
    "";
  const venueMainStand = isClubHome ? club.mainStand : homeInfo.mainStand || "Main Stand";
  const venueAnthem = isClubHome ? club.anthem : homeInfo.anthem || "Club Anthem";
  const venueLat = isClubHome ? club.lat : homeInfo.lat ?? 51.2;
  const venueLon = isClubHome ? club.lon : homeInfo.lon ?? 3.2;

  const confirmed = isLineupConfirmed(phase.id);

  const dynamicPhases = buildDynamicPhases(
    venueName,
    venueCapacity,
    venueMainStand,
    venueAnthem,
    club.manager,
    kickoffIso
  );
  const currentPhaseDetails = dynamicPhases.find((p) => p.id === phase.id) || dynamicPhases[0];

  const kickoffHourFromIso = kickoffIso ? new Date(kickoffIso).getUTCHours() : null;
  const weather = useKickoffWeather(
    kickoffHourFromIso ?? pm.kickoffHour ?? 19,
    venueLat,
    venueLon,
    venueCity || venueName,
    pm.conditions || DEFAULT_CONDITIONS
  );

  const wp = matchPreMatch?.winProbability || pm.winProbability || null;
  const homeForm = matchPreMatch?.form?.home?.length
    ? matchPreMatch.form.home
    : pm.form?.home?.length
      ? pm.form.home
      : [];
  const awayForm = matchPreMatch?.form?.away?.length
    ? matchPreMatch.form.away
    : pm.form?.away?.length
      ? pm.form.away
      : [];
  const homeSeries = pm.xgTrend?.home?.length ? pm.xgTrend.home : [];
  const awaySeries = pm.xgTrend?.away?.length ? pm.xgTrend.away : [];
  const homeTrend = trendLabel(homeSeries);
  const awayTrend = trendLabel(awaySeries);

  const realRecentHome = matchPreMatch?.lastFive?.home || [];
  const realRecentAway = matchPreMatch?.lastFive?.away || [];
  const rawH2h = pm.headToHead?.length ? pm.headToHead : [];
  const h2h = rawH2h.filter((m) => !h2hHomeVenueOnly || m.venue === venueName);
  const h2hSummary = h2h.reduce(
    (acc, m) => {
      acc[m.result] = (acc[m.result] || 0) + 1;
      return acc;
    },
    { W: 0, D: 0, L: 0 }
  );

  const lineupsInMins = Math.max(0, Math.ceil((countdownSeconds - 4500) / 60));

  const realRestHome = matchPreMatch?.rest?.home || pm.rest?.home || null;
  const realRestAway = matchPreMatch?.rest?.away || pm.rest?.away || null;
  const realReferee = matchPreMatch?.referee || pm.officials?.referee || null;

  return (
    <div className="space-y-4">
      {/* Win probability (only shown when real odds or fixture model exist) */}
      {wp && (
        <div className="pb-4 border-b border-white/[0.07]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2 text-xs font-medium text-white">
              <Target className="w-3.5 h-3.5 text-[#D2F865]" />
              <span>Win Probability</span>
              {pm.projectedXg && (
                <span className="text-[#8A8D96] font-normal">
                  · Forecast xG {pm.projectedXg[0]} – {pm.projectedXg[1]}
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#8A8D96]">
              {wp.source || pm.winProbabilitySource || "Live implied match odds"}
            </span>
          </div>
          <div className="flex h-7 w-full rounded-full overflow-hidden border border-white/[0.08] text-xs font-semibold">
            <div style={{ width: `${wp.home}%` }} className="bg-[#D2F865] flex items-center px-3 text-[#0E100C] truncate tabular-nums">
              {homeTeam} {wp.home}%
            </div>
            <div style={{ width: `${wp.draw}%` }} className="bg-white/12 flex items-center justify-center text-white/80 tabular-nums">
              Draw {wp.draw}%
            </div>
            <div style={{ width: `${wp.away}%` }} className="bg-[#637AE0]/50 flex items-center justify-end px-3 text-white truncate tabular-nums">
              {awayTeam} {wp.away}%
            </div>
          </div>
        </div>
      )}

      {/* Tactical Counter-Press Radar Comparison */}
      <TacticalRadarCard activeMatch={activeMatch} selectedClub={club} />

      {/* Tier 1: Real Form, Rest & Fixture Load, and Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card icon={TimerReset} title={`Recent Form (Last ${Math.max(homeForm.length, awayForm.length, 5)})`}>
          {homeForm.length > 0 || awayForm.length > 0 ? (
            [
              { team: homeTeam, form: homeForm, series: homeSeries, trend: homeTrend, colour: "#D2F865" },
              { team: awayTeam, form: awayForm, series: awaySeries, trend: awayTrend, colour: "#8BA3F5" },
            ].map((row) => (
              <div key={row.team} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-xs font-medium text-white block truncate mb-1">{row.team}</span>
                  {row.form.length > 0 ? (
                    <FormPills results={row.form} />
                  ) : (
                    <span className="text-[11px] text-[#6F727C]">Awaiting form feed</span>
                  )}
                </div>
                {row.series.length > 1 && (
                  <div className="flex flex-col items-end shrink-0">
                    <XgSparkline series={row.series} colour={row.colour} />
                    <span className={`text-[10px] font-medium ${row.trend.cls}`}>
                      {row.trend.arrow} {row.trend.text}
                    </span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-[#8A8D96]">
              Recent form data is awaiting publication from the official match feed.
            </p>
          )}
        </Card>

        <Card icon={BatteryMedium} title="Rest & Previous Match">
          {realRestHome || realRestAway ? (
            [
              { team: homeTeam, d: realRestHome },
              { team: awayTeam, d: realRestAway },
            ].map((row) => (
              <div key={row.team} className="space-y-0.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-white font-medium truncate">{row.team}</span>
                  <strong className={row.d && row.d.days <= 3 ? "text-[#F4BA5B] tabular-nums" : "text-[#D2F865] tabular-nums"}>
                    {row.d ? `${row.d.days}d rest` : "TBC"}
                  </strong>
                </div>
                {row.d?.last && (
                  <span className="text-[11px] text-[#8A8D96] block truncate">
                    Last: {row.d.last}
                  </span>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-[#8A8D96]">
              Recovery and previous fixture details will appear once published.
            </p>
          )}
        </Card>

        <Card icon={CloudRain} title="Venue & Kick-off Conditions">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-light font-mono text-white tabular-nums">{weather.tempC}°C</span>
            <span className="text-xs text-[#B7BAC3]">{weather.summary}</span>
          </div>
          <div className="text-xs text-[#8A8D96] tabular-nums">
            Rain {weather.rainPct}% · Wind {weather.windKmh} km/h
          </div>
          <div className="text-xs text-[#8A8D96]">
            {venueName}
            {venueCity ? ` · ${venueCity}` : ""}
            {venueCapacity ? ` · ${venueCapacity}` : ""}
          </div>
          <p className="text-[10px] text-[#6F727C]">{weather.source}</p>
        </Card>
      </div>

      {/* Tier 2: details toggle */}
      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        aria-expanded={showDetails}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-[#B7BAC3] hover:text-white cursor-pointer transition-colors"
      >
        {showDetails ? "Hide match context" : "More match context: last 5 results, tactical profile, set pieces, officials"}
        {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {showDetails && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Card icon={History} title={`${homeTeam} · Last 5 Matches`}>
            {realRecentHome.length > 0 ? (
              realRecentHome.map((m, idx) => (
                <div key={`rh-${idx}`} className="flex items-center justify-between text-xs gap-2">
                  <span className="text-[#6F727C] shrink-0 w-[56px] truncate">{m.date}</span>
                  <span className="text-white/90 truncate flex-1">
                    {m.atVs} {m.opponent}
                  </span>
                  <span className={`shrink-0 px-1.5 py-0.5 rounded border text-[10px] font-semibold tabular-nums ${RESULT_STYLES[m.result] || RESULT_STYLES.D}`}>
                    {m.score}
                  </span>
                </div>
              ))
            ) : h2h.length > 0 ? (
              h2h.map((m, idx) => (
                <div key={`${m.date}-${idx}`} className="flex items-center justify-between text-xs gap-2">
                  <span className="text-[#6F727C] shrink-0 w-[76px] truncate">{m.date}</span>
                  <span className="text-white/90 truncate flex-1">{m.fixture}</span>
                  <span className={`shrink-0 px-1.5 py-0.5 rounded border text-[10px] font-semibold tabular-nums ${RESULT_STYLES[m.result] || RESULT_STYLES.D}`}>{m.score}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#8A8D96]">No recent match log published for {homeTeam}.</p>
            )}
          </Card>

          <Card icon={History} title={`${awayTeam} · Last 5 Matches`}>
            {realRecentAway.length > 0 ? (
              realRecentAway.map((m, idx) => (
                <div key={`ra-${idx}`} className="flex items-center justify-between text-xs gap-2">
                  <span className="text-[#6F727C] shrink-0 w-[56px] truncate">{m.date}</span>
                  <span className="text-white/90 truncate flex-1">
                    {m.atVs} {m.opponent}
                  </span>
                  <span className={`shrink-0 px-1.5 py-0.5 rounded border text-[10px] font-semibold tabular-nums ${RESULT_STYLES[m.result] || RESULT_STYLES.D}`}>
                    {m.score}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#8A8D96]">No recent match log published for {awayTeam}.</p>
            )}
          </Card>

          <Card icon={Flag} title="Match Officials & Set Pieces">
            <div className="text-xs space-y-1.5">
              <div className="flex justify-between gap-2">
                <span className="text-[#8A8D96]">Referee</span>
                <strong className="text-white font-medium text-right">
                  {realReferee || "TBC (awaiting official sheet)"}
                </strong>
              </div>
              {pm.officials?.var && (
                <div className="flex justify-between gap-2">
                  <span className="text-[#8A8D96]">VAR</span>
                  <span className="text-white/85">{pm.officials.var}</span>
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] text-[#8A8D96] font-medium">Set-piece routines</span>
              <button
                type="button"
                onClick={() => setIsSetPieceOpen(true)}
                className="text-[11px] px-2.5 py-1 rounded-full border border-[#D2F865]/35 bg-[#D2F865]/12 text-[#D2F865] font-medium cursor-pointer hover:bg-[#D2F865]/22 flex items-center gap-1 transition-colors"
              >
                <CornerDownRight className="w-3 h-3" />
                Inspect Routines
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Matchday schedule timeline */}
      <div className="pt-4 border-t border-white/[0.07] transition-all duration-300">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-xs font-medium text-white">
            {venueName} Matchday Schedule
            {!confirmed && (
              <span className="text-[#8A8D96] ml-2 font-normal tabular-nums">
                Line-ups in {Math.floor(lineupsInMins / 60)}h {lineupsInMins % 60}m
              </span>
            )}
          </span>
          {isPreviewing ? (
            <button
              type="button"
              onClick={onResetPreview}
              className="text-[11px] px-3 py-1 rounded-full border border-[#D2F865]/35 bg-[#D2F865]/12 text-[#D2F865] font-medium cursor-pointer hover:bg-[#D2F865]/22 transition-colors flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D2F865]" />
              Previewing {currentPhaseDetails.label} · Return to live clock
            </button>
          ) : (
            <span className="text-[11px] text-[#6F727C]">Select a stage below to preview schedule details</span>
          )}
        </div>
        <ol className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {dynamicPhases.slice(1).map((step) => {
            const done = countdownSeconds < step.at;
            const current = phase.id === step.id;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => onPreviewPhase(step.at)}
                  aria-current={current ? "step" : undefined}
                  className={`w-full text-left cursor-pointer group p-2 rounded-xl transition-all ${
                    current
                      ? "bg-[#D2F865]/[0.08] ring-1 ring-[#D2F865]/40"
                      : "hover:bg-white/[0.04]"
                  }`}
                >
                  <div
                    className={`h-1 rounded-full mb-2 transition-all ${
                      current
                        ? "bg-[#D2F865] shadow-[0_0_10px_rgba(210,248,101,0.55)]"
                        : done
                        ? "bg-white/50"
                        : "bg-white/10 group-hover:bg-white/25"
                    }`}
                  />
                  <div className="flex items-center gap-1.5">
                    {done && !current ? (
                      <Check className="w-3 h-3 text-[#D2F865] shrink-0" />
                    ) : (
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          current ? "bg-[#D2F865]" : "bg-white/25"
                        }`}
                      />
                    )}
                    <span
                      className={`font-mono text-xs font-semibold tabular-nums ${
                        current ? "text-[#D2F865]" : done ? "text-white/50" : "text-white/85"
                      }`}
                    >
                      {step.clock}
                    </span>
                  </div>
                  <span
                    className={`block text-[11px] leading-tight mt-0.5 font-medium truncate ${
                      current ? "text-white" : done ? "text-[#6F727C]" : "text-[#8A8D96]"
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Selected Stage Detail Card */}
        {currentPhaseDetails && currentPhaseDetails.id !== "BUILD_UP" && (
          <div className="mt-3 pt-3 border-t border-white/[0.07] rounded-xl bg-[#0D0E11]/70 p-3.5 border border-white/[0.06]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#D2F865] text-[#0E100C] tabular-nums">
                  {currentPhaseDetails.clock || "LIVE"}
                </span>
                <span className="text-xs font-semibold text-white tracking-tight">
                  {currentPhaseDetails.headline}
                </span>
              </div>
              <span className="text-[11px] font-medium text-[#8A8D96]">
                {isPreviewing ? "Stage Simulation Active" : "Upcoming Milestone"}
              </span>
            </div>

            <p className="text-xs text-[#B7BAC3] mt-2 leading-relaxed">
              {currentPhaseDetails.summary}
            </p>

            {currentPhaseDetails.details && currentPhaseDetails.details.length > 0 && (
              <ul className="mt-2.5 space-y-1.5">
                {currentPhaseDetails.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[#8A8D96]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D2F865]/80 mt-1.5 shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] text-[#8A8D96] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D2F865]" />
                <span>
                  Tactical sync:{" "}
                  {["LINEUPS", "WARMUPS", "TUNNEL", "KICKOFF"].includes(currentPhaseDetails.id)
                    ? `Confirmed ${club.name} Squad Active`
                    : `Predicted ${club.name} XI Active`}
                </span>
              </div>
              {currentPhaseDetails.actionLabel && (
                <button
                  type="button"
                  onClick={() => {
                    if (currentPhaseDetails.id === "LINEUPS") {
                      const el = document.getElementById("pitch-canvas");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="text-[11px] px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white font-medium transition-colors cursor-pointer border border-white/[0.10]"
                >
                  {currentPhaseDetails.actionLabel}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* DeepMind TacticAI Set-Piece Modal */}
      <SetPieceModal
        isOpen={isSetPieceOpen}
        onClose={() => setIsSetPieceOpen(false)}
        activeMatch={activeMatch}
        selectedClub={club}
      />
    </div>
  );
}
