'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { FiRefreshCw, FiChevronRight } from 'react-icons/fi';

import type { LighthouseReport } from '@/lib/workspaces/pages/analysis/analysis.types';

/* ---------- types ---------- */

type LighthouseSummaryProps = {
  pageId: string;
  pageUrl: string;
  detailsHrefBase: string;
  initialReport: LighthouseReport | null;
  workspaceId: string;
};

type ScoreBubbleProps = {
  label: string;
  score: number | null | undefined;
  href: string;
};

/* ---------- helpers ---------- */

const getScoreColor = (score: number | null | undefined): string => {
  if (score == null) return '#999999';
  if (score < 50) return '#d93025';
  if (score < 90) return '#f9ab00';
  return '#188038';
};

const formatAnalysisDate = (report: LighthouseReport | null): string | null => {
  if (!report) return null;

  const candidate =
    report.updatedAt ||
    report.createdAt ||
    report.mobile?.analysisUTCTimestamp ||
    report.desktop?.analysisUTCTimestamp;

  if (!candidate) return null;

  const d = new Date(candidate);
  if (Number.isNaN(d.getTime())) return null;

  return d.toLocaleString('de-DE', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

/* ---------- styled-components ---------- */

const Container = styled.div`
  border: 1px solid #dddddd;
  border-radius: 8px;
  padding: 0.5rem;
  margin-bottom: 1.5rem;
  background: #fafafa;
`;

const TopRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
`;

const HeaderButton = styled.button<{ $open: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
`;

const ChevronIcon = styled(FiChevronRight)<{ $open: boolean }>`
  transition: transform 0.15s ease;
  transform: rotate(${({ $open }) => ($open ? 90 : 0)}deg);
`;

const UrlText = styled.div<{ $visible?: boolean }>`
  display: ${({ $visible }) => ($visible === false ? 'none' : 'block')};
  font-size: 0.8rem;
  color: #555;
  padding-left: 1.4rem;

  code {
    background: #f0f0f0;
    padding: 0.05rem 0.25rem;
    border-radius: 4px;
  }
`;

const ErrorText = styled.div`
  font-size: 0.8rem;
  color: #d93025;
  margin-top: 0.25rem;
`;

const ScoresGrid = styled.div`
  margin-top: 0.75rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(70px, 1fr));
  gap: 0.5rem;

  @media (min-width: 480px) {
    grid-template-columns: repeat(3, minmax(70px, 1fr));
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(6, minmax(70px, 1fr));
  }
`;

const ScoreBubbleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

const CircleLink = styled(Link)`
  text-decoration: none;
`;

const ScoreCircle = styled.div<{ $color: string }>`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  color: #ffffff;
`;

const ScoreLabel = styled.div`
  font-size: 0.75rem;
  color: #333;
  text-align: center;
`;

const RunCircle = styled.button<{ $disabled: boolean }>`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: none;
  background-color: ${({ $disabled }) => ($disabled ? '#bbbbbb' : '#1976d2')};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  color: #ffffff;
  font-size: 1.2rem;
`;

const RunLabel = styled.div`
  font-size: 0.75rem;
  color: #333;
  text-align: center;
`;

/* ---------- components ---------- */

const ScoreBubble: React.FC<ScoreBubbleProps> = ({ label, score, href }) => {
  const color = getScoreColor(score);
  const displayValue = score == null ? '–' : String(score);

  return (
    <ScoreBubbleContainer>
      <CircleLink href={href}>
        <ScoreCircle $color={color}>{displayValue}</ScoreCircle>
      </CircleLink>
      <ScoreLabel>{label}</ScoreLabel>
    </ScoreBubbleContainer>
  );
};

const LighthouseSummary: React.FC<LighthouseSummaryProps> = ({
  pageId,
  pageUrl,
  detailsHrefBase,
  initialReport,
  workspaceId,
}) => {
  const [report, setReport] = useState<LighthouseReport | null>(initialReport);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const analyzedAt = formatAnalysisDate(report);

  const handleRun = async () => {
    if (!pageUrl || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/pages/${pageId}/analysis`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: pageUrl }),
        }
      );

      if (!res.ok) {
        throw new Error(`Analyse fehlgeschlagen (${res.status})`);
      }

      const json = (await res.json()) as LighthouseReport;
      setReport(json);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Unbekannter Fehler bei der Analyse'
      );
    } finally {
      setLoading(false);
    }
  };

  const mobile = report?.summary.mobile;
  const desktop = report?.summary.desktop;

  return (
    <Container>
      <TopRow>
        <HeaderButton
          type="button"
          onClick={() => setOpen((v) => !v)}
          $open={open}
        >
          <ChevronIcon $open={open} />
          Lighthouse-Analyse
        </HeaderButton>

        <UrlText $visible={open}>
          <code>{pageUrl || '– keine URL –'}</code>
          {analyzedAt && <> · Analyse: {analyzedAt}</>}
        </UrlText>
      </TopRow>

      {open && (
        <>
          {error && <ErrorText>Fehler: {error}</ErrorText>}

          <ScoresGrid>
            <ScoreBubbleContainer>
              <RunCircle
                type="button"
                onClick={handleRun}
                $disabled={loading || !pageUrl}
              >
                <FiRefreshCw />
              </RunCircle>
              <RunLabel>{loading ? 'Läuft…' : 'Start'}</RunLabel>
            </ScoreBubbleContainer>

            <ScoreBubble
              label="Perf. Mobile"
              score={mobile?.performance}
              href={`${detailsHrefBase}?category=performance&strategy=mobile`}
            />

            <ScoreBubble
              label="Perf. Desktop"
              score={desktop?.performance}
              href={`${detailsHrefBase}?category=performance&strategy=desktop`}
            />

            <ScoreBubble
              label="Accessibility"
              score={mobile?.accessibility}
              href={`${detailsHrefBase}?category=accessibility`}
            />

            <ScoreBubble
              label="SEO"
              score={mobile?.seo}
              href={`${detailsHrefBase}?category=seo`}
            />

            <ScoreBubble
              label="Best Practices"
              score={mobile?.bestPractices}
              href={`${detailsHrefBase}?category=best-practices`}
            />
          </ScoresGrid>
        </>
      )}
    </Container>
  );
};

export default LighthouseSummary;
