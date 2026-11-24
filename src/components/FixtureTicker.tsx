import type { Fixture } from '../data/mockMatchday';
import { LiveBadge } from './LiveBadge';

interface FixtureTickerProps {
  fixtures: Fixture[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function FixtureTicker({ fixtures, selectedId, onSelect }: FixtureTickerProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0E131D]/95 backdrop-blur-md">
      <div className="flex items-stretch">
        {/* Competition label block (The Athletic style) */}
        <div className="hidden sm:flex shrink-0 flex-col justify-center border-r border-white/10 px-4 py-2 bg-[#0B0E14]">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-400">
            Matchday
          </span>
          <span className="text-xs font-semibold text-slate-200">
            Live Ticker
          </span>
        </div>

        {/* Horizontal scrollable fixture strip */}
        <div className="ticker-scroll flex flex-1 items-stretch overflow-x-auto divide-x divide-white/10">
          {fixtures.map((fixture) => {
            const isSelected = fixture.id === selectedId;
            return (
              <button
                key={fixture.id}
                type="button"
                onClick={() => onSelect(fixture.id)}
                className={`group flex min-w-[196px] shrink-0 flex-col justify-between px-3.5 py-2 text-left transition-colors ${
                  isSelected
                    ? 'bg-[#182234] ring-1 ring-inset ring-emerald-500/40'
                    : 'hover:bg-[#141B29]'
                }`}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="truncate text-[10px] font-medium text-slate-400">
                    {fixture.competition}
                  </span>
                  <LiveBadge
                    status={fixture.status}
                    minute={fixture.minute}
                    kickoff={fixture.kickoff}
                    compact
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium text-slate-100">
                      <span
                        className="h-2.5 w-2.5 rounded-full ring-1 ring-white/20"
                        style={{ backgroundColor: fixture.home.colour }}
                      />
                      {fixture.home.code}
                    </span>
                    <span className="font-mono font-bold text-slate-100">
                      {fixture.home.score ?? '–'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium text-slate-300">
                      <span
                        className="h-2.5 w-2.5 rounded-full ring-1 ring-white/20"
                        style={{ backgroundColor: fixture.away.colour }}
                      />
                      {fixture.away.code}
                    </span>
                    <span className="font-mono font-bold text-slate-300">
                      {fixture.away.score ?? '–'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
