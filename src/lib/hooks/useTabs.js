import { useEffect, useState } from 'react';

export const useTabs = () => {
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tabLinks = document.querySelectorAll('.td_tabs .td_tab_links a');
    if (tabLinks.length) {
      setActiveTab(tabLinks[0].getAttribute('href'));
    }

    const handleClick = (e) => {
      e.preventDefault();
      setActiveTab(e.currentTarget.getAttribute('href'));
    };

    tabLinks.forEach((link) => link.addEventListener('click', handleClick));

    return () => {
      tabLinks.forEach((link) => link.removeEventListener('click', handleClick));
    };
  }, []);

  useEffect(() => {
    if (!activeTab) return;

    const tabs = document.querySelectorAll('.td_tabs .td_tab');
    tabs.forEach((tab) => {
      if ('#' + tab.id === activeTab) {
        tab.style.display = 'block';
        tab.classList.add('active');
      } else {
        tab.style.display = 'none';
        tab.classList.remove('active');
      }
    });

    const tabItems = document.querySelectorAll('.td_tabs .td_tab_links li');
    tabItems.forEach((li) => {
      const link = li.querySelector('a');
      if (link && link.getAttribute('href') === activeTab) {
        li.classList.add('active');
      } else {
        li.classList.remove('active');
      }
    });
  }, [activeTab]);
};
