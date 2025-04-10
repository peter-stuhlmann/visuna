import { Translation } from '@/app/[locale]/content-elements/[slug]/utils/getContentElement';

export type ElementType =
  | string
  | {
      name: string;
      href?: string;
    };

export type ElementProp = {
  name: string;
  required?: boolean;
  type: ElementType[];
  default?: string | number | boolean;
  description: Translation;
};
