import GMTestnetABI from "../abis/GMTestnetABI.json";
import GMMainnetABI from "../abis/GMMainnetABI.json";
import ReferralABI from "../abis/ReferralABI.json";

export const BASE_CHAIN_ID = 8453;
export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const SONEIUM_CHAIN_ID = 1868;
export const INK_CHAIN_ID = 57073;
export const OP_CHAIN_ID = 10;
export const LISK_CHAIN_ID = 1135;
export const LINEA_CHAIN_ID = 59144;

export const GANNETX_CHAT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_GANNETX_CHAT_CONTRACT_ADDRESS || "0x4Be81a2966d52F1d7c5A9170e57DB7A8604186E5";
export const GANNETX_TOKEN_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_GANNETX_TOKEN_FACTORY_ADDRESS || "0x08B6E11A433fceF7b56bf9DDE331feA2f881AF3c";
export const BASE_RPC = process.env.BASE_MAINNET_RPC_URL || "https://mainnet.base.org";
export const BASE_SEPOLIA_RPC = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";

export const TEA_SEPOLIA_CHAIN_ID = 10218;
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
  // Mainnet
  [BASE_CHAIN_ID]: {
    chainId: `0x${BASE_CHAIN_ID.toString(16)}`,
    chainName: "Base",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.base.org", "https://base.llamarpc.com", "https://base-rpc.publicnode.com"],
    blockExplorerUrls: ["https://basescan.org"],
    contractAddress: process.env.NEXT_PUBLIC_BASE_MAINNET_CONTRACT_ADDRESS || "0x8A0043A965dF6683A71a87a4B8F33e64290eB3E7",
    logoUrl: "/assets/chains/base.png",
    status: "Ready!",
    isTestnet: false,
    abi: GMMainnetABI,
  },
  [SONEIUM_CHAIN_ID]: {
    chainId: `0x${SONEIUM_CHAIN_ID.toString(16)}`,
    chainName: "Soneium",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.soneium.org", "https://soneium-mainnet.rpc.caldera.xyz/http"],
    blockExplorerUrls: ["https://soneium.blocksout.com"],
    contractAddress: process.env.NEXT_PUBLIC_SONEIUM_MAINNET_CONTRACT_ADDRESS || "0xc636516508f8798c1d5F019A2C73BD7442213D94",
    logoUrl: "/assets/chains/soneium.png",
    status: "Ready!",
    isTestnet: false,
    abi: GMMainnetABI,
  },
  [INK_CHAIN_ID]: {
    chainId: `0x${INK_CHAIN_ID.toString(16)}`,
    chainName: "Ink",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://rpc-gel.inkonchain.com", "https://rpc-qnd.inkonchain.com"],
    blockExplorerUrls: ["https://explorer.inkonchain.com"],
    contractAddress: process.env.NEXT_PUBLIC_INK_MAINNET_CONTRACT_ADDRESS || "0x02a9107Bf30a38fEddA30FB83cC01ff5b44dC935",
    logoUrl: "/assets/chains/ink.png",
    status: "Ready!",
    isTestnet: false,
    abi: GMMainnetABI,
  },
  [OP_CHAIN_ID]: {
    chainId: `0x${OP_CHAIN_ID.toString(16)}`,
    chainName: "Optimism",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.optimism.io"],
    blockExplorerUrls: ["https://optimistic.etherscan.io"],
    contractAddress: process.env.NEXT_PUBLIC_OP_MAINNET_CONTRACT_ADDRESS || "0xa1Aa620CEb55448cd871c381457b87eFbFd34eA7",
    logoUrl: "/assets/chains/optimism.png",
    status: "Ready!",
    isTestnet: false,
    abi: GMMainnetABI,
  },
  [LISK_CHAIN_ID]: {
    chainId: `0x${LISK_CHAIN_ID.toString(16)}`,
    chainName: "Lisk",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.api.lisk.com"],
    blockExplorerUrls: ["https://blockscout.lisk.com"],
    contractAddress: process.env.NEXT_PUBLIC_LISK_MAINNET_CONTRACT_ADDRESS || "", // Needs env var or placeholder if empty in main
    logoUrl: "/assets/chains/lisk.png",
    status: "Ready!",
    isTestnet: false,
    abi: GMMainnetABI,
  },
  [LINEA_CHAIN_ID]: {
    chainId: `0x${LINEA_CHAIN_ID.toString(16)}`,
    chainName: "Linea",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://rpc.linea.build"],
    blockExplorerUrls: ["https://lineascan.build/"],
    contractAddress: process.env.NEXT_PUBLIC_LINEA_MAINNET_CONTRACT_ADDRESS || "", // Needs env var or placeholder
    logoUrl: "/assets/chains/linea.png",
    status: "Ready!",
    isTestnet: false,
    abi: GMMainnetABI,
  },

  // Testnet (Base Sepolia kept as it was there)
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
  const chainConfig = SUPPORTED_CHAINS[chainId];
  return chainConfig?.isTestnet === true;
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
  ink: 'https://api.studio.thegraph.com/query/106565/gannetx-ink/version/latest',
  soneium: 'https://api.studio.thegraph.com/query/106565/gannet-x-soneium/version/latest',
  op: 'https://api.studio.thegraph.com/query/110002/gannet-x-op/version/latest',
  linea: 'https://api.studio.thegraph.com/query/110002/gannet-x-linea/version/latest'
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