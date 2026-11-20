import { NextResponse } from "next/server";
import { PREMIER_LEAGUE_MANAGERS } from "../../../data/premierLeagueManagers";

// In-memory per-club cache (10 minutes TTL)
const scheduleCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId") || "364"; // Default Liverpool (364)
  const clubInfo = PREMIER_LEAGUE_MANAGERS[teamId] || { name: "Liverpool", shortName: "LIV" };

  const now = Date.now();
  const cached = scheduleCache.get(teamId);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.payload);
  }

  try {
    // 1. Fetch upcoming fixtures for the chosen club
    const upcomingUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams/${teamId}/schedule?fixture=true`;
    // 2. Fetch past match results for the chosen club
    const resultsUrl = `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams/${teamId}/schedule`;

    const [upcomingRes, resultsRes] = await Promise.all([
      fetch(upcomingUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; FootballInsights/1.0)", Accept: "application/json" },
        next: { revalidate: 600 },
      }),
      fetch(resultsUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; FootballInsights/1.0)", Accept: "application/json" },
        next: { revalidate: 600 },
      }),
    ]);

    if (!upcomingRes.ok && !resultsRes.ok) {
      throw new Error(`Failed to reach ESPN schedule feeds for team ${teamId}`);
    }

    const upcomingData = upcomingRes.ok ? await upcomingRes.json() : { events: [] };
    const resultsData = resultsRes.ok ? await resultsRes.json() : { events: [] };

    const parseEvents = (events = [], isUpcoming = true) => {
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
        const statusDesc = comp.status?.type?.description || (isUpcoming ? "Scheduled" : "Full Time");
        
        // Cleanly parse scores: completed matches have a real score, while unplayed upcoming matches do not
        const homeScore = !isUpcoming && home.score?.displayValue !== undefined ? String(home.score.displayValue) : null;
        const awayScore = !isUpcoming && away.score?.displayValue !== undefined ? String(away.score.displayValue) : null;

        // Broadcast channels
        const broadcasts = (comp.broadcasts || []).flatMap((b) => b.media?.shortName || b.names || []);

        return {
          id: `espn-${ev.id}`,
          title: `${clubInfo.name} vs ${opponent}`,
          clubName: clubInfo.name,
          clubId: teamId,
          opponent,
          opponentId,
          isHome: isSelectedClubHome,
          venue: comp.venue?.fullName || (isSelectedClubHome ? `${clubInfo.name} Stadium` : `${opponent} Stadium`),
          competition: ev.league?.name || "Premier League",
          date: dateIso,
          statusText: isUpcoming ? statusDesc.toUpperCase() : (homeScore !== null && awayScore !== null ? `${homeScore} - ${awayScore}` : "FT"),
          homeScore,
          awayScore,
          isLive: comp.status?.type?.state === "in",
          isUpcoming,
          broadcast: broadcasts[0] || (isSelectedClubHome ? "Sky Sports" : "TNT Sports"),
        };
      });
    };

    const parsedUpcoming = parseEvents(upcomingData.events || [], true);
    const parsedRecent = parseEvents(resultsData.events || [], false);

    const payload = {
      source: `ESPN Official Live Schedule Feed (${clubInfo.name})`,
      teamId,
      teamName: clubInfo.name,
      isLive: true,
      lastUpdated: new Date().toISOString(),
      upcoming: parsedUpcoming,
      recent: parsedRecent,
    };

    scheduleCache.set(teamId, { timestamp: now, payload });

    return NextResponse.json(payload);
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
