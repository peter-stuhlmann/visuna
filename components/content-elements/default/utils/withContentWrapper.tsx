import React, { ComponentType, FC } from 'react';
import Wrapper from '../layout/wrapper';
import Heading from '../text/heading';
import Overline from '../text/overline';
import Subline from '../text/subline';
import Spacer from '../layout/spacer';
import getElementClassName from './getElementClassName';
import { PageElementData } from '../types';

type WithDataWrapperProps = {
  data?: PageElementData; // data ist optional
};

export function withContentElementWrapper<P extends object>(
  Component: ComponentType<P>,
  baseClassName?: string
): FC<P & WithDataWrapperProps> {
  const WrappedComponent: FC<P & WithDataWrapperProps> = (props) => {
    const { data: rawData, ...rest } = props;

    const data: PageElementData = rawData ?? {};

    const unwrapped = data.unwrapped ?? false;

    const elementClassName = baseClassName
      ? getElementClassName(baseClassName)
      : '';

    const content = (
      <>
        {data.overlineValue && (
          <Overline value={data.overlineValue as string} />
        )}
        {data.headingValue && <Heading value={data.headingValue as string} />}
        {data.sublineValue && <Subline value={data.sublineValue as string} />}
        {(data.overlineValue || data.headingValue || data.sublineValue) && (
          <Spacer />
        )}
        <Component
          {...(rest as P)}
          data={data}
          className={`${elementClassName}`}
        />
      </>
    );

    if (unwrapped) return content;

    return (
      <Wrapper
        className={`${elementClassName}-wrapper`}
        data={{
          ...data,
          children: content,
        }}
      />
    );
  };

  WrappedComponent.displayName = `WithContentElementWrapper(${
    Component.displayName || Component.name || 'Anonymous'
  })`;

  return WrappedComponent;
}
