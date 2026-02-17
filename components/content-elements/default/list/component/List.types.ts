import { IconProps } from '../../core/icons/icon/component/Icon';

export type ListItemProps = {
  text: string;
  icon?: IconProps;
  iconColor?: string;
};

export type ListProps = {
  data: ListData;
};

export type ListData = {
  items: ListItemProps[];
  textColor?: string;
  highlightColor?: string;
  defaultIcon?: IconProps;
  defaultIconColor?: string;
};

export type ListStyleProps = {
  $textColor?: string;
};

export type ListItemStyleProps = {
  $highlightColor?: string;
};
