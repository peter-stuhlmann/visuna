import { ElementType, ReactNode } from 'react';

export type AccordionItem = {
  title: string;
  content: ReactNode | ElementType;
  icon?: ElementType;
  iconColor?: string;
};

export type AccordionProps = {
  items: AccordionItem[];
  className?: string;
  $innerWidth?: 'small' | 'medium' | 'large';
  $backgroundColor?: string;
  $panelBackgroundColor?: string;
  $textColor?: string;
  defaultIcon?: ElementType;
  $defaultIconColor?: string;
  allowMultiple?: boolean; // <— steuert ob mehrere Panels gleichzeitig offen sein dürfen
  initialOpenIndex?: number | null;
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
