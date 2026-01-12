import React from 'react';
import { Shield, CheckCircle, Star, Sparkles } from 'lucide-react';
import { BadgeType } from '@/types/token';

interface TokenBadgeProps {
    badge: BadgeType;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

const TokenBadge: React.FC<TokenBadgeProps> = ({
    badge,
    size = 'md',
    showLabel = true
}) => {
    if (badge === 'none') return null;

    const config = {
        premium: {
            icon: Sparkles,
            label: 'Premium Verified',
            gradient: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-500/10',
            textColor: 'text-purple-400',
            borderColor: 'border-purple-500/20',
        },
        verified: {
            icon: Shield,
            label: 'GannetX Verified',
            gradient: 'from-cyan-500 to-blue-500',
            bgColor: 'bg-cyan-500/10',
            textColor: 'text-cyan-400',
            borderColor: 'border-cyan-500/20',
        },
        standard: {
            icon: CheckCircle,
            label: 'Deployed via GannetX',
            gradient: 'from-gray-500 to-gray-600',
            bgColor: 'bg-white/5',
            textColor: 'text-gray-400',
            borderColor: 'border-white/10',
        },
    };

    const currentConfig = config[badge];
    const Icon = currentConfig.icon;

    const sizeClasses = {
        sm: { container: 'px-2 py-0.5', icon: 'w-3 h-3', text: 'text-xs' },
        md: { container: 'px-3 py-1', icon: 'w-4 h-4', text: 'text-sm' },
        lg: { container: 'px-4 py-1.5', icon: 'w-5 h-5', text: 'text-base' },
    };

    const classes = sizeClasses[size];

    return (
        <div
            className={`
        inline-flex items-center gap-1.5 
        ${classes.container} 
        ${currentConfig.bgColor} 
        ${currentConfig.borderColor} 
        border rounded-full backdrop-blur-sm
      `}
        >
            <Icon className={`${classes.icon} ${currentConfig.textColor}`} />
            {showLabel && (
                <span className={`${classes.text} ${currentConfig.textColor} font-medium whitespace-nowrap`}>
                    {currentConfig.label}
                </span>
            )}
        </div>
    );
};

export default TokenBadge;
