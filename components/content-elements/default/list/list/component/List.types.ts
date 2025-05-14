import { WrapperProps } from '../../../layout/wrapper';
import { IconName } from '../../../icons/icon/component/Icon.types';

export type ListItemProps = {
  text: string;
  icon?: IconName;
  iconColor?: string;
};

export type ListProps = {
  items: ListItemProps[];
  textColor?: string;
  highlightColor?: string;
  defaultIcon?: IconName;
  defaultIconColor?: string;
  unwrapped?: boolean;
} & WrapperProps;

export type ListStyleProps = {
  $textColor?: string;
};

export type ListItemStyleProps = {
  $highlightColor?: string;
};
