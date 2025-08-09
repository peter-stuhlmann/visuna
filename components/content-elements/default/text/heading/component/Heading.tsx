import { FC } from 'react';

import { StyledHeading } from './Heading.styles';
import type { HeadingProps } from './Heading.types';
import { getPrimaryColor } from '../../../constants';

const Heading: FC<HeadingProps> = ({
  value,
  textTransform = 'none',
  align = 'left',
  textColor = getPrimaryColor()['950'],
  element = 'h1',
}) => {
  return (
    <StyledHeading
      as={element}
      value={value}
      $textTransform={textTransform}
      $align={align}
      $color={textColor}
    >
      {value}
    </StyledHeading>
  );
};

export default Heading;
