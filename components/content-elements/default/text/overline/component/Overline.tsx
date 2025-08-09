import { FC } from 'react';

import type { OverlineProps } from './Overline.types';
import { getPrimaryColor } from '../../../constants';
import BaseText from '../../base-text';

const Overline: FC<OverlineProps> = ({
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

export default Overline;
