import { FC } from 'react';

import { HorizontalLineProps } from './HorizontalLine.types';
import { HorizontalLineContainer } from './HorizontalLine.styles';
import getElementClassName from '@/components/content-elements/default/utils/getElementClassName';

const HorizontalLine: FC<HorizontalLineProps> = ({ data }) => {
  const { color } = data ?? {};

  const elementClassName = getElementClassName('horizontal-line');

  return (
    <HorizontalLineContainer className={elementClassName} $color={color} />
  );
};

export default HorizontalLine;
