import { NextResponse } from "next/server";
import { PREMIER_LEAGUE_MANAGERS } from "../../../data/premierLeagueManagers";

// In-memory per-club cache (10 minutes TTL, capped for persistent Coolify containers)
const scheduleCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;
const LIVE_CACHE_TTL_MS = 30 * 1000;
const MAX_CACHE_ENTRIES = 50;
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
};

const COMPETITIONS = [
  { code: "PL", slug: "eng.1", label: "Premier League", isEuropean: false },
  { code: "UCL", slug: "uefa.champions", label: "UEFA Champions League", isEuropean: true },
  { code: "UEL", slug: "uefa.europa", label: "UEFA Europa League", isEuropean: true },
  { code: "UECL", slug: "uefa.europa.conf", label: "UEFA Conference League", isEuropean: true },
];

const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; FootballInsights/1.0)",
  Accept: "application/json",
};

function setScheduleCache(key, value) {
  if (scheduleCache.has(key)) {
    scheduleCache.delete(key);
  } else if (scheduleCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = scheduleCache.keys().next().value;
    scheduleCache.delete(oldestKey);
  }
  scheduleCache.set(key, value);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId") || "364"; // Default Liverpool (364)
  const clubInfo = PREMIER_LEAGUE_MANAGERS[teamId] || { name: "Liverpool", shortName: "LIV" };

  const now = Date.now();
  const cached = scheduleCache.get(teamId);
  const activeTtl = cached?.hasLive ? LIVE_CACHE_TTL_MS : CACHE_TTL_MS;
  if (cached && now - cached.timestamp < activeTtl) {
    return NextResponse.json(cached.payload, { headers: CACHE_HEADERS });
  }

  try {
    // Fetch Premier League + UEFA European schedules in parallel
    const fetches = COMPETITIONS.flatMap((compDef) => [
      fetch(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/${compDef.slug}/teams/${teamId}/schedule?fixture=true`,
        { headers: FETCH_HEADERS, next: { revalidate: 600 } }
      ).then(async (res) => ({
        compDef,
        isUpcoming: true,
        events: res.ok ? (await res.json())?.events || [] : [],
      })),
      fetch(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/${compDef.slug}/teams/${teamId}/schedule`,
        { headers: FETCH_HEADERS, next: { revalidate: 600 } }
      ).then(async (res) => ({
        compDef,
        isUpcoming: false,
        events: res.ok ? (await res.json())?.events || [] : [],
      })),
    ]);

    const settled = await Promise.allSettled(fetches);

    const parseEvents = (events = [], compDef, isUpcoming = true) => {
      return events.map((ev) => {
        const comp = ev.competitions?.[0] || {};
        const competitors = comp.competitors || [];
        const home = competitors.find((c) => c.homeAway === "home") || {};
        const away = competitors.find((c) => c.homeAway === "away") || {};

        const homeName = home.team?.displayName || "Home";
        const awayName = away.team?.displayName || "Away";
        const isSelectedClubHome = String(home.team?.id) === String(teamId);
        const opponent = isSelectedClubHome ? awayName : homeName;
        const opponentId = isSelectedClubHome ? away.team?.id : home.team?.id;

        const dateIso = ev.date;
        const state = comp.status?.type?.state || (isUpcoming ? "pre" : "post");
        const isLive = state === "in";
        const isPost = state === "post";
        const statusDesc = comp.status?.type?.description || (isUpcoming ? "Scheduled" : "Full Time");
        const displayClock =
          comp.status?.displayClock || comp.status?.type?.shortDetail || null;

        const homeScore =
          (isLive || isPost || !isUpcoming) && home.score?.displayValue !== undefined
            ? String(home.score.displayValue)
            : null;
        const awayScore =
          (isLive || isPost || !isUpcoming) && away.score?.displayValue !== undefined
            ? String(away.score.displayValue)
            : null;

        const broadcasts = (comp.broadcasts || []).flatMap((b) => b.media?.shortName || b.names || []);

        return {
          id: `espn-${ev.id}`,
          title: `${clubInfo.name} vs ${opponent}`,
          clubName: clubInfo.name,
          clubId: teamId,
          opponent,
          opponentId,
          isHome: isSelectedClubHome,
          venue:
            comp.venue?.fullName ||
            (isSelectedClubHome ? `${clubInfo.name} Stadium` : `${opponent} Stadium`),
          competition: ev.league?.name || compDef.label,
          competitionCode: compDef.code,
          isEuropean: compDef.isEuropean,
          date: dateIso,
          statusText:
            isLive
              ? homeScore !== null && awayScore !== null
                ? `${homeScore} - ${awayScore}`
                : "LIVE"
              : isUpcoming
              ? statusDesc.toUpperCase()
              : homeScore !== null && awayScore !== null
              ? `${homeScore} - ${awayScore}`
              : "FT",
          homeScore,
          awayScore,
          isLive,
          displayClock,
          isUpcoming: isUpcoming && !isLive && !isPost,
          broadcast:
            broadcasts[0] ||
            (compDef.isEuropean ? "TNT Sports" : isSelectedClubHome ? "Sky Sports" : "TNT Sports"),
        };
      });
    };

    const liveMap = new Map();
    const upcomingMap = new Map();
    const recentMap = new Map();

    for (const result of settled) {
      if (result.status !== "fulfilled") continue;
      const { compDef, isUpcoming, events } = result.value;
      const parsed = parseEvents(events, compDef, isUpcoming);
      for (const item of parsed) {
        if (item.isLive) {
          liveMap.set(item.id, item);
          continue;
        }
        const targetMap = isUpcoming ? upcomingMap : recentMap;
        if (!targetMap.has(item.id)) {
          targetMap.set(item.id, item);
        }
      }
    }

    const parsedLive = Array.from(liveMap.values());
    const parsedUpcoming = Array.from(upcomingMap.values())
      .filter((item) => !liveMap.has(item.id))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const parsedRecent = Array.from(recentMap.values())
      .filter((item) => !liveMap.has(item.id))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const payload = {
      source: `ESPN Official Multi-Competition Feed (${clubInfo.name})`,
      teamId,
      teamName: clubInfo.name,
      isLive: true,
      hasLiveMatch: parsedLive.length > 0,
      lastUpdated: new Date().toISOString(),
      live: parsedLive,
      upcoming: parsedUpcoming,
      recent: parsedRecent,
    };

    setScheduleCache(teamId, { timestamp: now, hasLive: parsedLive.length > 0, payload });

    return NextResponse.json(payload, { headers: CACHE_HEADERS });
  } catch (err) {
    console.error(`Error fetching live ESPN schedule for team ${teamId}:`, err);
    return NextResponse.json(
      {
        source: "ESPN Live Feed (Failed)",
        teamId,
        isLive: false,
        error: err.message,
        upcoming: [],
        recent: [],
      },
      { status: 500 }
    );
  }
}
