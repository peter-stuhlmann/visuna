'use client';

import React, { FC, useRef } from 'react';
import { Metric, MetricsProps } from './Metrics.types';
import Wrapper from '../../../layout/wrapper';
import { MetricsContainer } from './Metrics.styles';
import { getPrimaryColor } from '../../../constants';
import useIsInViewport from '../../../utils/useIsInViewport';
import MetricItem from './MetricItem';

const Metrics: FC<MetricsProps> = ({
  data = [],
  $backgroundColor,
  $textColor = getPrimaryColor()['950'],
  $margin = 'none',
  animated = true,
  animationDuration = 4000,
  animationOnce = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInViewport = useIsInViewport(containerRef, 0, animationOnce);

  return (
    <Wrapper
      width="large"
      padding="none"
      margin={$margin}
      backgroundColor={$backgroundColor}
      textColor={$textColor}
    >
      <MetricsContainer
        ref={containerRef}
        $totalItems={data.length}
        $textColor={$textColor}
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
    </Wrapper>
  );
};

export default Metrics;
