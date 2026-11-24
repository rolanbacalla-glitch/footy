import { Flame, MapPin, Target } from 'lucide-react';
import type { Fixture } from '../data/mockMatchday';
import { LiveBadge } from './LiveBadge';

interface MatchDetailPanelProps {
  fixture: Fixture;
}

export function MatchDetailPanel({ fixture }: MatchDetailPanelProps) {
  const maxXg = Math.max(
    ...fixture.xgTimeline.flatMap((p) => [p.home, p.away]),
    1.5
  );

  const chartW = 360;
  const chartH = 120;

  const toPoints = (key: 'home' | 'away') =>
    fixture.xgTimeline
      .map((pt) => {
        const x = (pt.minute / 90) * chartW;
        const y = chartH - (pt[key] / maxXg) * (chartH - 14) - 6;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

  const statRows = [
    {
      label: 'Expected Goals (xG)',
      home: fixture.home.xg.toFixed(2),
      away: fixture.away.xg.toFixed(2),
      homePct:
        fixture.home.xg + fixture.away.xg > 0
          ? (fixture.home.xg / (fixture.home.xg + fixture.away.xg)) * 100
          : 50,
    },
    {
      label: 'Possession',
      home: `${fixture.possessionHome}%`,
      away: `${100 - fixture.possessionHome}%`,
      homePct: fixture.possessionHome,
    },
    {
      label: 'Total Shots',
      home: String(fixture.shotsHome),
      away: String(fixture.shotsAway),
      homePct:
        fixture.shotsHome + fixture.shotsAway > 0
          ? (fixture.shotsHome / (fixture.shotsHome + fixture.shotsAway)) * 100
          : 50,
    },
    {
      label: 'Shots on Target',
      home: String(fixture.shotsOnTargetHome),
      away: String(fixture.shotsOnTargetAway),
      homePct:
        fixture.shotsOnTargetHome + fixture.shotsOnTargetAway > 0
          ? (fixture.shotsOnTargetHome /
              (fixture.shotsOnTargetHome + fixture.shotsOnTargetAway)) *
            100
          : 50,
    },
    {
      label: 'Big Chances',
      home: String(fixture.bigChancesHome),
      away: String(fixture.bigChancesAway),
      homePct:
        fixture.bigChancesHome + fixture.bigChancesAway > 0
          ? (fixture.bigChancesHome /
              (fixture.bigChancesHome + fixture.bigChancesAway)) *
            100
          : 50,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* Left 7 cols: Live Match Centre + xG Timeline */}
      <section className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#121722] p-5 lg:col-span-7">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <LiveBadge
              status={fixture.status}
              minute={fixture.minute}
              kickoff={fixture.kickoff}
            />
            <span className="text-xs font-semibold text-slate-300">
              {fixture.competition}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="h-3.5 w-3.5 text-slate-500" />
            {fixture.venue}
          </span>
        </div>

        {/* Scoreboard */}
        <div className="grid grid-cols-3 items-center py-2">
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2.5">
              <span
                className="h-3.5 w-3.5 rounded-full ring-2 ring-white/20"
                style={{ backgroundColor: fixture.home.colour }}
              />
              <span className="text-base font-bold text-slate-100 sm:text-lg">
                {fixture.home.name}
              </span>
            </div>
            <span className="font-mono text-xs text-slate-400">
              xG {fixture.home.xg.toFixed(2)}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-3 font-mono text-3xl font-bold tracking-tight text-white sm:text-4xl">
              <span>{fixture.home.score ?? '–'}</span>
              <span className="text-slate-600">:</span>
              <span>{fixture.away.score ?? '–'}</span>
            </div>
            <span className="mt-1 text-[11px] font-medium text-slate-400">
              {fixture.status === 'LIVE'
                ? 'In Play'
                : fixture.status === 'UPCOMING'
                  ? `Kick-off ${fixture.kickoff}`
                  : fixture.status}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2.5">
              <span className="text-base font-bold text-slate-100 sm:text-lg">
                {fixture.away.name}
              </span>
              <span
                className="h-3.5 w-3.5 rounded-full ring-2 ring-white/20"
                style={{ backgroundColor: fixture.away.colour }}
              />
            </div>
            <span className="font-mono text-xs text-slate-400">
              xG {fixture.away.xg.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Cumulative xG Timeline Chart */}
        <div className="rounded-lg border border-white/10 bg-[#0D1119] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <Target className="h-3.5 w-3.5 text-sky-400" />
              Cumulative xG Timeline
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {fixture.home.code}
              </span>
              <span className="flex items-center gap-1.5 text-sky-300">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                {fixture.away.code}
              </span>
            </div>
          </div>

          <svg
            viewBox={`0 0 ${chartW} ${chartH}`}
            className="h-32 w-full overflow-visible"
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map((ratio) => (
              <line
                key={ratio}
                x1="0"
                x2={chartW}
                y1={chartH * ratio}
                y2={chartH * ratio}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="3 3"
              />
            ))}
            {/* Half-time vertical marker */}
            <line
              x1={chartW / 2}
              x2={chartW / 2}
              y1="0"
              y2={chartH}
              stroke="rgba(255,255,255,0.12)"
              strokeDasharray="4 4"
            />
            {fixture.xgTimeline.length > 1 && (
              <>
                <polyline
                  points={toPoints('home')}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points={toPoints('away')}
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}
          </svg>

          <div className="mt-1.5 flex justify-between font-mono text-[10px] text-slate-500">
            <span>0&apos;</span>
            <span>HT (45&apos;)</span>
            <span>90&apos;</span>
          </div>
        </div>

        {/* Attack Momentum Strip */}
        <div className="rounded-lg border border-white/10 bg-[#0D1119] p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              Attack Momentum
            </span>
            <span className="text-[11px] text-slate-500">
              Above: {fixture.home.code} · Below: {fixture.away.code}
            </span>
          </div>
          <div className="relative flex h-16 items-center gap-1.5">
            <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
            {fixture.momentumSeries.map((val, idx) => {
              const isHome = val >= 0;
              const heightPct = Math.min(Math.abs(val), 100) / 2;
              return (
                <div key={idx} className="relative flex h-full flex-1 items-center justify-center">
                  <div
                    className={`absolute w-full rounded-sm ${
                      isHome ? 'bg-emerald-500/80 bottom-1/2' : 'bg-sky-400/80 top-1/2'
                    }`}
                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Right 5 cols: Match Stats & Key Events */}
      <section className="flex flex-col gap-4 lg:col-span-5">
        {/* Head-to-head comparison bars */}
        <div className="rounded-xl border border-white/10 bg-[#121722] p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Match Telemetry
          </h2>
          <div className="space-y-3.5">
            {statRows.map((row) => (
              <div key={row.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-slate-100">{row.home}</span>
                  <span className="text-slate-400">{row.label}</span>
                  <span className="font-mono font-semibold text-slate-100">{row.away}</span>
                </div>
                <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="bg-emerald-500 transition-all duration-300"
                    style={{ width: `${row.homePct}%` }}
                  />
                  <div
                    className="bg-sky-400 transition-all duration-300"
                    style={{ width: `${100 - row.homePct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Events Feed */}
        <div className="flex-1 rounded-xl border border-white/10 bg-[#121722] p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Key Match Events
          </h2>
          {fixture.keyEvents.length === 0 ? (
            <p className="text-xs text-slate-500">
              Match has not kicked off yet. Live events will appear here automatically.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {fixture.keyEvents.map((ev, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 rounded-lg border border-white/5 bg-[#0D1119] px-3 py-2.5"
                >
                  <span className="mt-0.5 shrink-0 font-mono text-xs font-bold text-emerald-400">
                    {ev.minute}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-100">
                        {ev.player}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                          ev.type === 'goal'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-amber-500/15 text-amber-300'
                        }`}
                      >
                        {ev.type}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-400">{ev.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
