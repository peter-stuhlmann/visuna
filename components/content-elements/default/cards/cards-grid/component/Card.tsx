'use client';

import { FC, useRef } from 'react';
import Link from 'next/link';
import Ripple from '../../../ripple/ripple';
import { RippleHandle } from '../../../ripple/ripple/component/Ripple.types';
import { CardProps } from './CardsGrid.types';

const Card: FC<CardProps> = ({ card }) => {
  const rippleRef = useRef<RippleHandle>(null);

  const handleClick = async (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    rippleRef.current?.createRipple(event);
    if (card.onClick) {
      event.preventDefault(); // Verhindert ggf. Navigation bei <a>
      await card.onClick();
    }
  };

  if (card.onClick) {
    return (
      <button className="card" onClick={handleClick}>
        <h3>{card.title}</h3>
        {card.teaser && <p>{card.teaser}</p>}
        <Ripple ref={rippleRef} />
      </button>
    );
  }

  return (
    <Link href={card.href ?? '#'} onClick={handleClick} className="card">
      <h3>{card.title}</h3>
      {card.teaser && <p>{card.teaser}</p>}
      <Ripple ref={rippleRef} />
    </Link>
  );
};

export default Card;
