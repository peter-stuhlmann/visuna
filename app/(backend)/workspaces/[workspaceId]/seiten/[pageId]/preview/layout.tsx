'use client';

import { ReactNode, useEffect } from 'react';

/**
 * Layout for the external preview route.
 * Removes dashboard container overflow restrictions so the preview can scroll freely.
 */
export default function PreviewLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Remove overflow: hidden from DashboardLayoutContainer
    // so the preview content can scroll
    const main = document.querySelector('main');
    const dashboardContainer = main?.parentElement;
    if (dashboardContainer) {
      dashboardContainer.style.overflow = 'auto';
      dashboardContainer.style.height = '100vh';
    }
    return () => {
      if (dashboardContainer) {
        dashboardContainer.style.overflow = '';
        dashboardContainer.style.height = '';
      }
    };
  }, []);

  return <>{children}</>;
}
