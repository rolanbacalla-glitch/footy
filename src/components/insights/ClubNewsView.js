"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { PREMIER_LEAGUE_MANAGERS } from "../../data/premierLeagueManagers";

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
    keywords: ["match", "goal", "win", "draw", "defeat", "premier league", "champions league", "fixture", "lineup", "score"],
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

export default function ClubNewsView({ selectedClubId = "364" }) {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFeed, setSelectedFeed] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState("all");

  const clubInfo = PREMIER_LEAGUE_MANAGERS[selectedClubId] || PREMIER_LEAGUE_MANAGERS["364"];

  const payloadRef = useRef(null);
  useEffect(() => {
    payloadRef.current = payload;
  }, [payload]);

  const fetchNews = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      }
      setError(null);

      const url = forceRefresh
        ? `/api/club-news?teamId=${selectedClubId}&refresh=1`
        : `/api/club-news?teamId=${selectedClubId}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Feed unavailable (HTTP ${res.status})`);
      }

      const data = await res.json();
      setPayload(data);
    } catch (err) {
      if (!payloadRef.current?.articles?.length) {
        setError(err?.message || `Unable to load latest ${clubInfo.name} news.`);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedClubId, clubInfo.name]);

  useEffect(() => {
    let active = true;

    async function loadNews(forceRefresh = false) {
      try {
        if (forceRefresh && active) {
          setRefreshing(true);
        }
        const url = forceRefresh
          ? `/api/club-news?teamId=${selectedClubId}&refresh=1`
          : `/api/club-news?teamId=${selectedClubId}`;

        const res = await fetch(url);
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
          if (!payloadRef.current?.articles?.length) {
            setError(err?.message || `Unable to load latest ${clubInfo.name} news.`);
          }
        }
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    setLoading(true);
    loadNews(false);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadNews(true);
      }
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
                  Latest {clubInfo.name} News
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
              <span className="text-[11px] text-[#8E8E93] tabular-nums self-end sm:self-auto">
                Updated {formatRelativeTime(payload.fetchedAt)}
              </span>
            )}
          </div>

          {/* Micro-Filter by Topic */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <span className="text-[11px] font-medium text-[#8E8E93] shrink-0 mr-1">
              Filter:
            </span>
            {TOPIC_FILTERS.map((topic) => {
              const isSelected = selectedTopic === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`min-h-[28px] px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white/15 text-white border-white/25 font-semibold"
                      : "bg-transparent text-[#8E8E93] border-white/[0.06] hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  {topic.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State Skeleton */}
        {loading && !payload && (
          <div className="space-y-3">
            <div className="apple-card rounded-[22px] p-6 animate-pulse space-y-3">
              <div className="h-4 w-28 bg-white/10 rounded-full" />
              <div className="h-6 w-3/4 bg-white/15 rounded-lg" />
              <div className="h-4 w-full bg-white/10 rounded-lg" />
              <div className="h-4 w-2/3 bg-white/10 rounded-lg" />
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="apple-card rounded-[18px] p-4 animate-pulse flex items-center justify-between"
              >
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-20 bg-white/10 rounded-full" />
                  <div className="h-4 w-4/5 bg-white/15 rounded" />
                </div>
                <div className="w-16 h-4 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Error Fallback Banner */}
        {error && !displayedArticles.length && (
          <div className="apple-card rounded-[20px] p-5 border border-[#FF453A]/30 bg-[#FF453A]/10 text-white flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#FF453A] shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <h3 className="text-sm font-semibold text-white">
                News Feeds Temporarily Unavailable
              </h3>
              <p className="text-xs text-[#EBEBF5]/70 leading-relaxed">
                {error} We automatically retry fetching live club feeds from Google News UK, BBC Sport, and The Guardian every 3 minutes.
              </p>
              <button
                type="button"
                onClick={() => fetchNews(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF453A] hover:underline pt-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Try Fetching Again
              </button>
            </div>
          </div>
        )}

        {/* Articles List: Lead Feature Card + Compact Secondary List */}
        {!loading && displayedArticles.length === 0 && !error && (
          <div className="apple-card rounded-[20px] p-8 text-center text-[#8E8E93] space-y-2">
            <p className="text-sm font-medium text-white">
              No headlines match the selected filter.
            </p>
            <p className="text-xs">
              Try switching back to &ldquo;All Sources&rdquo; or &ldquo;All Headlines&rdquo;.
            </p>
          </div>
        )}

        {/* 1. Lead Featured Headline Card */}
        {leadArticle && (
          <article className="apple-card rounded-[24px] p-5 sm:p-6 transition-all duration-300 hover:border-white/20 group relative overflow-hidden">
            <div className="flex flex-col gap-3">
              {/* Header meta */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${getSourceBadgeClasses(
                      leadArticle.feedAccent
                    )}`}
                  >
                    {leadArticle.feedName}
                  </span>
                  <span className="text-[11px] text-[#8E8E93] font-medium">
                    {leadArticle.publisher}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#8E8E93] font-mono tabular-nums">
                  <Clock className="w-3 h-3" />
                  <span>{formatRelativeTime(leadArticle.publishedAt)}</span>
                </div>
              </div>

              {/* Title & summary */}
              <div className="space-y-2">
                <a
                  href={leadArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug group-hover:text-[#FF4D5A] transition-colors focus:outline-none flex items-start justify-between gap-3"
                >
                  <span>{leadArticle.title}</span>
                  <ArrowUpRight className="w-4 h-4 shrink-0 text-[#8E8E93] group-hover:text-white transition-colors mt-1" />
                </a>
                {leadArticle.summary && (
                  <p className="text-xs sm:text-sm text-[#EBEBF5]/75 leading-relaxed font-normal">
                    {leadArticle.summary}
                  </p>
                )}
              </div>

              {/* Footer action */}
              <div className="pt-2 flex items-center justify-between border-t border-white/[0.06] text-xs">
                <a
                  href={leadArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-white/90 hover:text-white flex items-center gap-1 text-[11px] group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Read full coverage on {leadArticle.publisher}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
                <span className="text-[10px] text-white/40 font-mono">
                  {formatUkDateTime(leadArticle.publishedAt)}
                </span>
              </div>
            </div>
          </article>
        )}

        {/* 2. Secondary Compact Articles List (Items 2 - 10) */}
        {remainingArticles.length > 0 && (
          <div className="space-y-2.5">
            {remainingArticles.map((article, index) => (
              <article
                key={article.id}
                className="apple-card rounded-[18px] p-3.5 sm:p-4 transition-all duration-200 hover:border-white/20 hover:bg-[#15171E] group"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-white/40 w-4">
                        #{index + 2}
                      </span>
                      <span
                        className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${getSourceBadgeClasses(
                          article.feedAccent
                        )}`}
                      >
                        {article.feedName}
                      </span>
                      <span className="text-[11px] text-[#8E8E93] truncate max-w-[140px] sm:max-w-[220px]">
                        {article.publisher}
                      </span>
                    </div>

                    <span className="text-[11px] text-[#8E8E93] font-mono tabular-nums shrink-0">
                      {formatRelativeTime(article.publishedAt)}
                    </span>
                  </div>

                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm font-semibold text-white leading-snug group-hover:text-[#FF4D5A] transition-colors flex items-start justify-between gap-2"
                  >
                    <span>{article.title}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-[#8E8E93] group-hover:text-white mt-0.5" />
                  </a>

                  {article.summary && (
                    <p className="text-[11px] text-[#EBEBF5]/65 line-clamp-2 leading-relaxed">
                      {article.summary}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* 1/3 Right Column: Editorial Radar & Free Sources Registry */}
      <div className="lg:w-1/3 flex flex-col gap-3.5 shrink-0">
        {/* Source Health Card */}
        <div className="apple-card rounded-[20px] p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#0A84FF]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">
              Active Sources Registry
            </h3>
          </div>

          <div className="space-y-2">
            {(payload?.sourcesStatus || [
              { id: "google-news", name: "Google News", accent: "blue", ok: true },
              { id: "bbc-sport", name: "BBC Sport", accent: "yellow", ok: true },
              { id: "the-guardian", name: "The Guardian", accent: "mint", ok: true },
            ]).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      s.ok ? "bg-[#30D158]" : "bg-[#FF453A]"
                    }`}
                  />
                  <span className="text-xs font-semibold text-white">
                    {s.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/50 font-mono">
                  <span>{s.ok ? "Live & Synced" : "Unreachable"}</span>
                  {typeof s.count === "number" && (
                    <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-white/70">
                      {s.count} items
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-white/[0.06] text-[10px] text-[#8E8E93] leading-relaxed">
            All news headlines are drawn directly from open syndication streams. No login, synthetic articles, or paywalls.
          </div>
        </div>

        {/* Manager Tactical Spotlight Card */}
        <div className="apple-card rounded-[20px] p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FFD60A]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">
              {clubInfo.name} Command
            </h3>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-[#FF4D5A] tracking-wider">
              Official Head Coach
            </div>
            <div className="text-sm font-bold text-white">{clubInfo.manager}</div>
            <div className="text-xs text-white/60">
              Nationality: <span className="text-white">{clubInfo.nationality}</span>
            </div>
            <div className="text-xs text-white/60">
              Tactical Setup: <span className="font-mono text-white/90">{clubInfo.formation}</span>
            </div>
            <div className="text-xs text-[#8E8E93] pt-1 border-t border-white/[0.06] mt-2 leading-relaxed">
              {clubInfo.tacticalStyle}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
