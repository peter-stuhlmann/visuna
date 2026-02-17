'use client';

import { FC, useEffect, useMemo, useState } from 'react';
import { TabMenuProps } from './TabMenu.types';
import { Tab, TabBar } from './TabMenu.styles';
import getElementClassName from '@/components/content-elements/default/utils/getElementClassName';

const TabMenu: FC<TabMenuProps> = ({ data }) => {
  const elementClassName = getElementClassName('tab-menu');

  // Tabs können undefined sein → in sicheres Array umwandeln
  const safeTabs = useMemo(() => {
    const t = data?.tabs;
    return Array.isArray(t) ? t.filter(Boolean) : [];
  }, [data?.tabs]);

  const persistKey = data?.persistKey;
  const defaultTabId = safeTabs[0]?.id;

  const [activeTabId, setActiveTabId] = useState<string | undefined>(undefined);

  // Initial: aus localStorage lesen (falls persistKey) oder ersten Tab wählen
  useEffect(() => {
    if (!safeTabs.length) {
      setActiveTabId(undefined);
      return;
    }

    if (persistKey) {
      const stored =
        typeof window !== 'undefined' ? localStorage.getItem(persistKey) : null;
      const validStored =
        stored && safeTabs.some((t) => t.id === stored) ? stored : undefined;
      setActiveTabId(validStored ?? defaultTabId);
    } else {
      setActiveTabId(defaultTabId);
    }
  }, [persistKey, defaultTabId, safeTabs]);

  // Wenn sich Tabs ändern und der aktuelle activeTabId nicht mehr existiert → korrigieren
  useEffect(() => {
    if (!safeTabs.length) {
      if (activeTabId !== undefined) setActiveTabId(undefined);
      return;
    }
    if (activeTabId && !safeTabs.some((t) => t.id === activeTabId)) {
      setActiveTabId(defaultTabId);
    }
  }, [safeTabs, activeTabId, defaultTabId]);

  // In localStorage speichern (nur wenn sinnvoll)
  useEffect(() => {
    if (persistKey && activeTabId && safeTabs.length) {
      localStorage.setItem(persistKey, activeTabId);
    }
  }, [activeTabId, persistKey, safeTabs.length]);

  const activeTab = useMemo(
    () => safeTabs.find((t) => t.id === activeTabId),
    [safeTabs, activeTabId]
  );

  // Kein Tab vorhanden → leere Ausgabe (oder hier optional Placeholder rendern)
  if (!safeTabs.length) {
    return null;
  }

  return (
    <>
      <TabBar>
        {safeTabs.map((tab, idx: number) => (
          <Tab
            key={'tab' + idx}
            $active={tab.id === activeTabId}
            className={`${elementClassName}-tab`}
            onClick={() => setActiveTabId(tab.id)}
          >
            {tab.label}
          </Tab>
        ))}
      </TabBar>
      <div>{activeTab?.content}</div>
    </>
  );
};

export default TabMenu;
