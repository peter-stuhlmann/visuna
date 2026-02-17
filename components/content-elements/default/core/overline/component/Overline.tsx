import { FC } from 'react';

import type { OverlineProps } from './Overline.types';
import { getPrimaryColor } from '../../../constants';
import BaseText from '../../base-text';

const Overline: FC<OverlineProps> = ({
  textTransform = 'none',
  align = 'left',
  textColor = getPrimaryColor()['950'],
  element = 'div',
  value,
  htmlValue,
  currentLanguage,
  data,
}) => {
  return (
    <BaseText
      textTransform={textTransform}
      align={align}
      textColor={textColor}
      element={element}
      value={value}
      htmlValue={htmlValue}
      currentLanguage={currentLanguage}
      data={data}
    />
  );
};

export default Overline;
