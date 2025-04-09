import { ReactNode } from 'react';
import { ElementProp } from '../props-table/PropsTable.types';

export type Theme = {
  subFooter?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: 'small' | 'medium' | 'large';
    align?: 'left' | 'center' | 'right';
  };
};

export type ContentElement = {
  name: Translation;
  description: Translation;
  slug: string;
  components?: ReactNode[];
  elementProps?: ElementProp[];
};

export type Translation = {
  [key: string]: string | ReactNode;
};
