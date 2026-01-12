import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useAccount, useSwitchChain, useConnect, useDisconnect } from "wagmi";
import { useDirectProvider } from "./useEthersProvider";
import { getContract, getChainConfig, isChainSupported } from "@/utils/web3";

export interface Web3State {
    isConnected: boolean;
    address: string | null;
    provider: ethers.providers.Web3Provider | null;
    signer: ethers.Signer | null;
    contract: ethers.Contract | null;
    isLoading: boolean;
    error: string | null;
    chainId: number | null;
    referralContract: ethers.Contract | null;
    isOnReferralChain: boolean;
    hasReferrer: boolean;
    referredBy: string | null;
}

export function useWalletState() {
    const { address, isConnected, chainId } = useAccount();
    const { provider, signer } = useDirectProvider();
    const { switchChainAsync } = useSwitchChain();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();

    const [web3State, setWeb3State] = useState<Web3State>({
        isConnected: false,
        address: null,
        provider: null,
        signer: null,
        contract: null,
        isLoading: false,
        error: null,
        chainId: null,
        referralContract: null,
        isOnReferralChain: false,
        hasReferrer: false,
        referredBy: null,
    });

    useEffect(() => {
        let contract: ethers.Contract | null = null;

        if (isConnected && address && provider && signer && chainId) {
            try {
                // getContract might throw if checks fail, just wrap
                contract = getContract(signer, chainId);
            } catch (e) {
                // ignore
            }
        }

        setWeb3State(prev => ({
            ...prev,
            isConnected: !!(isConnected && address),
            address: address || null,
            provider: provider || null,
            signer: signer || null,
            contract: contract,
            chainId: chainId || null,
            isLoading: false
        }));

    }, [isConnected, address, provider, signer, chainId]);

    const handleSwitchNetwork = useCallback(async (targetChainId?: number) => {
        try {
            if (!targetChainId) return false;
            await switchChainAsync({ chainId: targetChainId });
            return true;
        } catch (e) {
            console.error("Switch network failed", e);
            return false;
        }
    }, [switchChainAsync]);

    const connectWallet = useCallback(async () => {
        try {
            const injected = connectors.find(c => c.id === 'injected');
            if (injected) {
                connect({ connector: injected });
            } else {
                // fallback to first available if not injected (e.g. coinbase)
                if (connectors.length > 0) connect({ connector: connectors[0] });
            }
        } catch (e) {
            console.error("Connect failed", e);
        }
    }, [connect, connectors]);

    return {
        web3State,
        connectWallet,
        disconnectWallet: disconnect,
        switchNetwork: handleSwitchNetwork,
        isOnSupportedNetwork: useCallback(() => chainId ? isChainSupported(chainId) : false, [chainId]),
        getCurrentChainInfo: useCallback(() => chainId ? getChainConfig(chainId) : null, [chainId]),
        refreshReferralStatus: () => { },
        isMiniApp: true,
    };
}
