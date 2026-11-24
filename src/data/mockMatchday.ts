export type MatchStatus = 'LIVE' | 'HT' | 'FT' | 'UPCOMING';

export interface TeamInfo {
  code: string;
  name: string;
  colour: string;
  score: number | null;
  xg: number;
}

export interface Fixture {
  id: string;
  competition: 'Premier League' | 'Champions League' | 'Championship';
  status: MatchStatus;
  minute?: string;
  kickoff?: string;
  venue: string;
  home: TeamInfo;
  away: TeamInfo;
  possessionHome: number;
  shotsHome: number;
  shotsAway: number;
  shotsOnTargetHome: number;
  shotsOnTargetAway: number;
  bigChancesHome: number;
  bigChancesAway: number;
  momentumSeries: number[]; // -100 (away) to +100 (home) across 12 intervals
  xgTimeline: { minute: number; home: number; away: number }[];
  keyEvents: {
    minute: string;
    team: 'home' | 'away';
    type: 'goal' | 'yellow' | 'sub' | 'var';
    player: string;
    detail: string;
  }[];
}

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down' | 'neutral';
  subtitle: string;
  accent: 'emerald' | 'sky' | 'amber' | 'rose';
  series: number[];
  chartType: 'bar' | 'area';
}

export const FIXTURES: Fixture[] = [
  {
    id: 'ars-liv',
    competition: 'Premier League',
    status: 'LIVE',
    minute: "68'",
    venue: 'Emirates Stadium',
    home: { code: 'ARS', name: 'Arsenal', colour: '#EF4444', score: 2, xg: 2.14 },
    away: { code: 'LIV', name: 'Liverpool', colour: '#DC2626', score: 1, xg: 1.48 },
    possessionHome: 56,
    shotsHome: 15,
    shotsAway: 11,
    shotsOnTargetHome: 6,
    shotsOnTargetAway: 4,
    bigChancesHome: 3,
    bigChancesAway: 2,
    momentumSeries: [18, 42, 65, -20, -45, 30, 52, 74, -15, 28, 60, 48],
    xgTimeline: [
      { minute: 0, home: 0, away: 0 },
      { minute: 12, home: 0.42, away: 0.08 },
      { minute: 24, home: 0.68, away: 0.51 },
      { minute: 38, home: 1.12, away: 0.89 },
      { minute: 45, home: 1.24, away: 0.94 },
      { minute: 56, home: 1.86, away: 1.12 },
      { minute: 68, home: 2.14, away: 1.48 },
    ],
    keyEvents: [
      { minute: "12'", team: 'home', type: 'goal', player: 'B. Saka', detail: 'Left-footed finish, assist M. Ødegaard' },
      { minute: "29'", team: 'away', type: 'goal', player: 'M. Salah', detail: 'Counter-attack, assist T. Alexander-Arnold' },
      { minute: "54'", team: 'home', type: 'goal', player: 'K. Havertz', detail: 'Header from close range, assist D. Rice' },
      { minute: "63'", team: 'away', type: 'yellow', player: 'A. Mac Allister', detail: 'Tactical foul in midfield' },
    ],
  },
  {
    id: 'mci-che',
    competition: 'Premier League',
    status: 'LIVE',
    minute: "74'",
    venue: 'Etihad Stadium',
    home: { code: 'MCI', name: 'Man City', colour: '#38BDF8', score: 3, xg: 2.65 },
    away: { code: 'CHE', name: 'Chelsea', colour: '#2563EB', score: 2, xg: 1.82 },
    possessionHome: 63,
    shotsHome: 18,
    shotsAway: 10,
    shotsOnTargetHome: 8,
    shotsOnTargetAway: 5,
    bigChancesHome: 4,
    bigChancesAway: 3,
    momentumSeries: [55, 70, 45, 20, -35, -50, 40, 62, 58, -22, 35, 72],
    xgTimeline: [
      { minute: 0, home: 0, away: 0 },
      { minute: 15, home: 0.55, away: 0.14 },
      { minute: 31, home: 1.18, away: 0.78 },
      { minute: 45, home: 1.54, away: 1.05 },
      { minute: 60, home: 2.21, away: 1.62 },
      { minute: 74, home: 2.65, away: 1.82 },
    ],
    keyEvents: [
      { minute: "14'", team: 'home', type: 'goal', player: 'E. Haaland', detail: 'Low drive inside the box' },
      { minute: "33'", team: 'away', type: 'goal', player: 'C. Palmer', detail: 'Curled effort from 18 yards' },
      { minute: "58'", team: 'home', type: 'goal', player: 'P. Foden', detail: 'Edge-of-box strike' },
    ],
  },
  {
    id: 'avl-new',
    competition: 'Premier League',
    status: 'HT',
    minute: 'HT',
    venue: 'Villa Park',
    home: { code: 'AVL', name: 'Aston Villa', colour: '#9F1239', score: 1, xg: 0.96 },
    away: { code: 'NEW', name: 'Newcastle', colour: '#94A3B8', score: 1, xg: 1.04 },
    possessionHome: 49,
    shotsHome: 7,
    shotsAway: 8,
    shotsOnTargetHome: 3,
    shotsOnTargetAway: 3,
    bigChancesHome: 1,
    bigChancesAway: 2,
    momentumSeries: [25, -18, 40, 32, -48, -30, 15, 28, -22, -40, 18, 10],
    xgTimeline: [
      { minute: 0, home: 0, away: 0 },
      { minute: 18, home: 0.44, away: 0.21 },
      { minute: 36, home: 0.72, away: 0.88 },
      { minute: 45, home: 0.96, away: 1.04 },
    ],
    keyEvents: [
      { minute: "19'", team: 'home', type: 'goal', player: 'O. Watkins', detail: 'Near-post finish' },
      { minute: "39'", team: 'away', type: 'goal', player: 'A. Isak', detail: 'Composed finish one-on-one' },
    ],
  },
  {
    id: 'tot-mun',
    competition: 'Premier League',
    status: 'UPCOMING',
    kickoff: '17:30',
    venue: 'Tottenham Hotspur Stadium',
    home: { code: 'TOT', name: 'Tottenham', colour: '#E2E8F0', score: null, xg: 0 },
    away: { code: 'MUN', name: 'Man Utd', colour: '#DC2626', score: null, xg: 0 },
    possessionHome: 50,
    shotsHome: 0,
    shotsAway: 0,
    shotsOnTargetHome: 0,
    shotsOnTargetAway: 0,
    bigChancesHome: 0,
    bigChancesAway: 0,
    momentumSeries: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    xgTimeline: [{ minute: 0, home: 0, away: 0 }],
    keyEvents: [],
  },
  {
    id: 'lee-sun',
    competition: 'Championship',
    status: 'LIVE',
    minute: "81'",
    venue: 'Elland Road',
    home: { code: 'LEE', name: 'Leeds Utd', colour: '#FACC15', score: 2, xg: 1.91 },
    away: { code: 'SUN', name: 'Sunderland', colour: '#EF4444', score: 0, xg: 0.62 },
    possessionHome: 61,
    shotsHome: 16,
    shotsAway: 6,
    shotsOnTargetHome: 7,
    shotsOnTargetAway: 2,
    bigChancesHome: 3,
    bigChancesAway: 1,
    momentumSeries: [40, 52, 35, 60, 48, 22, 66, 70, 44, 58, 62, 50],
    xgTimeline: [
      { minute: 0, home: 0, away: 0 },
      { minute: 25, home: 0.74, away: 0.18 },
      { minute: 50, home: 1.32, away: 0.42 },
      { minute: 81, home: 1.91, away: 0.62 },
    ],
    keyEvents: [
      { minute: "22'", team: 'home', type: 'goal', player: 'J. Piroe', detail: 'Low finish into bottom corner' },
      { minute: "67'", team: 'home', type: 'goal', player: 'W. Gnonto', detail: 'Cut inside and fired home' },
    ],
  },
  {
    id: 'rma-bay',
    competition: 'Champions League',
    status: 'FT',
    minute: 'FT',
    venue: 'Santiago Bernabéu',
    home: { code: 'RMA', name: 'Real Madrid', colour: '#F8FAFC', score: 2, xg: 1.78 },
    away: { code: 'BAY', name: 'Bayern', colour: '#DC2626', score: 1, xg: 1.54 },
    possessionHome: 48,
    shotsHome: 13,
    shotsAway: 14,
    shotsOnTargetHome: 5,
    shotsOnTargetAway: 5,
    bigChancesHome: 3,
    bigChancesAway: 2,
    momentumSeries: [-20, 35, 48, -32, -40, 22, 58, -18, 42, 65, 78, 30],
    xgTimeline: [
      { minute: 0, home: 0, away: 0 },
      { minute: 30, home: 0.48, away: 0.62 },
      { minute: 60, home: 1.02, away: 1.18 },
      { minute: 90, home: 1.78, away: 1.54 },
    ],
    keyEvents: [
      { minute: "41'", team: 'away', type: 'goal', player: 'H. Kane', detail: 'Penalty kick' },
      { minute: "76'", team: 'home', type: 'goal', player: 'Vinícius Jr', detail: 'Back-post tap-in' },
      { minute: "88'", team: 'home', type: 'goal', player: 'J. Bellingham', detail: 'Late winner from edge of area' },
    ],
  },
];

