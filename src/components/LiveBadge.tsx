import type { MatchStatus } from '../data/mockMatchday';

interface LiveBadgeProps {
  status: MatchStatus;
  minute?: string;
  kickoff?: string;
  compact?: boolean;
}

export function LiveBadge({ status, minute, kickoff, compact = false }: LiveBadgeProps) {
  if (status === 'LIVE') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded bg-red-600 font-mono font-bold tracking-wider text-white uppercase shadow-sm shadow-red-950/60 ${
          compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-live-dot" />
        LIVE{minute ? ` · ${minute}` : ''}
      </span>
    );
  }

  if (status === 'HT') {
    return (
      <span className="inline-flex items-center rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-amber-300 ring-1 ring-inset ring-amber-400/30">
        HT
      </span>
    );
  }

  if (status === 'FT') {
    return (
      <span className="inline-flex items-center rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-slate-400 ring-1 ring-inset ring-white/10">
        FT
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded bg-slate-800/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-300 ring-1 ring-inset ring-white/10">
      {kickoff ?? 'TBC'}
    </span>
  );
}
