import { useMemo, useState } from 'react';
import { RefreshCw, SlidersHorizontal } from 'lucide-react';
import { FIXTURES, MATCHDAY_KPIS } from './data/mockMatchday';
import { FixtureTicker } from './components/FixtureTicker';
import { KpiCard } from './components/KpiCard';
import { MatchDetailPanel } from './components/MatchDetailPanel';
import { SideRail } from './components/SideRail';

const COMPETITIONS = [
  'All Competitions',
  'Premier League',
  'Champions League',
  'Championship',
] as const;

const TIMEFRAMES = ['Live Now', 'Today', 'Gameweek 12'] as const;

export function App() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [selectedCompetition, setSelectedCompetition] =
    useState<(typeof COMPETITIONS)[number]>('All Competitions');
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<(typeof TIMEFRAMES)[number]>('Live Now');
  const [selectedFixtureId, setSelectedFixtureId] = useState(FIXTURES[0].id);

  const filteredFixtures = useMemo(() => {
    if (selectedCompetition === 'All Competitions') return FIXTURES;
    return FIXTURES.filter((f) => f.competition === selectedCompetition);
  }, [selectedCompetition]);

  const activeFixture =
    filteredFixtures.find((f) => f.id === selectedFixtureId) ??
    filteredFixtures[0] ??
    FIXTURES[0];

  const liveCount = FIXTURES.filter((f) => f.status === 'LIVE').length;

  return (
    <div className="flex min-h-screen bg-[#0B0E14] text-slate-100">
      {/* Snowflake-style compact left icon rail */}
      <SideRail activeNav={activeNav} onSelectNav={setActiveNav} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* The Athletic-style persistent top fixture & score ticker */}
        <FixtureTicker
          fixtures={filteredFixtures}
          selectedId={activeFixture.id}
          onSelect={setSelectedFixtureId}
        />

        {/* Main workspace */}
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          {/* Snowflake-style header + filter pill bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Matchday Command Centre
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600/15 px-2.5 py-0.5 font-mono text-xs font-semibold text-red-400 ring-1 ring-inset ring-red-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-live-dot" />
                  {liveCount} Live
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Real-time scores, expected goals (xG), and match telemetry across selected competitions.
              </p>
            </div>

            {/* Timeframe pill selector */}
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg border border-white/10 bg-[#121722] p-0.5">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      selectedTimeframe === tf
                        ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              <button
                type="button"
                title="Refresh telemetry"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#121722] text-slate-400 transition-colors hover:border-white/20 hover:text-slate-200"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Competition filter pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 pr-1 text-xs font-medium text-slate-500">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              League:
            </span>
            {COMPETITIONS.map((comp) => {
              const active = selectedCompetition === comp;
              return (
                <button
                  key={comp}
                  type="button"
                  onClick={() => setSelectedCompetition(comp)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-slate-100 text-slate-950'
                      : 'border border-white/10 bg-[#121722] text-slate-300 hover:border-white/20 hover:bg-[#182030]'
                  }`}
                >
                  {comp}
                </button>
              );
            })}
          </div>

          {/* Snowflake-style 4-column KPI & Sparkline grid */}
          <section aria-label="Matchday key metrics">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {MATCHDAY_KPIS.map((metric) => (
                <KpiCard key={metric.id} metric={metric} />
              ))}
            </div>
          </section>

          {/* Featured Live Match Panel */}
          <MatchDetailPanel fixture={activeFixture} />
        </main>
      </div>
    </div>
  );
}

export default App;
