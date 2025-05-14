'use client';

import { FC, useRef } from 'react';
import { getPrimaryColor } from '../../../constants';
import Button, { ButtonProps } from '../../../button/button';
import { LargeCardProps } from './LargeCard.types';
import { LargeCardContainer } from './LargeCard.styles';
import Image from '../../../images/image';
import useIsInViewport from '../../../utils/useIsInViewport';

const LargeCard: FC<LargeCardProps> = ({
  children = '',
  cardBackgroundColor = getPrimaryColor()['50'],
  textColor = getPrimaryColor()['950'],
  highlightColor = null,
  backgroundImage,
  viewportTriggerOnce = false,
  ctaButton = [],
  overlay = 'none',
  ...props
}) => {
  const elementRef = useRef<HTMLDivElement | null>(null);

  const isInViewport = useIsInViewport(elementRef, 0, viewportTriggerOnce);

  return (
    <LargeCardContainer
      ref={elementRef}
      className={`${props.className}`}
      $isInViewport={isInViewport}
      $isActive={isInViewport}
      $cardBackgroundColor={cardBackgroundColor}
      $textColor={textColor}
      $highlightColor={highlightColor || getPrimaryColor()['100']}
    >
      <div>
        {overlay && overlay === 'dark-gradient' && (
          <div className="overlay" aria-hidden="true" />
        )}

        <div className="content">
          <div className={highlightColor ? 'highlighted-text' : 'text'}>
            {children}
          </div>
          {ctaButton.length > 0 && (
            <div className="cta-buttons">
              {ctaButton.map((button: ButtonProps, idx: number) => (
                <Button
                  key={idx}
                  variant={button.variant}
                  textColor={button.textColor}
                  primaryColor={button.primaryColor}
                >
                  {button.children}
                </Button>
              ))}
            </div>
          )}
        </div>
        {backgroundImage && backgroundImage.src && (
          <Image src={backgroundImage.src} alt={backgroundImage.alt} />
        )}
      </div>
    </LargeCardContainer>
  );
};

export default LargeCard;
