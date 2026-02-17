// components/lighthouse/LighthouseDetails.tsx
'use client';

import React, { FC, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  FiRefreshCw,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
} from 'react-icons/fi';
import type {
  LighthouseReport,
  LighthouseSummary,
  Strategy,
} from '@/lib/workspaces/pages/analysis/analysis.types';
import {
  AuditItem,
  CategoryId,
  LighthouseDetailsProps,
  ScoreBubbleProps,
  Variant,
} from './LighthouseDetails.types';
import {
  AuditDescription,
  AuditItemLi,
  AuditList,
  AuditMeta,
  AuditScore,
  AuditTitle,
  AuditTitleRow,
  Container,
  ErrorText,
  GroupHeadline,
  RunCircle,
  RunCircleWrapper,
  RunLabel,
  ScoreBubbleContainer,
  ScoreCircle,
  ScoreLabel,
  ScoresGrid,
  ScoresSection,
  StatusIconWrapper,
  TabButton,
  TabContent,
  TabsHeader,
  TabsSection,
  Toolbar,
  UrlText,
} from './LighthouseDetails.styles';
import Link from 'next/link';

const getScoreColor = (score: number | null | undefined): string => {
  if (score == null) return '#999999'; // grau für "kein Wert"
  if (score < 50) return '#d93025'; // rot
  if (score < 90) return '#f9ab00'; // orange
  return '#188038'; // grün
};

/* Komponenten-Logik */

const ScoreBubble: React.FC<ScoreBubbleProps> = ({ label, score }) => {
  const color = getScoreColor(score);
  const displayValue = score == null ? '–' : String(score);

  return (
    <ScoreBubbleContainer>
      <ScoreCircle $color={color}>{displayValue}</ScoreCircle>
      <ScoreLabel>{label}</ScoreLabel>
    </ScoreBubbleContainer>
  );
};

