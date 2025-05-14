import { ReactNode } from 'react';

import { ImageProps } from '../../../images/image';
import { MapLeafletProps } from '../../../map/map/component/Map.types';
import { HeadingProps } from '../../../text/heading';
import { WrapperProps } from '../../../layout/wrapper';
import { OverlineProps } from '../../../text/overline';
import { SublineProps } from '../../../text/subline';

export type ContactMapProps = {
  children?: string | ReactNode;
  textColor?: string;
  image?: ImageProps;
  heading?: HeadingProps;
  overline?: OverlineProps;
  subline?: SublineProps;
  map?: MapLeafletProps;
  iconLinks?:
    | {
        icon: ReactNode | null;
        href?: string;
        target?: '_self' | '_blank';
        variant?: 'text' | 'outlined' | 'contained';
        ariaLabel?: string;
      }[]
    | null;
  listItems?:
    | {
        label?: string;
        value?: string;
      }[]
    | null;
  imagePosition?: 'left' | 'right';
} & WrapperProps;
