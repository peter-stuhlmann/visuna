import { CardProps } from '../CardsGrid.types';

const prefixCardLinks = (cards: CardProps[], baseUrl: string) => {
  return cards.map((card) => ({
    ...card,
    href: `${baseUrl}${card.href}`,
  }));
};

export default prefixCardLinks;
