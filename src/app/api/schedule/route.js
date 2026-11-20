import { NextResponse } from "next/server";

// Cache live fixtures for 10 minutes to respect API etiquette
let cachedSchedule = null;
let lastFetchedTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000;

export async function GET(request) {
  const now = Date.now();
  if (cachedSchedule && now - lastFetchedTime < CACHE_TTL_MS) {
    return NextResponse.json(cachedSchedule);
  }

  try {
    // 1. Fetch upcoming fixtures
    const upcomingUrl = "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams/364/schedule?fixture=true";
    // 2. Fetch past match results
    const resultsUrl = "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams/364/schedule";

    const [upcomingRes, resultsRes] = await Promise.all([
      fetch(upcomingUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; AnfieldInsights/1.0)", Accept: "application/json" },
        next: { revalidate: 600 },
      }),
      fetch(resultsUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; AnfieldInsights/1.0)", Accept: "application/json" },
        next: { revalidate: 600 },
      }),
    ]);

    if (!upcomingRes.ok && !resultsRes.ok) {
      throw new Error("Failed to reach ESPN schedule feeds");
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
        const isLfcHome = home.team?.id === "364";
        const opponent = isLfcHome ? awayName : homeName;

        const dateIso = ev.date;
        const statusDesc = comp.status?.type?.description || (isUpcoming ? "Scheduled" : "Full Time");
        const homeScore = home.score?.displayValue ?? null;
        const awayScore = away.score?.displayValue ?? null;

        // Broadcast channels
        const broadcasts = (comp.broadcasts || []).flatMap((b) => b.media?.shortName || b.names || []);

        return {
          id: `espn-${ev.id}`,
          title: `Liverpool vs ${opponent}`,
          opponent,
          isHome: isLfcHome,
          venue: comp.venue?.fullName || (isLfcHome ? "Anfield" : `${opponent} Stadium`),
          competition: ev.league?.name || "Premier League",
          date: dateIso,
          statusText: isUpcoming ? statusDesc.toUpperCase() : `${homeScore} - ${awayScore}`,
          homeScore,
          awayScore,
          isLive: comp.status?.type?.state === "in",
          isUpcoming,
          broadcast: broadcasts[0] || (isLfcHome ? "Sky Sports" : "TNT Sports"),
        };
      });
    };

    const parsedUpcoming = parseEvents(upcomingData.events || [], true);
    const parsedRecent = parseEvents(resultsData.events || [], false);

    const payload = {
      source: "ESPN Official Live Schedule Feed",
      isLive: true,
      lastUpdated: new Date().toISOString(),
      upcoming: parsedUpcoming,
      recent: parsedRecent,
    };

    cachedSchedule = payload;
    lastFetchedTime = now;

    return NextResponse.json(payload);
  } catch (err) {
    console.error("Error fetching live ESPN schedule:", err);
    return NextResponse.json(
      {
        source: "ESPN Live Feed (Failed)",
        isLive: false,
        error: err.message,
        upcoming: [],
        recent: [],
      },
      { status: 500 }
    );
  }
}
