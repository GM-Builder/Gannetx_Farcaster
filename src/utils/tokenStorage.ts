import { TokenMetadata } from '@/types/token';

const STORAGE_KEY = 'gannetx_deployed_tokens';
const USER_TOKENS_KEY = 'gannetx_user_tokens';

export const saveTokenMetadata = (metadata: TokenMetadata): void => {
    try {
        const existing = getAllTokens();
        const updated = [...existing.filter(t => t.address !== metadata.address), metadata];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        const userTokens = getUserTokens(metadata.deployer);
        const updatedUserTokens = [...userTokens.filter(addr => addr !== metadata.address), metadata.address];
        localStorage.setItem(`${USER_TOKENS_KEY}_${metadata.deployer}`, JSON.stringify(updatedUserTokens));
    } catch (error) {
        console.error('Failed to save token metadata:', error);
    }
};

export const getTokenMetadata = (address: string): TokenMetadata | null => {
    try {
        const tokens = getAllTokens();
        return tokens.find(t => t.address.toLowerCase() === address.toLowerCase()) || null;
    } catch (error) {
        console.error('Failed to get token metadata:', error);
        return null;
    }
};

export const getAllTokens = (): TokenMetadata[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to get all tokens:', error);
        return [];
    }
};

export const getUserTokens = (userAddress: string): string[] => {
    try {
        const stored = localStorage.getItem(`${USER_TOKENS_KEY}_${userAddress}`);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to get user tokens:', error);
        return [];
    }
};

export const updateTokenBadge = (address: string, badge: TokenMetadata['badge']): void => {
    const token = getTokenMetadata(address);
    if (token) {
        token.badge = badge;
        token.verified = badge !== 'none';
        saveTokenMetadata(token);
    }
};

export const updateTokenSocialLinks = (address: string, socialLinks: TokenMetadata['socialLinks']): void => {
    const token = getTokenMetadata(address);
    if (token) {
        token.socialLinks = { ...token.socialLinks, ...socialLinks };
        saveTokenMetadata(token);
    }
};
