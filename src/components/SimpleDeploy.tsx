import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { ArrowLeft, Zap, AlertCircle } from 'lucide-react';
import { useWalletState } from '@/hooks/useWalletState';
import {
    BASE_CHAIN_ID,
    SUPPORTED_CHAINS,
} from '@/utils/constants';
import { SIMPLE_DEPLOY_ADDRESSES, SIMPLE_DEPLOY_ABI } from '@/utils/constantsDeploy';
import { switchToChain, getProvider } from '@/utils/web3';
import ChainLogo from '@/components/ChainLogo';
import {
    Transaction,
    TransactionButton,
    TransactionStatus,
    TransactionStatusLabel,
    TransactionStatusAction,
    LifecycleStatus
} from '@coinbase/onchainkit/transaction';
import { useAccount } from 'wagmi';

// Filter for only Mainnet chains that are enabled in Simple Deploy
const DISPLAY_CHAINS = Object.values(SUPPORTED_CHAINS)
    .filter(chain => !chain.isTestnet)
    .sort((a, b) => a.chainName.localeCompare(b.chainName));

interface SimpleDeployProps {
    onBack?: () => void;
}

const SimpleDeploy: React.FC<SimpleDeployProps> = ({ onBack }) => {
    const { web3State, switchNetwork } = useWalletState();
    const { address } = useAccount();
    const [selectedChain, setSelectedChain] = useState<number | null>(BASE_CHAIN_ID);
    const [message, setMessage] = useState('');
    const [deploymentFee, setDeploymentFee] = useState<string>('0');
    const [isSwitchingChain, setIsSwitchingChain] = useState(false);

    // Initial chain sync
    useEffect(() => {
        if (web3State.chainId && SIMPLE_DEPLOY_ADDRESSES[web3State.chainId]) {
            setSelectedChain(web3State.chainId);
        }
    }, [web3State.chainId]);

    // Fetch fee
    useEffect(() => {
        const fetchFee = async () => {
            if (!selectedChain) return;
            const contractAddress = SIMPLE_DEPLOY_ADDRESSES[selectedChain];
            if (!contractAddress) return;

            try {
                const provider = web3State.provider || getProvider();
                if (!provider) return;

                const contract = new ethers.Contract(contractAddress, SIMPLE_DEPLOY_ABI, provider);
                const fee = await contract.deploymentFee();
                setDeploymentFee(ethers.utils.formatEther(fee));
            } catch (error) {
                console.error("Error fetching fee:", error);
            }
        };
        fetchFee();
    }, [selectedChain, web3State.provider]);

    const handleChainSelect = async (chainId: number) => {
        if (isSwitchingChain) return;
        setIsSwitchingChain(true);
        try {
            if (web3State.chainId !== chainId) {
                await switchNetwork(chainId);
            }
            setSelectedChain(chainId);
        } catch (error) {
            console.error("Failed to switch:", error);
            toast.error("Failed to switch network.");
        } finally {
            setIsSwitchingChain(false);
        }
    };

    const handleOnStatus = (status: LifecycleStatus) => {
        console.log('Transaction Status:', status);
        // Optional: Add toast updates based on status if needed, but OnchainKit handles UI well.
        if (status.statusName === 'success') {
            toast.success('Contract Deployed Successfully!');
            setMessage('');
        }
    };

    // Construct calls for OnchainKit
    const getTransactionCalls = () => {
        if (!selectedChain || !message) return [];
        const contractAddress = SIMPLE_DEPLOY_ADDRESSES[selectedChain];
        if (!contractAddress) return [];

        try {
            // Pre-encode data to avoid TS "excessively deep" instantiation errors with ABI
            const iface = new ethers.utils.Interface(SIMPLE_DEPLOY_ABI);
            const data = iface.encodeFunctionData('deployContract', [message]);

            return [
                {
                    to: contractAddress as `0x${string}`,
                    data: data as `0x${string}`,
                    value: ethers.utils.parseEther(deploymentFee).toBigInt(),
                },
            ];
        } catch (err) {
            console.error("Error encoding tx data:", err);
            return [];
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 pb-24">
            <div className="bg-[#0B0E14]/60 backdrop-blur-xl rounded-2xl border border-white/5 shadow-lg p-6">
                <div className="flex items-center gap-4 mb-6">
                    {onBack && (
                        <button onClick={onBack} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <Zap className="text-cyan-400 w-6 h-6" />
                            <h2 className="font-bold text-white text-xl">Simple Deploy</h2>
                        </div>
                        <p className="text-sm text-gray-400">Deploy a contract to Base instantly</p>
                    </div>
                </div>

                {/* Chain Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-3">Target Network</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                        {DISPLAY_CHAINS.map((chain) => {
                            const cid = parseInt(chain.chainId, 16);
                            return (
                                <button
                                    key={cid}
                                    onClick={() => handleChainSelect(cid)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${selectedChain === cid
                                        ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                                        : 'bg-[#0B0E14] border-white/10 hover:border-white/20'}`}
                                >
                                    <ChainLogo
                                        logoUrl={chain.logoUrl}
                                        altText={chain.chainName}
                                        size="sm"
                                    />
                                    <span className={`text-xs font-medium truncate ${selectedChain === cid ? 'text-white' : 'text-gray-400'}`}>
                                        {chain.chainName}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Message Input */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Deployment Message</label>
                    <input
                        type="text"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Hello Base!"
                        className="w-full px-4 py-3 bg-[#0B0E14] border border-white/10 rounded-lg focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-white placeholder-gray-600"
                    />
                    <p className="text-xs text-gray-500 mt-2">This message will be permanently stored on-chain.</p>
                </div>

                {/* Info & Action */}
                {selectedChain && (
                    <div className="p-4 bg-cyan-500/5 rounded-lg border border-cyan-500/10 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="text-cyan-100 font-medium">Fee Estimate</p>
                            <p className="text-cyan-400/60 mt-1">{deploymentFee} ETH + Gas</p>
                            <p className="text-xs text-gray-500 mt-2">
                                Smart Wallets & Paymasters supported.
                            </p>
                        </div>
                    </div>
                )}

                {/* OnchainKit Transaction Component */}
                {address && selectedChain ? (
                    <Transaction
                        calls={getTransactionCalls()}
                        chainId={selectedChain}
                        onStatus={handleOnStatus}
                    >
                        <TransactionButton
                            text="Deploy Contract"
                            className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                        />
                        <TransactionStatus>
                            <TransactionStatusLabel />
                            <TransactionStatusAction />
                        </TransactionStatus>
                    </Transaction>
                ) : (
                    <button
                        disabled
                        className="w-full py-4 rounded-xl font-bold text-lg bg-white/5 text-gray-500 cursor-not-allowed border border-white/5"
                    >
                        Connect Wallet to Deploy
                    </button>
                )}
            </div>
        </div>
    );
};

export default SimpleDeploy;
