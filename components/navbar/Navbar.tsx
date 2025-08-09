'use client';

import { FC } from 'react';
import BlockItem from './block-item/BlockItem';

import { Navbar, Block, BlockHeading } from './Navbar.styles';
import navData from './Navbar.data';
import NavbarToggleButton from './toggle-button/ToggleButton';
import { useNavbar } from '@/utils/useNavbar';
import { useSelectedWorkspace } from '../workspaces/WorkspaceContext';
// import { getLoggedInUser } from '@/utils/getLoggedInUser';

const NavbarComponent: FC = () => {
  // const user = await getLoggedInUser();
  // const isAdmin = user?.role === 'Admin';
  const isAdmin = true;

  const { isCollapsed } = useNavbar();
  const { selectedWorkspace } = useSelectedWorkspace();

  return (
    <Navbar id="navbar" $isCollapsed={isCollapsed || false}>
      <nav>
        <Block>
          <BlockHeading>Allgemein</BlockHeading>
          {navData.dashboard.map((item) => (
            <BlockItem
              key={item.href}
              href={`/workspaces/${selectedWorkspace?._id}/${item.href}`}
              icon={item.icon}
            >
              {item.de}
            </BlockItem>
          ))}
        </Block>
        <Block>
          <BlockHeading>Content</BlockHeading>
          {navData.content.map((item) => (
            <BlockItem
              key={item.href}
              href={`/workspaces/${selectedWorkspace?._id}/${item.href}`}
              icon={item.icon}
            >
              {item.de}
            </BlockItem>
          ))}
        </Block>
        <Block>
          <BlockHeading>Medienpool</BlockHeading>
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
        {isAdmin && (
          <Block>
            <BlockHeading>Admin</BlockHeading>
            {navData.admin.map((item) => (
              <BlockItem
                key={item.href}
                href={`/workspaces/${selectedWorkspace?._id}/${item.href}`}
                icon={item.icon}
              >
                {item.de}
              </BlockItem>
            ))}
          </Block>
        )}

        {/* <Block> */}
        {/* <BlockItem noArrow> */}
        <NavbarToggleButton />
        {/* </BlockItem> */}
        {/* </Block> */}
      </nav>
    </Navbar>
  );
};

export default NavbarComponent;
