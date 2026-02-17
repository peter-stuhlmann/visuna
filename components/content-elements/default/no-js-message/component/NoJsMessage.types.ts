import { WrapperProps } from '../../core/wrapper';

export type NoJsMessageProps = {
  hideElement?: string;
  message?: string;
  textColor?: string;
  unwrapped?: boolean;
} & WrapperProps;
