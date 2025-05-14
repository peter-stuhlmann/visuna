'use client';

import React, { FC, useRef } from 'react';
import { Metric, MetricsProps } from './Metrics.types';
import { MetricsContainer } from './Metrics.styles';
import { getPrimaryColor } from '../../../constants';
import useIsInViewport from '../../../utils/useIsInViewport';
import MetricItem from './MetricItem';

const Metrics: FC<MetricsProps> = ({
  data = [],
  textColor = getPrimaryColor()['950'],
  animated = true,
  animationDuration = 2500,
  animationOnce = true,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInViewport = useIsInViewport(containerRef, 0, animationOnce);

  return (
    <MetricsContainer
      ref={containerRef}
      className={className}
      $totalItems={data.length}
      $textColor={textColor}
    >
      {data.map((item: Metric, idx: number) => {
        const isNumber = typeof item.value === 'number';

        return (
          <MetricItem
            key={`metric-${idx}`}
            label={item.label}
            value={item.value}
            isNumber={isNumber}
            isInViewport={isInViewport}
            animated={animated}
            animationDuration={animationDuration}
          />
        );
      })}
    </MetricsContainer>
  );
};

export default Metrics;
