// components/pages/page-elements/hooks/useMounted.ts
'use client';

import { useEffect, useState } from 'react';

export function useMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  return isMounted;
}
