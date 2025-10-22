import GMTestnetABI from "../abis/GMTestnetABI.json";
import GMMainnetABI from "../abis/GMMainnetABI.json"; 
import ReferralABI from "../abis/ReferralABI.json";

export const BASE_CHAIN_ID = 8453;
export const BASE_SEPOLIA_CHAIN_ID = 84532;

export const DEPLOY_BLOCK = 0;

export interface ChainConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  contractAddress: string;
  logoUrl: string;
  status: string;
  isTestnet?: boolean;
  abi: any;
}

export const SUPPORTED_CHAINS: Record<number, ChainConfig> = {
  [BASE_CHAIN_ID]: {
    chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
    chainName: "Base",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.base.org", "https://base.llamarpc.com"],
    blockExplorerUrls: ["https://basescan.org"],
    contractAddress: process.env.NEXT_PUBLIC_BASE_MAINNET_CONTRACT_ADDRESS || "0x8A0043A965dF6683A71a87a4B8F33e64290eB3E7",
    logoUrl: "/assets/chains/base.png",
    status: "Ready!",
    isTestnet: false,
    abi: GMMainnetABI, 
  },
  [BASE_SEPOLIA_CHAIN_ID]: {
    chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}`,
    chainName: "Base Sepolia",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorerUrls: ["https://sepolia.basescan.org"],
    contractAddress: process.env.NEXT_PUBLIC_BASE_SEPOLIA_CONTRACT_ADDRESS || "0xA55F30904bC3404AF50F652eAC686651E3dD9DF8",
    logoUrl: "/assets/chains/base.png",
    status: "Ready!",
    isTestnet: true,
    abi: GMTestnetABI, 
  },
};

export const CHECKIN_FEE = "0.000029";
export const DAY_IN_MS = 86400000;

export const getChainConfig = (chainId: number): ChainConfig | undefined => {
  return SUPPORTED_CHAINS[chainId] || undefined;
};

export const isChainSupported = (chainId: number): boolean => {
  return chainId in SUPPORTED_CHAINS;
};

export const getSupportedChainIds = (): number[] => {
  return Object.keys(SUPPORTED_CHAINS).map(Number);
};

export const getContractAddress = (chainId: number): string => {
  const chain = getChainConfig(chainId);
  return chain?.contractAddress || '';
};

export const getChainName = (chainId: number): string => {
  return SUPPORTED_CHAINS[chainId]?.chainName || `Unknown Chain (${chainId})`;
};

export const getNativeCurrencySymbol = (chainId: number): string => {
  return SUPPORTED_CHAINS[chainId]?.nativeCurrency?.symbol || 'ETH';
};

export const isTestnetChain = (chainId: number): boolean => {
  return chainId === BASE_SEPOLIA_CHAIN_ID;
};

export const getMainnetChainIds = (): number[] => {
  return getSupportedChainIds().filter(chainId => !isTestnetChain(chainId));
};

export const getTestnetChainIds = (): number[] => {
  return getSupportedChainIds().filter(chainId => isTestnetChain(chainId));
};

export const formatChainId = (chainId: number): string => {
  return `0x${chainId.toString(16)}`;
};

export const getChainRpcUrl = (chainId: number): string => {
  const chain = getChainConfig(chainId);
  return chain?.rpcUrls[0] || '';
};

export const getChainExplorerUrl = (chainId: number): string => {
  const chain = getChainConfig(chainId);
  return chain?.blockExplorerUrls[0] || '';
};

export const getChainAbi = (chainId: number): any => {
  const chain = getChainConfig(chainId);
  return chain?.abi || GMMainnetABI;
};

export const SUBGRAPH_ENDPOINTS = {
  base: 'https://api.studio.thegraph.com/query/106565/gannet-x-base/version/latest',
} as const;

export const REFERRAL_SUBGRAPH_ENDPOINT = 
  process.env.NEXT_PUBLIC_REFERRAL_SUBGRAPH_URL || 
  'https://api.studio.thegraph.com/query/106565/gannetx-referral-base/version/latest';

export const REFERRAL_CONTRACT_CONFIG = {
  [BASE_CHAIN_ID]: {
    address: process.env.NEXT_PUBLIC_REFERRAL_CONTRACT_ADDRESS || "0x577990A6b1D9403Db0477985787F0d687E77dfB4",
    abi: ReferralABI,
  }
};

export const getReferralContractAddress = (): string => {
  return REFERRAL_CONTRACT_CONFIG[BASE_CHAIN_ID].address;
};

export const getReferralContractAbi = (): any => {
  return REFERRAL_CONTRACT_CONFIG[BASE_CHAIN_ID].abi;
};

export const isReferralSupported = (chainId: number): boolean => {
  return chainId === BASE_CHAIN_ID;
};

export const INK_CHAIN_ID = 57073;
export const SONEIUM_CHAIN_ID = 1868;
export const TEA_SEPOLIA_CHAIN_ID = 10218;