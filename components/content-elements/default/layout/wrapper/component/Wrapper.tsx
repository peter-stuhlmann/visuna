import { FC } from 'react';

import { Container } from './Wrapper.styles';
import { WrapperProps } from './Wrapper.types';
import getElementClassName from '../../../utils/getElementClassName';

const Wrapper: FC<WrapperProps> = ({
  ref,
  id = '',
  children,
  width = 'full',
  innerWidth = 'xxl',
  marginBottom = 'none',
  marginTop = 'none',
  borderRadius = 'none',
  innerBorderRadius = 'l',
  backgroundColor = 'transparent',
  paddingTop = 'm',
  paddingBottom = 'm',
  paddingLeft = 'm',
  paddingRight = 'm',
  className = '',
  element = 'section',
  style = {},
}) => {
  const elementClassName = getElementClassName(`wrapper`);

  return (
    <Container
      ref={ref}
      id={id}
      className={`${elementClassName} ${className}`}
      style={style}
      as={element}
      $width={width}
      $innerWidth={innerWidth}
      $marginBottom={marginBottom}
      $marginTop={marginTop}
      $borderRadius={borderRadius}
      $innerBorderRadius={innerBorderRadius}
      $backgroundColor={backgroundColor}
      $paddingTop={paddingTop}
      $paddingBottom={paddingBottom}
      $paddingLeft={paddingLeft}
      $paddingRight={paddingRight}
    >
      <div>{children}</div>
    </Container>
  );
};

export default Wrapper;
