'use client';

import React, { FC, useRef } from 'react';
import { MetricsProps, MetricsItemProps } from './Metrics.types';
import { MetricsContainer } from './Metrics.styles';
import useIsInViewport from '../../utils/useIsInViewport';
import MetricItemCmp from './MetricItem';

const Metrics: FC<MetricsProps> = ({ data }) => {
  const { metrics } = data ?? {};

  const containerRef = useRef<HTMLDivElement>(null);
  const isInViewport = useIsInViewport(containerRef, 0, true);

  return (
    <>
      {metrics && metrics.length > 0 && (
        <MetricsContainer ref={containerRef} $totalItems={metrics.length}>
          {metrics.map((item: MetricsItemProps) => (
            <MetricItemCmp
              key={item.id}
              id={item.id}
              label={item.label}
              startValue={item.startValue}
              endValue={item.endValue}
              animated={item.animated}
              isInViewport={isInViewport}
              animationDuration={item.animationDuration}
              prefixText={item.prefixText}
              suffixText={item.suffixText}
            />
          ))}
        </MetricsContainer>
      )}
    </>
  );
};

export default Metrics;
