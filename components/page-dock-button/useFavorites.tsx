'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { FavoriteItem } from './Explorer';

type FavoritesContextValue = {
  favorites: FavoriteItem[];
  setFavorites: (updater: FavoriteItem[] | ((prev: FavoriteItem[]) => FavoriteItem[])) => void;
  toggleFavorite: (e: React.MouseEvent, item: { id: string; label: string; href?: string; type?: string }) => void;
  isLoading: boolean;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavoritesState] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const didInit = useRef(false);

  // Fetch favorites from DB on mount
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    fetch('/api/dock-favorites')
      .then((res) => (res.ok ? res.json() : { favorites: [] }))
      .then((data) => setFavoritesState(data.favorites ?? []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Persist to DB
  const persistFavorites = useCallback((newFavorites: FavoriteItem[]) => {
    fetch('/api/dock-favorites', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ favorites: newFavorites }),
    }).catch((err) => console.error('Failed to save favorites:', err));
  }, []);

  // Set favorites (with persist)
  const setFavorites = useCallback(
    (updater: FavoriteItem[] | ((prev: FavoriteItem[]) => FavoriteItem[])) => {
      setFavoritesState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        persistFavorites(next);
        return next;
      });
    },
    [persistFavorites]
  );

  // Toggle a favorite (add/remove)
  const toggleFavorite = useCallback(
    (e: React.MouseEvent, item: { id: string; label: string; href?: string; type?: string }) => {
      e.stopPropagation();

      setFavorites((prev) => {
        const isFav = prev.some((f) => f.id === item.id);
        if (isFav) {
          return prev.filter((f) => f.id !== item.id);
        } else {
          if (prev.length >= 5) return prev;
          return [
            ...prev,
            {
              id: item.id,
              label: item.label,
              href: item.href || '#',
              type: item.type || 'OTHER',
            },
          ];
        }
      });
    },
    [setFavorites]
  );

  return (
    <FavoritesContext.Provider value={{ favorites, setFavorites, toggleFavorite, isLoading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

/**
 * Hook to access shared dock favorites.
 * Must be used within a <FavoritesProvider>.
 */
export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within a <FavoritesProvider>');
  }
  return ctx;
}
