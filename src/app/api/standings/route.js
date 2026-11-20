import { NextResponse } from "next/server";
import { fetchWithFallback } from "../../../lib/apiFallback";

// Cache live standings for 3 minutes
let cachedStandings = null;
let lastFetchedTime = 0;
const CACHE_TTL_MS = 3 * 60 * 1000;

export async function GET() {
  const now = Date.now();
  if (cachedStandings && now - lastFetchedTime < CACHE_TTL_MS) {
    return NextResponse.json(cachedStandings);
  }

  // Multi-tier Fallback Chain
  const endpoints = [
    {
      name: "ESPN Global Standings Feed",
      url: "https://site.web.api.espn.com/apis/v2/sports/soccer/eng.1/standings",
    },
    {
      name: "ESPN Secondary Scoreboard Table",
      url: "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard",
    },
  ];

  try {
    const { data, provider, tier } = await fetchWithFallback(endpoints, { timeoutMs: 2500 });
    const entries = data?.children?.[0]?.standings?.entries || [];

    const table = entries.map((entry) => {
      const team = entry.team || {};
      const stats = entry.stats || [];

      const getStat = (name) => {
        const item = stats.find((s) => s.name === name);
        return item?.displayValue ?? item?.value ?? 0;
      };

      return {
        id: team.id,
        rank: parseInt(getStat("rank"), 10),
        name: team.displayName,
        shortName: team.shortDisplayName || team.abbreviation,
        crest: team.logos?.[0]?.href || `/crests/${(team.displayName || "").toLowerCase().replace(/[^a-z0-9]/g, "")}.svg`,
        played: parseInt(getStat("gamesPlayed"), 10),
        wins: parseInt(getStat("wins"), 10),
        draws: parseInt(getStat("ties"), 10),
        losses: parseInt(getStat("losses"), 10),
        goalsFor: parseInt(getStat("pointsFor"), 10),
        goalsAgainst: parseInt(getStat("pointsAgainst"), 10),
        goalDiff: parseInt(getStat("pointDifferential"), 10),
        points: parseInt(getStat("points"), 10),
        isLfc: team.id === "364" || team.displayName?.includes("Liverpool"),
      };
    });

    const payload = {
      source: `${provider} (Tier ${tier})`,
      isLive: true,
      lastUpdated: new Date().toISOString(),
      standings: table,
    };

    cachedStandings = payload;
    lastFetchedTime = now;

    return NextResponse.json(payload);
  } catch (err) {
    console.error("Live Standings Fallback Chain Failed:", err);
    return NextResponse.json(
      {
        source: "Fallback Chain Exhausted",
        isLive: false,
        error: err.message,
        standings: [],
      },
      { status: 500 }
    );
  }
}
