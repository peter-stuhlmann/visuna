export type ContactMapProps = {
  data?: ContactMapData;
  __instanceKey?: string;
};

export type ContactMapData = {
  address?: string;
  map?: {
    center: { lat: number; lng: number };
    zoom: number;
    markers?: { lat: number; lng: number }[];
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  iconLinks?: any[];
  imagePosition?: 'right' | 'left';
  textColor?: string;
  elementOverlineValue?: string;
  elementHeadingValue?: string;
  elementHeadingElement?: string;
  elementSublineValue?: string;
  children?: React.ReactNode;
};
