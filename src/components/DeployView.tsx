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
        <div className="grid grid-cols-1 gap-4 mt-4">
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode('simple')}
                className="flex flex-col items-center justify-center p-8 bg-[#0B0E14]/60 backdrop-blur-xl border border-white/5 rounded-2xl hover:bg-[#1A1D24] hover:border-cyan-500/30 transition-all group min-h-[200px]"
            >
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="text-lg font-bold text-white mb-2">Simple Deploy</div>
                <p className="text-gray-400 text-center text-sm leading-relaxed max-w-xs">
                    Deploy a standard contract instantly on your chosen chain. Fast, cheap, and simple.
                </p>
            </motion.button>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMode('token')}
                className="flex flex-col items-center justify-center p-8 bg-[#0B0E14]/60 backdrop-blur-xl border border-white/5 rounded-2xl hover:bg-[#1A1D24] hover:border-purple-500/30 transition-all group min-h-[200px]"
            >
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Disc className="w-8 h-8 text-purple-400" />
                </div>
                <div className="text-lg font-bold text-white mb-2">Create Your Token</div>
                <p className="text-gray-400 text-center text-sm leading-relaxed max-w-xs">
                    Full customization suite. Configure taxes, anti-bot, supply, and advanced features.
                </p>
            </motion.button>
        </div>
    );
};

export default DeployView;
