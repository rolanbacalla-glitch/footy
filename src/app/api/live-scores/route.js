import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const COMPETITIONS = [
  { code: "PL", slug: "eng.1", label: "Premier League", isEuropean: false },
  { code: "UCL", slug: "uefa.champions", label: "UEFA Champions League", isEuropean: true },
  { code: "UEL", slug: "uefa.europa", label: "UEFA Europa League", isEuropean: true },
  { code: "UECL", slug: "uefa.europa.conf", label: "UEFA Conference League", isEuropean: true },
];

const CACHE_TTL_MS = 15 * 1000;
let cachedPayload = null;
let cachedAt = 0;

export async function GET() {
  const now = Date.now();
  if (cachedPayload && now - cachedAt < CACHE_TTL_MS) {
    return NextResponse.json(cachedPayload, {
      headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30" },
    });
  }

  try {
    const settled = await Promise.allSettled(
      COMPETITIONS.map((compDef) =>
        fetch(
          `https://site.api.espn.com/apis/site/v2/sports/soccer/${compDef.slug}/scoreboard`,
          { next: { revalidate: 15 } }
        ).then(async (res) => ({
          compDef,
          data: res.ok ? await res.json() : null,
        }))
      )
    );

    const matches = [];
    for (const res of settled) {
      if (res.status !== "fulfilled" || !res.value?.data) continue;
      const { compDef, data } = res.value;
      for (const e of data.events || []) {
        const comp = e.competitions?.[0];
        const home = comp?.competitors?.find((c) => c.homeAway === "home");
        const away = comp?.competitors?.find((c) => c.homeAway === "away");
        const state = comp?.status?.type?.state || e.status?.type?.state || "pre";
        const isLive = state === "in";

        matches.push({
          id: `espn-${e.id}`,
          competition: e.league?.name || compDef.label,
          competitionCode: compDef.code,
          isEuropean: compDef.isEuropean,
          state,
          isLive,
          displayClock:
            comp?.status?.displayClock ||
            e.status?.displayClock ||
            comp?.status?.type?.shortDetail ||
            null,
          statusText: comp?.status?.type?.shortDetail || comp?.status?.type?.detail || "Scheduled",
          date: e.date,
          homeTeamId: home?.team?.id ? String(home.team.id) : null,
          awayTeamId: away?.team?.id ? String(away.team.id) : null,
          homeLogo:
            home?.team?.logo ||
            (home?.team?.id ? `https://a.espncdn.com/i/teamlogos/soccer/500/${home.team.id}.png` : null),
          awayLogo:
            away?.team?.logo ||
            (away?.team?.id ? `https://a.espncdn.com/i/teamlogos/soccer/500/${away.team.id}.png` : null),
          homeTeam: home?.team?.displayName || "Home",
          awayTeam: away?.team?.displayName || "Away",
          homeShort: home?.team?.abbreviation || (home?.team?.displayName || "HOM").slice(0, 3).toUpperCase(),
          awayShort: away?.team?.abbreviation || (away?.team?.displayName || "AWY").slice(0, 3).toUpperCase(),
          homeScore: home?.score !== undefined ? parseInt(home.score, 10) : 0,
          awayScore: away?.score !== undefined ? parseInt(away.score, 10) : 0,
        });
      }
    }

    const liveMatches = matches.filter((m) => m.isLive);
    const payload = {
      updatedAt: new Date().toISOString(),
      liveCount: liveMatches.length,
      liveMatches,
      matches,
    };

    cachedPayload = payload;
    cachedAt = now;

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30" },
    });
  } catch (err) {
    console.warn("Shared live-scores fetch error:", err.message);
    return NextResponse.json(
      cachedPayload || { updatedAt: new Date().toISOString(), liveCount: 0, liveMatches: [], matches: [] },
      { status: cachedPayload ? 200 : 500 }
    );
  }
}
