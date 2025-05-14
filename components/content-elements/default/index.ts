import { withContentElementWrapper } from './utils/withContentWrapper';

// Direkt nutzbare Standard-UI-Komponenten

export { default as Button } from './button/button';
export type { ButtonProps } from './button/button';

export { default as Icon } from './icons/icon';
export type { IconProps } from './icons/icon';

export { default as Ripple } from './ripple/ripple';
export type { RippleProps } from './ripple/ripple';

export { default as Wrapper } from './layout/wrapper';
export type { WrapperProps, WrapperStyleProps } from './layout/wrapper';

export { default as Spacer } from './layout/spacer';
export type { SpacerProps } from './layout/spacer';

export { default as Heading } from './text/heading';
export type { HeadingProps } from './text/heading';

export { default as Overline } from './text/overline';
export type { OverlineProps } from './text/overline';

export { default as Subline } from './text/subline';
export type { SublineProps } from './text/subline';

export { default as Image } from './images/image';
export type { ImageProps } from './images/image';

export { default as Video } from './base/video';
export type { VideoProps } from './base/video';

// CONTENT-ELEMENTE mit Wrapper
import LargeCardComponent from './cards/large-card';
export { default as UnwrappedLargeCard } from './cards/large-card';
export type { LargeCardProps } from './cards/large-card';
export const LargeCard = withContentElementWrapper(
  LargeCardComponent,
  'large-card'
);

import BreadcrumbsComponent from './breadcrumbs/breadcrumbs';
export { default as UnwrappedBreadcrumbs } from './breadcrumbs/breadcrumbs';
export type { BreadcrumbsProps } from './breadcrumbs/breadcrumbs';
export const Breadcrumbs = withContentElementWrapper(
  BreadcrumbsComponent,
  'breadcrumbs'
);

import AccordionComponent from './list/accordion';
export { default as UnwrappedAccordion } from './list/accordion';
export type { AccordionProps } from './list/accordion';
export const Accordion = withContentElementWrapper(
  AccordionComponent,
  'accordion'
);

import ContactMapComponent from './contact/contact-map';
export { default as UnwrappedContactMap } from './contact/contact-map';
export type { ContactMapProps } from './contact/contact-map';
export const ContactMap = withContentElementWrapper(
  ContactMapComponent,
  'contact-map'
);

import FooterComponent from './footer/footer';
export { default as UnwrappedFooter } from './footer/footer';
export type { FooterProps } from './footer/footer';
export const Footer = withContentElementWrapper(FooterComponent, 'footer');

import ImageTextComponent from './text/image-text';
export { default as UnwrappedImageText } from './text/image-text';
export type { ImageTextProps } from './text/image-text';
export const ImageText = withContentElementWrapper(
  ImageTextComponent,
  'image-text'
);

import IntroTextComponent from './text/intro-text';
export { default as UnwrappedIntroText } from './text/intro-text';
export type { IntroTextProps } from './text/intro-text';
export const IntroText = withContentElementWrapper(
  IntroTextComponent,
  'intro-text'
);

import ListComponent from './list/list';
export { default as UnwrappedList } from './list/list';
export type { ListProps } from './list/list';
export const List = withContentElementWrapper(ListComponent, 'list');

import LogoGridComponent from './list/logo-grid';
export { default as UnwrappedLogoGrid } from './list/logo-grid';
export type { LogoGridProps } from './list/logo-grid';
export const LogoGrid = withContentElementWrapper(
  LogoGridComponent,
  'logo-grid'
);

import MetricsComponent from './metrics/metrics';
export { default as UnwrappedMetrics } from './metrics/metrics';
export type { MetricsProps } from './metrics/metrics';
export const Metrics = withContentElementWrapper(MetricsComponent, 'metrics');

import SubFooterComponent from './footer/sub-footer';
export { default as UnwrappedSubFooter } from './footer/sub-footer';
export type { SubFooterProps } from './footer/sub-footer';
export const SubFooter = withContentElementWrapper(
  SubFooterComponent,
  'sub-footer'
);

import SimpleHeaderComponent from './header/simple-header';
export { default as UnwrappedSimpleHeader } from './header/simple-header';
export type { SimpleHeaderProps } from './header/simple-header';
export const SimpleHeader = withContentElementWrapper(
  SimpleHeaderComponent,
  'simple-header'
);

import SliderComponent from './slider/slider';
export { default as UnwrappedSlider } from './slider/slider';
export type { SliderProps } from './slider/slider';
export const Slider = withContentElementWrapper(SliderComponent, 'slider');

import VideoHeroComponent from './hero-sections/video-hero';
export { default as UnwrappedVideoHero } from './hero-sections/video-hero';
export type { VideoHeroProps } from './hero-sections/video-hero';
export const VideoHero = withContentElementWrapper(
  VideoHeroComponent,
  'video-hero'
);
