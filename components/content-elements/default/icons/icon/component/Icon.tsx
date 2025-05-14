import * as MdIcons from 'react-icons/md';
import { IconProps } from './Icon.types';
import { FC } from 'react';

const BaseIcon: FC<IconProps> = ({ name, size = 24, color = 'black' }) => {
  const IconComponent = MdIcons[name];
  if (!IconComponent) {
    return null; // oder ein Fallback-Icon
  }
  return <IconComponent size={size} color={color} />;
};

export default BaseIcon;
