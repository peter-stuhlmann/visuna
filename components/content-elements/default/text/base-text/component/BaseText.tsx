import { FC } from 'react';

import { StyledBaseText } from './BaseText.styles';
import type { BaseTextProps } from './BaseText.types';
import { getPrimaryColor } from '../../../constants';

const BaseText: FC<BaseTextProps> = ({
  textTransform = 'none',
  align = 'left',
  color = getPrimaryColor()['950'],
  fontWeight = 'normal',
  element = 'div',
  value = '',
}) => {
  return (
    <StyledBaseText
      as={element}
      $textTransform={textTransform}
      $align={align}
      $color={color}
      $fontWeight={fontWeight}
    >
      {value}
    </StyledBaseText>
  );
};

export default BaseText;
