import React from 'react';
import './TabNavigation.css';

export type TabType = 'search' | 'comparison' | 'team';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'search' as TabType, label: 'Buscar Pokémon', icon: '🔍' },
    { id: 'comparison' as TabType, label: 'Comparar', icon: '⚔️' },
    { id: 'team' as TabType, label: 'Montar Equipe', icon: '🎯' }
  ];

  return (
    <div className="tab-navigation">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

export default TabNavigation;