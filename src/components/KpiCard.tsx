import type { KpiMetric } from '../data/mockMatchday';

interface KpiCardProps {
  metric: KpiMetric;
}

const ACCENT_MAP = {
  emerald: {
    pill: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
    stroke: '#10B981',
    fill: 'rgba(16, 185, 129, 0.18)',
    bar: 'bg-emerald-500/80',
  },
  sky: {
    pill: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
    stroke: '#38BDF8',
    fill: 'rgba(56, 189, 248, 0.18)',
    bar: 'bg-sky-400/80',
  },
  amber: {
    pill: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
    stroke: '#F59E0B',
    fill: 'rgba(245, 158, 11, 0.18)',
    bar: 'bg-amber-400/80',
  },
  rose: {
    pill: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
    stroke: '#F43F5E',
    fill: 'rgba(244, 63, 94, 0.18)',
    bar: 'bg-rose-500/80',
  },
};

export function KpiCard({ metric }: KpiCardProps) {
  const accent = ACCENT_MAP[metric.accent];
  const maxVal = Math.max(...metric.series, 1);

  // Build SVG area polyline points
  const width = 220;
  const height = 44;
  const step = width / Math.max(metric.series.length - 1, 1);
  const points = metric.series
    .map((val, idx) => {
      const x = idx * step;
      const y = height - (val / maxVal) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#121722] p-4 transition-colors hover:border-white/20 hover:bg-[#151C2A]">
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-medium text-slate-400">{metric.label}</span>
          <span
            className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold ring-1 ring-inset ${accent.pill}`}
          >
            {metric.delta}
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-mono text-2xl font-bold tracking-tight text-slate-50">
            {metric.value}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] text-slate-500">{metric.subtitle}</p>
      </div>

      {/* Mini chart */}
      <div className="mt-4 h-11 w-full">
        {metric.chartType === 'bar' ? (
          <div className="flex h-full items-end gap-1.5">
            {metric.series.map((val, idx) => (
              <div
                key={idx}
                className="flex-1 rounded-t-sm bg-white/5 h-full flex items-end overflow-hidden"
              >
                <div
                  className={`w-full rounded-t-sm ${accent.bar}`}
                  style={{ height: `${Math.max((val / maxVal) * 100, 12)}%` }}
                />
              </div>
            ))}
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-full w-full overflow-visible"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points={areaPoints} fill={accent.fill} />
            <polyline
              points={points}
              fill="none"
              stroke={accent.stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
