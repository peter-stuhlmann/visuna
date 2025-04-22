import { ElementType } from 'react';

export type ListItem = {
  text: string;
  icon?: ElementType;
  iconColor?: string;
};

export type ListProps = {
  items: ListItem[];
  className?: string;
  $innerWidth?: 'small' | 'medium' | 'large';
  $backgroundColor?: string;
  $textColor?: string;
  defaultIcon?: ElementType;
  $defaultIconColor?: string;
};
