'use client';

import { createContext, useContext } from 'react';

/**
 * Context to signal that PreviewContainer is running in an external window.
 * When `isExternal` is true, edit/create actions send BroadcastChannel
 * messages back to the main editor instead of navigating locally.
 */
type ExternalPreviewContextType = {
  isExternal: boolean;
};

const ExternalPreviewContext = createContext<ExternalPreviewContextType>({
  isExternal: false,
});

export const ExternalPreviewProvider = ExternalPreviewContext.Provider;

export function useExternalPreview() {
  return useContext(ExternalPreviewContext);
}
