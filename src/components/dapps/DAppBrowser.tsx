import React, { useState } from 'react';
import { 
  ArrowLeft, 
  RotateCw, 
  Search, 
  Compass, 
  ExternalLink, 
  Star, 
  ShieldCheck, 
  Layers, 
  Check, 
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';
import { FEATURED_DAPPS, POLYGON_USDT_ADDRESS } from '../../data/constants';
import { DAppItem } from '../../types/wallet';
import { useWallet } from '../../context/WalletContext';
import { Web3SignModal } from './Web3SignModal';

export const DAppBrowser: React.FC = () => {
  const { 
    tokens, 
    sendCrypto, 
    pendingWeb3Request, 
    requestWeb3Action, 
    resolveWeb3Request 
  } = useWallet();

  const [activeDApp, setActiveDApp] = useState<DAppItem | null>(null);
  const [urlInput, setUrlInput] = useState<string>('https://app.uniswap.org');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['uniswap', 'aave', 'lido']);
  
  // Interactive mock dApp inner form states
  const [dappSwapAmount, setDappSwapAmount] = useState<string>('100');
  const [dappSupplyAmount, setDappSupplyAmount] = useState<string>('250');
  const [dappSuccessNotice, setDappSuccessNotice] = useState<string>('');

  const categories = ['All', 'DeFi', 'Yield', 'NFT', 'Bridge', 'Gaming'];

  const filteredDApps = FEATURED_DAPPS.filter((dapp) => {
    const matchesCat = selectedCategory === 'All' || dapp.category === selectedCategory;
    const matchesSearch =
      dapp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dapp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dapp.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleLaunchDApp = (dapp: DAppItem) => {
    setActiveDApp(dapp);
    setUrlInput(dapp.url);
    setDappSuccessNotice('');
  };

  const handleGoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    let targetUrl = urlInput.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    const matched = FEATURED_DAPPS.find((d) => targetUrl.includes(d.id) || d.url.includes(targetUrl));
    if (matched) {
      setActiveDApp(matched);
    } else {
      setActiveDApp({
        id: 'custom-web3',
        name: new URL(targetUrl).hostname,
        url: targetUrl,
        category: 'DeFi',
        icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=040',
        description: 'Web3 connected external application',
        supportedNetworks: ['polygon', 'ethereum'],
      });
    }
  };

  const handleReload = () => {
    setIsReloading(true);
    setTimeout(() => setIsReloading(false), 500);
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Mock interaction triggers in dApps
  const handleTriggerUniswapSwap = async () => {
    const amt = parseFloat(dappSwapAmount) || 100;
    const approved = await requestWeb3Action({
      dappName: 'Uniswap v3 (Polygon)',
      dappIcon: 'https://cryptologos.cc/logos/uniswap-uni-logo.svg?v=040',
      dappUrl: 'https://app.uniswap.org',
      method: 'eth_sendTransaction',
      networkId: 'polygon',
      payload: {
        to: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
        value: `${amt} USDT ➔ POL`,
        estimatedGasUsd: 0.015,
      },
    });

    if (approved) {
      setDappSuccessNotice(`Swap confirmed! Swapped ${amt} USDT to POL on Polygon PoS.`);
      setTimeout(() => setDappSuccessNotice(''), 6000);
    }
  };

  const handleTriggerAaveSupply = async () => {
    const amt = parseFloat(dappSupplyAmount) || 250;
    const approved = await requestWeb3Action({
      dappName: 'Aave v3 Liquidity Pool',
      dappIcon: 'https://cryptologos.cc/logos/aave-aave-logo.svg?v=040',
      dappUrl: 'https://app.aave.com',
      method: 'eth_sendTransaction',
      networkId: 'polygon',
      payload: {
        to: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
        value: `${amt} USDT Deposit`,
        estimatedGasUsd: 0.02,
      },
    });

    if (approved) {
      setDappSuccessNotice(`Deposited ${amt} USDT into Aave v3 Polygon Pool! Now earning 7.8% APY.`);
      setTimeout(() => setDappSuccessNotice(''), 6000);
    }
  };

  const handleTriggerOpenSeaBid = async () => {
    const approved = await requestWeb3Action({
      dappName: 'OpenSea Marketplace',
      dappIcon: 'https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.svg',
      dappUrl: 'https://opensea.io',
      method: 'personal_sign',
      networkId: 'polygon',
      payload: {
        message: 'OpenSea: Sign in and approve bid offer of 120 POL for Cyber Ape #3892. Nonce: 89412',
      },
    });

    if (approved) {
      setDappSuccessNotice('Offer signed and broadcasted to OpenSea orderbook!');
      setTimeout(() => setDappSuccessNotice(''), 6000);
    }
  };

  return (
    <div className="pb-24 pt-2 px-3 max-w-xl mx-auto flex flex-col min-h-[85vh]">
      {/* Top Browser Navigation Bar */}
      <div className="bg-[#0c1527] border border-slate-800 rounded-2xl p-2.5 mb-3 shadow-lg">
        <div className="flex items-center gap-2">
          {activeDApp && (
            <button
              type="button"
              onClick={() => setActiveDApp(null)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Back to Discover"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={handleReload}
            className={`p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer ${
              isReloading ? 'animate-spin' : ''
            }`}
            title="Reload"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* URL Search Bar */}
          <form onSubmit={handleGoUrl} className="flex-1 relative flex items-center">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Search or enter Web3 dApp URL..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl py-1.5 pl-8 pr-16 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
            <Globe className="w-3.5 h-3.5 text-blue-400 absolute left-2.5" />
            <button
              type="submit"
              className="absolute right-1.5 px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
            >
              Go
            </button>
          </form>

          {activeDApp && (
            <button
              type="button"
              onClick={() => toggleBookmark(activeDApp.id)}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                bookmarkedIds.includes(activeDApp.id)
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Bookmark dApp"
            >
              <Star className="w-4 h-4" fill={bookmarkedIds.includes(activeDApp.id) ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        {/* Web3 Provider Injected Status Bar */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="text-emerald-400 font-semibold">TrustVault Web3 Injected</span>
            <span className="text-slate-500">|</span>
            <span className="font-mono text-slate-300">
              {POLYGON_USDT_ADDRESS.substring(0, 6)}...{POLYGON_USDT_ADDRESS.substring(POLYGON_USDT_ADDRESS.length - 4)}
            </span>
          </div>
          <span className="bg-purple-950/60 text-purple-300 px-2 py-0.5 rounded border border-purple-800/40 font-mono">
            Polygon PoS
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {activeDApp ? (
        /* In-DApp Browser View */
        <div className="flex-1 bg-[#091122] border border-slate-800 rounded-3xl p-4 flex flex-col shadow-xl">
          {/* Header of Active DApp */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-3">
              <img
                src={activeDApp.icon}
                alt={activeDApp.name}
                className="w-10 h-10 rounded-2xl bg-slate-800 p-1 object-contain"
              />
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                  <span>{activeDApp.name}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </h2>
                <span className="text-[11px] text-slate-400">{activeDApp.description}</span>
              </div>
            </div>
            <a
              href={activeDApp.url}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Open External"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Toast Notification inside dApp */}
          {dappSuccessNotice && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 text-xs animate-fadeIn font-semibold">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{dappSuccessNotice}</span>
            </div>
          )}

          {/* Interactive Simulated DApp Interface */}
          {activeDApp.id === 'uniswap' || activeDApp.id === 'quickswap' ? (
            <div className="max-w-md mx-auto w-full bg-[#0c1527] border border-slate-800 rounded-3xl p-5 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Uniswap v3 Protocol
                </span>
                <span className="text-xs bg-pink-500/20 text-pink-300 font-semibold px-2 py-0.5 rounded-lg border border-pink-500/30">
                  Polygon PoS
                </span>
              </div>

              {/* Swap Input */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl mb-2">
                <div className="text-[11px] text-slate-400 mb-1">Sell</div>
                <div className="flex justify-between items-center">
                  <input
                    type="number"
                    value={dappSwapAmount}
                    onChange={(e) => setDappSwapAmount(e.target.value)}
                    className="w-full bg-transparent text-xl font-bold text-white focus:outline-none"
                  />
                  <div className="bg-slate-800 text-white font-bold text-xs px-2.5 py-1 rounded-xl">
                    USDT
                  </div>
                </div>
              </div>

              {/* Swap Output */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl mb-4">
                <div className="text-[11px] text-slate-400 mb-1">Buy (Estimated)</div>
                <div className="flex justify-between items-center">
                  <div className="text-xl font-bold text-emerald-400">
                    {(parseFloat(dappSwapAmount || '0') * 1.71).toFixed(2)}
                  </div>
                  <div className="bg-purple-900/60 text-purple-300 font-bold text-xs px-2.5 py-1 rounded-xl border border-purple-700/50">
                    POL
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTriggerUniswapSwap}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-pink-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Swap via Web3 Provider</span>
              </button>
            </div>
          ) : activeDApp.id === 'aave' ? (
            <div className="max-w-md mx-auto w-full bg-[#0c1527] border border-slate-800 rounded-3xl p-5 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Aave v3 Lending & Earn
                </span>
                <span className="text-xs bg-cyan-500/20 text-cyan-300 font-semibold px-2 py-0.5 rounded-lg border border-cyan-500/30">
                  7.84% Supply APY
                </span>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl mb-4">
                <div className="text-[11px] text-slate-400 mb-1">Supply USDT into Liquidity Pool</div>
                <div className="flex justify-between items-center">
                  <input
                    type="number"
                    value={dappSupplyAmount}
                    onChange={(e) => setDappSupplyAmount(e.target.value)}
                    className="w-full bg-transparent text-xl font-bold text-white focus:outline-none"
                  />
                  <div className="bg-emerald-900/50 text-emerald-300 font-bold text-xs px-2.5 py-1 rounded-xl">
                    USDT
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-400 flex justify-between">
                  <span>Collateral Status: Enabled</span>
                  <span>Est. Annual Return: +${((parseFloat(dappSupplyAmount || '0') * 0.0784)).toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTriggerAaveSupply}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Supply to Aave Protocol</span>
              </button>
            </div>
          ) : (
            <div className="max-w-md mx-auto w-full bg-[#0c1527] border border-slate-800 rounded-3xl p-5 shadow-2xl text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 p-2 mx-auto mb-3 flex items-center justify-center">
                <img src={activeDApp.icon} alt="" className="w-12 h-12 object-contain" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">{activeDApp.name}</h3>
              <p className="text-xs text-slate-400 mb-4">{activeDApp.description}</p>
              
              <button
                type="button"
                onClick={handleTriggerOpenSeaBid}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                Connect Wallet & Authorize Contract Interaction
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Discover Hub View */
        <div className="space-y-4">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/50 via-indigo-900/40 to-purple-900/40 border border-blue-500/20 p-5 shadow-xl">
            <div className="relative z-10 max-w-sm">
              <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Web3 dApp Ecosystem</span>
              </div>
              <h2 className="text-xl font-black text-white mb-1 tracking-tight">
                Explore Decentralized Apps
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Seamlessly interact with DeFi protocols, NFT marketplaces, and bridges with TrustVault hardware-level biometric signatures.
              </p>
            </div>
          </div>

          {/* Bookmarks Row */}
          {bookmarkedIds.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Quick Access Bookmarks</span>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {FEATURED_DAPPS.filter((d) => bookmarkedIds.includes(d.id)).map((dapp) => (
                  <button
                    key={dapp.id}
                    onClick={() => handleLaunchDApp(dapp)}
                    className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer shrink-0"
                  >
                    <img src={dapp.icon} alt="" className="w-5 h-5 rounded-full object-contain" />
                    <span className="text-xs font-bold text-slate-200">{dapp.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Curated DApps List */}
          <div className="space-y-2.5">
            {filteredDApps.map((dapp) => (
              <div
                key={dapp.id}
                onClick={() => handleLaunchDApp(dapp)}
                className="p-3.5 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between cursor-pointer group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={dapp.icon}
                    alt={dapp.name}
                    className="w-11 h-11 rounded-2xl bg-slate-800 p-1.5 object-contain"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                        {dapp.name}
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-semibold">
                        {dapp.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 max-w-[260px] sm:max-w-sm">
                      {dapp.description}
                    </p>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-800 group-hover:bg-blue-600 text-slate-400 group-hover:text-white transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Web3 Biometric Signature Approval Modal */}
      <Web3SignModal
        request={pendingWeb3Request}
        onApprove={() => resolveWeb3Request(true)}
        onReject={() => resolveWeb3Request(false)}
      />
    </div>
  );
};
