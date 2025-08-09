'use client';

import { FC, useEffect, useState } from 'react';
import { TabMenuProps } from './TabMenu.types';
import { Tab, TabBar } from './TabMenu.styles';
import getElementClassName from '@/components/content-elements/default/utils/getElementClassName';

const TabMenu: FC<TabMenuProps> = ({
  tabs,
  persistKey, // optionaler localStorage-Schlüssel
}) => {
  const elementClassName = getElementClassName('tab-menu');

  const defaultTabId = tabs[0]?.id;
  const [activeTabId, setActiveTabId] = useState<string | undefined>(undefined);

  // Lade aus localStorage (nur bei persistKey)
  useEffect(() => {
    if (persistKey) {
      const storedTab = localStorage.getItem(persistKey);
      if (storedTab && tabs.find((tab) => tab.id === storedTab)) {
        setActiveTabId(storedTab);
      } else {
        setActiveTabId(defaultTabId);
      }
    } else {
      setActiveTabId(defaultTabId);
    }
  }, [defaultTabId, persistKey, tabs]);

  // Speichere im localStorage
  useEffect(() => {
    if (persistKey && activeTabId) {
      localStorage.setItem(persistKey, activeTabId);
    }
  }, [activeTabId, persistKey]);

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <>
      <TabBar>
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
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
