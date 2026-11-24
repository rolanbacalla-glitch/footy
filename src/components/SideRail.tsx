import {
  Activity,
  BarChart3,
  Calendar,
  Compass,
  Settings,
  Shield,
  Trophy,
} from 'lucide-react';

interface SideRailProps {
  activeNav: string;
  onSelectNav: (nav: string) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Matchday Dashboard', icon: Activity },
  { id: 'analytics', label: 'xG & Stats', icon: BarChart3 },
  { id: 'fixtures', label: 'Fixtures', icon: Calendar },
  { id: 'competitions', label: 'Competitions', icon: Trophy },
  { id: 'discover', label: 'Scout & Discover', icon: Compass },
];

export function SideRail({ activeNav, onSelectNav }: SideRailProps) {
  return (
    <aside className="hidden md:flex w-16 shrink-0 flex-col items-center justify-between border-r border-white/10 bg-[#0D1119] py-4">
      <div className="flex flex-col items-center gap-5">
        {/* Brand mark */}
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
          title="Footy"
        >
          <Shield className="h-5 w-5" />
        </div>

        {/* Navigation icons */}
        <nav className="flex flex-col items-center gap-2" aria-label="Primary navigation">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeNav === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectNav(id)}
                title={label}
                aria-label={label}
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                  active
                    ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
        </nav>
      </div>

      <button
        type="button"
        title="Settings"
        aria-label="Settings"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
      >
        <Settings className="h-5 w-5" />
      </button>
    </aside>
  );
}
