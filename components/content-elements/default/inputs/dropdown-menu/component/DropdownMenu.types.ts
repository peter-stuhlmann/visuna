import { ButtonProps } from '../../../core/button';
import { BorderRadiusOptions } from '../../../types';

export type DropdownMenuProps = {
  button: ButtonProps;
  menuItems?: ButtonProps[];
  borderRadius?: BorderRadiusOptions;
};

export type DropdownMenuStyleProps = {
  $borderRadius: DropdownMenuProps['borderRadius'];
};
