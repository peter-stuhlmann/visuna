'use client';

import React, { ReactNode, useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

const StyledComponentsRegistry = ({ children }: { children: ReactNode }) => {
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== 'undefined') {
    return <>{children}</>;
  }

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {children as React.JSX.Element}
    </StyleSheetManager>
  );
};

export default StyledComponentsRegistry;
