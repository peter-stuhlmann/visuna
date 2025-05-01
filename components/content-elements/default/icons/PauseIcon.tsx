import { FC } from 'react';
import { IconProps } from './Icon.types';

const PauseIcon: FC<IconProps> = ({ width }) => {
  return (
    <svg
      viewBox="0 0 320 512"
      style={{ width: width, marginLeft: '1px' }}
      aria-hidden="true"
    >
      <path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z" />
    </svg>
  );
};

export default PauseIcon;
