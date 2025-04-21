'use client';

import { useEffect, useState } from 'react';

export const useAnimatedCount = (
  targetValue: number,
  duration: number,
  shouldStart: boolean = true
): number => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;

    const delay = 500; // Delay in Millisekunden

    const timeoutId = setTimeout(() => {
      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = Math.round(progress * targetValue);
        setCurrentValue(value);

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    }, delay);

    // Cleanup für unmount oder wenn shouldStart false wird
    return () => clearTimeout(timeoutId);
  }, [targetValue, duration, shouldStart]);

  return shouldStart ? currentValue : targetValue;
};
