import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ChevronDown, 
  Lock, 
  Bell, 
  Copy, 
  Check, 
  Layers, 
  HardDrive, 
  Wallet,
  Sparkles,
  RefreshCw,
  LogOut,
  Radio
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { NETWORKS, POLYGON_USDT_ADDRESS, BITCOIN_ADDRESS } from '../data/constants';
import { NetworkId, WalletMode } from '../types/wallet';
import { WalletLogo } from './common/WalletLogo';

interface NavbarProps {
  onOpenAlerts: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAlerts, onOpenSettings }) => {
  const {
    selectedNetwork,
    setSelectedNetwork,
    wallets,
    activeWallet,
    setActiveWalletId,
    lockWallet,
    logout,
    walletMode,
    setWalletMode,
    syncBlockchainData,
    isSyncingBlockchain,
    priceAlerts,
    liveNotifications,
  } = useWallet();

  const [showNetworkMenu, setShowNetworkMenu] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);

  const currentNet = NETWORKS.find((n) => n.id === selectedNetwork);
  const activeAlertsCount = priceAlerts.filter((a) => a.enabled).length;
  const unreadAlertsCount = liveNotifications.length;

  const currentAddress = selectedNetwork === 'bitcoin' ? BITCOIN_ADDRESS : POLYGON_USDT_ADDRESS;

  const handleCopyCurrentAddress = () => {
    navigator.clipboard.writeText(currentAddress);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const toggleMode = () => {
    const nextMode: WalletMode = walletMode === 'live' ? 'demo' : 'live';
    setWalletMode(nextMode);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#030712]/95 backdrop-blur-md border-b border-amber-500/20 px-3 sm:px-4 py-2.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Left: 007 Logo & Active Wallet Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          <WalletLogo size="sm" showText={false} />

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowWalletMenu(!showWalletMenu);
                setShowNetworkMenu(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all text-left cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black shadow-sm font-bold text-xs font-mono">
                007
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-100 group-hover:text-amber-400 transition-colors leading-tight max-w-[90px] sm:max-w-[130px] truncate font-mono">
                  {activeWallet.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono leading-tight">
                  {currentAddress.substring(0, 6)}...{currentAddress.substring(currentAddress.length - 4)}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-transform" />
            </button>

          {/* Wallet Menu Dropdown */}
          {showWalletMenu && (
            <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-[#0c1527] border border-slate-700/80 shadow-2xl p-2 z-50 animate-fadeIn">
              <div className="px-3 py-2 border-b border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Switch Vault / Wallet
                </span>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-mono">
                  {wallets.length} Active
                </span>
              </div>
              <div className="space-y-1 py-1">
                {wallets.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => {
                      setActiveWalletId(wallet.id);
                      setShowWalletMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      wallet.id === activeWallet.id
                        ? 'bg-blue-600/15 border border-blue-500/40 text-blue-300'
                        : 'hover:bg-slate-800/60 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-xs">
                        {wallet.isHardware ? <HardDrive className="w-3 h-3" /> : <Wallet className="w-3 h-3" />}
                      </div>
                      <span className="text-xs font-semibold">{wallet.name}</span>
                    </div>
                    {wallet.id === activeWallet.id && (
                      <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                    )}
                  </button>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={handleCopyCurrentAddress}
                  className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  {copiedAddr ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedAddr ? 'Copied' : 'Copy Address'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowWalletMenu(false);
                    onOpenSettings();
                  }}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-medium px-2 py-1 cursor-pointer"
                >
                  Manage
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

        {/* Center: Live Blockchain vs Demo Sandbox Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl">
          <button
            type="button"
            onClick={toggleMode}
            title={walletMode === 'live' ? 'Connected to live on-chain data. Click to switch to Demo' : 'Running in Demo Sandbox. Click to switch to Real Blockchain'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              walletMode === 'live'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                walletMode === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'
              }`}
            />
            <span className="hidden sm:inline">
              {walletMode === 'live' ? 'Live Mainnet' : 'Demo Sandbox'}
            </span>
          </button>

          {/* Sync On-Chain Button */}
          <button
            type="button"
            onClick={syncBlockchainData}
            disabled={isSyncingBlockchain}
            title="Synchronize on-chain data & live prices"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isSyncingBlockchain ? 'animate-spin text-emerald-400' : ''}`}
            />
          </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Multi-Chain Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNetworkMenu(!showNetworkMenu);
                setShowWalletMenu(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 transition-all cursor-pointer group"
            >
              {selectedNetwork === 'all' ? (
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                  <Layers className="w-3 h-3" />
                </div>
              ) : currentNet ? (
                <img
                  src={currentNet.icon}
                  alt={currentNet.name}
                  className="w-5 h-5 rounded-full object-contain bg-slate-900"
                />
              ) : null}

              <span className="text-xs font-semibold text-slate-200 hidden md:inline">
                {selectedNetwork === 'all' ? 'All Networks' : currentNet?.name}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-transform" />
            </button>

            {/* Network Dropdown */}
            {showNetworkMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0c1527] border border-slate-700/80 shadow-2xl p-2 z-50 animate-fadeIn">
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Select Blockchain
                </div>
                <div className="space-y-1 py-1 max-h-72 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedNetwork('all');
                      setShowNetworkMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                      selectedNetwork === 'all'
                        ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300 font-semibold'
                        : 'hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                        <Layers className="w-3 h-3" />
                      </div>
                      <span>All Networks</span>
                    </div>
                    {selectedNetwork === 'all' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    )}
                  </button>

                  {NETWORKS.map((net) => (
                    <button
                      key={net.id}
                      onClick={() => {
                        setSelectedNetwork(net.id);
                        setShowNetworkMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                        selectedNetwork === net.id
                          ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300 font-semibold'
                          : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={net.icon}
                          alt={net.name}
                          className="w-5 h-5 rounded-full object-contain bg-slate-900"
                        />
                        <span>{net.name}</span>
                      </div>
                      {selectedNetwork === net.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Price Alerts Bell Button */}
          <button
            type="button"
            onClick={onOpenAlerts}
            title="Real-Time Price Alerts"
            className="relative p-2 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 ? (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadAlertsCount}
              </span>
            ) : activeAlertsCount > 0 ? (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#050b14]" />
            ) : null}
          </button>

          {/* Instant Biometric Lock Button */}
          <button
            type="button"
            onClick={lockWallet}
            title="Lock Wallet (Face ID / PIN)"
            className="p-2 rounded-2xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-600/30 text-blue-400 hover:text-cyan-300 transition-all cursor-pointer"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* Log Out Button (back to First Page Login) */}
          <button
            type="button"
            onClick={logout}
            title="Log Out to First Page"
            className="p-2 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
