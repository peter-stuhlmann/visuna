'use client';

import { FC } from 'react';
import BlockItem from './block-item/BlockItem';

import { Dock, Block, DockContainer } from './Dock.styles';
import navData from './Dock.data';
import { useDock } from '@/utils/useDock';
import { useSelectedWorkspace } from '../workspaces/WorkspaceContext';
import DockToggleButton from './toggle-button/ToggleButton';

const DockComponent: FC = () => {
  const { isFixed } = useDock();
  const { selectedWorkspace } = useSelectedWorkspace();

  return (
    <DockContainer>
      <Dock id="dock" $isFixed={isFixed}>
        <DockToggleButton />
        <nav>
          <Block>
            {navData.dashboard.map((item) => (
              <BlockItem
                key={item.href}
                href={`/workspaces/${selectedWorkspace?._id}/${item.href}`}
                icon={item.icon}
              >
                {item.de}
              </BlockItem>
            ))}

            {navData.content.map((item) => (
              <BlockItem
                key={item.href}
                href={`/workspaces/${selectedWorkspace?._id}/${item.href}`}
                icon={item.icon}
              >
                {item.de}
              </BlockItem>
            ))}

            {navData.assets.map((item) => (
              <BlockItem
                key={item.href}
                href={`/workspaces/${selectedWorkspace?._id}/${item.href}`}
                icon={item.icon}
              >
                {item.de}
              </BlockItem>
            ))}
          </Block>
        </nav>
      </Dock>
    </DockContainer>
  );
};

export default DockComponent;
