import React, { FC } from 'react';

import { SpacerContainer } from './Spacer.styles';
import getElementClassName from '../../../utils/getElementClassName';
import { SpacerProps } from './Spacer.types';

const Spacer: FC<SpacerProps> = ({ data }) => {
  const { size } = data ?? {};

  const elementClassName = getElementClassName('spacer');

  return (
    <SpacerContainer
      className={`${elementClassName}`}
      $size={size}
      aria-hidden="true"
    />
  );
};

export default Spacer;
