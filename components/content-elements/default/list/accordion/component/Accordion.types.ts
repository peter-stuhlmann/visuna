import { ElementType, ReactNode } from 'react';
import { WrapperProps } from '../../../layout/wrapper';

export type AccordionItem = {
  title: string;
  content: ReactNode | ElementType;
  icon?: ElementType;
  iconColor?: string;
};

export type AccordionProps = {
  items: AccordionItem[];
  panelBackgroundColor?: string;
  textColor?: string;
  defaultIcon?: ElementType;
  defaultIconColor?: string;
  allowMultiple?: boolean; // <— steuert ob mehrere Panels gleichzeitig offen sein dürfen
  initialOpenIndex?: number | null;
  unwrapped?: boolean;
} & WrapperProps;

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
