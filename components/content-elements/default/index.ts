import { withContentElementWrapper } from './utils/withContentWrapper';

// Direkt nutzbare Standard-UI-Komponenten

export { default as Button } from './core/button';
export type { ButtonProps } from './core/button';

export { default as Icon } from './core/icons/icon';
export type { IconProps } from './core/icons/icon';

export { default as Ripple } from './core/ripple';
export type { RippleProps } from './core/ripple';

export { default as Wrapper } from './core/wrapper';
export type { WrapperProps, WrapperStyleProps } from './core/wrapper';

export { default as Heading } from './core/heading';
export type { HeadingProps } from './core/heading';

export { default as Overline } from './core/overline';
export type { OverlineProps } from './core/overline';

export { default as Subline } from './core/subline';
export type { SublineProps } from './core/subline';

export { default as Image } from './core/image';
export type { ImageProps } from './core/image';

export { default as Video } from './core/video';
export type { VideoProps } from './core/video';

export { default as Grid } from './grid';
export type { GridProps } from './grid';

export { default as DropdownMenu } from './inputs/dropdown-menu';
export type { DropdownMenuProps } from './inputs/dropdown-menu';

export { default as TextInput } from './inputs/text-input';
export type { TextInputProps } from './inputs/text-input';

// CONTENT-ELEMENTE mit Wrapper

import AccordionComponent from './accordion';
export { default as UnwrappedAccordion } from './accordion';
export type { AccordionData } from './accordion';
export const Accordion = withContentElementWrapper(
  AccordionComponent,
  'accordion'
);

import AnimatedCardsComponent from './animated-cards';
export { default as UnwrappedAnimatedCards } from './animated-cards';
export type { AnimatedCardsData } from './animated-cards';
export const AnimatedCards = withContentElementWrapper(
  AnimatedCardsComponent,
  'animated-cards'
);

import BreadcrumbsComponent from './breadcrumbs';
export { default as UnwrappedBreadcrumbs } from './breadcrumbs';
export type { BreadcrumbsData } from './breadcrumbs';
export const Breadcrumbs = withContentElementWrapper(
  BreadcrumbsComponent,
  'breadcrumbs'
);

import CardsGridComponent from './cards-grid';
export { default as UnwrappedCardsGrid } from './cards-grid';
export type { CardsGridData } from './cards-grid';
export const CardsGrid = withContentElementWrapper(
  CardsGridComponent,
  'cards-grid'
);

import ContactMapComponent from './contact-map';
export { default as UnwrappedContactMap } from './contact-map';
export type { ContactMapData } from './contact-map';
export const ContactMap = withContentElementWrapper(
  ContactMapComponent,
  'contact-map'
);

import HorizontalLineComponent from './horizontal-line';
export { default as UnwrappedHorizontalLine } from './horizontal-line';
export type { HorizontalLineData } from './horizontal-line';
export const HorizontalLine = withContentElementWrapper(
  HorizontalLineComponent,
  'horizontal-line'
);

import LargeCardComponent from './large-card';
export { default as UnwrappedLargeCard } from './large-card';
export type { LargeCardData } from './large-card';
export const LargeCard = withContentElementWrapper(
  LargeCardComponent,
  'large-card'
);

// import FooterComponent from './footer';
// export { default as UnwrappedFooter } from './footer';
// export type { FooterData } from './footer';
// export const Footer = withContentElementWrapper(FooterComponent, 'footer');

import ImageTextComponent from './image-text';
export { default as UnwrappedImageText } from './image-text';
export type { ImageTextData } from './image-text';
export const ImageText = withContentElementWrapper(
  ImageTextComponent,
  'image-text'
);

import IntroTextComponent from './intro-text';
export { default as UnwrappedIntroText } from './intro-text';
export type { IntroTextData } from './intro-text';
export const IntroText = withContentElementWrapper(
  IntroTextComponent,
  'intro-text'
);

import ListComponent from './list';
export { default as UnwrappedList } from './list';
export type { ListData } from './list';
export const List = withContentElementWrapper(ListComponent, 'list');

import LogoGridComponent from './logo-grid';
export { default as UnwrappedLogoGrid } from './logo-grid';
export type { LogoGridData } from './logo-grid';
export const LogoGrid = withContentElementWrapper(
  LogoGridComponent,
  'logo-grid'
);

import MetricsComponent from './metrics';
export { default as UnwrappedMetrics } from './metrics';
export type { MetricsData } from './metrics';
export const Metrics = withContentElementWrapper(MetricsComponent, 'metrics');

import SliderComponent from './slider';
export { default as UnwrappedSlider } from './slider';
export type { SliderData } from './slider';
export const Slider = withContentElementWrapper(SliderComponent, 'slider');

import SpacerComponent from './spacer';
export { default as UnwrappedSpacer } from './spacer';
export type { SpacerData } from './spacer';
export const Spacer = withContentElementWrapper(SpacerComponent, 'spacer');

import SubFooterComponent from './sub-footer';
export { default as UnwrappedSubFooter } from './sub-footer';
export type { SubFooterData } from './sub-footer';
export const SubFooter = withContentElementWrapper(
  SubFooterComponent,
  'sub-footer'
);

// import SimpleHeaderComponent from './simple-header';
// export { default as UnwrappedSimpleHeader } from './simple-header';
// export type { SimpleHeaderData } from './simple-header';
// export const SimpleHeader = withContentElementWrapper(
//   SimpleHeaderComponent,
//   'simple-header'
// );

import TabMenuComponent from './tab-menu';
export { default as UnwrappedTabMenu } from './tab-menu';
export type { TabMenuData } from './tab-menu';
export const TabMenu = withContentElementWrapper(TabMenuComponent, 'tab-menu');

import VideoHeroComponent from './video-hero';
export { default as UnwrappedVideoHero } from './video-hero';
export type { VideoHeroData } from './video-hero';
export const VideoHero = withContentElementWrapper(
  VideoHeroComponent,
  'video-hero'
);

import WatermarkComponent from './watermark';
export { default as UnwrappedWatermark } from './watermark';
export type { WatermarkData } from './watermark';
export const Watermark = withContentElementWrapper(
  WatermarkComponent,
  'watermark'
);
