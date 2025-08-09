'use client';

// import { Heading, Wrapper } from '@/components/content-elements/default';
// import ContentElementSettingsWrapper from '@/components/content-element-settings-wrapper/ContentElementSettingsWrapper';
// import dynamic from 'next/dynamic';
import { FC } from 'react';
// import { PageElement } from '@/components/content-elements/default/types';
// import ResizableSplit from '@/components/ResizableSplit';

// const PageElementPage: FC<{ pageElement: PageElement }> = ({ pageElement }) => {
const PageElementPage: FC = () => {
  return (
    <>
      {/* <ResizableLayout /> */}
      {/* <ResizableSplit
        direction="horizontal"
        area1Content={
          <Wrapper
            data={{
              innerWidth: 'full',
              children: (
                <>
                  <Heading element="h1" value={`Seitenelement`} />
                  <div style={{ fontWeight: 'bold', fontSize: '2rem' }}>
                    {pageElement.name}
                  </div>
                  <div>{pageElement.element}</div>

                  <ContentElementSettingsWrapper pageElement={pageElement} />
                </>
              ),
            }}
          />
        }
        area2Content={<div>Area 2</div>}
      /> */}
      {/* <Wrapper
        data={{
          innerWidth: 'full',
          children: (
            <>
              <Heading element="h1" value={`Seitenelement`} />
              <div style={{ fontWeight: 'bold', fontSize: '2rem' }}>
                {pageElement.name}
              </div>
              <div>{pageElement.element}</div>

              <ContentElementSettingsWrapper pageElement={pageElement} />
            </>
          ),
        }}
      /> */}
    </>
  );
};
export default PageElementPage;
