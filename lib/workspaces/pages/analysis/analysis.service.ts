import {
  PageSpeedApiResponse,
  LighthouseSummary,
  Strategy,
  StrategySummary,
} from './analysis.types';

/* ---------- helpers ---------- */

function toPercent(score?: number | null): number | null {
  if (typeof score !== 'number') return null;
  return Math.round(score * 100);
}

function buildSummary(data: PageSpeedApiResponse): LighthouseSummary {
  const categories = data.lighthouseResult?.categories;
  return {
    performance: toPercent(categories?.performance?.score),
    accessibility: toPercent(categories?.accessibility?.score),
    seo: toPercent(categories?.seo?.score),
    bestPractices: toPercent(categories?.['best-practices']?.score),
  };
}

function buildApiUrl(url: string, strategy: Strategy, apiKey: string): string {
  const apiUrl = new URL(
    'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
  );
  apiUrl.searchParams.set('url', url);
  apiUrl.searchParams.set('strategy', strategy);
  apiUrl.searchParams.set('locale', 'de');
  apiUrl.searchParams.set('key', apiKey);
  ['performance', 'accessibility', 'seo', 'best-practices'].forEach((cat) =>
    apiUrl.searchParams.append('category', cat)
  );
  return apiUrl.toString();
}

export async function runLighthouseForStrategy(
  url: string,
  strategy: Strategy
) {
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey) {
    throw new Error('PAGESPEED_API_KEY_MISSING');
  }

  const response = await fetch(buildApiUrl(url, strategy, apiKey));

  if (!response.ok) {
    throw new Error(`PAGESPEED_${response.status}`);
  }

  const raw = (await response.json()) as PageSpeedApiResponse;
  const summary = buildSummary(raw);

  return { raw, summary };
}

export async function runFullLighthouse(url: string): Promise<
  StrategySummary & {
    mobileRaw: PageSpeedApiResponse;
    desktopRaw: PageSpeedApiResponse;
  }
> {
  const [mobile, desktop] = await Promise.all([
    runLighthouseForStrategy(url, 'mobile'),
    runLighthouseForStrategy(url, 'desktop'),
  ]);

  return {
    mobile: mobile.summary,
    desktop: desktop.summary,
    mobileRaw: mobile.raw,
    desktopRaw: desktop.raw,
  };
}
