import { IconName } from '../../../icons/icon/component/Icon.types';
import { ListData } from '../../../types';

export type ListItemProps = {
  text: string;
  icon?: IconName;
  iconColor?: string;
};

export type ListProps = ListData;

export type ListStyleProps = {
  $textColor?: string;
};

export type ListItemStyleProps = {
  $highlightColor?: string;
};
