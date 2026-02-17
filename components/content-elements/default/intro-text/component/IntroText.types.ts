import { ButtonProps } from '../../core/button';

export type IntroTextProps = { data: IntroTextData };

export type IntroTextData = {
  ctaButton?: ButtonProps;
  children?: React.ReactNode;
};
