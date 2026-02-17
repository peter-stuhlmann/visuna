import { FC } from 'react';
import { CardProps, CardsGridProps } from './CardsGrid.types';
import { CardsGridContainer } from './CardsGrid.styles';
import Card from './Card';

const CardsGrid: FC<CardsGridProps> = ({ data }) => {
  const { cards } = data ?? {};

  return (
    <CardsGridContainer>
      {cards &&
        cards?.map((card: CardProps, idx: number) => (
          <Card
            key={idx}
            teaser={card.teaser}
            onClick={card.onClick}
            title={card.title}
            href={card.href}
            openInNewTab={card.openInNewTab}
          />
        ))}
    </CardsGridContainer>
  );
};

export default CardsGrid;
