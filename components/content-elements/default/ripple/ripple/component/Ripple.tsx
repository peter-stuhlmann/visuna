'use client';

import {
  forwardRef,
  useImperativeHandle,
  useState,
  useLayoutEffect,
  MouseEvent,
} from 'react';
import { RippleContainer } from './Ripple.styles';
import { RippleData, RippleProps, RippleHandle } from './Ripple.types';

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

const Ripple = forwardRef<RippleHandle, RippleProps>(
  ({ duration = 700, color = 'rgba(255, 255, 255, 0.2)' }, ref) => {
    const [rippleArray, setRippleArray] = useState<RippleData[]>([]);

    useDebouncedRippleCleanUp(rippleArray.length, duration, () => {
      setRippleArray([]);
    });

    const createRipple = (event: MouseEvent<HTMLElement>): void => {
      const rect = event.currentTarget.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;
      const newRipple: RippleData = { x, y, size: size + 20 };
      setRippleArray((prev) => [...prev, newRipple]);
    };

    useImperativeHandle(ref, () => ({
      createRipple,
    }));

    return (
      <RippleContainer
        $duration={duration}
        $color={color}
        aria-hidden="true"
        className="ripple"
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
  }
);

Ripple.displayName = 'Ripple';
export default Ripple;
