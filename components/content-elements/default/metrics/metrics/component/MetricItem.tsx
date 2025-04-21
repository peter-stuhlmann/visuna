'use client';

import { FC } from 'react';
import { useAnimatedCount } from './utils/useAnimatedCount';
import { MetricItemProps } from './Metrics.types';

const MetricItem: FC<MetricItemProps> = ({
  label,
  value,
  isNumber,
  isInViewport,
  animated,
  animationDuration,
}) => {
  const animatedValue = useAnimatedCount(
    isNumber ? (value as number) : 0,
    animationDuration,
    animated && isNumber && isInViewport
  );

  return (
    <div>
      <div>
        {animated && isNumber ? (
          <>
            <div aria-hidden="true">
              {isInViewport ? animatedValue : 0}
              {isInViewport &&
                animatedValue > 0 &&
                animatedValue === value &&
                '+'}
            </div>
            <span className="sr-only">Über {value}</span>
          </>
        ) : (
          <span>
            {value}
            {isNumber && '+'}
          </span>
        )}
      </div>
      <div>{label}</div>
    </div>
  );
};

export default MetricItem;
