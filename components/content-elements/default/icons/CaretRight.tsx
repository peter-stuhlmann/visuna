import { FC } from 'react';
import { IconProps } from './Icon.types';
import { getPrimaryColor } from '../constants';

const CaretRightIcon: FC<IconProps> = ({
  height = '0.875rem',
  color = getPrimaryColor()['950'],
}) => {
  return (
    <svg viewBox="0 0 192 460" height={height} fill={color}>
      <path d="M0 384.662V127.338c0-17.818 21.543-26.741 34.142-14.142l128.662 128.662c7.81 7.81 7.81 20.474 0 28.284L34.142 398.804C21.543 411.404 0 402.48 0 384.662z" />
    </svg>
  );
};

export default CaretRightIcon;
