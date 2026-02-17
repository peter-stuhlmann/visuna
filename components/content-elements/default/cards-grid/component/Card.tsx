'use client';

import { FC, useRef } from 'react';
import Link from 'next/link';
import Ripple from '../../core/ripple';
import { RippleHandle } from '../../core/ripple/component/Ripple.types';
import { CardProps } from './CardsGrid.types';
import Heading from '../../core/heading';

const Card: FC<CardProps> = ({
  teaser,
  onClick,
  title,
  href,
  openInNewTab,
}) => {
  const rippleRef = useRef<RippleHandle>(null);

  const handleClick = async (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    rippleRef.current?.createRipple(event);
    if (onClick) {
      // Navigation verhindern, wenn eine eigene onClick-Action hinterlegt ist
      event.preventDefault();
      await onClick();
    }
  };

  // Variante mit eigener Click-Action → Button
  if (onClick) {
    return (
      <button className="card" onClick={handleClick}>
        <Heading value={title} element="h3" />
        {teaser && <p>{teaser}</p>}
        <Ripple ref={rippleRef} />
      </button>
    );
  }

  // Link-Variante (optional: im neuen Tab öffnen)
  const targetProps = openInNewTab
    ? ({ target: '_blank', rel: 'noopener noreferrer' } as const)
    : undefined;

  return (
    <Link
      href={href ?? '#'}
      onClick={handleClick}
      className="card"
      {...targetProps}
    >
      <Heading value={title} element="h3" />
      {teaser && <p>{teaser}</p>}
      <Ripple ref={rippleRef} />
    </Link>
  );
};

export default Card;