export const MATCHDAY_KPIS: KpiMetric[] = [
  {
    id: 'total-xg',
    label: 'Matchday Expected Goals (xG)',
    value: '14.32',
    delta: '+18.4%',
    trend: 'up',
    subtitle: 'vs 5-week matchday average',
    accent: 'sky',
    series: [1.2, 1.8, 2.4, 2.1, 2.9, 3.4, 3.8, 4.2],
    chartType: 'area',
  },
  {
    id: 'goals-scored',
    label: 'Goals Scored (Live & FT)',
    value: '15',
    delta: '+2.6 / match',
    trend: 'up',
    subtitle: 'Across 5 active fixtures',
    accent: 'emerald',
    series: [2, 1, 3, 2, 4, 2, 3, 5],
    chartType: 'bar',
  },
  {
    id: 'pressing-ppda',
    label: 'Avg Pressing Intensity (PPDA)',
    value: '8.4',
    delta: '-11.2%',
    trend: 'up',
    subtitle: 'Lower PPDA = higher press',
    accent: 'amber',
    series: [11.2, 10.6, 9.8, 9.5, 9.1, 8.9, 8.6, 8.4],
    chartType: 'area',
  },
  {
    id: 'big-chances',
    label: 'Big Chances Created',
    value: '23',
    delta: '+34.0%',
    trend: 'up',
    subtitle: '65% conversion on target',
    accent: 'rose',
    series: [2, 4, 3, 5, 4, 6, 5, 7],
    chartType: 'bar',
  },
];
