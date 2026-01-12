import React, { useState, useMemo } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Disc, Settings, Shield, Zap, CheckCircle2, ArrowRight, ArrowLeft,
    Sparkles, Info, Copy, ExternalLink, AlertTriangle, TrendingUp,
    AlertCircle, Wallet, Bot, BarChart3, Clock, Ban, PauseCircle,
    Flame, Gem, FileCheck
} from 'lucide-react';
import FactoryABI from '@/abis/GannetXTokenFactory.json';
import { GANNETX_TOKEN_FACTORY_ADDRESS, BASE_CHAIN_ID } from '@/utils/constants';
import { switchToChain, getProvider } from '@/utils/web3';
import { useWalletState } from '@/hooks/useWalletState';
import { saveTokenMetadata, getTokenMetadata } from '@/utils/tokenStorage';
import { TokenMetadata } from '@/types/token';
import TokenBadge from '@/components/TokenBadge';

interface TokenConfig {
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    taxRecipient: string;
    buyTax: number;
    sellTax: number;
    maxTxAmount: string;
    maxWalletAmount: string;
    cooldownTime: number;
    burnPercentage: number;
    reflectionPercentage: number;
}

interface Features {
    hasTaxSystem: boolean;
    hasAntiBot: boolean;
    hasMaxTxLimit: boolean;
    hasMaxWallet: boolean;
    hasCooldown: boolean;
    hasBlacklist: boolean;
    isPausable: boolean;
    hasBurn: boolean;
    hasReflection: boolean;
    hasWhitelist: boolean;
}

const STEPS = [
    { id: 1, name: 'Basic', icon: Disc },
    { id: 2, name: 'Features', icon: Settings },
    { id: 3, name: 'Advanced', icon: Shield },
    { id: 4, name: 'Review', icon: CheckCircle2 },
];

const FEATURE_FEES = {
    BASE_FEE: '0.0001',
    TAX_SYSTEM_FEE: '0.0003',
    ANTI_BOT_FEE: '0.0002',
    MAX_TX_LIMIT_FEE: '0.0001',
    MAX_WALLET_FEE: '0.0001',
    COOLDOWN_FEE: '0.0001',
    BLACKLIST_FEE: '0.0002',
    PAUSABLE_FEE: '0.0001',
    BURN_FEE: '0.0002',
    REFLECTION_FEE: '0.0003',
    WHITELIST_FEE: '0.0001',
};

