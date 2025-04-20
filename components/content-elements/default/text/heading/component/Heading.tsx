import { FC } from 'react';

import { StyledHeading } from './Heading.styles';
import type { HeadingProps } from './Heading.types';

const Heading: FC<HeadingProps> = ({ level, children }) => {
  return (
    <StyledHeading as={level} $level={level}>
      {children}
    </StyledHeading>
  );
};

export default Heading;
