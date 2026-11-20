"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Newspaper,
  RefreshCw,
  ArrowUpRight,
  Clock,
  Globe,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

const REFRESH_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes

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
    keywords: ["transfer", "sign", "bid", "target", "contract", "deal", "scout", "window", "swap", "loan"],
  },
  {
    id: "matchday",
    label: "Matchday",
    keywords: ["match", "goal", "win", "draw", "defeat", "premier league", "champions league", "anfield", "fixture", "lineup", "score"],
  },
  {
    id: "injuries",
    label: "Fitness & Squad",
    keywords: ["injury", "fit", "return", "squad", "training", "blow", "boost", "suspension", "ruled out"],
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

function getSourceBadgeClasses(accent) {
  if (accent === "blue") {
    return "bg-[#0A84FF]/15 text-[#64D2FF] border-[#0A84FF]/30";
  }
  if (accent === "yellow") {
    return "bg-[#FFD60A]/14 text-[#FFD60A] border-[#FFD60A]/30";
  }
  return "bg-[#00DAC3]/14 text-[#00DAC3] border-[#00DAC3]/30";
}

export default function ClubNewsView() {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFeed, setSelectedFeed] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");

  const fetchNews = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      }
      setError(null);

      const res = await fetch(
        forceRefresh ? "/api/club-news?refresh=1" : "/api/club-news"
      );
      if (!res.ok) {
        throw new Error(`Feed unavailable (HTTP ${res.status})`);
      }

      const data = await res.json();
      setPayload(data);
    } catch (err) {
      setError(err?.message || "Unable to load latest Liverpool FC news.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadNews(forceRefresh = false) {
      try {
        if (forceRefresh && active) {
          setRefreshing(true);
        }
        const res = await fetch(
          forceRefresh ? "/api/club-news?refresh=1" : "/api/club-news"
        );
        if (!res.ok) {
          throw new Error(`Feed unavailable (HTTP ${res.status})`);
        }
        const data = await res.json();
        if (active) {
          setPayload(data);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || "Unable to load latest Liverpool FC news.");
        }
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    loadNews(false);

    // Automatically refresh live club news every 3 minutes
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadNews(true);
      }
    }, REFRESH_INTERVAL_MS);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

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
            const haystack = `${article.title} ${article.summary}`.toLowerCase();
            return activeTopic.keywords.some((kw) => haystack.includes(kw));
          })
          .slice(0, 10);

  const leadArticle = displayedArticles[0] || null;
  const remainingArticles = displayedArticles.slice(1);

  return (
    <div className="w-full min-h-0 flex-1 flex flex-col lg:flex-row gap-4 overflow-y-auto pr-0.5">
      {/* 2/3 Left Column: Apple News Dark Mode Top 10 Feed */}
      <div className="flex-1 lg:w-2/3 space-y-3.5 min-w-0">
        {/* Top Editorial Control Bar */}
        <div className="apple-card rounded-[20px] p-4 flex flex-col gap-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Newspaper className="w-5 h-5 text-[#FF453A]" strokeWidth={2} />
                <h2 className="text-[17px] font-semibold text-white tracking-[-0.02em]">
                  Latest Liverpool FC News
                </h2>
                <span className="text-[10px] font-semibold tabular-nums text-[#00DAC3] bg-[#00DAC3]/12 px-2.5 py-0.5 rounded-full border border-[#00DAC3]/25">
                  Top 10 Most Recent
                </span>
              </div>
              <p className="text-xs text-[#EBEBF5]/68 mt-0.5">
                Live club coverage aggregated from free public RSS feeds (Google News UK, BBC Sport &amp; The Guardian).
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchNews(true)}
              disabled={refreshing}
              className="min-h-[38px] self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#181818] hover:bg-[#222222] border border-white/[0.08] text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-60"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#FF2636] ${
                  refreshing ? "animate-spin" : ""
                }`}
                strokeWidth={2.2}
              />
              <span>{refreshing ? "Refreshing…" : "Refresh Feed"}</span>
            </button>
          </div>

          {/* Apple Segmented Source Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-white/[0.08]">
            <div
              role="tablist"
              aria-label="Filter news by free source"
              className="apple-segmented inline-flex items-center gap-1.5 p-1 rounded-full overflow-x-auto max-w-full"
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
                    className={`min-h-[34px] pressable px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "glass-crimson-pill text-white"
                        : "apple-tile border-white/[0.08] text-[#8E8E93] hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {payload?.fetchedAt && (
              <div className="flex items-center gap-3 text-[11px] text-[#EBEBF5]/60 tabular-nums">
                <span className="inline-flex items-center gap-1.5 text-[#30D158] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#30D158] animate-pulse" />
                  Auto-updates every 3 mins
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#EBEBF5]/45" />
                  Updated {formatUkDateTime(payload.fetchedAt)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-3" aria-busy="true" aria-label="Loading latest club news">
            <div className="apple-card rounded-[20px] p-5 animate-pulse">
              <div className="h-4 w-32 bg-[#1A1A1A] rounded-full mb-3" />
              <div className="h-6 w-4/5 bg-[#1A1A1A] rounded-lg mb-2" />
              <div className="h-4 w-full bg-[#1A1A1A] rounded-lg mb-1.5" />
              <div className="h-4 w-2/3 bg-[#1A1A1A] rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="apple-card rounded-[20px] p-4 animate-pulse">
                  <div className="h-3.5 w-24 bg-[#1A1A1A] rounded-full mb-3" />
                  <div className="h-4 w-full bg-[#1A1A1A] rounded mb-2" />
                  <div className="h-4 w-3/4 bg-[#1A1A1A] rounded" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="apple-card rounded-[20px] p-6 text-center flex flex-col items-center gap-3">
            <AlertCircle className="w-8 h-8 text-[#E03535]" strokeWidth={1.8} />
            <div>
              <h3 className="text-sm font-semibold text-white">
                Could not retrieve live news feeds
              </h3>
              <p className="text-xs text-[#EBEBF5]/68 mt-1">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => fetchNews(true)}
              className="min-h-[40px] px-5 py-2 rounded-full glass-crimson-pill text-white text-xs font-semibold cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty Filter State */}
        {!loading && !error && displayedArticles.length === 0 && (
          <div className="apple-card rounded-[20px] p-8 text-center">
            <p className="text-sm font-semibold text-white">
              No recent headlines matched this filter
            </p>
            <p className="text-xs text-[#EBEBF5]/65 mt-1">
              Try switching back to All Headlines or All Sources to see the full Top 10.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedFeed("all");
                setSelectedTopic("all");
              }}
              className="mt-4 min-h-[38px] px-4 py-1.5 rounded-full bg-[#181818] hover:bg-[#222222] text-xs font-semibold text-white border border-white/10 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Story #01 — Featured Lead Hero Card */}
        {!loading && !error && leadArticle && (
          <a
            href={leadArticle.url}
            target="_blank"
            rel="noopener noreferrer"
            className="apple-card group glass-shimmer rounded-[24px] p-5 pressable block"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold uppercase tracking-[0.05em] px-2.5 py-0.5 rounded-full glass-crimson-pill text-white tabular-nums">
                  Top Story • #01
                </span>
                <span
                  className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${getSourceBadgeClasses(
                    leadArticle.feedAccent
                  )}`}
                >
                  {leadArticle.feedName}
                </span>
                {leadArticle.publisher &&
                  leadArticle.publisher !== leadArticle.feedName && (
                    <span className="text-[11px] font-medium text-[#8E8E93]">
                      via {leadArticle.publisher}
                    </span>
                  )}
              </div>

              <span className="text-[11px] font-medium tabular-nums text-[#8E8E93]">
                {formatRelativeTime(leadArticle.publishedAt)}
                {leadArticle.publishedAt
                  ? ` • ${formatUkDateTime(leadArticle.publishedAt)}`
                  : ""}
              </span>
            </div>

            <h3 className="text-[18px] sm:text-[20px] font-bold text-white tracking-[-0.02em] leading-snug group-hover:text-[#FF4D5A] transition-colors">
              {leadArticle.title}
            </h3>

            {leadArticle.summary && (
              <p className="text-[13px] text-[#8E8E93] leading-relaxed mt-2">
                {leadArticle.summary}
              </p>
            )}

            <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
              <span className="text-[#8E8E93] font-medium">
                {leadArticle.publisher}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-[#FF2636] group-hover:translate-x-0.5 transition-transform">
                Read full article
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </a>
        )}

        {/* Stories #02 – #10 Grid */}
        {!loading && !error && remainingArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
            {remainingArticles.map((article, idx) => {
              const rank = String(idx + 2).padStart(2, "0");
              const itemKey = article.id
                ? `${article.id}-${idx}`
                : `article-${idx}-${article.url || rank}`;
              return (
                <a
                  key={itemKey}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="apple-card group rounded-[22px] p-4.5 pressable flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-[#1A1A1A] border border-white/10 text-[10px] font-semibold tabular-nums text-white flex items-center justify-center shrink-0">
                          {rank}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${getSourceBadgeClasses(
                            article.feedAccent
                          )}`}
                        >
                          {article.feedName}
                        </span>
                      </div>

                      <span className="text-[11px] text-[#8E8E93] tabular-nums shrink-0">
                        {formatRelativeTime(article.publishedAt)}
                      </span>
                    </div>

                    <h4 className="text-[14px] font-semibold text-white leading-snug tracking-[-0.015em] group-hover:text-[#FF4D5A] transition-colors line-clamp-3">
                      {article.title}
                    </h4>

                    {article.summary && (
                      <p className="text-xs text-[#8E8E93] leading-relaxed mt-1.5 line-clamp-2">
                        {article.summary}
                      </p>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-[#8E8E93] font-medium truncate">
                      {article.publisher}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#FF2636] shrink-0">
                      Open
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* 1/3 Right Column: Free Sources Status & Topic Filter */}
      <div className="lg:w-1/3 space-y-3.5 min-w-0">
        {/* Topic Filter Chips */}
        <div className="apple-card rounded-[24px] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#F1B82D]" strokeWidth={2} />
            <h3 className="text-[13px] font-semibold text-white tracking-[-0.01em]">
              Quick Topic Filter
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {TOPIC_FILTERS.map((topic) => {
              const isActive = selectedTopic === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setSelectedTopic(topic.id)}
                  aria-pressed={isActive}
                  className={`min-h-[36px] px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                    isActive
                      ? "glass-crimson-pill text-white border-transparent"
                      : "bg-[#1A1A1A] border-white/[0.08] text-[#8E8E93] hover:text-white hover:bg-[#222222]"
                  }`}
                >
                  {topic.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Free Live RSS Sources Telemetry */}
        <div className="apple-card rounded-[24px] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#FF2636]" strokeWidth={2} />
              <h3 className="text-[13px] font-semibold text-white tracking-[-0.01em]">
                Free Live News Sources
              </h3>
            </div>
          </div>

          <div className="space-y-2">
            {(payload?.sourcesStatus || [
              { id: "google-news", name: "Google News", accent: "blue", ok: true, count: 0 },
              { id: "bbc-sport", name: "BBC Sport", accent: "yellow", ok: true, count: 0 },
              { id: "the-guardian", name: "The Guardian", accent: "mint", ok: true, count: 0 },
            ]).map((src) => (
              <div
                key={src.id}
                className="apple-tile px-3 py-2.5 rounded-[14px] flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      src.ok ? "text-[#FF2636]" : "text-[#8E8E93]"
                    }`}
                    strokeWidth={2}
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      {src.name}
                    </span>
                    <span className="text-[10px] text-[#8E8E93]">
                      Public RSS • UK (en-GB)
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono tabular-nums font-semibold text-[#FF2636]">
                  {loading ? "—" : `${src.count} items`}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-[#8E8E93] leading-relaxed mt-3 pt-3 border-t border-white/[0.08]">
            Headlines are deduplicated across feeds, ordered strictly by publication timestamp, and capped to the <strong className="text-white">Top 10 most recent</strong> stories.
          </p>
        </div>
      </div>
    </div>
  );
}
