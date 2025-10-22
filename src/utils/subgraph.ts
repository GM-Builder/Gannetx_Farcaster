import { 
  BASE_CHAIN_ID, 
  INK_CHAIN_ID, 
  SONEIUM_CHAIN_ID 
} from './constants';

export const SUBGRAPH_ENDPOINTS = {
  base: 'https://api.studio.thegraph.com/query/106565/gannet-x-base/version/latest',
  ink: 'https://api.studio.thegraph.com/query/106565/gannetx-ink/version/latest',
  soneium: 'https://api.studio.thegraph.com/query/106565/gannet-x-soneium/version/latest',
} as const;

export type ChainName = keyof typeof SUBGRAPH_ENDPOINTS;

export const SUPPORTED_CHAINS: ChainName[] = ['base', 'ink', 'soneium'];

// Mapping Chain ID (number) ke ChainName (string)
export const CHAIN_ID_TO_NAME: Record<number, ChainName> = {
  [BASE_CHAIN_ID]: 'base',
  [INK_CHAIN_ID]: 'ink',
  [SONEIUM_CHAIN_ID]: 'soneium',
};

// Mapping ChainName (string) ke Chain ID (number)
export const CHAIN_NAME_TO_ID: Record<ChainName, number> = {
  base: BASE_CHAIN_ID,
  ink: INK_CHAIN_ID,
  soneium: SONEIUM_CHAIN_ID,
};

// Helper functions
export function chainIdToName(chainId: number): ChainName | undefined {
  return CHAIN_ID_TO_NAME[chainId];
}

export function chainNameToId(chainName: ChainName): number {
  return CHAIN_NAME_TO_ID[chainName];
}