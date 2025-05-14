import { FC } from 'react';

import type { SublineProps } from './Subline.types';
import { getPrimaryColor } from '../../../constants';
import BaseText from '../../base-text';

const Subline: FC<SublineProps> = ({
  textTransform = 'none',
  align = 'left',
  color = getPrimaryColor()['950'],
  fontWeight = 'normal',
  element = 'div',
  value = '',
}) => {
  return (
    <BaseText
      textTransform={textTransform}
      align={align}
      color={color}
      fontWeight={fontWeight}
      element={element}
      value={value}
    />
  );
};

export default Subline;
