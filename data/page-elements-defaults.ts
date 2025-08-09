import {
  ElementInnerTypographyProps,
  PageElementData,
  ElementTypeToDataMap,
  IntroTextData,
  MetricsData,
  ContactMapData,
} from '@/components/content-elements/default/types';

const wrapperDefaults: Partial<PageElementData> = {
  width: 'full',
  innerWidth: 'xl',
  innerBorderRadius: 'none',
  borderRadius: 'none',
  marginTop: 'none',
  marginBottom: 'none',
  paddingTop: 'm',
  paddingBottom: 'm',
  paddingLeft: 'm',
  paddingRight: 'm',
  backgroundColor: 'transparent',
  unwrapped: false,
  element: 'section',
};

const elementHeadingDefaults: Partial<ElementInnerTypographyProps> = {
  elementHeadingValue: '',
  elementHeadingTextColor: '#000',
  elementHeadingTextAlign: 'center',
  elementHeadingElement: 'h1',
};

const elementOverlineDefaults: Partial<ElementInnerTypographyProps> = {
  elementOverlineValue: '',
  elementOverlineTextColor: '#000',
  elementOverlineTextAlign: 'center',
  elementOverlineElement: 'div',
};

const elementSublineDefaults: Partial<ElementInnerTypographyProps> = {
  elementSublineValue: '',
  elementSublineTextColor: '#000',
  elementSublineTextAlign: 'center',
  elementSublineElement: 'div',
};

export function withDefaults<T extends object>(
  base: Partial<T>,
  override?: Partial<T>
): T {
  return {
    ...base,
    ...(override || {}),
  } as T;
}

export const pageElementDefaultData: {
  [K in keyof ElementTypeToDataMap]: ElementTypeToDataMap[K];
} = {
  'intro-text': withDefaults<IntroTextData>({
    ...wrapperDefaults,
  }),
  'contact-map': withDefaults<ContactMapData>({
    ...wrapperDefaults,
    map: {
      center: { lat: 52.52, lng: 13.41 },
      zoom: 13,
      markers: [],
    },
  }),
  metrics: withDefaults<MetricsData>({
    ...wrapperDefaults,
    metrics: [],
    animated: false,
    animationOnce: false,
    animationDuration: 0,
  }),
  spacer: {
    size: 'm',
  },
};

export function withElementDefaults<
  T extends keyof typeof pageElementDefaultData
>(
  elementType: T,
  data: Partial<(typeof pageElementDefaultData)[T]>
): (typeof pageElementDefaultData)[T] {
  return {
    ...pageElementDefaultData[elementType],
    ...data,
  };
}

// export const pageElementDefaultData: {
//   [K in keyof ElementTypeToDataMap]: ElementTypeToDataMap[K];
// } = {
//   'intro-text': withDefaults<IntroTextData>({
//     ...wrapperDefaults,
//     text: '',
//     buttonText: '',
//   }),
//   'contact-map': withDefaults<ContactMapData>({
//     ...wrapperDefaults,
//     map: {
//       center: { lat: 52.52, lng: 13.41 },
//       zoom: 13,
//       markers: [],
//     },
//   }),
//   metrics: withDefaults<MetricsData>({
//     ...wrapperDefaults,
//     metrics: [],
//     animated: false,
//     animationOnce: false,
//     animationDuration: 0,
//   }),
//   spacer: {
//     size: 'm',
//   },
// };
