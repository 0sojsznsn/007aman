export type NetworkId = 
  | 'all'
  | 'bitcoin'
  | 'polygon'
  | 'ethereum'
  | 'bsc'
  | 'solana'
  | 'arbitrum'
  | 'avalanche';

export type WalletMode = 'live' | 'demo';

export interface Network {
  id: NetworkId;
  name: string;
  symbol: string;
  icon: string;
  color: string;
  address: string;
  explorerUrl: string;
  isEvm?: boolean;
}

export interface Token {
  id: string;
  name: string;
  symbol: string;
  networkId: NetworkId;
  networkName: string;
  balance: number;
  priceUsd: number;
  change24h: number;
  icon: string;
  address: string;
  decimals: number;
  isPopular?: boolean;
  history24h?: number[];
}

export interface NFTItem {
  id: string;
  name: string;
  collection: string;
  networkId: NetworkId;
  imageUrl: string;
  floorPrice: number;
  tokenId: string;
  acquiredDate: string;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'stake' | 'claim';
  tokenSymbol: string;
  amount: number;
  amountUsd: number;
  networkId: NetworkId;
  timestamp: number;
  status: 'confirmed' | 'pending' | 'failed';
  fromAddress: string;
  toAddress: string;
  txHash: string;
  feeUsd: number;
}

export interface StakingPosition {
  id: string;
  tokenSymbol: string;
  networkId: NetworkId;
  stakedAmount: number;
  stakedAmountUsd: number;
  rewardsPending: number;
  rewardsPendingUsd: number;
  apy: number;
  validatorName: string;
  startDate: number;
  lockPeriodDays: number;
  status: 'active' | 'cooldown' | 'unstaked';
}

export interface StakingPool {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  networkId: NetworkId;
  networkName: string;
  apy: number;
  minStake: number;
  lockPeriod: string;
  validators: {
    name: string;
    commission: number;
    uptime: string;
    votingPower: string;
  }[];
  totalStaked: string;
  icon: string;
  color: string;
}

export interface PriceAlert {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  targetPrice: number;
  currentPriceAtCreation: number;
  direction: 'above' | 'below';
  isTriggered: boolean;
  triggeredAt?: number;
  enabled: boolean;
  recurring: boolean;
  networkId: NetworkId;
}

export interface DAppItem {
  id: string;
  name: string;
  url: string;
  category: 'DeFi' | 'NFT' | 'Yield' | 'Bridge' | 'Gaming';
  icon: string;
  description: string;
  supportedNetworks: NetworkId[];
  isFeatured?: boolean;
}

export interface Web3Request {
  id: string;
  dappName: string;
  dappIcon: string;
  dappUrl: string;
  method: 'eth_sendTransaction' | 'personal_sign' | 'eth_signTypedData';
  networkId: NetworkId;
  payload: {
    to?: string;
    value?: string;
    data?: string;
    message?: string;
    estimatedGasUsd?: number;
  };
}

export interface WalletAccount {
  id: string;
  name: string;
  avatarSeed: string;
  isHardware?: boolean;
  createdAt: number;
}
