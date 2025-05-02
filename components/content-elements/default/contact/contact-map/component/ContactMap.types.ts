import { ReactNode } from 'react';

import { WrapperStyleProps } from '../../../layout/wrapper/component';
import { ImageProps } from '../../../images/image';
import { MapLeafletProps } from '../../../map/map/component/Map.types';

export type ContactMapProps = {
  children?: string | ReactNode;
  className?: string;
  image?: ImageProps;
  heading?: string | ReactNode;
  headingType?: 'h1' | 'h2' | 'h3';
  subHeading?: string | ReactNode;
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
  $imagePosition?: 'left' | 'right';
} & WrapperStyleProps;
