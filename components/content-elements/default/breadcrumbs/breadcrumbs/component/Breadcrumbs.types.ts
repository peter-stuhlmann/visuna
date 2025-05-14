import { WrapperProps } from '../../../layout/wrapper';

export type BreadcrumbItem = {
  label: string;
  href?: string | null;
  title: string;
  isActive?: boolean;
};

export type BreadcrumbsProps = {
  links: BreadcrumbItem[];
  textColor?: string;
  activeTextColor?: string;
  dividerColor?: string;
  unwrapped?: boolean;
} & WrapperProps;

export type BreadcrumbsStyleProps = {
  $textColor?: BreadcrumbsProps['textColor'];
  $activeTextColor?: BreadcrumbsProps['activeTextColor'];
  $dividerColor?: BreadcrumbsProps['dividerColor'];
};
