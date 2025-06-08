export type RippleProps = {
  duration?: number;
  color?: string;
};

export type RippleData = {
  x: number;
  y: number;
  size: number;
};

export type RippleHandle = {
  createRipple: (event: React.MouseEvent<HTMLElement>) => void;
};
