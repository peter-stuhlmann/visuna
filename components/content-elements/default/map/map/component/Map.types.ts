import { WrapperStyleProps } from '../../../layout/wrapper/component';
import { ImageProps } from '../../../images/image';

export type MapProps = {
  className?: string;
  placeholderImage?: ImageProps;
  map?: MapLeafletProps & { enableMapButtonText?: string };
} & WrapperStyleProps;

export type MapLeafletProps = {
  center?: [number, number];
  zoom?: number;
  markers?: Marker[];
};

export type Marker = {
  position: [number, number];
  popup: {
    content: string;
  };
};
