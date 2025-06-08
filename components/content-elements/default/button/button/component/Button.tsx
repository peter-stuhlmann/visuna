'use client';

import { forwardRef, Ref, useRef } from 'react';
import { ButtonProps } from './Button.types';
import { ButtonContainer } from './Button.styles';
import getElementClassName from '@/components/content-elements/default/utils/getElementClassName';
import Ripple from '../../../ripple/ripple';
import { getPrimaryColor, getRippleSpeed } from '../../../constants';
import Icon from '../../../icons/icon';
import { RippleHandle } from '../../../ripple/ripple/component/Ripple.types';

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
      textColor,
      borderRadius = 'full',
      fullWidth,
      align = 'center',
      ariaLabel,
      tabIndex = 0,
      type = 'button',
      icon,
      iconPosition = 'start',
      disabled,
      showOnlyIconOnMobile = false,
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
    const rippleRef = useRef<RippleHandle>(null);

    const handleClick = (
      event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
    ) => {
      rippleRef.current?.createRipple(event);
      onClick?.(event);
    };

    const sharedProps = {
      onClick: handleClick,
      style,
      className: `${elementClassName} ${className}`,
      'aria-label': ariaLabel,
      tabIndex: tabIndex,
      disabled: disabled,
      $primaryColor: resolvedPrimaryColor,
      $textColor: textColor,
      $variant: variant,
      $fontWeight: fontWeight,
      $size: size,
      $margin: margin,
      $gap: icon ? '0.5rem' : '0',
      $borderRadius: borderRadius,
      $fullWidth: fullWidth,
      $align: align,
      $iconPosition: iconPosition,
      $showOnlyIconOnMobile: showOnlyIconOnMobile,
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
        {icon && (
          <div className="icon">
            <Icon name={icon} />
          </div>
        )}
        <div className="button-text">{children}</div>
        {!disabledRipple && (
          <Ripple
            ref={rippleRef}
            duration={rippleSpeed}
            color={resolvedPrimaryColor['500']}
          />
        )}
      </ButtonContainer>
    ) : (
      <ButtonContainer
        as={'button'}
        ref={buttonRef}
        type={type}
        {...sharedProps}
      >
        <div>
          {icon && (
            <div className="icon">
              <Icon name={icon} />
            </div>
          )}
          <div className="button-text">{children}</div>
        </div>
        {!disabledRipple && (
          <Ripple
            ref={rippleRef}
            duration={rippleSpeed}
            color={resolvedPrimaryColor['500']}
          />
        )}
      </ButtonContainer>
    );
  }
);

Button.displayName = 'Button';

export default Button;
