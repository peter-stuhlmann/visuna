import { WrapperProps } from '../../../layout/wrapper';

export type NoJsMessageProps = {
  hideElement?: string;
  message?: string;
  textColor?: string;
  unwrapped?: boolean;
} & WrapperProps;
