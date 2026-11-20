"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  ChevronDown,
  ChevronUp,
  CloudRain,
  Flag,
  HeartPulse,
  History,
  Swords,
  TimerReset,
  Target,
  BatteryMedium,
  Check,
} from "lucide-react";

// ─── Matchday phases (Premier League timings relative to kick-off) ───────────
// Line-ups must be published 75 minutes before kick-off; warm-ups ~45 minutes.
export const MATCHDAY_PHASES = [
  { id: "BUILD_UP", label: "Matchday", at: Infinity, clock: "", note: "Matchday build-up" },
  { id: "GATES", label: "Turnstiles Open", at: 7200, clock: "14:30", note: "Turnstiles open" },
  { id: "LINEUPS", label: "Line-ups In", at: 4500, clock: "15:15", note: "Official line-ups published" },
  { id: "WARMUPS", label: "Warm-ups", at: 2700, clock: "15:45", note: "Players out for warm-ups" },
  { id: "TUNNEL", label: "Tunnel & YNWA", at: 300, clock: "16:25", note: "Teams in the tunnel • You'll Never Walk Alone" },
  { id: "KICKOFF", label: "Kick-off", at: 0, clock: "16:30", note: "Kick-off • live data starts" },
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

// ─── Open-Meteo (free, no API key) weather for Anfield at kick-off ───────────
const ANFIELD = { lat: 53.4308, lon: -2.9608 };
const DEFAULT_CONDITIONS = { tempC: 9, rainPct: 40, windKmh: 18, summary: "Overcast" };

const WEATHER_CODES = {
  0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Freezing fog", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain", 71: "Light snow", 73: "Snow", 75: "Heavy snow",
  80: "Rain showers", 81: "Rain showers", 82: "Violent showers", 95: "Thunderstorm",
};

function useKickoffWeather(kickoffHour, fallback) {
  const [weather, setWeather] = useState({ ...fallback, source: "Sample forecast" });

  useEffect(() => {
    let cancelled = false;
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${ANFIELD.lat}&longitude=${ANFIELD.lon}` +
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
          source: "Open-Meteo • live forecast",
        });
      })
      .catch(() => {
        // Keep sample forecast on failure
      });

    return () => {
      cancelled = true;
    };
  }, [kickoffHour, fallback]);

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

// Tiny inline sparkline: xG for (solid) vs xG against (dashed) over the last N matches
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
  const half = Math.floor(series.length / 2);
  const diff = (arr) => arr.reduce((s, p) => s + (p[0] - p[1]), 0) / arr.length;
  const delta = diff(series.slice(half)) - diff(series.slice(0, half));
  if (delta > 0.2) return { text: "Improving", cls: "text-[#30D158]", arrow: "↗" };
  if (delta < -0.2) return { text: "Declining", cls: "text-[#FF6961]", arrow: "↘" };
  return { text: "Steady", cls: "text-white/60", arrow: "→" };
}

const NEWS_STYLES = {
  out: { label: "Out", cls: "bg-[#FF453A]/20 text-[#FF6961] border-[#FF453A]/35" },
  doubt: { label: "Doubt", cls: "bg-[#F1B82D]/20 text-[#F1B82D] border-[#F1B82D]/35" },
  booking: { label: "1 off ban", cls: "bg-[#FFD60A]/15 text-[#FFD60A] border-[#FFD60A]/30" },
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
export default function PreMatchPanel({ activeMatch, phase, countdownSeconds, onPreviewPhase, isPreviewing, onResetPreview }) {
  const [showDetails, setShowDetails] = useState(false);
  const [h2hAnfieldOnly, setH2hAnfieldOnly] = useState(false);

  const pm = activeMatch?.preMatch || {};
  const homeTeam = activeMatch?.homeTeam || "Liverpool";
  const awayTeam = activeMatch?.awayTeam || "Man United";
  const confirmed = isLineupConfirmed(phase.id);

  const weather = useKickoffWeather(pm.kickoffHour ?? 16, pm.conditions || DEFAULT_CONDITIONS);

  const wp = pm.winProbability || { home: 58, draw: 23, away: 19 };
  const homeTrend = trendLabel(pm.xgTrend?.home || [[1, 1], [1, 1]]);
  const awayTrend = trendLabel(pm.xgTrend?.away || [[1, 1], [1, 1]]);

  const h2h = (pm.headToHead || []).filter((m) => !h2hAnfieldOnly || m.venue === "Anfield");
  const h2hSummary = h2h.reduce(
    (acc, m) => {
      acc[m.result] += 1;
      return acc;
    },
    { W: 0, D: 0, L: 0 }
  );

  const lineupsInMins = Math.max(0, Math.ceil((countdownSeconds - 4500) / 60));

  return (
    <div className="space-y-3">
      {/* Win probability + data status */}
      <div className="apple-tile rounded-xl border border-white/[0.06] p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#8E8E93]">
            <Target className="w-3.5 h-3.5 text-[#FF2636]" />
            Win Probability
            <span className="normal-case tracking-normal font-medium text-white/40 ml-1">
              • Forecast xG {pm.projectedXg?.[0] ?? 2.54} – {pm.projectedXg?.[1] ?? 0.92}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="flex items-center gap-1 text-[#F1B82D]">
              <Activity className="w-3 h-3 animate-pulse" />
              Live data starts at kick-off
            </span>
            <span className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-white/50 uppercase tracking-wider font-semibold">
              Sample data
            </span>
          </div>
        </div>
        <div className="flex h-7 w-full rounded-lg overflow-hidden border border-white/10 text-[11px] font-bold">
          <div style={{ width: `${wp.home}%` }} className="bg-gradient-to-r from-[#800A1A] to-[#E31B23] flex items-center px-2 text-white">
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
          {awayTeam} {wp.away}% • {pm.winProbabilitySource || "Elo rating blended with market odds; adjusted for team news"}
        </p>
      </div>

      {/* Tier 1: form, team news, key duel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Card icon={TimerReset} title="Form & xG trend (last 6)">
          {[
            { team: homeTeam, form: pm.form?.home || [], series: pm.xgTrend?.home || [], trend: homeTrend, colour: "#FF2636" },
            { team: awayTeam, form: pm.form?.away || [], series: pm.xgTrend?.away || [], trend: awayTrend, colour: "#C7C7CC" },
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

        <Card icon={HeartPulse} title="Team news">
          {[
            { team: homeTeam, items: pm.teamNews?.home || [] },
            { team: awayTeam, items: pm.teamNews?.away || [] },
          ].map((group) => (
            <div key={group.team} className="space-y-1">
              <span className="text-[10px] font-semibold text-white/60">{group.team}</span>
              {group.items.map((p) => (
                <div key={p.name} className="flex items-start gap-1.5 text-[11px]">
                  <span className={`shrink-0 px-1.5 py-[1px] rounded border text-[9px] font-bold uppercase ${NEWS_STYLES[p.status].cls}`}>
                    {NEWS_STYLES[p.status].label}
                  </span>
                  <span className="min-w-0">
                    <strong className="text-white font-semibold">{p.name}</strong>
                    <span className="text-white/50"> • {p.detail}</span>
                  </span>
                </div>
              ))}
            </div>
          ))}
        </Card>

        <Card icon={Swords} title="Key duel">
          {pm.keyDuel && (
            <>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div className="text-left min-w-0">
                  <span className="text-[10px] font-mono text-[#FF4D5A] font-bold">#{pm.keyDuel.home.number}</span>
                  <span className="block text-[12px] font-bold text-white truncate">{pm.keyDuel.home.name}</span>
                  <span className="block text-lg font-black font-mono text-[#FF2636] leading-none mt-1">{pm.keyDuel.home.stat}</span>
                  <span className="block text-[9px] text-white/45">{pm.keyDuel.home.label}</span>
                </div>
                <span className="text-[10px] font-bold text-white/30">VS</span>
                <div className="text-right min-w-0">
                  <span className="text-[10px] font-mono text-white/60 font-bold">#{pm.keyDuel.away.number}</span>
                  <span className="block text-[12px] font-bold text-white truncate">{pm.keyDuel.away.name}</span>
                  <span className="block text-lg font-black font-mono text-white/80 leading-none mt-1">{pm.keyDuel.away.stat}</span>
                  <span className="block text-[9px] text-white/45">{pm.keyDuel.away.label}</span>
                </div>
              </div>
              <p className="text-[11px] text-white/70 leading-snug">{pm.keyDuel.takeaway}</p>
            </>
          )}
        </Card>
      </div>

      {/* Tier 2: details toggle */}
      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        aria-expanded={showDetails}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[11px] font-semibold text-white/70 hover:text-white cursor-pointer transition-colors"
      >
        {showDetails ? "Hide match context" : "More match context: head-to-head, tactics, set pieces, rest, officials, conditions"}
        {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {showDetails && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <Card icon={History} title="Head-to-head">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/70">
                {homeTeam}: <strong className="text-[#30D158]">{h2hSummary.W}W</strong>{" "}
                <strong className="text-white/70">{h2hSummary.D}D</strong>{" "}
                <strong className="text-[#FF6961]">{h2hSummary.L}L</strong>
              </span>
              <button
                type="button"
                onClick={() => setH2hAnfieldOnly(!h2hAnfieldOnly)}
                aria-pressed={h2hAnfieldOnly}
                className={`text-[10px] px-2 py-0.5 rounded-full border cursor-pointer ${h2hAnfieldOnly ? "bg-[#E31B23]/25 border-[#E31B23]/40 text-white" : "border-white/15 text-white/60 hover:text-white"}`}
              >
                At Anfield only
              </button>
            </div>
            {h2h.map((m) => (
              <div key={m.date} className="flex items-center justify-between text-[11px] gap-2">
                <span className="text-white/45 shrink-0 w-[72px]">{m.date}</span>
                <span className="text-white/90 truncate flex-1">{m.fixture}</span>
                <span className={`shrink-0 px-1.5 rounded border text-[10px] font-bold ${RESULT_STYLES[m.result]}`}>{m.score}</span>
              </div>
            ))}
          </Card>

          <Card icon={Swords} title="Tactical mismatch">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black font-mono text-[#00DAC3]">{pm.tactical?.ppda ?? 6.4}</span>
              <span className="text-[10px] text-white/50">our PPDA (lower = more pressing)</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black font-mono text-white/80">{pm.tactical?.opponentTurnovers ?? 14}</span>
              <span className="text-[10px] text-white/50">{awayTeam} turnovers per game under high press</span>
            </div>
            <p className="text-[11px] text-white/70 leading-snug">{pm.tactical?.takeaway}</p>
          </Card>

          <Card icon={Flag} title="Set pieces (xG per game)">
            {[
              { team: homeTeam, d: pm.setPieces?.home },
              { team: awayTeam, d: pm.setPieces?.away },
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
            <p className="text-[11px] text-white/70 leading-snug">{pm.setPieces?.takeaway}</p>
          </Card>

          <Card icon={BatteryMedium} title="Rest & fixture load">
            {[
              { team: homeTeam, d: pm.rest?.home },
              { team: awayTeam, d: pm.rest?.away },
            ].map((row) => (
              <div key={row.team} className="flex items-center justify-between text-[11px] gap-2">
                <span className="text-white/80">{row.team}</span>
                <span className="text-right">
                  <strong className={row.d?.days <= 3 ? "text-[#FF9F0A]" : "text-white"}>{row.d?.days} days</strong>
                  <span className="text-white/45"> • {row.d?.last}</span>
                </span>
              </div>
            ))}
            {pm.rest?.flag && <p className="text-[11px] text-[#FF9F0A]/90 leading-snug">{pm.rest.flag}</p>}
          </Card>

          <Card icon={Flag} title="Match officials">
            <div className="text-[11px] space-y-0.5">
              <div className="flex justify-between"><span className="text-white/50">Referee</span><strong className="text-white">{pm.officials?.referee}</strong></div>
              <div className="flex justify-between"><span className="text-white/50">VAR</span><span className="text-white/85">{pm.officials?.var}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Cards per game</span><span className="font-mono text-[#FFD60A]">{pm.officials?.cardsPerGame}</span></div>
              <div className="flex justify-between"><span className="text-white/50">Penalties per game</span><span className="font-mono text-white/85">{pm.officials?.pensPerGame}</span></div>
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
              {pm.pitch || "Hybrid grass"} • <span className="text-[#F1B82D]">{pm.attendance || "61,276 • Sold out"}</span>
            </div>
            <p className="text-[9px] text-white/35">{weather.source}</p>
          </Card>
        </div>
      )}

      {/* Matchday schedule timeline */}
      <div className="apple-tile rounded-xl border border-white/[0.06] p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E8E93]">
            Matchday schedule
            {!confirmed && (
              <span className="normal-case tracking-normal text-[#F1B82D] ml-2 font-medium">
                Line-ups in {Math.floor(lineupsInMins / 60)}h {lineupsInMins % 60}m
              </span>
            )}
          </span>
          {isPreviewing ? (
            <button
              type="button"
              onClick={onResetPreview}
              className="text-[10px] px-2 py-0.5 rounded-full border border-[#F1B82D]/40 bg-[#F1B82D]/15 text-[#F1B82D] font-semibold cursor-pointer"
            >
              Previewing • back to now
            </button>
          ) : (
            <span className="text-[10px] text-white/35">Select a step to preview that stage</span>
          )}
        </div>
        <ol className="grid grid-cols-5 gap-1">
          {MATCHDAY_PHASES.slice(1).map((step) => {
            const done = countdownSeconds < step.at;
            const current = phase.id === step.id;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => onPreviewPhase(step.at)}
                  aria-current={current ? "step" : undefined}
                  className="w-full text-left cursor-pointer group"
                >
                  <div className={`h-1 rounded-full mb-1.5 ${current ? "bg-[#F1B82D] shadow-[0_0_8px_rgba(241,184,45,0.7)]" : done ? "bg-[#30D158]/70" : "bg-white/10 group-hover:bg-white/25"}`} />
                  <div className="flex items-center gap-1">
                    {done && !current ? (
                      <Check className="w-3 h-3 text-[#30D158] shrink-0" />
                    ) : (
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current ? "bg-[#F1B82D] animate-pulse" : "bg-white/25"}`} />
                    )}
                    <span className={`font-mono text-[11px] font-bold ${current ? "text-[#F1B82D]" : done ? "text-white/45" : "text-white/80"}`}>
                      {step.clock}
                    </span>
                  </div>
                  <span className={`block text-[10px] leading-tight mt-0.5 ${current ? "text-white" : done ? "text-white/40" : "text-white/60"}`}>
                    {step.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
