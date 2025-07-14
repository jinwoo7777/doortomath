import { useState, useCallback } from 'react';

export const useTabs = (initialTab) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  return { activeTab, handleTabChange };
};
