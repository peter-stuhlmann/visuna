import { ElementType, ReactNode } from 'react';

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

export type TabMenuProps = {
  tabs: TabItem[];
  persistKey?: string; // optionaler localStorage-Schlüssel
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
