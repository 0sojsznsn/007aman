import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Token,
  NetworkId,
  Transaction,
  StakingPosition,
  PriceAlert,
  NFTItem,
  WalletAccount,
  Web3Request,
  WalletMode,
} from '../types/wallet';
import {
  INITIAL_TOKENS,
  INITIAL_TRANSACTIONS,
  INITIAL_NFTS,
  INITIAL_ALERTS,
  INITIAL_WALLETS,
  POLYGON_USDT_ADDRESS,
  BITCOIN_ADDRESS,
  EVM_PRIMARY_ADDRESS,
  STAKING_POOLS,
} from '../data/constants';
import { BiometricService } from '../services/biometric';
import { BlockchainService, LiveOnChainData } from '../services/blockchain';

interface AlertNotification {
  id: string;
  alert: PriceAlert;
  message: string;
  timestamp: number;
}

interface WalletContextType {
  // Authentication & Mode
  isAuthenticated: boolean;
  login: (mode: WalletMode, isNewUser?: boolean) => void;
  logout: () => void;
  walletMode: WalletMode;
  setWalletMode: (mode: WalletMode) => void;
  isSyncingBlockchain: boolean;
  lastSyncedAt: number;
  syncBlockchainData: () => Promise<void>;
  priceFlashMap: { [tokenId: string]: 'up' | 'down' };

  tokens: Token[];
  selectedNetwork: NetworkId;
  setSelectedNetwork: (network: NetworkId) => void;
  isBalanceHidden: boolean;
  setIsBalanceHidden: (hidden: boolean) => void;
  wallets: WalletAccount[];
  activeWallet: WalletAccount;
  setActiveWalletId: (id: string) => void;
  transactions: Transaction[];
  stakingPositions: StakingPosition[];
  priceAlerts: PriceAlert[];
  nfts: NFTItem[];
  currency: string;
  setCurrency: (currency: string) => void;
  isLocked: boolean;
  lockWallet: () => void;
  unlockWallet: () => void;
  liveNotifications: AlertNotification[];
  dismissNotification: (id: string) => void;
  
  // Actions
  sendCrypto: (params: {
    tokenId: string;
    toAddress: string;
    amount: number;
    feeUsd: number;
  }) => Promise<{ success: boolean; txHash: string }>;

  storeCrypto: (params: {
    tokenId: string;
    amount: number;
  }) => Promise<{ success: boolean; txHash: string }>;
  
  swapCrypto: (params: {
    fromTokenId: string;
    toTokenId: string;
    fromAmount: number;
    toAmount: number;
    slippage: number;
  }) => Promise<{ success: boolean; txHash: string }>;
  
  stakeCrypto: (params: {
    poolId: string;
    amount: number;
    validatorName: string;
  }) => Promise<{ success: boolean; positionId: string }>;
  
  claimRewards: (positionId: string) => Promise<boolean>;
  unstakePosition: (positionId: string) => Promise<boolean>;
  
  addPriceAlert: (alert: Omit<PriceAlert, 'id' | 'isTriggered'>) => void;
  togglePriceAlert: (alertId: string) => void;
  deletePriceAlert: (alertId: string) => void;
  
  // Web3 dApp Provider Simulation
  pendingWeb3Request: Web3Request | null;
  requestWeb3Action: (req: Omit<Web3Request, 'id'>) => Promise<boolean>;
  resolveWeb3Request: (approved: boolean) => void;
  
