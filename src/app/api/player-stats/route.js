import { NextResponse } from "next/server";
import { fetchWithFallback } from "../../../lib/apiFallback";

const ESPN_ATHLETE_IDS = {
  alisson: "196876",
  vandijk: "157892",
  frimpong: "281119",
  kerkez: "323110",
  jacquet: "355980",
  macallister: "249299",
  szoboszlai: "257206",
  gravenberch: "274632",
  wirtz: "303748",
  barcola: "328238",
  isak: "235662",
};

const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get("playerId");

  if (!playerId) {
    return NextResponse.json({ error: "playerId query parameter required" }, { status: 400 });
  }

  const athleteId = ESPN_ATHLETE_IDS[playerId.toLowerCase()];
  if (!athleteId) {
    return NextResponse.json(
      {
        source: "Unmapped Athlete",
        isLive: false,
        message: "No public live athlete ID mapped for this selection",
      },
      { status: 200 }
    );
  }

  const cached = cache.get(athleteId);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data);
  }

  // Automatic Fallback Chain (2500ms timeout per provider)
  const endpoints = [
    {
      name: "ESPN Overview V3 Feed",
      url: `https://site.web.api.espn.com/apis/common/v3/sports/soccer/athletes/${athleteId}/overview`,
    },
    {
      name: "ESPN Primary Athlete V2 Feed",
      url: `https://site.api.espn.com/apis/site/v2/sports/soccer/athletes/${athleteId}`,
    },
  ];

  try {
    const { data, provider, tier } = await fetchWithFallback(endpoints, { timeoutMs: 2500 });
    const statsObj = data?.statistics || {};
    const names = statsObj.names || [];
    const splits = statsObj.splits || [];

    let totalStarts = 0;
    let totalGoals = 0;
    let totalAssists = 0;
    let totalYellows = 0;
    let totalReds = 0;
    let totalShots = 0;
    let totalSaves = 0;
    let totalCleanSheets = 0;

    const competitions = [];

    for (const split of splits) {
      const compName = split.displayName || "";
      const statValues = split.stats || [];
      const statMap = {};
      names.forEach((name, idx) => {
        statMap[name] = statValues[idx];
      });

      const starts = parseInt(statMap.starts || "0", 10);
      const goals = parseInt(statMap.totalGoals || "0", 10);
      const assists = parseInt(statMap.goalAssists || "0", 10);
      const yellows = parseInt(statMap.yellowCards || "0", 10);
      const reds = parseInt(statMap.redCards || "0", 10);
      const shots = parseInt(statMap.totalShots || "0", 10);
      const saves = parseInt(statMap.saves || "0", 10);
      const cleanSheets = parseInt(statMap.cleanSheet || "0", 10);

      if (compName.includes("2026-27") || compName.includes("Premier League") || compName.includes("Champions League")) {
        totalStarts += isNaN(starts) ? 0 : starts;
        totalGoals += isNaN(goals) ? 0 : goals;
        totalAssists += isNaN(assists) ? 0 : assists;
        totalYellows += isNaN(yellows) ? 0 : yellows;
        totalReds += isNaN(reds) ? 0 : reds;
        totalShots += isNaN(shots) ? 0 : shots;
        totalSaves += isNaN(saves) ? 0 : saves;
        totalCleanSheets += isNaN(cleanSheets) ? 0 : cleanSheets;

        competitions.push({
          competition: compName,
          starts,
          goals,
          assists,
          yellows,
        });
      }
    }

    const estimatedMinutes = totalStarts * 82;

    const liveStats = {
      source: `${provider} (Tier ${tier})`,
      isLive: true,
      lastUpdated: new Date().toISOString(),
      athleteId,
      seasonStarts: totalStarts,
      seasonMinutes: estimatedMinutes,
      seasonGoals: totalGoals,
      seasonAssists: totalAssists,
      seasonYellows: totalYellows,
      seasonReds: totalReds,
      seasonShots: totalShots,
      seasonSaves: totalSaves,
      cleanSheets: totalCleanSheets,
      competitions,
    };

    cache.set(athleteId, { data: liveStats, timestamp: now });
    return NextResponse.json(liveStats);
  } catch (err) {
    console.error(`Fallback Chain Exhausted for Athlete ${athleteId}:`, err);
    return NextResponse.json(
      {
        source: "Fallback Chain Exhausted",
        isLive: false,
        error: err.message,
      },
      { status: 200 }
    );
  }
}
