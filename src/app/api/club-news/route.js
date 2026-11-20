import crypto from "node:crypto";

export const dynamic = "force-dynamic";

const FREE_NEWS_SOURCES = [
  {
    id: "google-news",
    name: "Google News",
    url: "https://news.google.com/rss/search?q=%22Liverpool+FC%22+OR+%22Liverpool%22+football+-%22East+Liverpool%22&hl=en-GB&gl=GB&ceid=GB:en",
    accent: "blue",
  },
  {
    id: "bbc-sport",
    name: "BBC Sport",
    url: "https://feeds.bbci.co.uk/sport/football/teams/liverpool/rss.xml",
    accent: "yellow",
  },
  {
    id: "the-guardian",
    name: "The Guardian",
    url: "https://www.theguardian.com/football/liverpool/rss",
    accent: "mint",
  },
];

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

    // Google News appends " - Publisher" to headlines; separate cleanly for Apple News styling
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

    // Remove redundant Google News description when it just repeats the headline + publisher
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

function isRelevantLiverpoolStory(item) {
  // Direct club RSS feeds are already scoped strictly to Liverpool FC
  if (item.feedId !== "google-news") return true;
  const text = `${item.title} ${item.summary}`.toLowerCase();
  if (text.includes("east liverpool") || text.includes("liverpool nsw")) {
    return false;
  }
  return (
    text.includes("liverpool") ||
    text.includes("anfield") ||
    text.includes("iraola") ||
    text.includes("merseyside")
  );
}

function extractKeywords(title) {
  const stopWords = new Set([
    "liverpool", "football", "with", "from", "that", "this", "have", "will",
    "after", "over", "into", "about", "ahead", "their", "what", "when", "where",
    "news", "live", "latest", "transfer", "premier", "league",
  ]);
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !stopWords.has(w))
  );
}

function normaliseHeadlineKey(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 56);
}

function isDuplicateHeadline(candidate, existingList) {
  const candKey = normaliseHeadlineKey(candidate.title);
  const candWords = extractKeywords(candidate.title);

  for (const existing of existingList) {
    if (normaliseHeadlineKey(existing.title) === candKey) return true;

    const existingWords = extractKeywords(existing.title);
    if (candWords.size >= 3 && existingWords.size >= 3) {
      let overlap = 0;
      for (const w of candWords) {
        if (existingWords.has(w)) overlap++;
      }
      const minSize = Math.min(candWords.size, existingWords.size);
      if (overlap / minSize >= 0.6) return true;
    }
  }
  return false;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get("refresh") === "1";

  const results = await Promise.allSettled(
    FREE_NEWS_SOURCES.map(async (source) => {
      const res = await fetch(source.url, {
        headers: {
          "User-Agent": "AnfieldInsights/1.0 (+Liverpool FC News Aggregator)",
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
    const meta = FREE_NEWS_SOURCES[index];
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

  // Filter to genuine Liverpool FC club coverage and sort strictly by most recent first
  const relevantItems = allItems.filter(isRelevantLiverpoolStory);
  relevantItems.sort((a, b) => {
    if (b.timestamp !== a.timestamp) return b.timestamp - a.timestamp;
    // When timestamps match, prefer direct publisher RSS (BBC / Guardian) over Google News redirect
    return (a.feedId === "google-news" ? 1 : 0) - (b.feedId === "google-news" ? 1 : 0);
  });

  // Deduplicate overlapping headlines across feeds
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

  // Build top 10 overall + up to 10 per individual feed for instant source switching
  const topTen = deduped.slice(0, 10);
  const bySource = {};
  for (const source of FREE_NEWS_SOURCES) {
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

  return Response.json(
    {
      club: "Liverpool FC",
      fetchedAt: new Date().toISOString(),
      refreshIntervalSeconds: 180,
      totalFound: deduped.length,
      articles: topTen,
      bySource,
      sourcesStatus,
    },
    {
      headers: {
        "Cache-Control": forceRefresh
          ? "no-store"
          : "public, s-maxage=180, stale-while-revalidate=360",
      },
    }
  );
}
