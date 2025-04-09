'use client';

import React, { FC, useState, useLayoutEffect, MouseEvent } from 'react';
import { RippleContainer } from './Ripple.styles';
import getElementClassName from '../utils/getElementClassName';

export interface RippleProps {
  duration?: number;
  color?: string;
}

export interface RippleData {
  x: number;
  y: number;
  size: number;
}

const useDebouncedRippleCleanUp = (
  rippleCount: number,
  duration: number,
  cleanUpFunction: () => void
): void => {
  useLayoutEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    if (rippleCount > 0) {
      timeoutId = setTimeout(() => {
        cleanUpFunction();
      }, duration * 4);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [rippleCount, duration, cleanUpFunction]);
};

const Ripple: FC<RippleProps> = ({ duration = 700, color = '#fff' }) => {
  const [rippleArray, setRippleArray] = useState<RippleData[]>([]);

  useDebouncedRippleCleanUp(rippleArray.length, duration, () => {
    setRippleArray([]);
  });

  const addRipple = (event: MouseEvent<HTMLElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    const newRipple: RippleData = { x, y, size: size + 20 };
    setRippleArray((prev) => [...prev, newRipple]);
  };

  const elementClassName = getElementClassName('ripple');

  return (
    <RippleContainer
      className={elementClassName}
      $duration={duration}
      $color={color}
      onMouseDown={addRipple}
      aria-hidden="true"
    >
      {rippleArray.map((ripple, index) => (
        <span
          key={`ripple-${index}`}
          style={{
            top: ripple.y,
            left: ripple.x,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
    </RippleContainer>
  );
};

export default Ripple;
