import React from 'react';
import { motion } from 'framer-motion';

interface HeroSectionProps {
    address?: string | null;
}

const HeroSection: React.FC<HeroSectionProps> = ({ address }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mb-8 rounded-2xl bg-[#0B0E14]/60 backdrop-blur-xl border border-white/5 relative overflow-hidden"
        >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/hero.webp"
                    alt="GM Background"
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14]/90 via-[#0B0E14]/60 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 p-8 flex items-center justify-between">
                <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Start Your Day Right
                    </h1>
                    <p className="text-gray-300 text-sm">
                        Track GMs. Deploy smart contracts. Connect with others.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default HeroSection;
