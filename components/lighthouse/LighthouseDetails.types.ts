import {
  LighthouseReport,
  Strategy,
} from '@/lib/workspaces/pages/analysis/analysis.types';

export type CategoryId =
  | 'performance'
  | 'accessibility'
  | 'seo'
  | 'best-practices';

export type LighthouseDetailsProps = {
  pageId: string;
  pageUrl: string;
  initialCategory?: CategoryId;
  initialStrategy?: Strategy;
  initialReport: LighthouseReport | null;
  workspaceId: string;
};

export type ScoreBubbleProps = {
  label: string;
  score: number | null | undefined;
};

export type AuditItem = {
  id: string;
  title: string;
  description?: string;
  score: number | null;
  scoreDisplayMode?: string;
  displayValue?: string;
};

export type Variant = 'success' | 'warning' | 'error';
