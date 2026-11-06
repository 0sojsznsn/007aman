import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  Landmark, 
  Plus, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ArrowDownCircle,
  Radio,
  RefreshCw
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { Token, NFTItem, Transaction } from '../../types/wallet';
import { ReceiveModal } from './ReceiveModal';
import { SendModal } from './SendModal';
import { StoreCryptoModal } from './StoreCryptoModal';
import { SwapModal } from './SwapModal';
import { TokenDetailModal } from './TokenDetailModal';
import { POLYGON_USDT_ADDRESS, BITCOIN_ADDRESS } from '../../data/constants';

interface WalletHomeProps {
  onNavigateToStaking: () => void;
  onNavigateToBrowser: () => void;
  onOpenAlerts: (symbol?: string) => void;
}

export const WalletHome: React.FC<WalletHomeProps> = ({
  onNavigateToStaking,
  onNavigateToBrowser,
  onOpenAlerts,
}) => {
  const {
    tokens,
    selectedNetwork,
    isBalanceHidden,
    setIsBalanceHidden,
    transactions,
    nfts,
    totalBalanceUsd,
    totalChange24hUsd,
    totalChange24hPercent,
    activeWallet,
    walletMode,
    syncBlockchainData,
    isSyncingBlockchain,
    lastSyncedAt,
    priceFlashMap,
  } = useWallet();

  const [activeTab, setActiveTab] = useState<'tokens' | 'nfts' | 'activity'>('tokens');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals state
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [activeTokenModal, setActiveTokenModal] = useState<Token | null>(null);
  const [selectedTokenForAction, setSelectedTokenForAction] = useState<string>('usdt-polygon');

  // Filter tokens according to network and search
  const filteredTokens = tokens.filter((t) => {
    const matchesNet = selectedNetwork === 'all' || t.networkId === selectedNetwork;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.networkName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesNet && matchesSearch;
  });

  // Filter NFTs
  const filteredNFTs = nfts.filter((nft) => {
    return selectedNetwork === 'all' || nft.networkId === selectedNetwork;
  });

  // Filter Transactions
  const filteredTransactions = transactions.filter((tx) => {
    return selectedNetwork === 'all' || tx.networkId === selectedNetwork;
  });

  const isPositive = totalChange24hPercent >= 0;

  const handleOpenSend = (tokenId: string = 'usdt-polygon') => {
    setSelectedTokenForAction(tokenId);
    setSendModalOpen(true);
  };

  const handleOpenReceive = (tokenId: string = 'usdt-polygon') => {
    setSelectedTokenForAction(tokenId);
    setReceiveModalOpen(true);
  };

  const handleOpenStore = (tokenId: string = 'usdt-polygon') => {
    setSelectedTokenForAction(tokenId);
    setStoreModalOpen(true);
  };

  const handleOpenSwap = (tokenId: string = 'usdt-polygon') => {
    setSelectedTokenForAction(tokenId);
    setSwapModalOpen(true);
  };

  return (
    <div className="pb-24 pt-3 px-3 sm:px-4 max-w-xl mx-auto space-y-4">
      {/* Real Blockchain On-Chain Status Banner */}
      <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              walletMode === 'live' ? 'bg-emerald-400 animate-ping' : 'bg-blue-400'
            }`}
          />
          <div>
            <span className="font-bold text-white">
              {walletMode === 'live' ? 'Live Mainnet (Real On-Chain Data)' : 'Demo Sandbox Mode'}
            </span>
            <div className="text-[10px] text-slate-400">
              Synced: {new Date(lastSyncedAt).toLocaleTimeString()}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={syncBlockchainData}
          disabled={isSyncingBlockchain}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncingBlockchain ? 'animate-spin text-emerald-400' : ''}`} />
          <span>{isSyncingBlockchain ? 'Syncing...' : 'Sync Blockchain'}</span>
        </button>
      </div>

      {/* Portfolio Balance Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1527] via-[#070d1a] to-[#030712] border border-amber-500/30 p-5 sm:p-6 shadow-2xl glow-blue">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

        <div className="relative z-10">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="font-mono text-amber-400 font-bold">007 VAULT BALANCE</span>
              {activeWallet.isHardware && (
                <span className="text-[10px] bg-slate-800 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/30 font-semibold font-mono">
                  Hardware Enclave
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsBalanceHidden(!isBalanceHidden)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={isBalanceHidden ? 'Reveal balance' : 'Hide balance'}
            >
              {isBalanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Balance Amount */}
          <div className="flex items-baseline gap-2 mb-1.5">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
              {isBalanceHidden
                ? '••••••••••'
                : `$${totalBalanceUsd.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
            </h1>
            <span className="text-xs font-bold text-amber-400 font-mono">USD</span>
          </div>

          {/* 24h PnL badge & Live status */}
          <div className="flex items-center gap-2 mb-5">
            {totalBalanceUsd === 0 ? (
              <div className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>New 007 Vault Active • $0.00 Initial Balance</span>
              </div>
            ) : (
              <div
                className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl ${
                  isPositive ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}
              >
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>
                  {isPositive ? '+' : ''}${Math.abs(totalChange24hUsd).toFixed(2)} (
                  {isPositive ? '+' : ''}
                  {totalChange24hPercent.toFixed(2)}%)
                </span>
              </div>
            )}
            <span className="text-[11px] text-slate-400 font-mono">Live Rates Ticking</span>
          </div>

          {/* 5 Core Action Buttons: Send, Receive, Store Crypto, Swap, Stake */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {/* Send */}
            <button
              type="button"
              onClick={() => handleOpenSend()}
              className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-white transition-all cursor-pointer group shadow-sm"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600/30 text-blue-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center mb-1 group-hover:scale-105 transition-all">
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-200">Send</span>
            </button>

            {/* Receive */}
            <button
              type="button"
              onClick={() => handleOpenReceive()}
              className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-white transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-600/30 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center mb-1 group-hover:scale-105 transition-all">
                <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-200">Receive</span>
            </button>

            {/* Store / Deposit */}
            <button
              type="button"
              onClick={() => handleOpenStore()}
              className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 transition-all cursor-pointer group shadow-lg shadow-amber-500/10"
              title="Deposit & Store Crypto"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-500 text-black flex items-center justify-center mb-1 group-hover:scale-105 transition-all shadow-md shadow-amber-500/40">
                <ArrowDownCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[11px] font-black text-amber-300">Store</span>
            </button>

            {/* Swap */}
            <button
              type="button"
              onClick={() => handleOpenSwap()}
              className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-white transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-cyan-600/30 text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white flex items-center justify-center mb-1 group-hover:scale-105 transition-all">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-200">Swap</span>
            </button>

            {/* Stake */}
            <button
              type="button"
              onClick={onNavigateToStaking}
              className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-white transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-purple-600/30 text-purple-400 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center mb-1 group-hover:scale-105 transition-all">
                <Landmark className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-200">Stake</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Row: Tokens | NFTs | Activity */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex gap-2">
          {(['tokens', 'nfts', 'activity'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all capitalize cursor-pointer ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab === 'tokens' ? 'Crypto Assets' : tab === 'nfts' ? 'NFTs' : 'History'}
            </button>
          ))}
        </div>

        {activeTab === 'tokens' && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search coin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-28 sm:w-36 bg-slate-900 border border-slate-800 rounded-xl py-1 pl-6 pr-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-3 h-3 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
          </div>
        )}
      </div>

      {/* Tab 1: Tokens List */}
      {activeTab === 'tokens' && (
        <div className="space-y-2.5">
          {filteredTokens.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No assets found matching criteria.
            </div>
          ) : (
            filteredTokens.map((token) => {
              const tokenHolding = token.balance * token.priceUsd;
              const isTokPos = token.change24h >= 0;
              const flash = priceFlashMap[token.id];

              return (
                <div
                  key={token.id}
                  onClick={() => setActiveTokenModal(token)}
                  className={`p-3.5 rounded-2xl transition-all flex items-center justify-between cursor-pointer group shadow-sm border ${
                    flash === 'up'
                      ? 'bg-emerald-950/30 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-[1.01]'
                      : flash === 'down'
                      ? 'bg-rose-950/30 border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.3)] scale-[1.01]'
                      : 'bg-[#080d1a]/80 hover:bg-[#0c1527] border-slate-800/80 hover:border-amber-500/40'
                  }`}
                >
                  {/* Left: Icon and Name */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={token.icon}
                        alt={token.name}
                        className="w-10 h-10 rounded-full bg-slate-900 p-0.5 object-contain"
                      />
                      <span className="absolute -bottom-1 -right-1 text-[9px] font-bold bg-[#030712] text-amber-400 border border-slate-700 px-1 rounded font-mono">
                        {token.networkId.substring(0, 3).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors font-mono">
                          {token.symbol}
                        </span>
                        {token.id === 'usdt-polygon' && (
                          <span className="text-[10px] bg-purple-500/20 text-purple-300 font-semibold px-1.5 py-0.2 rounded border border-purple-500/30">
                            Polygon USDT
                          </span>
                        )}
                        {token.id === 'btc-bitcoin' && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-1.5 py-0.2 rounded border border-amber-500/30">
                            Native SegWit
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                        <span className={flash === 'up' ? 'text-emerald-400 font-bold' : flash === 'down' ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                          ${token.priceUsd > 10 ? token.priceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : token.priceUsd.toFixed(4)}
                        </span>
                        <span className={`flex items-center text-[10px] px-1 py-0.2 rounded font-bold ${
                          isTokPos ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {flash === 'up' ? '▲ ' : flash === 'down' ? '▼ ' : ''}
                          {isTokPos ? '+' : ''}{token.change24h}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Holding Balance */}
                  <div className="text-right">
                    <div className="text-sm font-bold text-white font-mono">
                      {isBalanceHidden ? '••••••' : token.balance.toLocaleString()} {token.symbol}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {isBalanceHidden
                        ? '••••'
                        : `≈ $${tokenHolding.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: NFTs Gallery */}
      {activeTab === 'nfts' && (
        <div className="grid grid-cols-2 gap-3">
          {filteredNFTs.map((nft) => (
            <div
              key={nft.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden group hover:border-blue-500/50 transition-all shadow-md"
            >
              <div className="relative aspect-square overflow-hidden bg-slate-800">
                <img
                  src={nft.imageUrl}
                  alt={nft.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-[10px] text-white px-2 py-0.5 rounded-full font-semibold">
                  {nft.tokenId}
                </span>
              </div>
              <div className="p-3">
                <div className="text-xs font-bold text-white truncate">{nft.name}</div>
                <div className="text-[11px] text-slate-400 truncate mb-2">{nft.collection}</div>
                <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Floor</span>
                  <span className="font-bold text-blue-400 font-mono">
                    {nft.floorPrice} {nft.networkId === 'solana' ? 'SOL' : 'POL'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Transaction History */}
      {activeTab === 'activity' && (
        <div className="space-y-2.5">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No transactions recorded yet.
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isSend = tx.type === 'send';
              const isReceive = tx.type === 'receive';
              const isSwap = tx.type === 'swap';

              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        isReceive
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isSend
                          ? 'bg-blue-500/20 text-blue-400'
                          : isSwap
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}
                    >
                      {isReceive ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : isSend ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : isSwap ? (
                        <ArrowLeftRight className="w-4 h-4" />
                      ) : (
                        <Landmark className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white capitalize flex items-center gap-1.5">
                        <span>{tx.type}</span>
                        <span className="text-slate-400">{tx.tokenSymbol}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        <span>{new Date(tx.timestamp).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="truncate max-w-[100px]">{tx.toAddress}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-xs font-bold ${
                        isReceive ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {isReceive ? '+' : isSend ? '-' : ''}
                      {tx.amount} {tx.tokenSymbol.split(' ')[0]}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="capitalize">{tx.status}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Active Modals */}
      <ReceiveModal
        isOpen={receiveModalOpen}
        onClose={() => setReceiveModalOpen(false)}
        defaultTokenId={selectedTokenForAction}
      />
      <SendModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        defaultTokenId={selectedTokenForAction}
      />
      <StoreCryptoModal
        isOpen={storeModalOpen}
        onClose={() => setStoreModalOpen(false)}
        defaultTokenId={selectedTokenForAction}
      />
      <SwapModal
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
        defaultFromId={selectedTokenForAction}
      />
      <TokenDetailModal
        token={activeTokenModal}
        isOpen={!!activeTokenModal}
        onClose={() => setActiveTokenModal(null)}
        onSend={(id) => handleOpenSend(id)}
        onReceive={(id) => handleOpenReceive(id)}
        onSwap={(id) => handleOpenSwap(id)}
        onSetAlert={(sym) => onOpenAlerts(sym)}
      />
    </div>
  );
};
