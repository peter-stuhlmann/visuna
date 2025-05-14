import React, { FC } from 'react';

import { SpacerContainer } from './Spacer.styles';
import getElementClassName from '../../../utils/getElementClassName';
import { SpacerProps } from './Spacer.types';

const Spacer: FC<SpacerProps> = ({
  className = '',
  style = {},
  size = 'l',
  backgroundColor = 'transparent',
}) => {
  const elementClassName = getElementClassName('spacer');

  return (
    <SpacerContainer
      className={`${elementClassName} ${className}`}
      style={style}
      $size={size}
      $backgroundColor={backgroundColor}
      aria-hidden="true"
    />
  );
};

export default Spacer;
