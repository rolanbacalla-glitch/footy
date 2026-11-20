import crypto from "node:crypto";
import { PREMIER_LEAGUE_MANAGERS } from "../../../data/premierLeagueManagers";

export const dynamic = "force-dynamic";

function getNewsSourcesForClub(teamId) {
  const club = PREMIER_LEAGUE_MANAGERS[teamId] || PREMIER_LEAGUE_MANAGERS["364"];
  const bbcSlug = club.bbcSlug || "football";
  const guardianSlug = club.guardianSlug || "football";
  const clubNameQuery = encodeURIComponent(`"${club.name}" football`);

  return [
    {
      id: "google-news",
      name: "Google News",
      url: `https://news.google.com/rss/search?q=${clubNameQuery}&hl=en-GB&gl=GB&ceid=GB:en`,
      accent: "blue",
    },
    {
      id: "bbc-sport",
      name: "BBC Sport",
      url: `https://feeds.bbci.co.uk/sport/football/teams/${bbcSlug}/rss.xml`,
      accent: "yellow",
    },
    {
      id: "the-guardian",
      name: "The Guardian",
      url: `https://www.theguardian.com/football/${guardianSlug}/rss`,
      accent: "mint",
    },
  ];
}

function decodeHtmlEntities(input) {
  if (!input) return "";
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "…");
}

function stripHtml(input) {
  if (!input) return "";
  return decodeHtmlEntities(input)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(block, tagName) {
  const regex = new RegExp(
    `<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`,
    "i"
  );
  const match = block.match(regex);
  return match ? match[1].trim() : "";
}

function isSafeHttpUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function parseRssItems(xml, sourceMeta) {
  if (!xml) return [];
  const itemMatches = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];

  const parsed = [];

  for (const rawItem of itemMatches) {
    const rawTitle = stripHtml(extractTag(rawItem, "title"));
    const rawLink = decodeHtmlEntities(extractTag(rawItem, "link")).trim();
    const rawPubDate = stripHtml(extractTag(rawItem, "pubDate"));
    const rawSourceTag = stripHtml(extractTag(rawItem, "source"));
    const rawDescription = stripHtml(extractTag(rawItem, "description"));

    if (!rawTitle || !isSafeHttpUrl(rawLink)) continue;

    let headline = rawTitle;
    let publisher = rawSourceTag || sourceMeta.name;

    if (sourceMeta.id === "google-news") {
      const dashIdx = rawTitle.lastIndexOf(" - ");
      if (dashIdx > 15) {
        const trailing = rawTitle.slice(dashIdx + 3).trim();
        if (!rawSourceTag && trailing.length <= 50) {
          publisher = trailing;
        }
        headline = rawTitle.slice(0, dashIdx).trim();
      }
    }

    let summary = rawDescription;
    if (
      sourceMeta.id === "google-news" &&
      summary.toLowerCase().startsWith(headline.toLowerCase().slice(0, 28))
    ) {
      summary = "";
    }
    if (summary.length > 220) {
      summary = `${summary.slice(0, 217).trim()}…`;
    }

    const parsedDate = rawPubDate ? new Date(rawPubDate) : null;
    const timestamp =
      parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate.getTime()
        : 0;

    const hash = crypto
      .createHash("sha256")
      .update(`${sourceMeta.id}:${rawLink}:${headline}`)
      .digest("hex")
      .slice(0, 20);

    parsed.push({
      id: `${sourceMeta.id}-${hash}`,
      title: headline,
      summary,
      url: rawLink,
      publisher,
      feedId: sourceMeta.id,
      feedName: sourceMeta.name,
      feedAccent: sourceMeta.accent,
      publishedAt: timestamp ? new Date(timestamp).toISOString() : null,
      timestamp,
    });
  }

  return parsed;
}

function isRelevantStory(item, club) {
  if (item.feedId !== "google-news") return true;
  const text = `${item.title} ${item.summary}`.toLowerCase();
  const clubNorm = club.name.toLowerCase();
  const managerNorm = club.manager.toLowerCase();
  const shortNorm = club.shortName.toLowerCase();
  return (
    text.includes(clubNorm) ||
    text.includes(managerNorm) ||
    text.includes(shortNorm)
  );
}

function tokenizeForOverlap(text) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4)
  );
}

