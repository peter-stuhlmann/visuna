import { FC } from 'react';

import type { OverlineProps } from './Overline.types';
import { getPrimaryColor } from '../../../constants';
import BaseText from '../../base-text';

const Overline: FC<OverlineProps> = ({
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

export default Overline;
