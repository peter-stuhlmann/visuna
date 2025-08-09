'use client';

import { FC } from 'react';
import { WrapperProps } from './Wrapper.types';
import { Container } from './Wrapper.styles';
import getElementClassName from '../../../utils/getElementClassName';

const Wrapper: FC<WrapperProps> = ({ data, className }) => {
  const {
    id,
    element = 'section',
    children = null,
    width = 'full',
    innerWidth = 'xl',
    marginTop = 'none',
    marginBottom = 'none',
    paddingTop = 'none',
    paddingBottom = 'none',
    paddingLeft = 'none',
    paddingRight = 'none',
    backgroundColor = 'transparent',
    borderRadius = 'none',
    innerBorderRadius = 'none',
  } = data ?? {};

  const elementClassName = getElementClassName('wrapper');

  return (
    <Container
      as={element}
      id={id}
      className={`${elementClassName} ${className}`}
      $width={width}
      $innerWidth={innerWidth}
      $marginTop={marginTop}
      $marginBottom={marginBottom}
      $paddingTop={paddingTop}
      $paddingBottom={paddingBottom}
      $paddingLeft={paddingLeft}
      $paddingRight={paddingRight}
      $backgroundColor={backgroundColor}
      $borderRadius={borderRadius}
      $innerBorderRadius={innerBorderRadius}
    >
      <div>{children}</div>
    </Container>
  );
};

export default Wrapper;
