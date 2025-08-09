import { ReactNode } from 'react';

export type Card = {
  title: string;
  teaser?: ReactNode;
  href?: string;
  onClick?: () => void;
};

export type CardProps = {
  card: Card;
};

export type CardsGridProps = {
  cards: Card[];
};
