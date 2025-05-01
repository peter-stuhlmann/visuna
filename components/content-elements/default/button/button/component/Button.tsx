'use client';

import { forwardRef, Ref } from 'react';
import { ButtonProps } from './Button.types';
import { ButtonContainer } from './Button.styles';
import getElementClassName from '@/components/content-elements/default/utils/getElementClassName';
import Ripple from '../../../ripple/ripple';
import { getPrimaryColor, getRippleSpeed } from '../../../constants';

const rippleSpeed = getRippleSpeed();

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (props, ref) => {
    const {
      children,
      className = '',
      variant = 'outlined',
      fontWeight = 700,
      size = 'medium',
      margin = 'none',
      primaryColor,
      href,
      target = '_self',
      onClick,
      style,
      disabledRipple = false,
      $textColor,
      ariaLabel,
      tabIndex = 0,
      type = 'button',
    } = props;

    if (!children) {
      console.error(
        'Button: The "children" prop is required and should be a string or ReactNode.'
      );
    }

    if (href && !href.startsWith('/') && !href.startsWith('http')) {
      console.error(
        'Button: The "href" prop must start with "/" or "http(s)".'
      );
    }

    const elementClassName = getElementClassName(`button-${variant}`);
    const resolvedPrimaryColor = primaryColor ?? getPrimaryColor();

    const isLink = Boolean(href);

    const buttonRef = ref as Ref<HTMLButtonElement>;
    const anchorRef = ref as Ref<HTMLAnchorElement>;

    const sharedProps = {
      onClick,
      style,
      className: `${elementClassName} ${className}`,
      'aria-label': ariaLabel,
      tabIndex: tabIndex,
      $primaryColor: resolvedPrimaryColor,
      $textColor: $textColor,
      $variant: variant,
      $fontWeight: fontWeight,
      $size: size,
      $margin: margin,
    };

    return isLink ? (
      <ButtonContainer
        as={'a'}
        ref={anchorRef}
        href={href}
        target={target}
        rel="noreferrer noopener"
        {...sharedProps}
      >
        <div>{children}</div>
        {!disabledRipple && (
          <Ripple duration={rippleSpeed} color={resolvedPrimaryColor['500']} />
        )}
      </ButtonContainer>
    ) : (
      <ButtonContainer
        as={'button'}
        ref={buttonRef}
        type={type}
        {...sharedProps}
      >
        <div>{children}</div>
        {!disabledRipple && (
          <Ripple duration={rippleSpeed} color={resolvedPrimaryColor['500']} />
        )}
      </ButtonContainer>
    );
  }
);

Button.displayName = 'Button';

export default Button;
