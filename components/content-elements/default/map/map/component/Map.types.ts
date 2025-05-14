import { WrapperProps } from '../../../layout/wrapper/component';
import { ImageProps } from '../../../images/image';

export type MapProps = {
  className?: string;
  placeholderImage?: ImageProps;
  textColor?: string;
  map?: MapLeafletProps & { enableMapButtonText?: string };
} & WrapperProps;

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
