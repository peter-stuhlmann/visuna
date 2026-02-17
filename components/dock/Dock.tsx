// components/dock/Dock.tsx (oder wo dein DockComponent liegt)
'use client';

import { FC, useMemo } from 'react';
import { usePathname } from 'next/navigation';

import BlockItem from './block-item/BlockItem';
import { Dock, Block, DockContainer } from './Dock.styles';
import { useDock } from '@/utils/useDock';
import { useSelectedWorkspace } from '../workspaces/WorkspaceContext';
import DockToggleButton from './toggle-button/ToggleButton';
import { HiOutlineDocument } from 'react-icons/hi2';
import {
  MdHome,
  MdImage,
  MdOutlineSettings,
  MdWorkspacesOutline,
} from 'react-icons/md';
import { HiOutlineDocumentDuplicate } from 'react-icons/hi2';
import { FaWpforms } from 'react-icons/fa6';

function extractPageIdFromPath(pathname: string): string | null {
  // erwartet: /workspaces/{id}/seiten/{pageId}/...
  // oder:     /workspaces/{id}/seiten/{pageId}
  const m = pathname.match(/^\/workspaces\/[^/]+\/seiten\/([^/]+)/);
  return m?.[1] ?? null;
}

function isInPageSubSection(pathname: string): boolean {
  // Seiten, bei denen der Dock-Link erscheinen soll:
  // /workspaces/[id]/seiten/[pageId]/seo
  // /workspaces/[id]/seiten/[pageId]/seitenelemente
  // /workspaces/[id]/seiten/[pageId]/analyse
  // + später beliebig erweiterbar
  return /^\/workspaces\/[^/]+\/seiten\/[^/]+\/(seo|seitenelemente|analyse)(\/|$)/.test(
    pathname
  );
}

const DockComponent: FC = () => {
  const { isFixed } = useDock();
  const { selectedWorkspace } = useSelectedWorkspace();
  const pathname = usePathname();

  const workspaceId = selectedWorkspace?._id
    ? String(selectedWorkspace._id)
    : '';

  const pageId = useMemo(() => extractPageIdFromPath(pathname), [pathname]);

  const shouldShowPageLink = useMemo(
    () => Boolean(pageId) && isInPageSubSection(pathname),
    [pageId, pathname]
  );

  const itemCount = shouldShowPageLink ? 7 : 6;

  const hasWorkspaces = Boolean(selectedWorkspace);

  return (
    <DockContainer $itemCount={itemCount}>
      <Dock id="dock" $isFixed={isFixed}>
        <DockToggleButton />

        <nav>
          <Block>
            <BlockItem href={`/workspaces`} icon={<MdWorkspacesOutline />}>
              Workspaces
            </BlockItem>
            {hasWorkspaces && (
              <>
                <BlockItem
                  href={`/workspaces/${workspaceId}/dashboard`}
                  icon={<MdHome />}
                >
                  Dashboard
                </BlockItem>
                <BlockItem
                  href={`/workspaces/${workspaceId}/seiten`}
                  icon={<HiOutlineDocumentDuplicate />}
                >
                  Seiten
                </BlockItem>

                {shouldShowPageLink && (
                  <BlockItem
                    href={`/workspaces/${workspaceId}/seiten/${pageId}`}
                    icon={<HiOutlineDocument />}
                  >
                    Aktuelle Seite
                  </BlockItem>
                )}
                <BlockItem
                  href={`/workspaces/${workspaceId}/formularverwaltung`}
                  icon={<FaWpforms />}
                >
                  Formulare
                </BlockItem>
                <BlockItem
                  href={`/workspaces/${workspaceId}/medienpool/bilder`}
                  icon={<MdImage />}
                >
                  Medienpool
                </BlockItem>
                <BlockItem
                  href={`/workspaces/${workspaceId}/einstellungen`}
                  icon={<MdOutlineSettings />}
                >
                  Einstellungen
                </BlockItem>
              </>
            )}
          </Block>
        </nav>
      </Dock>
    </DockContainer>
  );
};

export default DockComponent;