const TokenFactory: React.FC = () => {
    const { web3State, switchNetwork } = useWalletState();
    const [currentStep, setCurrentStep] = useState(1);
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployedToken, setDeployedToken] = useState<string | null>(null);

    const [config, setConfig] = useState<TokenConfig>({
        name: '', symbol: '', decimals: 18, totalSupply: '1000000',
        taxRecipient: '', buyTax: 0, sellTax: 0,
        maxTxAmount: '', maxWalletAmount: '', cooldownTime: 30,
        burnPercentage: 0, reflectionPercentage: 0,
    });

    const [features, setFeatures] = useState<Features>({
        hasTaxSystem: false, hasAntiBot: false, hasMaxTxLimit: false,
        hasMaxWallet: false, hasCooldown: false, hasBlacklist: false,
        isPausable: false, hasBurn: false, hasReflection: false, hasWhitelist: false,
    });

    const totalFee = useMemo(() => {
        let fee = parseFloat(FEATURE_FEES.BASE_FEE);
        if (features.hasTaxSystem) fee += parseFloat(FEATURE_FEES.TAX_SYSTEM_FEE);
        if (features.hasAntiBot) fee += parseFloat(FEATURE_FEES.ANTI_BOT_FEE);
        if (features.hasMaxTxLimit) fee += parseFloat(FEATURE_FEES.MAX_TX_LIMIT_FEE);
        if (features.hasMaxWallet) fee += parseFloat(FEATURE_FEES.MAX_WALLET_FEE);
        if (features.hasCooldown) fee += parseFloat(FEATURE_FEES.COOLDOWN_FEE);
        if (features.hasBlacklist) fee += parseFloat(FEATURE_FEES.BLACKLIST_FEE);
        if (features.isPausable) fee += parseFloat(FEATURE_FEES.PAUSABLE_FEE);
        if (features.hasBurn) fee += parseFloat(FEATURE_FEES.BURN_FEE);
        if (features.hasReflection) fee += parseFloat(FEATURE_FEES.REFLECTION_FEE);
        if (features.hasWhitelist) fee += parseFloat(FEATURE_FEES.WHITELIST_FEE);
        return fee.toFixed(4);
    }, [features]);

    const canProceed = useMemo(() => {
        if (currentStep === 1) return config.name && config.symbol && config.totalSupply;
        if (currentStep === 2) {
            if (features.hasTaxSystem && !config.taxRecipient) return false;
            return true;
        }
        return true;
    }, [currentStep, config, features]);

    const handleDeploy = async () => {
        if (!web3State.isConnected) {
            toast.error('Please connect your wallet');
            return;
        }

        setIsDeploying(true);
        const toastId = toast.loading('Preparing deployment...');

        try {
            if (web3State.chainId !== BASE_CHAIN_ID) {
                toast.loading('Switching to Base...', { id: toastId });
                await switchNetwork(BASE_CHAIN_ID); // Use adapter func
            }

            const signer = web3State.signer; // Should be available after switch ideally, or adapter updates
            if (!signer) throw new Error("Signer unavailable");

            const factory = new ethers.Contract(GANNETX_TOKEN_FACTORY_ADDRESS, FactoryABI, signer);

            const tokenConfig = {
                name: config.name,
                symbol: config.symbol,
                decimals: config.decimals,
                totalSupply: ethers.utils.parseEther(config.totalSupply),
                taxRecipient: config.taxRecipient || web3State.address,
                buyTax: config.buyTax * 100,
                sellTax: config.sellTax * 100,
                maxTxAmount: config.maxTxAmount ? ethers.utils.parseEther(config.maxTxAmount) : 0,
                maxWalletAmount: config.maxWalletAmount ? ethers.utils.parseEther(config.maxWalletAmount) : 0,
                cooldownTime: config.cooldownTime,
                burnPercentage: config.burnPercentage * 100,
                reflectionPercentage: config.reflectionPercentage * 100,
            };

            toast.loading('Waiting for confirmation...', { id: toastId });
            const tx = await factory.deployToken(tokenConfig, features, {
                value: ethers.utils.parseEther(totalFee),
            });

            toast.loading('Deploying token...', { id: toastId });
            const receipt = await tx.wait();

            const event = receipt.logs.find((log: any) => {
                try { return factory.interface.parseLog(log).name === 'TokenDeployed'; } catch { return false; }
            });

            if (!event) throw new Error('TokenDeployed event not found');

            const parsedEvent = factory.interface.parseLog(event);
            const tokenAddress = parsedEvent.args[0];
            setDeployedToken(tokenAddress);

            const tokenMetadata: TokenMetadata = {
                address: tokenAddress,
                name: config.name,
                symbol: config.symbol,
                decimals: config.decimals,
                totalSupply: config.totalSupply,
                deployer: web3State.address || '',
                deployedAt: Date.now(),
                chainId: BASE_CHAIN_ID,
                txHash: receipt.transactionHash,
                verified: true,
                badge: 'standard',
                features: Object.entries(features).filter(([_, v]) => v).map(([k]) => k.replace(/has|is/g, '')),
            };

            saveTokenMetadata(tokenMetadata);
            toast.success('Token deployed!', { id: toastId });
            setCurrentStep(5);

        } catch (error: any) {
            console.error(error);
            toast.error(error.reason || error.message || 'Deployment failed', { id: toastId });
        } finally {
            setIsDeploying(false);
        }
    };

    return (
        <div className="bg-[#050608] text-white p-4 pb-24 min-h-screen">
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {/* Steps Nav */}
                    {currentStep < 5 && (
                        <div className="flex justify-between mb-8 overflow-x-auto">
                            {STEPS.map((s, i) => (
                                <div key={s.id} className="flex flex-col items-center min-w-[60px]">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= s.id ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
                                        <s.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`text-[10px] mt-2 ${currentStep >= s.id ? 'text-cyan-400' : 'text-gray-500'}`}>{s.name}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="bg-[#0B0E14]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl">
                        {currentStep === 1 && <Step1BasicInfo config={config} setConfig={setConfig} />}
                        {currentStep === 2 && <Step2Features features={features} setFeatures={setFeatures} config={config} setConfig={setConfig} />}
                        {currentStep === 3 && <Step3Advanced config={config} setConfig={setConfig} features={features} />}
                        {currentStep === 4 && <Step4Review config={config} features={features} totalFee={totalFee} />}
                        {currentStep === 5 && <Step5Success tokenAddress={deployedToken} config={config} />}
                    </div>

                    {/* Nav Buttons */}
                    {currentStep < 5 && (
                        <div className="mt-6 flex gap-4">
                            {currentStep > 1 && (
                                <button onClick={() => setCurrentStep(prev => prev - 1)} className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                            )}
                            {currentStep < 4 ? (
                                <button onClick={() => setCurrentStep(prev => prev + 1)} disabled={!canProceed} className="flex-1 px-6 py-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    Continue <ArrowRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button onClick={handleDeploy} disabled={isDeploying} className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                                    {isDeploying ? 'Deploying...' : 'Deploy Token'} <Zap className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-[#0B0E14]/60 border border-white/10 rounded-xl p-6 sticky top-4">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Wallet className="text-cyan-400" /> Cost Breakdown</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-gray-400">Base Fee</span><span>{FEATURE_FEES.BASE_FEE} ETH</span></div>
                            {/* Simplified list for sidebar */}
                            <div className="pt-2 border-t border-white/10 flex justify-between font-bold">
                                <span>Total</span><span className="text-cyan-400">{totalFee} ETH</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Step1BasicInfo: React.FC<any> = ({ config, setConfig }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Disc className="text-cyan-400" /> Token Basics</h3>
        <div>
            <label className="text-sm text-gray-300">Name</label>
            <input type="text" value={config.name} onChange={e => setConfig({ ...config, name: e.target.value })} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" placeholder="My Token" />
        </div>
        <div>
            <label className="text-sm text-gray-300">Symbol</label>
            <input type="text" value={config.symbol} onChange={e => setConfig({ ...config, symbol: e.target.value.toUpperCase() })} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 outline-none font-mono" placeholder="TKN" />
        </div>
        <div>
            <label className="text-sm text-gray-300">Supply</label>
            <input type="number" value={config.totalSupply} onChange={e => setConfig({ ...config, totalSupply: e.target.value })} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg p-3 text-white focus:border-cyan-500 outline-none font-mono" placeholder="1000000" />
        </div>
        <div>
            <label className="text-sm text-gray-300">Decimals (Default 18)</label>
            <select value={config.decimals} onChange={e => setConfig({ ...config, decimals: Number(e.target.value) })} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg p-3 text-white">
                {[6, 8, 9, 18].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
        </div>
    </div>
);

const Step2Features: React.FC<any> = ({ features, setFeatures, config, setConfig }) => {
    const toggle = (k: string) => setFeatures({ ...features, [k]: !features[k] });
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2"><Settings className="text-cyan-400" /> Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                    { k: 'hasTaxSystem', l: 'Tax System', f: FEATURE_FEES.TAX_SYSTEM_FEE },
                    { k: 'hasAntiBot', l: 'Anti-Bot', f: FEATURE_FEES.ANTI_BOT_FEE },
                    { k: 'hasMaxTxLimit', l: 'Max Tx Limit', f: FEATURE_FEES.MAX_TX_LIMIT_FEE },
                    { k: 'hasMaxWallet', l: 'Max Wallet', f: FEATURE_FEES.MAX_WALLET_FEE },
                    { k: 'hasCooldown', l: 'Cooldown', f: FEATURE_FEES.COOLDOWN_FEE },
                    { k: 'hasBurn', l: 'Auto Burn', f: FEATURE_FEES.BURN_FEE },
                    { k: 'hasReflection', l: 'Reflections', f: FEATURE_FEES.REFLECTION_FEE },
                ].map(item => (
                    <button key={item.k} onClick={() => toggle(item.k)} className={`p-3 rounded-lg border text-left transition-all ${features[item.k] ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-[#0B0E14] border-white/10'}`}>
                        <div className="font-semibold text-white text-sm">{item.l}</div>
                        <div className="text-xs text-cyan-400">+{item.f} ETH</div>
                    </button>
                ))}
            </div>
            {features.hasTaxSystem && (
                <div className="mt-4 p-4 bg-black/20 rounded-lg border border-white/10 space-y-3">
                    <p className="text-sm font-bold text-cyan-400">Tax Config</p>
                    <input type="text" placeholder="Recipient Address (0x...)" value={config.taxRecipient} onChange={e => setConfig({ ...config, taxRecipient: e.target.value })} className="w-full p-2 bg-[#0B0E14] border border-white/10 rounded text-xs text-white" />
                    <div className="flex gap-2">
                        <input type="number" placeholder="Buy Tax %" value={config.buyTax} onChange={e => setConfig({ ...config, buyTax: Number(e.target.value) })} className="w-1/2 p-2 bg-[#0B0E14] border border-white/10 rounded text-xs text-white" />
                        <input type="number" placeholder="Sell Tax %" value={config.sellTax} onChange={e => setConfig({ ...config, sellTax: Number(e.target.value) })} className="w-1/2 p-2 bg-[#0B0E14] border border-white/10 rounded text-xs text-white" />
                    </div>
                </div>
            )}
        </div>
    );
};

const Step3Advanced: React.FC<any> = ({ config, setConfig, features }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Shield className="text-cyan-400" /> Advanced</h3>
        {!features.hasMaxTxLimit && !features.hasMaxWallet && !features.hasCooldown && <p className="text-gray-500 text-sm">No advanced features selected.</p>}

        {features.hasMaxTxLimit && (
            <div><label className="text-xs text-gray-400">Max Tx Amount</label><input type="text" value={config.maxTxAmount} onChange={e => setConfig({ ...config, maxTxAmount: e.target.value })} className="w-full p-2 bg-[#0B0E14] border border-white/10 rounded text-white" /></div>
        )}
        {features.hasMaxWallet && (
            <div><label className="text-xs text-gray-400">Max Wallet Amount</label><input type="text" value={config.maxWalletAmount} onChange={e => setConfig({ ...config, maxWalletAmount: e.target.value })} className="w-full p-2 bg-[#0B0E14] border border-white/10 rounded text-white" /></div>
        )}
        {features.hasCooldown && (
            <div><label className="text-xs text-gray-400">Cooldown (sec)</label><input type="number" value={config.cooldownTime} onChange={e => setConfig({ ...config, cooldownTime: Number(e.target.value) })} className="w-full p-2 bg-[#0B0E14] border border-white/10 rounded text-white" /></div>
        )}
    </div>
);

const Step4Review: React.FC<any> = ({ config, features, totalFee }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2"><CheckCircle2 className="text-cyan-400" /> Review</h3>
        <div className="bg-[#0B0E14] p-4 rounded-lg border border-white/10">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xl font-bold text-white">{config.name}</span>
                <span className="font-mono text-cyan-400">${config.symbol}</span>
            </div>
            <div className="text-sm text-gray-400 mb-4">{Number(config.totalSupply).toLocaleString()} Supply</div>
            <div className="space-y-1">
                {Object.entries(features).filter(([_, v]) => v).map(([k]) => (
                    <div key={k} className="flex items-center gap-2 text-xs text-green-400"><CheckCircle2 className="w-3 h-3" /> {k.replace('has', '')}</div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between font-bold text-white">
                <span>Total Fee</span>
                <span>{totalFee} ETH</span>
            </div>
        </div>
    </div>
);

const Step5Success: React.FC<any> = ({ tokenAddress, config }) => (
    <div className="text-center space-y-4 py-8">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">Deployed!</h2>
        <p className="text-gray-400">Your token is live on Base.</p>
        {tokenAddress && (
            <div className="bg-[#0B0E14] p-3 rounded-lg border border-white/10 flex items-center justify-between gap-2 mt-4">
                <span className="font-mono text-cyan-400 text-sm truncate">{tokenAddress}</span>
                <button onClick={() => { navigator.clipboard.writeText(tokenAddress); toast.success('Copied!') }}><Copy className="w-4 h-4 text-gray-400" /></button>
            </div>
        )}
        <a href={`https://basescan.org/address/${tokenAddress}`} target="_blank" className="inline-flex items-center gap-2 text-cyan-400 text-sm hover:underline mt-2">
            View on Explorer <ExternalLink className="w-3 h-3" />
        </a>
    </div>
);

export default TokenFactory;
