export type ColorShade =
  | '0'
  | '50'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'
  | '950'
  | '1000';

export type ColorDefinition = Record<ColorShade, string>;

export type Colors = Record<string, ColorDefinition>;
