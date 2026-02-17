// app/(backend)/workspaces/[workspaceId]/seiten/[pageId]/preview/ExternalPreview.tsx
'use client';

import { useEffect, useRef, useCallback } from 'react';
import PreviewContainer from '@/components/PreviewContainer';
import { usePage } from '@/components/PageContext';
import { usePageElements } from '@/components/usePageElements';
import { ExternalPreviewProvider } from '@/components/ExternalPreviewContext';
import type { LanguageCode } from '@/components/language-settings/languages';

type Props = {
  availableLanguages: LanguageCode[];
};

/**
 * Client component for the external preview window.
 * Renders PreviewContainer and listens on BroadcastChannel
 * for page-change events, content updates, scroll and language sync
 * from the main editor. Also broadcasts local changes back.
 */
export default function ExternalPreview({ availableLanguages }: Props) {
  const { page } = usePage();
  const { pageElements, setPageElements, updatePageElement, revision } = usePageElements();

  // Counter-based skip: incremented when a remote update arrives,
  // decremented when the revision effect fires. This prevents
  // re-broadcasting remote updates while allowing local changes through.
  const skipBroadcastCountRef = useRef(0);
  const initialRef = useRef(true);

  // Listen for page changes, content updates, scroll & language events from main editor
  useEffect(() => {
    const channel = new BroadcastChannel('preview-sync');

    channel.onmessage = (event) => {
      const { type } = event.data || {};

      if (type === 'page-change') {
        const { pageId, workspaceId } = event.data;
        if (pageId && workspaceId) {
          const targetPath = `/workspaces/${workspaceId}/seiten/${pageId}/preview`;
          if (window.location.pathname !== targetPath) {
            window.location.href = targetPath;
          }
        }
      }

      if (type === 'content-update' || type === 'state-response') {
        const { pageElements: updatedElements } = event.data;
        if (Array.isArray(updatedElements)) {
          skipBroadcastCountRef.current += 1;
          setPageElements(updatedElements);
        }
      }

      if (type === 'visibility-change') {
        const { elementId, visible } = event.data;
        if (elementId !== undefined && visible !== undefined) {
          skipBroadcastCountRef.current += 1;
          updatePageElement(elementId, { visible });
        }
      }

      if (type === 'scroll-to-element') {
        const { elementId } = event.data;
        if (elementId) {
          window.dispatchEvent(
            new CustomEvent('pe-scroll-to', { detail: { id: elementId } })
          );
        }
      }

      if (type === 'language-change') {
        const { language } = event.data;
        if (language) {
          window.dispatchEvent(
            new CustomEvent('preview-language-change', { detail: { language } })
          );
        }
      }
    };

    // Request latest state from main editor (handles refresh)
    channel.postMessage({ type: 'state-request' });

    return () => channel.close();
  }, [setPageElements]);

  // Broadcast window dimensions to main editor so PageDock can show external preview size
  useEffect(() => {
    const sendDimensions = () => {
      const ch = new BroadcastChannel('preview-sync');
      ch.postMessage({
        type: 'external-preview-dimensions',
        width: window.innerWidth,
        height: window.innerHeight,
      });
      ch.close();
    };
    // Send immediately on mount
    sendDimensions();
    // Send on every resize
    window.addEventListener('resize', sendDimensions);
    return () => {
      window.removeEventListener('resize', sendDimensions);
      // Notify that the external preview was closed
      const ch = new BroadcastChannel('preview-sync');
      ch.postMessage({ type: 'external-preview-closed' });
      ch.close();
    };
  }, []);

  // Broadcast LOCAL changes back to main editor (reverse sync)
  useEffect(() => {
    // Skip initial mount
    if (initialRef.current) {
      initialRef.current = false;
      return;
    }
    // Skip if this revision was triggered by a remote update
    if (skipBroadcastCountRef.current > 0) {
      skipBroadcastCountRef.current -= 1;
      return;
    }
    // Broadcast local changes to main editor
    const channel = new BroadcastChannel('preview-sync');
    channel.postMessage({ type: 'content-update-from-external', pageElements });
    channel.close();
  }, [revision]);

  // Broadcast language changes from external preview to main editor
  const handleLanguageChange = useCallback((lang: LanguageCode) => {
    const channel = new BroadcastChannel('preview-sync');
    channel.postMessage({ type: 'language-change-from-external', language: lang });
    channel.close();
  }, []);

  if (!page || !pageElements) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
        Lade Preview…
      </div>
    );
  }

  return (
    <ExternalPreviewProvider value={{ isExternal: true }}>
      <div style={{ height: '100vh', overflowY: 'auto' }}>
        <PreviewContainer
          pageElements={pageElements}
          availableLanguages={availableLanguages}
          onLanguageChange={handleLanguageChange}
          isPagePreview
        />
      </div>
    </ExternalPreviewProvider>
  );
}