const LighthouseDetails: FC<LighthouseDetailsProps> = ({
  pageId,
  pageUrl,
  initialCategory,
  initialStrategy,
  initialReport,
  workspaceId,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [report, setReport] = useState<LighthouseReport | null>(initialReport);
  const [strategy, setStrategy] = useState<Strategy>(
    initialStrategy || 'mobile'
  );
  const [activeCategory, setActiveCategory] = useState<CategoryId>(
    initialCategory || 'performance'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canRun = !!pageUrl;

  const summaryMobile: LighthouseSummary | null = report
    ? (report.summary.mobile as LighthouseSummary)
    : null;
  const summaryDesktop: LighthouseSummary | null = report
    ? (report.summary.desktop as LighthouseSummary)
    : null;

  const currentSummary: LighthouseSummary | null =
    strategy === 'mobile' ? summaryMobile : summaryDesktop;

  const updateUrl = (category: CategoryId, nextStrategy?: Strategy) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set('category', category);
    if (category === 'performance' && nextStrategy) {
      params.set('strategy', nextStrategy);
    } else {
      params.delete('strategy');
    }
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  const handleRun = async () => {
    if (!canRun || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/pages/${pageId}/analysis`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pageId, url: pageUrl }),
        }
      );

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(
          `Fehler bei der Analyse (${res.status}): ${text || res.statusText}`
        );
      }

      const json = (await res.json()) as LighthouseReport;
      setReport(json);
    } catch (e) {
      console.error('LighthouseDetails run error:', e);
      setError(
        e instanceof Error ? e.message : 'Unbekannter Fehler bei der Analyse'
      );
    } finally {
      setLoading(false);
    }
  };

  const { improvements, passed } = useMemo(() => {
    if (!report) {
      return { improvements: [] as AuditItem[], passed: [] as AuditItem[] };
    }

    const raw =
      strategy === 'mobile' ? (report.mobile as any) : (report.desktop as any);

    const lighthouseResult = raw?.lighthouseResult;
    if (!lighthouseResult) {
      return { improvements: [] as AuditItem[], passed: [] as AuditItem[] };
    }

    const categories = lighthouseResult.categories || {};
    const audits = lighthouseResult.audits || {}; // ✅ HIER
    const category = categories[activeCategory];
    const auditRefs: any[] = category?.auditRefs || [];

    const improvementItems: AuditItem[] = [];
    const passedItems: AuditItem[] = [];

    for (const ref of auditRefs) {
      const id = ref.id;
      const audit = audits[id];
      if (!audit) continue;

      const score = typeof audit.score === 'number' ? audit.score : null;
      const scoreDisplayMode: string | undefined = audit.scoreDisplayMode;
      const title: string = audit.title || id;
      const description: string | undefined = audit.description;
      const displayValue: string | undefined = audit.displayValue;

      if (
        scoreDisplayMode === 'notApplicable' ||
        scoreDisplayMode === 'informative'
      ) {
        continue;
      }

      const item: AuditItem = {
        id,
        title,
        description,
        score,
        scoreDisplayMode,
        displayValue,
      };

      if (score === 1) {
        passedItems.push(item);
      } else {
        improvementItems.push(item);
      }
    }

    return { improvements: improvementItems, passed: passedItems };
  }, [report, strategy, activeCategory]);

  const renderAuditScore = (score: number | null) => {
    if (score == null) return 'Score: –';
    return `Score: ${Math.round(score * 100)}/100`;
  };

  const handleSelectPerfMobile = () => {
    setActiveCategory('performance');
    setStrategy('mobile');
    updateUrl('performance', 'mobile');
  };

  const handleSelectPerfDesktop = () => {
    setActiveCategory('performance');
    setStrategy('desktop');
    updateUrl('performance', 'desktop');
  };

  const handleSelectCategory = (category: CategoryId) => {
    setActiveCategory(category);
    // Für Nicht-Performance-Kategorien nutzen wir immer Mobile
    setStrategy('mobile');
    updateUrl(category);
  };

  return (
    <Container>
      <Toolbar>
        {pageUrl && <UrlText>
          Ziel-URL:&nbsp;
          <Link href={pageUrl} target="_blank" rel="noopener noreferrer"><code>{pageUrl}</code></Link>
        </UrlText>}
        {report?.updatedAt && (
          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: 4 }}>
            Letzter Abruf:{' '}
            {new Intl.DateTimeFormat('de-DE', {
              dateStyle: 'medium',
              timeStyle: 'medium',
            }).format(new Date(report.updatedAt))}
          </div>
        )}
      </Toolbar>

      {error && <ErrorText>Fehler: {error}</ErrorText>}

      <ScoresSection>
        <ScoresGrid>
          {/* Run-Kreis */}
          <RunCircleWrapper>
            <RunCircle
              type="button"
              onClick={handleRun}
              $disabled={!canRun || loading}
              title={
                loading
                  ? 'Analyse läuft …'
                  : report
                    ? 'Analyse erneut ausführen'
                    : 'Analyse starten'
              }
            >
              <FiRefreshCw />
            </RunCircle>
            <RunLabel>
              {loading ? 'Läuft …' : report ? 'Neu laden' : 'Start'}
            </RunLabel>
          </RunCircleWrapper>

          {/* Performance Mobile */}
          <ScoreBubble
            label="Perf. Mobile"
            score={summaryMobile?.performance ?? null}
          />

          {/* Performance Desktop */}
          <ScoreBubble
            label="Perf. Desktop"
            score={summaryDesktop?.performance ?? null}
          />

          {/* Accessibility (Mobile) */}
          <ScoreBubble
            label="Accessibility"
            score={summaryMobile?.accessibility ?? null}
          />

          {/* SEO (Mobile) */}
          <ScoreBubble label="SEO" score={summaryMobile?.seo ?? null} />

          {/* Best Practices (Mobile) */}
          <ScoreBubble
            label="Best Practices"
            score={summaryMobile?.bestPractices ?? null}
          />
        </ScoresGrid>
      </ScoresSection>

      {currentSummary && (
        <TabsSection>
          <TabsHeader>
            <TabButton
              type="button"
              $active={
                activeCategory === 'performance' && strategy === 'mobile'
              }
              onClick={handleSelectPerfMobile}
            >
              Performance Mobile
            </TabButton>
            <TabButton
              type="button"
              $active={
                activeCategory === 'performance' && strategy === 'desktop'
              }
              onClick={handleSelectPerfDesktop}
            >
              Performance Desktop
            </TabButton>
            <TabButton
              type="button"
              $active={activeCategory === 'accessibility'}
              onClick={() => handleSelectCategory('accessibility')}
            >
              Accessibility
            </TabButton>
            <TabButton
              type="button"
              $active={activeCategory === 'seo'}
              onClick={() => handleSelectCategory('seo')}
            >
              SEO
            </TabButton>
            <TabButton
              type="button"
              $active={activeCategory === 'best-practices'}
              onClick={() => handleSelectCategory('best-practices')}
            >
              Best Practices
            </TabButton>
          </TabsHeader>

          <TabContent>
            <GroupHeadline>
              Verbesserungspotenzial (
              {activeCategory === 'performance'
                ? strategy === 'mobile'
                  ? 'Performance Mobile'
                  : 'Performance Desktop'
                : activeCategory}
              )
            </GroupHeadline>
            {improvements.length === 0 ? (
              <AuditMeta>
                Keine Punkte mit Verbesserungspotenzial gefunden.
              </AuditMeta>
            ) : (
              <AuditList>
                {improvements.map((item) => {
                  const variant: Variant =
                    item.score == null
                      ? 'warning'
                      : item.score >= 0.5
                        ? 'warning'
                        : 'error';

                  return (
                    <AuditItemLi key={item.id} $variant={variant}>
                      <AuditTitleRow>
                        <AuditTitle>{item.title}</AuditTitle>
                        <AuditScore>
                          <StatusIconWrapper $variant={variant}>
                            {variant === 'warning' ? (
                              <FiAlertTriangle />
                            ) : (
                              <FiXCircle />
                            )}
                          </StatusIconWrapper>
                          {renderAuditScore(item.score)}
                        </AuditScore>
                      </AuditTitleRow>
                      {item.displayValue && (
                        <AuditMeta>{item.displayValue}</AuditMeta>
                      )}
                      {item.description && (
                        <AuditDescription>{item.description}</AuditDescription>
                      )}
                    </AuditItemLi>
                  );
                })}
              </AuditList>
            )}

            <GroupHeadline>Erfüllte Punkte</GroupHeadline>
            {passed.length === 0 ? (
              <AuditMeta>Keine erfüllten Punkte für diese Kategorie.</AuditMeta>
            ) : (
              <AuditList>
                {passed.map((item) => {
                  const variant: Variant = 'success';

                  return (
                    <AuditItemLi key={item.id} $variant={variant}>
                      <AuditTitleRow>
                        <AuditTitle>{item.title}</AuditTitle>
                        <AuditScore>
                          <StatusIconWrapper $variant={variant}>
                            <FiCheckCircle />
                          </StatusIconWrapper>
                          {renderAuditScore(item.score)}
                        </AuditScore>
                      </AuditTitleRow>
                      {item.displayValue && (
                        <AuditMeta>{item.displayValue}</AuditMeta>
                      )}
                      {item.description && (
                        <AuditDescription>{item.description}</AuditDescription>
                      )}
                    </AuditItemLi>
                  );
                })}
              </AuditList>
            )}
          </TabContent>
        </TabsSection>
      )}

      {!currentSummary && !loading && !error && (
        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#555' }}>
          Es liegt noch keine gespeicherte Analyse vor. Bitte über den blauen
          Kreis eine Analyse starten.
        </p>
      )}
    </Container>
  );
};

export default LighthouseDetails;
