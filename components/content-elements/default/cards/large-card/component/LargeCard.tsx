'use client';

import { FC, useRef } from 'react';
import getElementClassName from '@/components/content-elements/default/utils/getElementClassName';
import { getPrimaryColor } from '../../../constants';
import Wrapper from '../../../layout/wrapper';
import Button, { ButtonProps } from '../../../button/button';
import { LargeCardProps } from './LargeCard.types';
import { LargeCardContainer } from './LargeCard.styles';
import Image from '../../../images/image';
import useIsInViewport from '../../../utils/useIsInViewport';

const LargeCard: FC<LargeCardProps> = ({
  children = '',
  className = '',
  $backgroundColor = 'transparent',
  $cardBackgroundColor = getPrimaryColor()['50'],
  $backgroundImage = { src: '', alt: '', width: 0, height: 0 },
  $textColor = getPrimaryColor()['950'],
  overlay = 'none',
  ariaLabel = '',
  animationOnce = false,
  isHighlighted = false,
  $highlightedTextBackgroundColor,
  ctaButton = [],
}) => {
  const elementRef = useRef<HTMLDivElement | null>(null);

  const elementClassName = getElementClassName(`large-card`);

  const isInViewport = useIsInViewport(elementRef, 0, animationOnce);

  return (
    <Wrapper
      backgroundColor={$backgroundColor}
      textColor={$textColor}
      width="large"
    >
      <LargeCardContainer
        ref={elementRef}
        className={`${elementClassName} ${className}`}
        aria-label={ariaLabel}
        $isInViewport={isInViewport}
        $isActive={isInViewport}
        $cardBackgroundColor={$cardBackgroundColor}
        $textColor={$textColor || getPrimaryColor()['950']}
        $highlightedTextBackgroundColor={
          $highlightedTextBackgroundColor || getPrimaryColor()['100']
        }
      >
        <div>
          {overlay && overlay === 'dark-gradient' && (
            <div className="overlay" />
          )}

          <div className="content">
            <div className={isHighlighted ? 'highlighted-text' : 'text'}>
              {children}
            </div>
            {ctaButton.length > 0 && (
              <div className="cta-buttons">
                {ctaButton.map((button: ButtonProps, idx: number) => (
                  <Button
                    key={idx}
                    variant={button.variant}
                    $textColor={button.$textColor}
                    primaryColor={button.primaryColor}
                  >
                    {button.children}
                  </Button>
                ))}
              </div>
            )}
          </div>
          {$backgroundImage && $backgroundImage.src && (
            <Image src={$backgroundImage.src} alt={$backgroundImage.alt} />
          )}
        </div>
      </LargeCardContainer>
    </Wrapper>
  );
};

export default LargeCard;
