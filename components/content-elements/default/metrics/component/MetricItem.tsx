'use client';

import { FC, useEffect, useMemo, useRef, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { MetricsItemProps } from './Metrics.types';

// -------- styled-components
const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const ItemWrapper = styled.div`
  display: grid;
  gap: 6px;
`;

const ValueRow = styled.div<{ $enableIntroAnim: boolean; $durationMs: number }>`
  font-weight: 700;
  font-size: 1.75rem;
  line-height: 1.2;

  ${({ $enableIntroAnim, $durationMs }) =>
    $enableIntroAnim &&
    css`
      animation: ${fadeSlideIn} ${Math.max($durationMs * 0.25, 300)}ms ease-out
        1 both;
    `}
`;

const LabelRow = styled.div`
  font-size: 0.95rem;
  opacity: 0.8;
`;

// Easing für die Zahl
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// --- NEU: Dauer-Resolver für Item-Keys oder Zahlen/Strings aus der DB ---
const DURATION_MS: Record<'fast' | 'normal' | 'slow', number> = {
  fast: 1200,
  normal: 2500,
  slow: 4000,
};
const toMs = (v: unknown): number => {
  if (typeof v === 'number' && Number.isFinite(v)) return v < 50 ? v * 1000 : v;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s in DURATION_MS) return DURATION_MS[s as keyof typeof DURATION_MS];
    if (s.endsWith('ms')) {
      const n = Number(s.slice(0, -2));
      return Number.isFinite(n) ? n : 0;
    }
    if (s.endsWith('s')) {
      const n = Number(s.slice(0, -1));
      return Number.isFinite(n) ? n * 1000 : 0;
    }
    const n = Number(s);
    return Number.isFinite(n) ? (n < 50 ? n * 1000 : n) : 0;
  }
  return 0;
};

// evtl. numerische Strings sicher zu number
const toNumberOrUndef = (v: unknown): number | undefined => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
};

const MetricItem: FC<MetricsItemProps> = ({
  label,
  startValue,
  endValue,
  isInViewport,
  animated,
  animationDuration, // 'fast' | 'normal' | 'slow' ODER direkt ms/„2500ms“/„2.5s“
  prefixText,
  suffixText,
}) => {
  const startNum = toNumberOrUndef(startValue);
  const endNum = toNumberOrUndef(endValue);

  // nichts rendern, wenn gar kein Wert gesetzt
  const hasNumber = startNum !== undefined || endNum !== undefined;

  // Start/End: wenn nur Start da ist, zeigen wir den Start (keine 0)
  const start = startNum ?? 0;
  const end = endNum ?? startNum ?? 0;

  const delta = Math.max(0, end - start);
  const isIntegerRange = Number.isInteger(start) && Number.isInteger(end);
  const useStepCounting = hasNumber && isIntegerRange && delta <= 200;

  const shouldAnimateCount =
    !!animated && !!isInViewport && hasNumber && delta > 0;

  // ✅ Dauer korrekt auf Millisekunden abbilden, Mindestdauer 200ms
  const durationMs = Math.max(toMs(animationDuration), 200);

  const [displayValue, setDisplayValue] = useState<number>(
    shouldAnimateCount ? start : end
  );
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!hasNumber) return;

    if (!shouldAnimateCount) {
      setDisplayValue(end);
      return;
    }

    const dur = durationMs;
    const stepTime = useStepCounting ? dur / Math.max(1, delta) : 0;

    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(1, elapsed / dur);

      if (useStepCounting) {
        const steps = Math.min(delta, Math.floor(elapsed / stepTime));
        setDisplayValue(start + steps);
      } else {
        const eased = easeOutCubic(t);
        setDisplayValue(start + delta * eased);
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayValue(end);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
    };
  }, [
    hasNumber,
    shouldAnimateCount,
    start,
    end,
    delta,
    durationMs,
    useStepCounting,
  ]);

  const formattedValue = useMemo(() => {
    if (!hasNumber) return '';
    if (isIntegerRange) return Math.round(displayValue);
    return Number(displayValue.toFixed(2));
  }, [displayValue, hasNumber, isIntegerRange]);

  return (
    <ItemWrapper>
      <ValueRow
        $enableIntroAnim={!!isInViewport}
        $durationMs={durationMs}
        aria-hidden="true"
      >
        {hasNumber ? (
          <>
            {prefixText ?? ''}
            {formattedValue}
            {suffixText ?? ''}
          </>
        ) : null}
      </ValueRow>
      <LabelRow>{label}</LabelRow>
    </ItemWrapper>
  );
};

export default MetricItem;
