"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { RefreshCw, ArrowUpRight, AlertCircle } from "lucide-react";
import { PREMIER_LEAGUE_MANAGERS } from "../../data/premierLeagueManagers";

const REFRESH_INTERVAL_MS = 3 * 60 * 1000;

const FEED_TABS = [
  { id: "all", label: "All Sources" },
  { id: "google-news", label: "Google News" },
  { id: "bbc-sport", label: "BBC Sport" },
  { id: "the-guardian", label: "The Guardian" },
];

const TOPIC_FILTERS = [
  { id: "all", label: "All Headlines", keywords: [] },
  {
    id: "transfers",
    label: "Transfers",
    keywords: [
      "transfer",
      "sign",
      "bid",
      "target",
      "contract",
      "deal",
      "scout",
      "window",
      "swap",
      "loan",
    ],
  },
  {
    id: "matchday",
    label: "Matchday",
    keywords: [
      "match",
      "goal",
      "win",
      "draw",
      "defeat",
      "premier league",
      "champions league",
      "fixture",
      "lineup",
      "score",
    ],
  },
  {
    id: "injuries",
    label: "Fitness & Squad",
    keywords: [
      "injury",
      "fit",
      "return",
      "squad",
      "training",
      "blow",
      "boost",
      "suspension",
      "ruled out",
    ],
  },
];

