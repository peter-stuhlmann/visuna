import { Card } from '../CardsGrid.types';

const prefixCardLinks = (cards: Card[], baseUrl: string) => {
  return cards.map((card) => ({
    ...card,
    href: `${baseUrl}${card.href}`,
  }));
};

export default prefixCardLinks;
