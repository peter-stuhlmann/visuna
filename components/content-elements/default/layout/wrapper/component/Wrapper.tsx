import { FC } from 'react';

import { Container } from './Wrapper.styles';
import { WrapperProps } from './Wrapper.types';
import getElementClassName from '../../../utils/getElementClassName';
import { getPrimaryColor } from '../../../constants';

const primaryColor = getPrimaryColor();

const Wrapper: FC<WrapperProps> = ({
  ref,
  id = 'element-1',
  children,
  withShadow = false,
  width = 'medium',
  innerWidth = 'medium',
  margin = 'none',
  textAlign = 'left',
  backgroundColor = 'transparent',
  textColor = primaryColor['1000'],
  padding = 'medium',
  className = '',
}) => {
  const elementClassName = getElementClassName(`wrapper`);

  return (
    <Container
      ref={ref}
      $withShadow={withShadow}
      $width={width}
      $innerWidth={innerWidth}
      $margin={margin}
      $textAlign={textAlign}
      $backgroundColor={backgroundColor}
      $textColor={textColor}
      $padding={padding}
      id={id}
      className={`${elementClassName} ${className}`}
    >
      <div>{children}</div>
    </Container>
  );
};

export default Wrapper;