function formatRelativeTime(isoDate) {
  if (!isoDate) return "Recent";
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function formatUkDateTime(isoDate) {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ClubNewsView({ selectedClubId = "364" }) {
  const [payload, setPayload] = useState(null);
  const [loadedClubId, setLoadedClubId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFeed, setSelectedFeed] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const loading = loadedClubId !== selectedClubId;

  const clubInfo =
    PREMIER_LEAGUE_MANAGERS[selectedClubId] || PREMIER_LEAGUE_MANAGERS["364"];

  const payloadRef = useRef(null);
  useEffect(() => {
    payloadRef.current = payload;
  }, [payload]);

  const fetchNews = useCallback(
    async (forceRefresh = false) => {
      try {
        if (forceRefresh) setRefreshing(true);
        setError(null);
        const url = forceRefresh
          ? `/api/club-news?teamId=${selectedClubId}&refresh=1`
          : `/api/club-news?teamId=${selectedClubId}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Feed unavailable (HTTP ${res.status})`);
        const data = await res.json();
        setPayload(data);
      } catch (err) {
        if (!payloadRef.current?.articles?.length) {
          setError(
            err?.message || `Unable to load latest ${clubInfo.name} news.`
          );
        }
      } finally {
        setLoadedClubId(selectedClubId);
        setRefreshing(false);
      }
    },
    [selectedClubId, clubInfo.name]
  );

  useEffect(() => {
    let active = true;

    async function loadNews(forceRefresh = false) {
      try {
        if (forceRefresh && active) setRefreshing(true);
        const url = forceRefresh
          ? `/api/club-news?teamId=${selectedClubId}&refresh=1`
          : `/api/club-news?teamId=${selectedClubId}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Feed unavailable (HTTP ${res.status})`);
        const data = await res.json();
        if (active) {
          setPayload(data);
          setError(null);
        }
      } catch (err) {
        if (active && !payloadRef.current?.articles?.length) {
          setError(
            err?.message || `Unable to load latest ${clubInfo.name} news.`
          );
        }
      } finally {
        if (active) {
          setLoadedClubId(selectedClubId);
          setRefreshing(false);
        }
      }
    }

    loadNews(false);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") loadNews(true);
    }, REFRESH_INTERVAL_MS);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [selectedClubId, clubInfo.name]);

  const rawList =
    selectedFeed === "all"
      ? payload?.articles || []
      : payload?.bySource?.[selectedFeed] || [];

  const activeTopic =
    TOPIC_FILTERS.find((t) => t.id === selectedTopic) || TOPIC_FILTERS[0];

  const displayedArticles =
    activeTopic.keywords.length === 0
      ? rawList.slice(0, 10)
      : rawList
          .filter((article) => {
            const haystack =
              `${article.title} ${article.summary}`.toLowerCase();
            return activeTopic.keywords.some((kw) => haystack.includes(kw));
          })
          .slice(0, 10);

  const leadArticle = displayedArticles[0] || null;
  const remainingArticles = displayedArticles.slice(1);

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
      {/* Main 8-Col Editorial Wire */}
      <div className="xl:col-span-8 space-y-5 min-w-0">
        {/* Streamlined Filter Toolbar */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div
              role="tablist"
              aria-label="Filter news by source"
              className="glass-segmented inline-flex items-center p-1 rounded-full gap-0.5 overflow-x-auto max-w-full"
            >
              {FEED_TABS.map((tab) => {
                const isActive = selectedFeed === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedFeed(tab.id)}
                    className={`min-h-[34px] px-3.5 py-1 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-all ${
                      isActive
                        ? "bg-[#D2F865] text-[#0E100C] font-semibold"
                        : "text-[#8A8D96] hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => fetchNews(true)}
              disabled={refreshing}
              className="min-h-[36px] self-start sm:self-auto flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-medium text-white transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#D2F865] ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              <span>{refreshing ? "Refreshing…" : "Refresh Wire"}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {TOPIC_FILTERS.map((topic) => {
                const isSelected = selectedTopic === topic.id;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`min-h-[30px] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-white/12 text-white"
                        : "text-[#8A8D96] hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {topic.label}
                  </button>
                );
              })}
            </div>

            {payload?.fetchedAt && (
              <span className="text-xs text-[#6F727C] font-mono tabular-nums">
                Updated {formatRelativeTime(payload.fetchedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && !payload && (
          <div className="space-y-4">
            <div className="glass-card-deep p-6 animate-pulse space-y-3">
              <div className="h-3 w-36 bg-white/10 rounded" />
              <div className="h-6 w-3/4 bg-white/12 rounded" />
              <div className="h-4 w-full bg-white/8 rounded" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-5 animate-pulse space-y-2">
                <div className="h-3 w-28 bg-white/10 rounded" />
                <div className="h-4 w-4/5 bg-white/12 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !displayedArticles.length && (
          <div className="glass-card p-6 border-[#F26E7C]/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#F26E7C] shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-white">
                News Feeds Temporarily Unavailable
              </h3>
              <p className="text-xs text-[#8A8D96] leading-relaxed">{error}</p>
              <button
                type="button"
                onClick={() => fetchNews(true)}
                className="text-xs font-medium text-[#D2F865] hover:underline pt-1 cursor-pointer"
              >
                Try fetching again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && displayedArticles.length === 0 && !error && (
          <div className="glass-card p-8 text-center text-[#8A8D96] space-y-1.5">
            <p className="text-sm font-medium text-white">
              No headlines match this filter.
            </p>
            <p className="text-xs">
              Switch back to All Sources or All Headlines to view the full wire.
            </p>
          </div>
        )}

        {/* Lead Story */}
        {leadArticle && (
          <article className="glass-card-deep p-6 sm:p-7 group">
            <div className="flex items-center justify-between gap-2 text-xs text-[#8A8D96] mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[#D2F865] font-medium">
                  {leadArticle.feedName}
                </span>
                <span aria-hidden="true">·</span>
                <span>{leadArticle.publisher}</span>
              </div>
              <span className="font-mono tabular-nums">
                {formatRelativeTime(leadArticle.publishedAt)}
              </span>
            </div>

            <a
              href={leadArticle.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-lg sm:text-xl font-semibold text-white tracking-tight leading-snug group-hover:text-[#D2F865] transition-colors flex items-start justify-between gap-4"
            >
              <span>{leadArticle.title}</span>
              <ArrowUpRight className="w-5 h-5 shrink-0 text-[#8A8D96] group-hover:text-[#D2F865] transition-colors mt-0.5" />
            </a>

            {leadArticle.summary && (
              <p className="text-sm text-[#B7BAC3] leading-relaxed mt-3 max-w-[68ch]">
                {leadArticle.summary}
              </p>
            )}

            <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#6F727C]">
              <span>Full coverage on {leadArticle.publisher}</span>
              <span className="font-mono tabular-nums">
                {formatUkDateTime(leadArticle.publishedAt)}
              </span>
            </div>
          </article>
        )}

        {/* Clean Remaining Wire List */}
        {remainingArticles.length > 0 && (
          <div className="glass-card divide-y divide-white/[0.06]">
            {remainingArticles.map((article, idx) => (
              <article
                key={article.id}
                className="p-5 hover:bg-white/[0.025] transition-colors group"
              >
                <div className="flex items-center justify-between gap-2 text-xs text-[#8A8D96] mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[#5E616B]">
                      {String(idx + 2).padStart(2, "0")}
                    </span>
                    <span className="text-[#B7BAC3] font-medium">
                      {article.feedName}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{article.publisher}</span>
                  </div>
                  <span className="font-mono tabular-nums shrink-0">
                    {formatRelativeTime(article.publishedAt)}
                  </span>
                </div>

                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm sm:text-[15px] font-medium text-white leading-snug group-hover:text-[#D2F865] transition-colors flex items-start justify-between gap-3"
                >
                  <span>{article.title}</span>
                  <ArrowUpRight className="w-4 h-4 shrink-0 text-[#6F727C] group-hover:text-[#D2F865] mt-0.5" />
                </a>

                {article.summary && (
                  <p className="text-xs text-[#8A8D96] line-clamp-2 leading-relaxed mt-1.5">
                    {article.summary}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Right 4-Col Club Command & Sources Panel */}
      <div className="xl:col-span-4 space-y-5">
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-display text-sm font-semibold text-white">
            {clubInfo.name} Technical Staff
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-2 border-b border-white/[0.06]">
              <span className="text-[#8A8D96]">Head Coach</span>
              <span className="text-white font-medium">{clubInfo.manager}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/[0.06]">
              <span className="text-[#8A8D96]">Nationality</span>
              <span className="text-white">{clubInfo.nationality}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/[0.06]">
              <span className="text-[#8A8D96]">Base Shape</span>
              <span className="font-mono text-[#D2F865]">{clubInfo.formation}</span>
            </div>
            <p className="text-xs text-[#8A8D96] leading-relaxed pt-1">
              {clubInfo.tacticalStyle}
            </p>
          </div>
        </div>

        <div className="glass-card p-5 space-y-3.5">
          <h3 className="font-display text-sm font-semibold text-white">
            Syndication Sources
          </h3>
          <div className="space-y-2">
            {(
              payload?.sourcesStatus || [
                { id: "google-news", name: "Google News UK", ok: true },
                { id: "bbc-sport", name: "BBC Sport", ok: true },
                { id: "the-guardian", name: "The Guardian", ok: true },
              ]
            ).map((s) => (
              <div
                key={s.id}
                className="glass-tile px-3.5 py-2.5 flex items-center justify-between text-xs"
              >
                <span className="text-white font-medium">{s.name}</span>
                <span className="font-mono text-[11px] text-[#8A8D96] tabular-nums">
                  {s.ok
                    ? typeof s.count === "number"
                      ? `${s.count} stories`
                      : "Synced"
                    : "Unavailable"}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#6F727C] leading-relaxed">
            Headlines are aggregated directly from open UK sports RSS feeds with automatic 3-minute refreshes.
          </p>
        </div>
      </div>
    </div>
  );
}
