"use client";

import React, { useEffect, useState } from "react";
import TacticalRadarCard from "./TacticalRadarCard";
import SetPieceModal from "./SetPieceModal";
import { getTeamManagerInfo } from "../../data/premierLeagueManagers";
import {
  Activity,
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

function buildDynamicPhases(venue, capacity, mainStand, anthem, manager) {
  return [
    {
      id: "BUILD_UP",
      label: "Matchday",
      at: Infinity,
      clock: "",
      note: "Matchday build-up",
      headline: `${venue} Matchday Preparation`,
      summary: `Stadium operations commenced at ${venue}. Match programmes and hospitality concourses open around the ground.`,
      details: [
        "Club store & matchday fan zones open to ticket holders",
        `Official team coaches depart team hotels en route to ${venue}`,
        "Pitch inspection completed by Premier League match officials",
      ],
      actionLabel: "View Match Context",
    },
    {
      id: "GATES",
      label: "Turnstiles Open",
      at: 7200,
      clock: "14:30",
      note: "Turnstiles open • Fans arriving",
      headline: "Turnstiles Open Across All Four Stands",
      summary: `${venue} gates open 2 hours prior to kick-off across ${mainStand} and all stadium tiers.`,
      details: [
        `Access control active at ${capacity} capacity; NFC digital passes scan at turnstiles`,
        "Players' coach arrival at stadium players' entrance scheduled for 14:45",
        "Concourse kiosks open with matchday specials and digital match programmes",
      ],
      actionLabel: "Stadium Access Guide",
    },
    {
      id: "LINEUPS",
      label: "Line-ups In",
      at: 4500,
      clock: "15:15",
      note: "Official team sheets published",
      headline: "Premier League Official Team Sheets Exchanged",
      summary: "Official starting XIs and 9-player substitutes benches submitted to match referee and broadcast directors under the Premier League T-75 rule.",
      details: [
        "Confirmed starting line-ups officially verified and locked into match protocol",
        "Pitch status transitions from Predicted XI to Confirmed Tactical Shape",
        "Opposition bench composition and formation nuances published to analyst feeds",
      ],
      actionLabel: "Inspect Confirmed XI",
    },
    {
      id: "WARMUPS",
      label: "Warm-ups",
      at: 2700,
      clock: "15:45",
      note: "Players out for warm-ups",
      headline: `Squads Emerge onto ${venue} Pitch for Drills`,
      summary: `Goalkeepers start warm-up routines with coaching staff at 15:45; outfield squads emerge at 15:52 to ${venue} applause.`,
      details: [
        "Rondo possession drills, progressive passing channels, and counter-press triggers",
        `High-intensity sprint activations and box finishing routines facing ${mainStand}`,
        "Stadium sound system begins matchday playlist countdown",
      ],
      actionLabel: "View Tactical Drills",
    },
    {
      id: "TUNNEL",
      label: "Tunnel & Anthem",
      at: 300,
      clock: "16:25",
      note: `Teams in the tunnel • ${anthem}`,
      headline: `Tunnel Assembly & '${anthem}'`,
      summary: `Captains lead both squads into the ${venue} tunnel as '${anthem}' plays to a standing home crowd.`,
      details: [
        `Full stadium scarf and banner display across ${mainStand}`,
        `Final tactical reminders from ${manager} in tunnel corridor prior to referee bell`,
        "Coin toss with club captains and match referee on the centre circle",
      ],
      actionLabel: "Listen to Atmosphere",
    },
    {
      id: "KICKOFF",
      label: "Kick-off",
      at: 0,
      clock: "16:30",
      note: "Kick-off • Live data starts",
      headline: "Referee Whistle & Live Telemetry Ingest",
      summary: "Official kick-off whistle. Real-time ball possession, expected goals (xG), high-press intensity (PPDA), and pass networks commence live feed.",
      details: [
        "Live telemetry switches to 15-second high-frequency refresh rate",
        "Opta/StatsPerform positional tracking and heatmaps begin plotting live",
        "Real-time tactical mismatch and momentum radar activated",
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
  W: "bg-[#30D158]/20 text-[#30D158] border-[#30D158]/40",
  D: "bg-white/10 text-white/70 border-white/20",
  L: "bg-[#FF453A]/20 text-[#FF6961] border-[#FF453A]/40",
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
  out: { label: "Out", cls: "bg-[#FF453A]/20 text-[#FF6961] border-[#FF453A]/35" },
  doubt: { label: "Doubt", cls: "bg-white/10 text-white/90 border-white/20" },
  booking: { label: "1 off ban", cls: "bg-white/10 text-white/70 border-white/15" },
};

function Card({ icon: Icon, title, children, className = "" }) {
  return (
    <div className={`apple-tile rounded-xl border border-white/[0.06] p-3 flex flex-col gap-2 min-w-0 ${className}`}>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#8E8E93]">
        <Icon className="w-3.5 h-3.5 text-[#FF2636]" strokeWidth={2} />
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
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [h2hHomeVenueOnly, setH2hHomeVenueOnly] = useState(false);
  const [isSetPieceOpen, setIsSetPieceOpen] = useState(false);

  const club = selectedClub || getTeamManagerInfo(activeMatch?.teamId || "364") || getTeamManagerInfo("364");
  const pm = activeMatch?.preMatch || {};
  const homeTeam = activeMatch?.homeTeam || club.name;
  const awayTeam = activeMatch?.awayTeam || activeMatch?.opponent || "Opponent";
  const homeInfo = getTeamManagerInfo(homeTeam) || club;
  const venueName = activeMatch?.venue || homeInfo.stadium || club.stadium;
  const venueCity = activeMatch?.city || homeInfo.city || club.city;
  const venueCapacity = activeMatch?.capacity || homeInfo.capacity || club.capacity;
  const venueMainStand = activeMatch?.mainStand || homeInfo.mainStand || club.mainStand;
  const venueAnthem = activeMatch?.anthem || homeInfo.anthem || club.anthem;
  const venueLat = activeMatch?.lat ?? homeInfo.lat ?? club.lat;
  const venueLon = activeMatch?.lon ?? homeInfo.lon ?? club.lon;

  const confirmed = isLineupConfirmed(phase.id);

  const dynamicPhases = buildDynamicPhases(
    venueName,
    venueCapacity,
    venueMainStand,
    venueAnthem,
    homeInfo.manager || club.manager
  );
  const currentPhaseDetails = dynamicPhases.find((p) => p.id === phase.id) || dynamicPhases[0];

  const weather = useKickoffWeather(
    pm.kickoffHour ?? 16,
    venueLat,
    venueLon,
    venueCity,
    pm.conditions || DEFAULT_CONDITIONS
  );

  const wp = pm.winProbability || { home: 52, draw: 24, away: 24 };
  const homeForm = pm.form?.home?.length ? pm.form.home : ["W", "W", "D", "W", "L", "W"];
  const awayForm = pm.form?.away?.length ? pm.form.away : ["W", "D", "L", "W", "D", "L"];
  const homeSeries = pm.xgTrend?.home?.length ? pm.xgTrend.home : [[1.6, 1.1], [1.9, 0.9], [1.4, 1.2], [2.1, 0.8], [1.7, 1.1], [2.2, 1.0]];
  const awaySeries = pm.xgTrend?.away?.length ? pm.xgTrend.away : [[1.4, 1.3], [1.2, 1.5], [1.5, 1.2], [1.1, 1.6], [1.3, 1.4], [1.2, 1.5]];
  const homeTrend = trendLabel(homeSeries);
  const awayTrend = trendLabel(awaySeries);

  const rawH2h = pm.headToHead?.length
    ? pm.headToHead
    : [
        { date: "Recent", fixture: `${homeTeam} vs ${awayTeam}`, score: "2–1", result: "W", venue: venueName },
      ];
  const h2h = rawH2h.filter((m) => !h2hHomeVenueOnly || m.venue === venueName);
  const h2hSummary = h2h.reduce(
    (acc, m) => {
      acc[m.result] = (acc[m.result] || 0) + 1;
      return acc;
    },
    { W: 0, D: 0, L: 0 }
  );

  const lineupsInMins = Math.max(0, Math.ceil((countdownSeconds - 4500) / 60));

  const defaultKeyDuel = pm.keyDuel || {
    home: {
      name: activeMatch?.startingXI?.[8]?.name || homeInfo.captain,
      number: activeMatch?.startingXI?.[8]?.number || 7,
      stat: "3.8",
      label: "progressive carries /90",
    },
    away: {
      name: `${awayTeam} Defender`,
      number: 3,
      stat: "2.1",
      label: "tackles won /90",
    },
    takeaway: `${homeInfo.name}'s half-space overload under ${homeInfo.manager} is the primary tactical battleground against ${awayTeam}.`,
  };

  return (
    <div className="space-y-3">
      {/* Win probability + data status */}
      <div className="apple-tile rounded-xl border border-white/[0.06] p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#8E8E93]">
            <Target className="w-3.5 h-3.5 text-[#FF2636]" />
            Win Probability
            <span className="normal-case tracking-normal font-medium text-white/40 ml-1">
              • Forecast xG {pm.projectedXg?.[0] ?? 2.18} – {pm.projectedXg?.[1] ?? 1.05}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="flex items-center gap-1 text-[#F1B82D]">
              <Activity className="w-3 h-3 animate-pulse" />
              Live telemetry synced for {club.name}
            </span>
          </div>
        </div>
        <div className="flex h-7 w-full rounded-lg overflow-hidden border border-white/10 text-[11px] font-bold">
          <div style={{ width: `${wp.home}%` }} className="bg-gradient-to-r from-[#800A1A] to-[#E31B23] flex items-center px-2 text-white truncate">
            {homeTeam} {wp.home}%
          </div>
          <div style={{ width: `${wp.draw}%` }} className="bg-white/15 flex items-center justify-center text-white/80">
            Draw {wp.draw}%
          </div>
          <div style={{ width: `${wp.away}%` }} className="bg-white/[0.06] flex items-center justify-end px-2 text-white/80">
            {wp.away}%
          </div>
        </div>
        <p className="text-[10px] text-white/40 mt-1.5">
          {awayTeam} {wp.away}% • {pm.winProbabilitySource || "Elo rating blended with live Premier League table & market odds"}
        </p>
      </div>

      {/* Tactical Counter-Press Radar Comparison */}
      <TacticalRadarCard activeMatch={activeMatch} selectedClub={club} />

      {/* Tier 1: form, team news, key duel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Card icon={TimerReset} title="Form & xG trend (last 6)">
          {[
            { team: homeTeam, form: homeForm, series: homeSeries, trend: homeTrend, colour: "#FF2636" },
            { team: awayTeam, form: awayForm, series: awaySeries, trend: awayTrend, colour: "#C7C7CC" },
          ].map((row) => (
            <div key={row.team} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-white block truncate">{row.team}</span>
                <FormPills results={row.form} />
              </div>
              <div className="flex flex-col items-end shrink-0">
                {row.series.length > 1 && <XgSparkline series={row.series} colour={row.colour} />}
                <span className={`text-[10px] font-semibold ${row.trend.cls}`}>
                  {row.trend.arrow} {row.trend.text}
                </span>
              </div>
            </div>
          ))}
          <p className="text-[9px] text-white/35">Solid line: xG for • dashed line: xG against • most recent on the right</p>
        </Card>

        <Card icon={HeartPulse} title="Team news & availability">
          {[
            {
              team: homeTeam,
              items: pm.teamNews?.home?.length
                ? pm.teamNews.home
                : [{ name: homeInfo.captain, status: "doubt", detail: "Assessed in final training session" }],
            },
            {
              team: awayTeam,
              items: pm.teamNews?.away?.length
                ? pm.teamNews.away
                : [{ name: `${awayTeam} Squad`, status: "booking", detail: "1 caution away from suspension" }],
            },
          ].map((group) => (
            <div key={group.team} className="space-y-1">
              <span className="text-[10px] font-semibold text-white/60">{group.team}</span>
              {group.items.map((p, idx) => {
                const st = NEWS_STYLES[p.status] || NEWS_STYLES.doubt;
                return (
                  <div key={`${p.name}-${idx}`} className="flex items-start gap-1.5 text-[11px]">
                    <span className={`shrink-0 px-1.5 py-[1px] rounded border text-[9px] font-bold uppercase ${st.cls}`}>
                      {st.label}
                    </span>
                    <span className="min-w-0">
                      <strong className="text-white font-semibold">{p.name}</strong>
                      <span className="text-white/50"> • {p.detail}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </Card>

        <Card icon={Swords} title="Key duel">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="text-left min-w-0">
              <span className="text-[10px] font-mono text-[#FF4D5A] font-bold">#{defaultKeyDuel.home.number}</span>
              <span className="block text-[12px] font-bold text-white truncate">{defaultKeyDuel.home.name}</span>
              <span className="block text-lg font-black font-mono text-[#FF2636] leading-none mt-1">{defaultKeyDuel.home.stat}</span>
              <span className="block text-[9px] text-white/45">{defaultKeyDuel.home.label}</span>
            </div>
            <span className="text-[10px] font-bold text-white/30">VS</span>
            <div className="text-right min-w-0">
              <span className="text-[10px] font-mono text-white/60 font-bold">#{defaultKeyDuel.away.number}</span>
              <span className="block text-[12px] font-bold text-white truncate">{defaultKeyDuel.away.name}</span>
              <span className="block text-lg font-black font-mono text-white/80 leading-none mt-1">{defaultKeyDuel.away.stat}</span>
              <span className="block text-[9px] text-white/45">{defaultKeyDuel.away.label}</span>
            </div>
          </div>
          <p className="text-[11px] text-white/70 leading-snug">{defaultKeyDuel.takeaway}</p>
        </Card>
      </div>

      {/* Tier 2: details toggle */}
      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        aria-expanded={showDetails}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[11px] font-semibold text-white/70 hover:text-white cursor-pointer transition-colors"
      >
        {showDetails ? "Hide match context" : "More match context: recent results, tactics, set pieces, rest, officials, conditions"}
        {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {showDetails && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <Card icon={History} title="Recent Results & H2H">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/70">
                {club.shortName}: <strong className="text-[#30D158]">{h2hSummary.W}W</strong>{" "}
                <strong className="text-white/70">{h2hSummary.D}D</strong>{" "}
                <strong className="text-[#FF6961]">{h2hSummary.L}L</strong>
              </span>
              <button
                type="button"
                onClick={() => setH2hHomeVenueOnly(!h2hHomeVenueOnly)}
                aria-pressed={h2hHomeVenueOnly}
                className={`text-[10px] px-2 py-0.5 rounded-full border cursor-pointer ${
                  h2hHomeVenueOnly
                    ? "bg-[#E31B23]/25 border-[#E31B23]/40 text-white"
                    : "border-white/15 text-white/60 hover:text-white"
                }`}
              >
                At {venueName} only
              </button>
            </div>
            {h2h.map((m, idx) => (
              <div key={`${m.date}-${idx}`} className="flex items-center justify-between text-[11px] gap-2">
                <span className="text-white/45 shrink-0 w-[76px] truncate">{m.date}</span>
                <span className="text-white/90 truncate flex-1">{m.fixture}</span>
                <span className={`shrink-0 px-1.5 rounded border text-[10px] font-bold ${RESULT_STYLES[m.result] || RESULT_STYLES.D}`}>{m.score}</span>
              </div>
            ))}
          </Card>

          <Card icon={Swords} title="Tactical mismatch">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black font-mono text-[#00DAC3]">{pm.tactical?.ppda ?? activeMatch?.metrics?.ppda ?? 7.1}</span>
              <span className="text-[10px] text-white/50">{club.shortName} PPDA (lower = more pressing)</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black font-mono text-white/80">{pm.tactical?.opponentTurnovers ?? 13}</span>
              <span className="text-[10px] text-white/50">{awayTeam} turnovers per game under high press</span>
            </div>
            <p className="text-[11px] text-white/70 leading-snug">
              {pm.tactical?.takeaway || `${club.name} deploy ${club.manager}'s ${club.formation} (${club.tacticalStyle.toLowerCase()}) to disrupt ${awayTeam}'s build-up.`}
            </p>
          </Card>

          <Card icon={Flag} title="Set pieces (xG per game)">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">TacticAI Dynamics</span>
              <button
                type="button"
                onClick={() => setIsSetPieceOpen(true)}
                className="text-[10px] px-2 py-0.5 rounded-full border border-[#00DAC3]/40 bg-[#00DAC3]/15 text-[#00DAC3] font-semibold cursor-pointer hover:bg-[#00DAC3]/25 flex items-center gap-1 transition-colors"
              >
                <CornerDownRight className="w-3 h-3" />
                Inspect Routines
              </button>
            </div>
            {[
              { team: homeTeam, d: pm.setPieces?.home || { for: 0.36, against: 0.22 } },
              { team: awayTeam, d: pm.setPieces?.away || { for: 0.28, against: 0.31 } },
            ].map((row) => (
              <div key={row.team} className="flex items-center justify-between text-[11px]">
                <span className="text-white/80">{row.team}</span>
                <span className="font-mono">
                  <span className="text-[#30D158]">{row.d?.for?.toFixed(2)}</span>
                  <span className="text-white/30"> for • </span>
                  <span className="text-[#FF6961]">{row.d?.against?.toFixed(2)}</span>
                  <span className="text-white/30"> against</span>
                </span>
              </div>
            ))}
            <p className="text-[11px] text-white/70 leading-snug">
              {pm.setPieces?.takeaway || `${club.name} generate high-value aerial deliveries targeting ${club.captain} inside the six-yard box.`}
            </p>
          </Card>

          <Card icon={BatteryMedium} title="Rest & fixture load">
            {[
              { team: homeTeam, d: pm.rest?.home || { days: 6, last: "Previous PL Match" } },
              { team: awayTeam, d: pm.rest?.away || { days: 5, last: "Previous PL Match" } },
            ].map((row) => (
              <div key={row.team} className="flex items-center justify-between text-[11px] gap-2">
                <span className="text-white/80">{row.team}</span>
                <span className="text-right">
                  <strong className={row.d?.days <= 3 ? "text-[#FF9F0A]" : "text-white"}>{row.d?.days} days</strong>
                  <span className="text-white/45"> • {row.d?.last}</span>
                </span>
              </div>
            ))}
            <p className="text-[11px] text-[#FF9F0A]/90 leading-snug">
              {pm.rest?.flag || `${club.name} arrive with full tactical recovery ahead of kick-off at ${venueName}.`}
            </p>
          </Card>

          <Card icon={Flag} title="Match officials">
            <div className="text-[11px] space-y-0.5">
              <div className="flex justify-between"><span className="text-white/50">Referee</span><strong className="text-white">{pm.officials?.referee || "Michael Oliver"}</strong></div>
              <div className="flex justify-between"><span className="text-white/50">VAR</span><span className="text-white/85">{pm.officials?.var || "Stuart Attwell"}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Cards per game</span><span className="font-mono text-[#FFD60A]">{pm.officials?.cardsPerGame || "3.8"}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Penalties per game</span><span className="font-mono text-white/85">{pm.officials?.pensPerGame || "0.21"}</span></div>
            </div>
          </Card>

          <Card icon={CloudRain} title="Conditions at kick-off">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black font-mono text-white">{weather.tempC}°C</span>
              <span className="text-[11px] text-white/70">{weather.summary}</span>
            </div>
            <div className="text-[11px] text-white/60">
              Rain {weather.rainPct}% • Wind {weather.windKmh} km/h
            </div>
            <div className="text-[11px] text-white/60">
              {pm.pitch || `${venueName} • Hybrid grass`} • <span className="text-white/85">{pm.attendance || `${venueCapacity} • Capacity`}</span>
            </div>
            <p className="text-[9px] text-white/35">{weather.source}</p>
          </Card>
        </div>
      )}

      {/* Matchday schedule timeline */}
      <div className="apple-tile rounded-xl border border-white/[0.06] p-3 transition-all duration-300">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E8E93]">
            {venueName} Matchday Schedule
            {!confirmed && (
              <span className="normal-case tracking-normal text-white/80 ml-2 font-medium">
                Line-ups in {Math.floor(lineupsInMins / 60)}h {lineupsInMins % 60}m
              </span>
            )}
          </span>
          {isPreviewing ? (
            <button
              type="button"
              onClick={onResetPreview}
              className="text-[10px] px-2.5 py-0.5 rounded-full border border-[#FF2636]/40 bg-[#FF2636]/15 text-white font-semibold cursor-pointer hover:bg-[#FF2636]/25 transition flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2636] animate-ping" />
              Previewing {currentPhaseDetails.label} • Return to live clock
            </button>
          ) : (
            <span className="text-[10px] text-white/40">Select a stage below to preview schedule details</span>
          )}
        </div>
        <ol className="grid grid-cols-5 gap-1.5">
          {dynamicPhases.slice(1).map((step) => {
            const done = countdownSeconds < step.at;
            const current = phase.id === step.id;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => onPreviewPhase(step.at)}
                  aria-current={current ? "step" : undefined}
                  className={`w-full text-left cursor-pointer group p-1.5 rounded-lg transition-all ${
                    current
                      ? "bg-white/[0.08] ring-1 ring-[#FF2636]/50 shadow-sm"
                      : "hover:bg-white/[0.04]"
                  }`}
                >
                  <div
                    className={`h-1 rounded-full mb-1.5 transition-all ${
                      current
                        ? "bg-[#FF2636] shadow-[0_0_10px_#FF2636]"
                        : done
                        ? "bg-white/60"
                        : "bg-white/10 group-hover:bg-white/25"
                    }`}
                  />
                  <div className="flex items-center gap-1">
                    {done && !current ? (
                      <Check className="w-3 h-3 text-white/80 shrink-0" />
                    ) : (
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          current ? "bg-[#FF2636] animate-pulse" : "bg-white/25"
                        }`}
                      />
                    )}
                    <span
                      className={`font-mono text-[11px] font-bold ${
                        current ? "text-white" : done ? "text-white/45" : "text-white/80"
                      }`}
                    >
                      {step.clock}
                    </span>
                  </div>
                  <span
                    className={`block text-[10px] leading-tight mt-0.5 font-medium truncate ${
                      current ? "text-white font-semibold" : done ? "text-white/40" : "text-white/60"
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
          <div className="mt-3 pt-3 border-t border-white/[0.08] rounded-lg bg-black/30 p-3 ring-1 ring-white/[0.05] animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FF2636]/20 text-[#FF4D5A] border border-[#FF2636]/30">
                  {currentPhaseDetails.clock || "LIVE"}
                </span>
                <span className="text-xs font-bold text-white tracking-tight">
                  {currentPhaseDetails.headline}
                </span>
              </div>
              <span className="text-[10px] font-medium text-white/50">
                {isPreviewing ? "Stage Simulation Active" : "Upcoming Milestone"}
              </span>
            </div>

            <p className="text-[11px] text-white/75 mt-1.5 leading-relaxed">
              {currentPhaseDetails.summary}
            </p>

            {currentPhaseDetails.details && currentPhaseDetails.details.length > 0 && (
              <ul className="mt-2.5 space-y-1.5">
                {currentPhaseDetails.details.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[10px] text-white/65">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF2636]/80 mt-1 shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
              <div className="text-[10px] text-white/40 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
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
                  className="text-[10px] px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white font-medium transition cursor-pointer border border-white/15"
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
