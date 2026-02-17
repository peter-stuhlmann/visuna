import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: '',
};

export default function WorkspaceDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
