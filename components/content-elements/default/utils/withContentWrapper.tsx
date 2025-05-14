import React, { ComponentType, FC } from 'react';
import Wrapper, { WrapperProps } from '../layout/wrapper';
import Heading from '../text/heading';
import Overline from '../text/overline';
import Subline from '../text/subline';
import Spacer from '../layout/spacer';
import getElementClassName from './getElementClassName';

export function withContentElementWrapper<P extends object>(
  Component: ComponentType<P>,
  baseClassName?: string
): FC<P & WrapperProps> {
  const WrappedComponent: FC<P & WrapperProps> = (props) => {
    const {
      elementOverline,
      elementHeading,
      elementSubline,
      className,
      unwrapped = false,
      ...restProps
    } = props;

    const elementClassName = baseClassName
      ? getElementClassName(baseClassName)
      : '';

    if (unwrapped) {
      return (
        <Component
          className={`${className ?? ''} ${elementClassName}`}
          {...(restProps as P)}
        />
      );
    }

    return (
      <Wrapper
        className={`${elementClassName}-wrapper ${
          className ? className + '-wrapper' : ''
        }`}
        {...restProps}
      >
        {elementOverline?.value && <Overline {...elementOverline} />}
        {elementHeading?.value && <Heading {...elementHeading} />}
        {elementSubline?.value && <Subline {...elementSubline} />}
        {(elementOverline?.value ||
          elementHeading?.value ||
          elementSubline?.value) && <Spacer />}
        <Component
          className={`${className ?? ''} ${elementClassName}`}
          {...(restProps as P)}
        />
      </Wrapper>
    );
  };

  WrappedComponent.displayName = `WithContentElementWrapper(${
    Component.displayName || Component.name || 'Anonymous'
  })`;

  return WrappedComponent;
}
