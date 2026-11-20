/**
 * Resilient Multi-Tier API Fetcher with Automatic Fallback Chain
 * - Primary: ESPN Global Sports Feeds (Fast, real-time, no auth required)
 * - Fallback: Football-Data.org / Secondary Mirrors
 * - Timeout: 2500ms abort controller before switching to fallback
 */

export async function fetchWithFallback(endpoints = [], options = {}) {
  const timeoutMs = options.timeoutMs || 2500;
  let lastError = null;

  for (let i = 0; i < endpoints.length; i++) {
    const config = endpoints[i];
    const url = typeof config === "string" ? config : config.url;
    const providerName = config.name || `Tier-${i + 1} Provider`;
    const headers = {
      "User-Agent": "Mozilla/5.0 (compatible; AnfieldInsights/1.0)",
      Accept: "application/json",
      ...(config.headers || {}),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        headers,
        signal: controller.signal,
        next: { revalidate: config.revalidate || 60 },
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`${providerName} returned HTTP ${res.status}`);
      }

      const json = await res.json();
      return {
        data: json,
        provider: providerName,
        tier: i + 1,
        url,
      };
    } catch (err) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === "AbortError";
      console.warn(
        `[Fallback Chain] ${providerName} failed (${isTimeout ? "Timeout > " + timeoutMs + "ms" : err.message}). Attempting next provider...`
      );
      lastError = err;
    }
  }

  throw new Error(`All providers in fallback chain failed: ${lastError?.message}`);
}
