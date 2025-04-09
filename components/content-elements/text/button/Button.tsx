'use client';

import { FC } from 'react';
import Link from 'next/link';
import { ButtonProps } from './Button.types';
import { ButtonContainer } from './Button.styles';
import getElementClassName from '../../utils/getElementClassName';
import { PRIMARY_COLOR, RIPPLE_SPEED } from '../../content-elements.config';
import Ripple from '../../ripple/Ripple';

const Button: FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'outlined',
  fontWeight = 700,
  size = 'medium',
  margin = 'none',
  href = undefined,
  target = '_self',
  onClick,
  style,
  disabledRipple = false,
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

  return (
    <ButtonContainer
      as={href ? Link : 'button'}
      className={`${elementClassName} ${className}`}
      style={style}
      $variant={variant}
      $fontWeight={fontWeight}
      $size={size}
      $margin={margin}
      onClick={onClick}
      {...(href ? { href, target, rel: 'noreferrer noopener' } : {})}
    >
      <div>{children}</div>
      {!disabledRipple && (
        <Ripple duration={RIPPLE_SPEED} color={PRIMARY_COLOR['500']} />
      )}
    </ButtonContainer>
  );
};

export default Button;
