export interface TokenMetadata {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    deployer: string;
    deployedAt: number;
    chainId: number;
    txHash: string;
    verified: boolean;
    badge: 'none' | 'standard' | 'verified' | 'premium';
    features: string[];
    logoURL?: string;
    socialLinks?: {
        website?: string;
        twitter?: string;
        telegram?: string;
        discord?: string;
    };
    liquidityInfo?: {
        added: boolean;
        dex?: string;
        pairAddress?: string;
    };
}

export type BadgeType = 'none' | 'standard' | 'verified' | 'premium';
