import { FC } from 'react';
import { Container } from './Wrapper.styles';
import { WrapperProps } from './Wrapper.types';

const Wrapper: FC<WrapperProps> = ({
  children,
  theme = 'default',
  withShadow = false,
  width = 'medium',
  innerWidth = 'medium',
  margin = 'none',
  textAlign = 'left',
}) => {
  return (
    <Container
      $theme={theme}
      $withShadow={withShadow}
      $width={width}
      $innerWidth={innerWidth}
      $margin={margin}
      $textAlign={textAlign}
      className={theme === 'dark' ? 'theme-dark' : ''}
    >
      <div>{children}</div>
    </Container>
  );
};

export default Wrapper;
