'use client';

import { FC, useMemo } from 'react';
import { Grid } from './AnimatedCards.styles';
import Card from './AnimatedCardItem';
import type { AnimatedCardsProps, CardProps } from './AnimatedCards.types';
import { DEFAULT_LANGUAGES } from '@/components/language-settings/languages';
import type { LanguageCode } from '@/components/language-settings/languages';

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

const toInt = (v: unknown, fallback: number) => {
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? Math.round(n) : fallback;
};

const AnimatedCards: FC<AnimatedCardsProps> = ({ data }) => {
  const cards = (data?.cards ?? []) as CardProps[];
  const count = cards.length;

  // ✅ currentLanguage kommt vom PageElementMapper via withCurrentLanguage(...)
  const lang: LanguageCode =
    (data?.currentLanguage as LanguageCode | undefined) ?? DEFAULT_LANGUAGES[0];

  const desiredCols = useMemo(() => {
    const raw = data?.cardsPerRow;
    return clamp(toInt(raw, 4), 1, 12);
  }, [data?.cardsPerRow]);

  const stretch = useMemo(() => {
    const raw = data?.stretchCards;
    return typeof raw === 'boolean' ? raw : true;
  }, [data?.stretchCards]);

  const colsForGrid = stretch
    ? desiredCols
    : Math.max(1, Math.min(desiredCols, count));

  return (
    <Grid
      $cols={colsForGrid}
      $count={count}
      $stretch={stretch}
      $minCard="240px"
      $maxCard="320px"
    >
      {cards.map((card, idx) => (
        <Card
          key={idx}
          {...card}
          currentLanguage={lang} // ✅ reinreichen
        />
      ))}
    </Grid>
  );
};

export default AnimatedCards;
