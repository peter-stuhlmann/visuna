import {
  BorderRadiusOptions,
  InnerWidthOptions,
  MarginOptions,
  PaddingOptions,
  PageElementData,
  Width,
} from '@/components/content-elements/default/types';

export function getPageElementProps(data: PageElementData) {
  return {
    backgroundColor:
      'backgroundColor' in data ? (data.backgroundColor as string) : undefined,
    borderRadius:
      'borderRadius' in data
        ? (data.borderRadius as BorderRadiusOptions)
        : undefined,
    innerBorderRadius:
      'innerBorderRadius' in data
        ? (data.innerBorderRadius as BorderRadiusOptions)
        : undefined,
    innerWidth:
      'innerWidth' in data ? (data.innerWidth as InnerWidthOptions) : undefined,
    marginTop:
      'marginTop' in data ? (data.marginTop as MarginOptions) : undefined,
    marginBottom:
      'marginBottom' in data ? (data.marginBottom as MarginOptions) : undefined,
    marginLeft:
      'marginLeft' in data ? (data.marginLeft as MarginOptions) : undefined,
    marginRight:
      'marginRight' in data ? (data.marginRight as MarginOptions) : undefined,
    paddingTop:
      'paddingTop' in data ? (data.paddingTop as PaddingOptions) : undefined,
    paddingBottom:
      'paddingBottom' in data
        ? (data.paddingBottom as PaddingOptions)
        : undefined,
    paddingLeft:
      'paddingLeft' in data ? (data.paddingLeft as PaddingOptions) : undefined,
    paddingRight:
      'paddingRight' in data
        ? (data.paddingRight as PaddingOptions)
        : undefined,
    width: 'width' in data ? (data.width as Width) : undefined,
    element:
      'element' in data
        ? (data.element as 'div' | 'footer' | 'header' | 'section')
        : undefined,
    headingValue:
      'headingValue' in data ? (data.headingValue as string) : undefined,
    headingTextColor:
      'headingTextColor' in data
        ? (data.headingTextColor as string)
        : undefined,
    headingTextAlign:
      'headingTextAlign' in data
        ? (data.headingTextAlign as 'left' | 'center' | 'right' | 'justify')
        : undefined,
    headingElement:
      'headingElement' in data
        ? (data.headingElement as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6')
        : undefined,
    size:
      'size' in data
        ? (data.size as 's' | 'm' | 'l' | 'xl' | 'xxl')
        : undefined,
  };
}
