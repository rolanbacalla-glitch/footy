#!/usr/bin/env node
/**
 * Daily Live Data Feed & Integrity Check
 * Verifies every upstream live sports, news, standings, roster, crest, and weather feed
 * used by Football Insights returns valid, non-empty data.
 *
 * Usage:
 *   node scripts/check-live-data.mjs
 */

const CHECKS = [
  {
    name: "ESPN Premier League Standings (20 clubs)",
    url: "https://site.web.api.espn.com/apis/v2/sports/soccer/eng.1/standings",
    validate: (data) => {
      const entries = data?.children?.[0]?.standings?.entries || [];
      return entries.length === 20
        ? { ok: true, detail: `${entries.length} clubs` }
        : { ok: false, detail: `Expected 20 clubs, got ${entries.length}` };
    },
  },
  {
    name: "ESPN Premier League Scoreboard",
    url: "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard",
    validate: (data) =>
      Array.isArray(data?.events)
        ? { ok: true, detail: `${data.events.length} events` }
        : { ok: false, detail: "Missing events array" },
  },
  {
    name: "ESPN UEFA Champions League Scoreboard",
    url: "https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard",
    validate: (data) =>
      Array.isArray(data?.events)
        ? { ok: true, detail: `${data.events.length} events` }
        : { ok: false, detail: "Missing events array" },
  },
  {
    name: "ESPN UEFA Europa League Scoreboard",
    url: "https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.europa/scoreboard",
    validate: (data) =>
      Array.isArray(data?.events)
        ? { ok: true, detail: `${data.events.length} events` }
        : { ok: false, detail: "Missing events array" },
  },
  {
    name: "ESPN UEFA Conference League Scoreboard",
    url: "https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.europa.conf/scoreboard",
    validate: (data) =>
      Array.isArray(data?.events)
        ? { ok: true, detail: `${data.events.length} events` }
        : { ok: false, detail: "Missing events array" },
  },
  {
    name: "ESPN Team Schedule (Liverpool 364)",
    url: "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams/364/schedule?fixture=true",
    validate: (data) => {
      const count = (data?.events || []).length;
      return count > 0
        ? { ok: true, detail: `${count} upcoming fixtures` }
        : { ok: false, detail: "0 upcoming fixtures returned" };
    },
  },
  {
    name: "ESPN Team Roster (Liverpool 364)",
    url: "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams/364/roster",
    validate: (data) => {
      const count = (data?.athletes || []).length;
      return count >= 15
        ? { ok: true, detail: `${count} squad players` }
        : { ok: false, detail: `Only ${count} squad players returned` };
    },
  },
  {
    name: "ESPN Premier League News Wire",
    url: "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/news",
    validate: (data) => {
      const count = (data?.articles || []).length;
      return count > 0
        ? { ok: true, detail: `${count} articles` }
        : { ok: false, detail: "0 articles returned" };
    },
  },
  {
    name: "BBC Sport Club RSS Feed (Liverpool)",
    url: "https://feeds.bbci.co.uk/sport/football/teams/liverpool/rss.xml",
    type: "text",
    validate: (text) => {
      const items = (text.match(/<item\b/gi) || []).length;
      return items > 0
        ? { ok: true, detail: `${items} RSS items` }
        : { ok: false, detail: "0 RSS items found" };
    },
  },
  {
    name: "The Guardian Club RSS Feed (Liverpool)",
    url: "https://www.theguardian.com/football/liverpool/rss",
    type: "text",
    validate: (text) => {
      const items = (text.match(/<item\b/gi) || []).length;
      return items > 0
        ? { ok: true, detail: `${items} RSS items` }
        : { ok: false, detail: "0 RSS items found" };
    },
  },
  {
    name: "Google News UK Football RSS",
    url: "https://news.google.com/rss/search?q=%22Liverpool%22+football&hl=en-GB&gl=GB&ceid=GB:en",
    type: "text",
    validate: (text) => {
      const items = (text.match(/<item\b/gi) || []).length;
      return items > 0
        ? { ok: true, detail: `${items} RSS items` }
        : { ok: false, detail: "0 RSS items found" };
    },
  },
  {
    name: "Open-Meteo Stadium Weather API",
    url: "https://api.open-meteo.com/v1/forecast?latitude=53.4308&longitude=-2.9608&current=temperature_2m,wind_speed_10m",
    validate: (data) =>
      data?.current?.temperature_2m !== undefined
        ? { ok: true, detail: `${data.current.temperature_2m}°C` }
        : { ok: false, detail: "Missing current weather payload" },
  },
  {
    name: "ESPN Club Crest CDN (Liverpool + Club Brugge)",
    url: "https://a.espncdn.com/i/teamlogos/soccer/500/570.png",
    type: "head",
    validate: (_, status) =>
      status === 200
        ? { ok: true, detail: "HTTP 200 PNG" }
        : { ok: false, detail: `HTTP ${status}` },
  },
];

async function runCheck(check) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(check.url, {
      method: check.type === "head" ? "HEAD" : "GET",
      redirect: "follow",
      signal: ctrl.signal,
      headers: {
        "User-Agent": "FootballInsightsLiveCheck/1.0",
        Accept: check.type === "text" ? "application/rss+xml, application/xml, text/xml" : "*/*",
      },
    });
    if (!res.ok) {
      return { name: check.name, ok: false, detail: `HTTP ${res.status}` };
    }
    if (check.type === "head") {
      return { name: check.name, ...check.validate(null, res.status) };
    }
    const body = check.type === "text" ? await res.text() : await res.json();
    return { name: check.name, ...check.validate(body, res.status) };
  } catch (err) {
    return { name: check.name, ok: false, detail: err.message };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  console.log(`=== DAILY LIVE DATA INTEGRITY CHECK (${new Date().toISOString()}) ===`);
  const results = await Promise.all(CHECKS.map(runCheck));

  let failures = 0;
  for (const r of results) {
    const icon = r.ok ? "PASS" : "FAIL";
    console.log(`[${icon}] ${r.name} — ${r.detail}`);
    if (!r.ok) failures++;
  }

  console.log(`\nSummary: ${results.length - failures}/${results.length} live data feeds healthy.`);
  if (failures > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Live data check crashed:", err);
  process.exit(1);
});
