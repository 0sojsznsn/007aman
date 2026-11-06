import React from 'react';
import { Wallet, Compass, Landmark, Bell, Settings } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export type TabType = 'wallet' | 'browser' | 'staking' | 'alerts' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { liveNotifications, priceAlerts } = useWallet();
  const alertCount = liveNotifications.length;

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'wallet',
      label: 'Wallet',
      icon: <Wallet className="w-5 h-5" />,
    },
    {
      id: 'browser',
      label: 'dApps',
      icon: <Compass className="w-5 h-5" />,
    },
    {
      id: 'staking',
      label: 'Earn & Stake',
      icon: <Landmark className="w-5 h-5" />,
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: <Bell className="w-5 h-5" />,
      badge: alertCount > 0 ? alertCount : undefined,
    },
    {
      id: 'settings',
      label: 'Security',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#040814]/95 backdrop-blur-lg border-t border-amber-500/20 px-2 py-2">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 leading-none tracking-tight font-mono">{tab.label}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