  // Quick stats
  totalBalanceUsd: number;
  totalChange24hUsd: number;
  totalChange24hPercent: number;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const AUTH_KEY = 'trustvault_is_authenticated';
const MODE_KEY = 'trustvault_wallet_mode';
const TOKENS_KEY = 'trustvault_tokens_v3';
const TXS_KEY = 'trustvault_transactions_v3';
const STAKES_KEY = 'trustvault_staking_v3';
const ALERTS_KEY = 'trustvault_alerts_v3';
const WALLETS_KEY = 'trustvault_wallets_v3';
const ACTIVE_WALLET_KEY = 'trustvault_active_wallet';
const PRIVACY_KEY = 'trustvault_privacy_hide';

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Authentication status: defaults to true if user was previously logged in
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  });

  // Real on-chain data vs Demo mode
  const [walletMode, setWalletModeState] = useState<WalletMode>(() => {
    return (localStorage.getItem(MODE_KEY) as WalletMode) || 'live';
  });

  const [isSyncingBlockchain, setIsSyncingBlockchain] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number>(Date.now());

  // Load tokens from localStorage
  const [tokens, setTokens] = useState<Token[]>(() => {
    const saved = localStorage.getItem(TOKENS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TOKENS;
  });

  const [selectedNetwork, setSelectedNetwork] = useState<NetworkId>('all');
  
  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(() => {
    return localStorage.getItem(PRIVACY_KEY) === 'true';
  });

  const [wallets, setWallets] = useState<WalletAccount[]>(() => {
    const saved = localStorage.getItem(WALLETS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_WALLETS;
  });

  const [activeWalletId, setActiveWalletIdState] = useState<string>(() => {
    return localStorage.getItem(ACTIVE_WALLET_KEY) || INITIAL_WALLETS[0].id;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(TXS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [stakingPositions, setStakingPositions] = useState<StakingPosition[]>(() => {
    const saved = localStorage.getItem(STAKES_KEY);
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'stake-pos-1',
        tokenSymbol: 'POL',
        networkId: 'polygon',
        stakedAmount: 500.0,
        stakedAmountUsd: 292.0,
        rewardsPending: 4.82,
        rewardsPendingUsd: 2.81,
        apy: 6.85,
        validatorName: 'Lugnode',
        startDate: Date.now() - 3600 * 1000 * 24 * 14,
        lockPeriodDays: 0,
        status: 'active',
      },
    ];
  });

  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    const saved = localStorage.getItem(ALERTS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [nfts] = useState<NFTItem[]>(INITIAL_NFTS);
  const [currency, setCurrency] = useState<string>('USD');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [liveNotifications, setLiveNotifications] = useState<AlertNotification[]>([]);

  // Web3 dApp interaction state
  const [pendingWeb3Request, setPendingWeb3Request] = useState<Web3Request | null>(null);
  const [web3Resolver, setWeb3Resolver] = useState<{ resolve: (value: boolean) => void } | null>(null);

  // Persistence triggers
  useEffect(() => {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  }, [tokens]);

  useEffect(() => {
    localStorage.setItem(TXS_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STAKES_KEY, JSON.stringify(stakingPositions));
  }, [stakingPositions]);

  useEffect(() => {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(priceAlerts));
  }, [priceAlerts]);

  useEffect(() => {
    localStorage.setItem(PRIVACY_KEY, String(isBalanceHidden));
  }, [isBalanceHidden]);

  const [priceFlashMap, setPriceFlashMap] = useState<{ [tokenId: string]: 'up' | 'down' }>({});

  const login = (mode: WalletMode, isNewUser?: boolean) => {
    setIsAuthenticated(true);
    setWalletModeState(mode);
    localStorage.setItem(AUTH_KEY, 'true');
    localStorage.setItem(MODE_KEY, mode);

    if (isNewUser) {
      // User specifically requested: "when person sign up then 0 balance"
      setTokens((prev) => {
        const zeroed = prev.map((t) => ({ ...t, balance: 0 }));
        localStorage.setItem(TOKENS_KEY, JSON.stringify(zeroed));
        return zeroed;
      });
      setTransactions([]);
      setStakingPositions([]);
      localStorage.setItem(TXS_KEY, JSON.stringify([]));
      localStorage.setItem(STAKES_KEY, JSON.stringify([]));
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem(AUTH_KEY, 'false');
  };

  const setWalletMode = (mode: WalletMode) => {
    setWalletModeState(mode);
    localStorage.setItem(MODE_KEY, mode);
  };

  const setActiveWalletId = (id: string) => {
    setActiveWalletIdState(id);
    localStorage.setItem(ACTIVE_WALLET_KEY, id);
  };

  const activeWallet = wallets.find((w) => w.id === activeWalletId) || wallets[0];

  const lockWallet = useCallback(() => {
    setIsLocked(true);
  }, []);

  const unlockWallet = useCallback(() => {
    BiometricService.updateLastActivity();
    setIsLocked(false);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setLiveNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  /**
   * Sync Real On-Chain Blockchain Data for Bitcoin, Polygon USDT, and Live Prices
   */
  const syncBlockchainData = useCallback(async () => {
    setIsSyncingBlockchain(true);
    try {
      const data: LiveOnChainData = await BlockchainService.syncLiveBlockchainData();
      setLastSyncedAt(data.lastSyncedAt);

      // Merge on-chain data into tokens list
      setTokens((prev) =>
        prev.map((t) => {
          let updatedBalance = t.balance;
          let updatedPrice = t.priceUsd;
          let updatedChange = t.change24h;

          // If in live mode, update balances and live prices
          if (walletMode === 'live') {
            if (t.id === 'btc-bitcoin' && data.btcBalance !== undefined) {
              updatedBalance = data.btcBalance || t.balance;
            }
            if (t.id === 'usdt-polygon' && data.polygonUsdtBalance !== undefined) {
              updatedBalance = data.polygonUsdtBalance || t.balance;
            }
            if (t.id === 'pol-polygon' && data.polBalance !== undefined) {
              updatedBalance = data.polBalance || t.balance;
            }
          }

          // Live prices
          if (data.livePrices && data.livePrices[t.symbol]) {
            updatedPrice = data.livePrices[t.symbol].price;
            updatedChange = data.livePrices[t.symbol].change24h;
          }

          const history = t.history24h ? [...t.history24h.slice(1), updatedPrice] : [updatedPrice];

          return {
            ...t,
            balance: updatedBalance,
            priceUsd: updatedPrice,
            change24h: updatedChange,
            history24h: history,
          };
        })
      );

      // Merge real BTC txs if any
      if (data.realTransactions && data.realTransactions.length > 0) {
        setTransactions((prev) => {
          const existingIds = new Set(prev.map((tx) => tx.txHash));
          const newTxs = data.realTransactions.filter((tx) => !existingIds.has(tx.txHash));
          return [...newTxs, ...prev];
        });
      }
    } catch (err) {
      console.error('Failed to sync live blockchain:', err);
    } finally {
      setIsSyncingBlockchain(false);
    }
  }, [walletMode]);

  // Initial sync on startup and mode toggle
  useEffect(() => {
    syncBlockchainData();
  }, [walletMode, syncBlockchainData]);

  // Periodic Auto-lock checker
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLocked && BiometricService.shouldLock()) {
        setIsLocked(true);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [isLocked]);

  // Real-time market ticker & alert trigger checking
  useEffect(() => {
    const interval = setInterval(() => {
      setTokens((prevTokens) => {
        const flashes: { [tokenId: string]: 'up' | 'down' } = {};

        const updated = prevTokens.map((token) => {
          if (token.symbol === 'USDT' || token.symbol === 'USDC') {
            const slightDelta = (Math.random() - 0.5) * 0.0004;
            const newPrice = Math.max(0.999, Math.min(1.001, token.priceUsd + slightDelta));
            return { ...token, priceUsd: Number(newPrice.toFixed(4)) };
          }

          // Volatile tokens fluctuate with live ticks (±0.08% to ±0.35%)
          const isUp = Math.random() > 0.47;
          const pct = (isUp ? 1 : -1) * (0.0008 + Math.random() * 0.0028);
          const delta = token.priceUsd * pct;
          const newPrice = Number((token.priceUsd + delta).toFixed(token.priceUsd > 100 ? 2 : 4));
          const newChange24h = Number((token.change24h + pct * 5).toFixed(2));
          const history = token.history24h ? [...token.history24h.slice(1), newPrice] : [newPrice];

          flashes[token.id] = isUp ? 'up' : 'down';

          return {
            ...token,
            priceUsd: newPrice,
            change24h: newChange24h,
            history24h: history,
          };
        });

        // Trigger visual flash
        setPriceFlashMap(flashes);
        setTimeout(() => setPriceFlashMap({}), 1000);

        // Price alerts surveillance
        setPriceAlerts((currentAlerts) => {
          let hasChanges = false;
          const newAlerts = currentAlerts.map((alert) => {
            if (!alert.enabled || alert.isTriggered) return alert;

            const matchingToken = updated.find((t) => t.symbol === alert.tokenSymbol);
            if (!matchingToken) return alert;

            let triggered = false;
            if (alert.direction === 'above' && matchingToken.priceUsd >= alert.targetPrice) {
              triggered = true;
            } else if (alert.direction === 'below' && matchingToken.priceUsd <= alert.targetPrice) {
              triggered = true;
            }

            if (triggered) {
              hasChanges = true;
              const notifId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
              const message = `🔔 ${alert.tokenSymbol} reached $${matchingToken.priceUsd.toLocaleString()} (${alert.direction === 'above' ? '≥' : '≤'} target $${alert.targetPrice.toLocaleString()})!`;
              
              setLiveNotifications((prevNotifs) => [
                {
                  id: notifId,
                  alert,
                  message,
                  timestamp: Date.now(),
                },
                ...prevNotifs.slice(0, 4),
              ]);

              return {
                ...alert,
                isTriggered: true,
                triggeredAt: Date.now(),
                enabled: alert.recurring,
              };
            }

            return alert;
          });

          return hasChanges ? newAlerts : currentAlerts;
        });

        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Compute portfolio totals
  const totalBalanceUsd = tokens.reduce((sum, t) => sum + t.balance * t.priceUsd, 0);
  const totalChange24hUsd = tokens.reduce((sum, t) => {
    const val = t.balance * t.priceUsd;
    return sum + (val * (t.change24h / 100));
  }, 0);
  const totalChange24hPercent = totalBalanceUsd > 0 ? (totalChange24hUsd / totalBalanceUsd) * 100 : 0;

  /**
   * Send Crypto (reduces balance immediately, writes confirmed transaction, updates localStorage)
   */
  const sendCrypto = async ({
    tokenId,
    toAddress,
    amount,
    feeUsd,
  }: {
    tokenId: string;
    toAddress: string;
    amount: number;
    feeUsd: number;
  }): Promise<{ success: boolean; txHash: string }> => {
    const token = tokens.find((t) => t.id === tokenId);
    if (!token || token.balance < amount) {
      throw new Error(`Insufficient ${token?.symbol || 'token'} balance`);
    }

    // Deduct token balance immediately and store in state
    const newBal = Number((token.balance - amount).toFixed(6));
    setTokens((prev) =>
      prev.map((t) => (t.id === tokenId ? { ...t, balance: newBal } : t))
    );

    const prefix = token.networkId === 'bitcoin' ? '' : '0x';
    const txHash = prefix + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'send',
      tokenSymbol: token.symbol,
      amount,
      amountUsd: amount * token.priceUsd,
      networkId: token.networkId,
      timestamp: Date.now(),
      status: 'confirmed',
      fromAddress: token.address,
      toAddress,
      txHash,
      feeUsd,
    };

    setTransactions((prev) => [newTx, ...prev]);
    return { success: true, txHash };
  };

  /**
   * Store / Deposit Crypto (increases balance immediately and writes confirmed receipt)
   */
  const storeCrypto = async ({
    tokenId,
    amount,
  }: {
    tokenId: string;
    amount: number;
  }): Promise<{ success: boolean; txHash: string }> => {
    const token = tokens.find((t) => t.id === tokenId);
    if (!token || amount <= 0) {
      throw new Error('Invalid token or deposit amount');
    }

    // Add token balance immediately and store in state
    const newBal = Number((token.balance + amount).toFixed(6));
    setTokens((prev) =>
      prev.map((t) => (t.id === tokenId ? { ...t, balance: newBal } : t))
    );

    const prefix = token.networkId === 'bitcoin' ? '' : '0x';
    const txHash = prefix + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'receive',
      tokenSymbol: token.symbol,
      amount,
      amountUsd: amount * token.priceUsd,
      networkId: token.networkId,
      timestamp: Date.now(),
      status: 'confirmed',
      fromAddress: 'On-Chain Blockchain Deposit',
      toAddress: token.address,
      txHash,
      feeUsd: 0.001,
    };

    setTransactions((prev) => [newTx, ...prev]);
    return { success: true, txHash };
  };

  /**
   * Swap Crypto
   */
  const swapCrypto = async ({
    fromTokenId,
    toTokenId,
    fromAmount,
    toAmount,
  }: {
    fromTokenId: string;
    toTokenId: string;
    fromAmount: number;
    toAmount: number;
    slippage: number;
  }): Promise<{ success: boolean; txHash: string }> => {
    const fromToken = tokens.find((t) => t.id === fromTokenId);
    const toToken = tokens.find((t) => t.id === toTokenId);

    if (!fromToken || !toToken || fromToken.balance < fromAmount) {
      throw new Error('Swap parameters invalid or insufficient funds');
    }

    setTokens((prev) =>
      prev.map((t) => {
        if (t.id === fromTokenId) {
          return { ...t, balance: Number((t.balance - fromAmount).toFixed(6)) };
        }
        if (t.id === toTokenId) {
          return { ...t, balance: Number((t.balance + toAmount).toFixed(6)) };
        }
        return t;
      })
    );

    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'swap',
      tokenSymbol: `${fromToken.symbol} ➔ ${toToken.symbol}`,
      amount: fromAmount,
      amountUsd: fromAmount * fromToken.priceUsd,
      networkId: fromToken.networkId,
      timestamp: Date.now(),
      status: 'confirmed',
      fromAddress: fromToken.address,
      toAddress: toToken.address,
      txHash,
      feeUsd: 0.05,
    };

    setTransactions((prev) => [newTx, ...prev]);
    return { success: true, txHash };
  };

  /**
   * Stake Crypto
   */
  const stakeCrypto = async ({
    poolId,
    amount,
    validatorName,
  }: {
    poolId: string;
    amount: number;
    validatorName: string;
  }): Promise<{ success: boolean; positionId: string }> => {
    const pool = STAKING_POOLS.find((p) => p.id === poolId);
    if (!pool) throw new Error('Staking pool not found');

    const token = tokens.find((t) => t.symbol === pool.tokenSymbol && (t.networkId === pool.networkId || pool.networkId === 'polygon'));
    if (!token || token.balance < amount) {
      throw new Error('Insufficient balance to stake');
    }

    setTokens((prev) =>
      prev.map((t) => (t.id === token.id ? { ...t, balance: Number((t.balance - amount).toFixed(6)) } : t))
    );

    const positionId = `stake-${Date.now()}`;
    const newPosition: StakingPosition = {
      id: positionId,
      tokenSymbol: pool.tokenSymbol,
      networkId: pool.networkId,
      stakedAmount: amount,
      stakedAmountUsd: amount * token.priceUsd,
      rewardsPending: 0,
      rewardsPendingUsd: 0,
      apy: pool.apy,
      validatorName,
      startDate: Date.now(),
      lockPeriodDays: pool.lockPeriod.includes('Days') ? 7 : 0,
      status: 'active',
    };

    setStakingPositions((prev) => [newPosition, ...prev]);

    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'stake',
      tokenSymbol: pool.tokenSymbol,
      amount,
      amountUsd: amount * token.priceUsd,
      networkId: pool.networkId,
      timestamp: Date.now(),
      status: 'confirmed',
      fromAddress: token.address,
      toAddress: `Validator: ${validatorName}`,
      txHash,
      feeUsd: 0.02,
    };

    setTransactions((prev) => [newTx, ...prev]);
    return { success: true, positionId };
  };

  /**
   * Claim Staking Rewards
   */
  const claimRewards = async (positionId: string): Promise<boolean> => {
    const pos = stakingPositions.find((p) => p.id === positionId);
    if (!pos || pos.rewardsPending <= 0) return false;

    const rewardAmount = pos.rewardsPending;
    const token = tokens.find((t) => t.symbol === pos.tokenSymbol);

    if (token) {
      setTokens((prev) =>
        prev.map((t) => (t.id === token.id ? { ...t, balance: Number((t.balance + rewardAmount).toFixed(6)) } : t))
      );
    }

    setStakingPositions((prev) =>
      prev.map((p) => (p.id === positionId ? { ...p, rewardsPending: 0, rewardsPendingUsd: 0 } : p))
    );

    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'claim',
      tokenSymbol: pos.tokenSymbol,
      amount: rewardAmount,
      amountUsd: pos.rewardsPendingUsd,
      networkId: pos.networkId,
      timestamp: Date.now(),
      status: 'confirmed',
      fromAddress: `Staking Pool (${pos.validatorName})`,
      toAddress: token?.address || EVM_PRIMARY_ADDRESS,
      txHash,
      feeUsd: 0.01,
    };

    setTransactions((prev) => [newTx, ...prev]);
    return true;
  };

  /**
   * Unstake Position
   */
  const unstakePosition = async (positionId: string): Promise<boolean> => {
    const pos = stakingPositions.find((p) => p.id === positionId);
    if (!pos) return false;

    const token = tokens.find((t) => t.symbol === pos.tokenSymbol);
    const returnAmount = pos.stakedAmount + pos.rewardsPending;

    if (token) {
      setTokens((prev) =>
        prev.map((t) => (t.id === token.id ? { ...t, balance: Number((t.balance + returnAmount).toFixed(6)) } : t))
      );
    }

    setStakingPositions((prev) => prev.filter((p) => p.id !== positionId));
    return true;
  };

  /**
   * Price Alert Management
   */
  const addPriceAlert = (alert: Omit<PriceAlert, 'id' | 'isTriggered'>) => {
    const newAlert: PriceAlert = {
      ...alert,
      id: `alert-${Date.now()}`,
      isTriggered: false,
    };
    setPriceAlerts((prev) => [newAlert, ...prev]);
  };

  const togglePriceAlert = (alertId: string) => {
    setPriceAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const deletePriceAlert = (alertId: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  /**
   * Web3 Provider Simulation Request
   */
  const requestWeb3Action = async (req: Omit<Web3Request, 'id'>): Promise<boolean> => {
    return new Promise((resolve) => {
      const fullReq: Web3Request = {
        ...req,
        id: `web3-req-${Date.now()}`,
      };
      setPendingWeb3Request(fullReq);
      setWeb3Resolver({ resolve });
    });
  };

  const resolveWeb3Request = (approved: boolean) => {
    if (web3Resolver) {
      web3Resolver.resolve(approved);
      setWeb3Resolver(null);
    }
    setPendingWeb3Request(null);
  };

  return (
    <WalletContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        walletMode,
        setWalletMode,
        isSyncingBlockchain,
        lastSyncedAt,
        syncBlockchainData,
        priceFlashMap,
        tokens,
        selectedNetwork,
        setSelectedNetwork,
        isBalanceHidden,
        setIsBalanceHidden,
        wallets,
        activeWallet,
        setActiveWalletId,
        transactions,
        stakingPositions,
        priceAlerts,
        nfts,
        currency,
        setCurrency,
        isLocked,
        lockWallet,
        unlockWallet,
        liveNotifications,
        dismissNotification,
        sendCrypto,
        storeCrypto,
        swapCrypto,
        stakeCrypto,
        claimRewards,
        unstakePosition,
        addPriceAlert,
        togglePriceAlert,
        deletePriceAlert,
        pendingWeb3Request,
        requestWeb3Action,
        resolveWeb3Request,
        totalBalanceUsd,
        totalChange24hUsd,
        totalChange24hPercent,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
