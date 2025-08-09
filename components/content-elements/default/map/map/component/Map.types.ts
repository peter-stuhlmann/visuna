import { ImageProps } from '../../../images/image';

export type MapProps = {
  className?: string;
  placeholderImage?: ImageProps;
  textColor?: string;
  map?: MapLeafletProps & { enableMapButtonText?: string };
};

export type MapLeafletProps = {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Marker[];
};

export type Marker = {
  lat: number;
  lng: number;
};
