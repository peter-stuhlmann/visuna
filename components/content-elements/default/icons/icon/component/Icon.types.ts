import * as MdIcons from 'react-icons/md';

export type IconName = keyof typeof MdIcons;

export type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
};
