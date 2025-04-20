'use client';

import { FC } from 'react';
import Link from 'next/link';
import { ButtonProps } from './Button.types';
import { ButtonContainer } from './Button.styles';
import getElementClassName from '@/components/content-elements/default/utils/getElementClassName';
import Ripple from '../../../ripple/ripple';
import { getPrimaryColor, getRippleSpeed } from '../../../constants';

const rippleSpeed = getRippleSpeed();

const Button: FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'outlined',
  fontWeight = 700,
  size = 'medium',
  margin = 'none',
  primaryColor,
  href = undefined,
  target = '_self',
  onClick,
  style,
  disabledRipple = false,
  $textColor,
}) => {
  if (!children) {
    console.error(
      'Button: The "children" prop is required and should be a string or ReactNode.'
    );
  }

  if (href && !href.startsWith('/') && !href.startsWith('http')) {
    console.error(
      'Button: The "href" prop must start with "/" or "http" / "https".'
    );
  }

  const elementClassName = getElementClassName(`button-${variant}`);

  const resolvedPrimaryColor = primaryColor ?? getPrimaryColor();

  return (
    <ButtonContainer
      as={href ? Link : 'button'}
      className={`${elementClassName} ${className}`}
      style={style}
      $variant={variant}
      $fontWeight={fontWeight}
      $size={size}
      $margin={margin}
      $primaryColor={resolvedPrimaryColor}
      $textColor={$textColor}
      onClick={onClick}
      {...(href ? { href, target, rel: 'noreferrer noopener' } : {})}
    >
      <div>{children}</div>
      {!disabledRipple && (
        <Ripple duration={rippleSpeed} color={resolvedPrimaryColor['500']} />
      )}
    </ButtonContainer>
  );
};

export default Button;
