// src/components/BottomNav.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Home, Trophy, User, Rocket, MessageSquare, Zap } from 'lucide-react';

export type TabType = 'home' | 'deploy' | 'chat' | 'leaderboard' | 'profile';

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
    { id: 'home' as TabType, icon: Home, label: 'Home' },
    { id: 'deploy' as TabType, icon: Rocket, label: 'Deploy' },
    { id: 'chat' as TabType, icon: MessageSquare, label: 'Chat' },
    { id: 'leaderboard' as TabType, icon: Trophy, label: 'Ranks' },
    { id: 'profile' as TabType, icon: User, label: 'Profile', notification: hasNotification },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-[#050608]/90 backdrop-blur-lg border-t border-white/5"></div>

      <nav className="relative flex items-center justify-around px-2 py-3 safe-bottom">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all duration-200 flex-1"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-xl"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-colors ${isActive
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

              <span className={`text-[10px] font-medium transition-colors ${isActive
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
