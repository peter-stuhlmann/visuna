'use client';

import { FC, useRef } from 'react';
import { getPrimaryColor } from '../../constants';
import { LargeCardProps } from './LargeCard.types';
import { LargeCardContainer } from './LargeCard.styles';
import Image from '../../core/image';
// import useIsInViewport from '../../../utils/useIsInViewport';
// import Button from '../../core/button';

const LargeCard: FC<LargeCardProps> = ({ data }) => {
  const {
    children,
    cardBackgroundColor,
    textColor,
    highlightColor,
    backgroundImage,
    // ctaButton = [],
    overlay,
  } = data ?? {};

  const elementRef = useRef<HTMLDivElement | null>(null);
  // const isInViewport = useIsInViewport(elementRef, 0, viewportTriggerOnce);
  const isInViewport = true;

  return (
    <LargeCardContainer
      ref={elementRef}
      $isInViewport={isInViewport}
      $isActive={isInViewport}
      $cardBackgroundColor={cardBackgroundColor}
      $textColor={textColor}
      $highlightColor={highlightColor || getPrimaryColor()['100']}
    >
      <div>
        {overlay === 'dark-gradient' && (
          <div className="overlay" aria-hidden="true" />
        )}

        <div className="content">
          <div className={highlightColor ? 'highlighted-text' : 'text'}>
            {children && typeof children === 'string' ? (
              <div dangerouslySetInnerHTML={{ __html: children }} />
            ) : (
              <>{children}</>
            )}
          </div>

          {/* {Array.isArray(ctaButton) && ctaButton.length > 0 && (
            <div className="cta-buttons">
              {ctaButton.map((button, idx) => (
                <Button
                  key={idx}
                  variant={button.variant}
                  textColor={button.textColor}
                  primaryColor={button.primaryColor}
                  onClick={button.onClick}
                >
                  {button.label}
                </Button>
              ))}
            </div>
          )} */}
        </div>

        {backgroundImage?.src && (
          <Image
            src={backgroundImage.src}
            alt={backgroundImage.alt}
            width={backgroundImage.width}
            height={backgroundImage.height}
          />
        )}
      </div>
    </LargeCardContainer>
  );
};

export default LargeCard;
