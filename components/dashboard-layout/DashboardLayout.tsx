'use client';

import { FC, ReactNode } from 'react';

import { DashboardLayoutContainer } from './DashboardLayout.styles';
import { useDock } from '@/utils/useDock';

type DashboardLayoutProps = {
  children: ReactNode;
};

const DashboardLayout: FC<DashboardLayoutProps> = ({ children }) => {
  const { isFixed } = useDock();

  return (
    <DashboardLayoutContainer $isFixed={isFixed}>
      {children}
    </DashboardLayoutContainer>
  );
};

export default DashboardLayout;
