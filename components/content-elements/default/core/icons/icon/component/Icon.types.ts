export type IconPack =
  | 'ai'
  | 'bi'
  | 'bs'
  | 'cg'
  | 'ci'
  | 'di'
  | 'fa'
  | 'fa6'
  | 'fc'
  | 'fi'
  | 'gi'
  | 'go'
  | 'gr'
  | 'hi'
  | 'hi2'
  | 'im'
  | 'io'
  | 'io5'
  | 'lia'
  | 'md'
  | 'pi'
  | 'ri'
  | 'rx'
  | 'si'
  | 'sl'
  | 'tb'
  | 'tfi'
  | 'ti'
  | 'vsc'
  | 'wi';

export type IconProps = {
  name: string;
  pack?: IconPack;
  size?: number;
  color?: string;
  className?: string;
  title?: string;
  'aria-hidden'?: boolean;
  'aria-label'?: string;
  role?: string;
};
