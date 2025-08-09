import { FC } from 'react';
import { Card as CardProps, CardsGridProps } from './CardsGrid.types';
import { CardsGridContainer } from './CardsGrid.styles';
import Card from './Card';

const CardsGrid: FC<CardsGridProps> = ({ cards }) => {
  return (
    <CardsGridContainer>
      {cards.map((card: CardProps, idx) => (
        <Card key={idx} card={card} />
      ))}
    </CardsGridContainer>
  );
};

export default CardsGrid;
