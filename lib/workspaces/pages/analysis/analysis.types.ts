export type LighthouseCategory = {
  score?: number | null;
  auditRefs?: LighthouseAuditRef[];
};

export type LighthouseCategories = {
  performance?: LighthouseCategory;
  accessibility?: LighthouseCategory;
  seo?: LighthouseCategory;
  ['best-practices']?: LighthouseCategory;
};

export type PageSpeedApiResponse = {
  id?: string;
  kind?: string;
  analysisUTCTimestamp?: string;
  lighthouseResult?: LighthouseResult;
  audits?: Record<string, LighthouseAudit>;
};

export type LighthouseSummary = {
  performance: number | null;
  accessibility: number | null;
  seo: number | null;
  bestPractices: number | null;
};

export type Strategy = 'mobile' | 'desktop';

export type StrategySummary = {
  mobile: LighthouseSummary;
  desktop: LighthouseSummary;
};

export type LighthouseReport = {
  pageId: string;
  url: string;
  summary: StrategySummary;
  mobile: PageSpeedApiResponse;
  desktop: PageSpeedApiResponse;
  createdAt: string;
  updatedAt: string;
};

export type LighthouseReportDoc = {
  pageId: string;
  url: string;
  summary: StrategySummary;
  mobile: PageSpeedApiResponse;
  desktop: PageSpeedApiResponse;
  createdAt: Date;
  updatedAt: Date;
};

export type LighthouseAuditRef = {
  id: string;
  weight?: number;
  group?: string;
};

export type LighthouseAudit = {
  id?: string;
  title?: string;
  description?: string;
  score?: number | null;
  scoreDisplayMode?: string;
  displayValue?: string;
};

export type LighthouseResult = {
  categories?: LighthouseCategories;
};
