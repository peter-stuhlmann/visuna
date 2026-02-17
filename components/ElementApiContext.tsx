'use client';

import { createContext, useContext, ReactNode, FC, useMemo } from 'react';

/**
 * Provides API URL paths for element CRUD operations.
 * 
 * When used inside templates, the paths point to template-element API routes.
 * When not provided (default), the hooks fall back to page-element API routes.
 */
type ElementApiContextType = {
  /** Base URL for element collection, e.g. /api/workspaces/.../templates/.../elements */
  elementsBasePath: string;
  /** URL for element order, e.g. /api/workspaces/.../templates/.../elements/order */
  orderPath: string;
  /** URL for a specific element */
  elementPath: (elementId: string) => string;
  /** Label for the entity type, e.g. 'Header', 'Footer', 'Seiten' */
  entityLabel: string;
};

const ElementApiContext = createContext<ElementApiContextType | null>(null);

type ElementApiProviderProps = {
  children: ReactNode;
  workspaceId: string;
  /** Page ID or Template ID */
  entityId: string;
  /** 'page' or 'template' */
  entityType: 'page' | 'template';
  /** Display label, e.g. 'Header', 'Footer'. Defaults to 'Seiten' for pages. */
  entityLabel?: string;
};

export const ElementApiProvider: FC<ElementApiProviderProps> = ({
  children,
  workspaceId,
  entityId,
  entityType,
  entityLabel,
}) => {
  const value = useMemo<ElementApiContextType>(() => {
    if (entityType === 'template') {
      const base = `/api/workspaces/${workspaceId}/templates/${entityId}/elements`;
      return {
        elementsBasePath: base,
        orderPath: `${base}/order`,
        elementPath: (elementId: string) => `${base}/${elementId}`,
        entityLabel: entityLabel ?? 'Template',
      };
    }

    // Default: page-element paths
    const base = `/api/workspaces/${workspaceId}/pages/${entityId}/page-elements`;
    return {
      elementsBasePath: base,
      orderPath: `${base}/order`,
      elementPath: (elementId: string) => `${base}/${elementId}`,
      entityLabel: entityLabel ?? 'Seiten',
    };
  }, [workspaceId, entityId, entityType, entityLabel]);

  return (
    <ElementApiContext.Provider value={value}>
      {children}
    </ElementApiContext.Provider>
  );
};

/**
 * Returns API paths for element operations. 
 * Falls back to page-element API if no provider is present.
 */
export function useElementApi(
  fallbackWorkspaceId?: string,
  fallbackPageId?: string
): ElementApiContextType {
  const ctx = useContext(ElementApiContext);

  if (ctx) return ctx;

  // Fallback for pages (backward compatibility)
  const wId = fallbackWorkspaceId ?? '';
  const pId = fallbackPageId ?? '';
  const base = `/api/workspaces/${wId}/pages/${pId}/page-elements`;

  return {
    elementsBasePath: base,
    orderPath: `${base}/order`,
    elementPath: (elementId: string) => `${base}/${elementId}`,
    entityLabel: 'Seiten',
  };
}
