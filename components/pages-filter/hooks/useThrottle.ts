// components/pages/hooks/useThrottle.ts
'use client';

import { useEffect, useState } from 'react';

export function useThrottle<T>(value: T, delay = 300): T {
  const [throttled, setThrottled] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setThrottled(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return throttled;
}
