import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Disc, ArrowRight, Layers } from 'lucide-react';
import SimpleDeploy from './SimpleDeploy';
import TokenFactory from './TokenFactory';

const DeployView: React.FC = () => {
    const [mode, setMode] = useState<'menu' | 'simple' | 'token'>('menu');

    if (mode === 'simple') {
        return <SimpleDeploy onBack={() => setMode('menu')} />;
    }

    if (mode === 'token') {
        // TokenFactory usually handles its own back navigation internally in steps, 
        // but if we want a global back, we might need to wrap it or modify TokenFactory.
        // For now, let's assume TokenFactory has its own flow.
        // But wait, TokenFactory in my port has "Back" button for steps, but not for exiting the component.
        // I should probably wrap it with a "Exit" button at the top if needed, 
        // or just let the bottom nav switch tabs.
        // Actually, let's add a "Back to Menu" button at the top of TokenFactory specific wrapper here.
        return (
            <div className="relative">
                <button
                    onClick={() => setMode('menu')}
                    className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-black/40 text-gray-400 text-xs rounded-lg border border-white/10 hover:bg-white/10 backdrop-blur"
                >
                    ← Back to Menu
                </button>
                <TokenFactory />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#050608] text-white p-6 pb-24">
            <header className="mb-8 mt-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
                        <Layers className="w-6 h-6 text-white" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold">Deployer Studio</h1>
                <p className="text-gray-400 text-sm">Create contracts and tokens on Base in seconds.</p>
            </header>

            <div className="grid gap-4">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMode('simple')}
                    className="bg-[#0B0E14]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-left hover:border-cyan-500/30 transition-all group shadow-lg"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors">
                            <Zap className="w-6 h-6" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">Simple Contract</h3>
                    <p className="text-sm text-gray-400">Deploy a basic messaging contract to the blockchain. Perfect for testing interactions.</p>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMode('token')}
                    className="bg-[#0B0E14]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-left hover:border-purple-500/30 transition-all group shadow-lg"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
                            <Disc className="w-6 h-6" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">Token Factory</h3>
                    <p className="text-sm text-gray-400">Launch your own ERC-20 token with advanced features like taxes, burn, and anti-bot.</p>
                </motion.button>
            </div>

            <div className="mt-8 p-4 bg-cyan-900/10 border border-cyan-500/10 rounded-xl">
                <p className="text-xs text-cyan-200/70 text-center">
                    Powered by GannetX Protocol on Base
                </p>
            </div>
        </div>
    );
};

export default DeployView;
