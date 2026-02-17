import { FC } from 'react';

import type { HeadingProps } from './Heading.types';
import { getPrimaryColor } from '../../../constants';
import BaseText from '../../base-text';

const Heading: FC<HeadingProps> = ({
  textTransform = 'none',
  align = 'left',
  textColor = getPrimaryColor()['950'],
  element,
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

export default Heading;
