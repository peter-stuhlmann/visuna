import { FC } from 'react';

import type { SublineProps } from './Subline.types';
import { getPrimaryColor } from '../../../constants';
import BaseText from '../../base-text';

const Subline: FC<SublineProps> = ({
  textTransform = 'none',
  align = 'left',
  textColor = getPrimaryColor()['950'],
  element = 'div',
  value = '',
}) => {
  return (
    <BaseText
      textTransform={textTransform}
      align={align}
      textColor={textColor}
      element={element}
      value={value}
    />
  );
};

export default Subline;
