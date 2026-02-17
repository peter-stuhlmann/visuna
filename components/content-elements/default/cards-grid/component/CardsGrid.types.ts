import { ReactNode } from 'react';

export type CardsGridProps = {
  data?: CardsGridData;
};

export type CardsGridData = {
  cards: CardProps[];
};

export type CardProps = {
  title: string;
  teaser?: ReactNode;
  href?: string;
  openInNewTab?: boolean;
  onClick?: () => void;
};
