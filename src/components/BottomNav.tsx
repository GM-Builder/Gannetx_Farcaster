// src/components/BottomNav.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaTrophy, FaUser, FaCog } from 'react-icons/fa';

export type TabType = 'home' | 'leaderboard' | 'profile' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  hasNotification?: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ 
  activeTab, 
  onTabChange,
  hasNotification = false 
}) => {
  const tabs = [
    { id: 'home' as TabType, icon: FaHome, label: 'Home' },
    { id: 'leaderboard' as TabType, icon: FaTrophy, label: 'Ranks' },
    { id: 'profile' as TabType, icon: FaUser, label: 'Profile', notification: hasNotification },
    { id: 'settings' as TabType, icon: FaCog, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800"></div>
      
      <nav className="relative flex items-center justify-around px-2 py-3 safe-bottom">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all duration-200"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-xl"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              
              <div className="relative">
                <Icon className={`text-xl transition-colors ${
                  isActive 
                    ? 'text-cyan-500 dark:text-cyan-400' 
                    : 'text-gray-400 dark:text-gray-500'
                }`} />
                
                {tab.notification && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"
                  />
                )}
              </div>
              
              <span className={`text-[10px] font-medium transition-colors ${
                isActive 
                  ? 'text-cyan-600 dark:text-cyan-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
      
      <div className="h-safe-bottom bg-white dark:bg-gray-900"></div>
    </div>
  );
};

export default BottomNav;