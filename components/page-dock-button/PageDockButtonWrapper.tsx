'use client';

import { useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import PageDockButton from './PageDockButton';
import MenuDockButton from './MenuDockButton';

export default function PageDockButtonWrapper() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set containerRef to document.body after mount
    if (typeof document !== 'undefined') {
      (containerRef as any).current = document.body;
    }
  }, []);

  // Hide dock in external preview
  if (pathname?.endsWith('/preview')) return null;

  return (
    <>
      <PageDockButton containerRef={containerRef} />
      <MenuDockButton containerRef={containerRef} />
    </>
  );
}
