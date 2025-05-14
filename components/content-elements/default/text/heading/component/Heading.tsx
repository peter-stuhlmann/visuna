import { FC } from 'react';

import { StyledHeading } from './Heading.styles';
import type { HeadingProps } from './Heading.types';
import { getPrimaryColor } from '../../../constants';

const Heading: FC<HeadingProps> = ({
  value,
  textTransform = 'none',
  align = 'left',
  color = getPrimaryColor()['950'],
  fontWeight = 'bold',
  element = 'h1',
}) => {
  return (
    <StyledHeading
      as={element}
      value={value}
      $textTransform={textTransform}
      $align={align}
      $color={color}
      $fontWeight={fontWeight}
    >
      {value}
    </StyledHeading>
  );
};

export default Heading;
