import { Size } from '../../types';

export type SpacerData = {
  size: Size;
};

export type SpacerProps = {
  data?: SpacerData;
};

export type SpacerStyleProps = {
  $size?: SpacerData['size'];
};
