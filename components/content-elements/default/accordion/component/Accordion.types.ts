import { ElementType, ReactNode } from 'react';

export type AccordionProps = {
  data: AccordionData;
};

export type AccordionData = {
  items: AccordionItem[];
  panelBackgroundColor?: string;
  textColor?: string;
  defaultIconColor?: string;
  allowMultiple?: boolean;
  initialOpenIndex?: number | null;
  unwrapped?: boolean;
  currentLanguage: string;
};

export type AccordionItem = {
  title: string;
  content: ReactNode | ElementType;
  iconColor?: string;
};

export type AccordionPanelProps = {
  id: string;
  index: number;
  title: string;
  content: ReactNode | ElementType;
  isOpen: boolean;
  onToggle: () => void;
  iconColor: string;
  classPrefix: string;
};
