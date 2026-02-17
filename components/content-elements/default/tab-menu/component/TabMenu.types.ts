import { ElementType, ReactNode } from 'react';

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

export type TabMenuProps = {
  data: TabMenuData;
};

export type TabMenuData = {
  tabs: TabItem[];
  persistKey?: string;
};

export type AccordionPanelProps = {
  id: string;
  index: number;
  title: string;
  content: ReactNode | ElementType;
  isOpen: boolean;
  onToggle: () => void;
  icon: ElementType;
  iconColor: string;
  classPrefix: string;
};
