import React, { useState } from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import { Navbar } from './components/Navbar';
import { BottomNav, TabType } from './components/BottomNav';
import { WalletHome } from './components/wallet/WalletHome';
import { DAppBrowser } from './components/dapps/DAppBrowser';
import { StakingHub } from './components/staking/StakingHub';
import { PriceAlertsManager } from './components/alerts/PriceAlertsManager';
import { SettingsModal } from './components/settings/SettingsModal';
import { BiometricLockScreen } from './components/security/BiometricLockScreen';
import { AuthOnboarding } from './components/auth/AuthOnboarding';
import { Bell, X } from 'lucide-react';

const WalletAppInner: React.FC = () => {
  const { 
    isAuthenticated, 
    login, 
    isLocked, 
    liveNotifications, 
    dismissNotification 
  } = useWallet();

  const [activeTab, setActiveTab] = useState<TabType>('wallet');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [alertsInitialSymbol, setAlertsInitialSymbol] = useState<string>('BTC');

  // First page: Login and Sign-Up interface
  if (!isAuthenticated) {
    return <AuthOnboarding onAuthenticated={(mode, isNewUser) => login(mode, isNewUser)} />;
  }

  // If wallet is locked by biometric timer or manual lock:
  if (isLocked) {
    return <BiometricLockScreen reason="Unlock 007 Crypto Wallet" />;
  }

  const handleOpenAlertsForSymbol = (symbol?: string) => {
    if (symbol) setAlertsInitialSymbol(symbol);
    setActiveTab('alerts');
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenAlerts={() => setActiveTab('alerts')}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Floating Global Price Alert Toast (top banner if alerts triggered) */}
      {liveNotifications.length > 0 && activeTab !== 'alerts' && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pointer-events-none">
          {liveNotifications.slice(0, 1).map((notif) => (
            <div
              key={notif.id}
              className="pointer-events-auto bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white p-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-bounce border border-amber-300/30"
            >
              <div
                className="flex items-center gap-2 text-xs font-bold cursor-pointer"
                onClick={() => setActiveTab('alerts')}
              >
                <Bell className="w-4 h-4 text-white shrink-0" />
                <span>{notif.message}</span>
              </div>
              <button
                type="button"
                onClick={() => dismissNotification(notif.id)}
                className="p-1 rounded-lg hover:bg-black/20 text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Content Pane */}
      <main className="flex-1 w-full max-w-4xl mx-auto">
        {activeTab === 'wallet' && (
          <WalletHome
            onNavigateToStaking={() => setActiveTab('staking')}
            onNavigateToBrowser={() => setActiveTab('browser')}
            onOpenAlerts={handleOpenAlertsForSymbol}
          />
        )}

        {activeTab === 'browser' && <DAppBrowser />}

        {activeTab === 'staking' && <StakingHub />}

        {activeTab === 'alerts' && (
          <PriceAlertsManager initialTokenSymbol={alertsInitialSymbol} />
        )}

        {activeTab === 'settings' && (
          <div className="p-4">
            <SettingsModal isOpen={true} onClose={() => setActiveTab('wallet')} />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Settings Modal (when opened from Navbar) */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <WalletProvider>
      <WalletAppInner />
    </WalletProvider>
  );
}