function isDuplicateHeadline(candidate, existingList) {
  const cTokens = tokenizeForOverlap(candidate.title);
  if (cTokens.size < 3) return false;

  for (const item of existingList) {
    const itemTokens = tokenizeForOverlap(item.title);
    if (itemTokens.size < 3) continue;

    let overlap = 0;
    for (const t of cTokens) {
      if (itemTokens.has(t)) overlap += 1;
    }
    const minSize = Math.min(cTokens.size, itemTokens.size);
    if (minSize > 0 && overlap / minSize >= 0.6) {
      const timeDiff = Math.abs(candidate.timestamp - item.timestamp);
      if (timeDiff <= 36 * 3600 * 1000) return true;
      if (overlap / minSize >= 0.75) return true;
    }
  }
  return false;
}

// In-memory cache per club with 3 minute TTL
const newsCache = new Map();
const CACHE_TTL_MS = 3 * 60 * 1000;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get("teamId") || "364";
  const forceRefresh = searchParams.get("refresh") === "1";

  const club = PREMIER_LEAGUE_MANAGERS[teamId] || PREMIER_LEAGUE_MANAGERS["364"];
  const now = Date.now();

  const cached = newsCache.get(teamId);
  if (!forceRefresh && cached && now - cached.timestamp < CACHE_TTL_MS) {
    return Response.json(cached.payload, {
      headers: {
        "Cache-Control": "public, s-maxage=180, stale-while-revalidate=360",
      },
    });
  }

  const newsSources = getNewsSourcesForClub(teamId);

  const results = await Promise.allSettled(
    newsSources.map(async (source) => {
      const res = await fetch(source.url, {
        headers: {
          "User-Agent": "FootballInsights/1.0 (+Premier League News Aggregator)",
          Accept: "application/rss+xml, application/xml, text/xml, */*",
        },
        signal: AbortSignal.timeout(8000),
        ...(forceRefresh
          ? { cache: "no-store" }
          : { next: { revalidate: 180 } }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const xml = await res.text();
      const items = parseRssItems(xml, source);
      return { source, items };
    })
  );

  const allItems = [];
  const sourcesStatus = [];

  results.forEach((result, index) => {
    const meta = newsSources[index];
    if (result.status === "fulfilled") {
      allItems.push(...result.value.items);
      sourcesStatus.push({
        id: meta.id,
        name: meta.name,
        accent: meta.accent,
        ok: true,
        count: result.value.items.length,
      });
    } else {
      sourcesStatus.push({
        id: meta.id,
        name: meta.name,
        accent: meta.accent,
        ok: false,
        count: 0,
      });
    }
  });

  const relevantItems = allItems.filter((item) => isRelevantStory(item, club));
  relevantItems.sort((a, b) => {
    if (b.timestamp !== a.timestamp) return b.timestamp - a.timestamp;
    return (a.feedId === "google-news" ? 1 : 0) - (b.feedId === "google-news" ? 1 : 0);
  });

  const deduped = [];
  const seenIds = new Set();
  const seenUrls = new Set();

  for (const item of relevantItems) {
    if (seenIds.has(item.id) || seenUrls.has(item.url)) continue;
    if (isDuplicateHeadline(item, deduped)) continue;
    seenIds.add(item.id);
    seenUrls.add(item.url);
    deduped.push(item);
  }

  const topTen = deduped.slice(0, 10);
  const bySource = {};
  for (const source of newsSources) {
    const seenBySourceIds = new Set();
    bySource[source.id] = relevantItems
      .filter((item) => {
        if (item.feedId !== source.id) return false;
        if (seenBySourceIds.has(item.id)) return false;
        seenBySourceIds.add(item.id);
        return true;
      })
      .slice(0, 10);
  }

  const payload = {
    club: club.name,
    teamId,
    manager: club.manager,
    fetchedAt: new Date().toISOString(),
    refreshIntervalSeconds: 180,
    totalFound: deduped.length,
    articles: topTen,
    bySource,
    sourcesStatus,
  };

  newsCache.set(teamId, { timestamp: now, payload });

  return Response.json(payload, {
    headers: {
      "Cache-Control": forceRefresh
        ? "no-store"
        : "public, s-maxage=180, stale-while-revalidate=360",
    },
  });
}
