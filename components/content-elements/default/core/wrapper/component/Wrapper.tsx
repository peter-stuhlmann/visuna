'use client';

import { FC } from 'react';
import { WrapperProps } from './Wrapper.types';
import { Container } from './Wrapper.styles';
import getElementClassName from '../../../utils/getElementClassName';

const Wrapper: FC<WrapperProps> = ({ data, className = '' }) => {
  const { id, children = null, layout = {} } = data ?? {};

  const {
    element,
    outerWidth,
    innerWidth,
    outerMarginTop,
    outerMarginBottom,
    innerPaddingTop,
    innerPaddingRight,
    innerPaddingBottom,
    innerPaddingLeft,
    outerPaddingTop,
    outerPaddingRight,
    outerPaddingBottom,
    outerPaddingLeft,
    outerBackgroundColor,
    innerBackgroundColor,
    outerBorderRadius,
    innerBorderRadius,
  } = layout;

  const elementClassName = getElementClassName('wrapper');

  return (
    <Container
      as={element}
      id={id}
      className={`${elementClassName} ${className}`.trim()}
      $outerWidth={outerWidth}
      $innerWidth={innerWidth}
      $outerMarginTop={outerMarginTop}
      $outerMarginBottom={outerMarginBottom}
      $innerPaddingTop={innerPaddingTop}
      $innerPaddingRight={innerPaddingRight}
      $innerPaddingBottom={innerPaddingBottom}
      $innerPaddingLeft={innerPaddingLeft}
      $outerPaddingTop={outerPaddingTop}
      $outerPaddingRight={outerPaddingRight}
      $outerPaddingBottom={outerPaddingBottom}
      $outerPaddingLeft={outerPaddingLeft}
      $outerBackgroundColor={outerBackgroundColor}
      $innerBackgroundColor={innerBackgroundColor}
      $outerBorderRadius={outerBorderRadius}
      $innerBorderRadius={innerBorderRadius}
    >
      <div>{children}</div>
    </Container>
  );
};

export default Wrapper;
