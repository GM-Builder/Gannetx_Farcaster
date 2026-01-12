import React from 'react';
import { motion } from 'framer-motion';
import { FaGift, FaCopy } from 'react-icons/fa';

interface SidebarReferralCardProps {
  canUseReferral: boolean;
  myReferralsCount: number;
  userReferredBy: string | null;
  onCopyLink: () => void;
  onCardClick: () => void;
  onSwitchToBase: () => void;
  formatAddress: (address: string) => string;
}

export const SidebarReferralCard: React.FC<SidebarReferralCardProps> = ({
  canUseReferral,
  myReferralsCount,
  userReferredBy,
  onCopyLink,
  onCardClick,
  onSwitchToBase,
  formatAddress,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="overflow-hidden rounded-2xl border border-white/5 bg-[#0B0E14]/60 backdrop-blur-xl"
    >
      {canUseReferral ? (
        <>
          {/* Main Card - Clickable */}
          <div
            onClick={onCardClick}
            className="p-5 cursor-pointer hover:bg-white/5 transition-all group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 group-hover:border-cyan-500/40 transition-colors">
                  <FaGift className="text-lg text-cyan-400" />
                </div>
                <div>
                  <div className="font-bold text-white text-base leading-tight">Referral</div>
                  <div className="text-[11px] text-gray-400 mt-0.5 font-medium">
                    Program
                  </div>
                </div>
              </div>

              {/* Counter Badge */}
              {myReferralsCount > 0 && (
                <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-white">
                  {myReferralsCount}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="space-y-3">
              {/* Referred By Info */}
              {userReferredBy && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[10px] text-gray-400">
                    Invited by <span className="font-mono text-emerald-400 ml-1">{formatAddress(userReferredBy)}</span>
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                Invite friends to start their journey. Secure your spot for future rewards.
              </p>

              <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors mt-2">
                <span>VIEW DASHBOARD</span>
                <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="px-5 pb-5 pt-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopyLink();
              }}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/5 hover:border-white/10 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all group/btn"
            >
              <FaCopy className="text-gray-400 group-hover/btn:text-white transition-colors" />
              <span>COPY LINK</span>
            </button>
          </div>
        </>
      ) : (
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <FaGift className="text-lg text-amber-500" />
            </div>
            <div>
              <div className="font-bold text-white text-base">Referrals</div>
              <p className="text-[10px] text-amber-500 mt-0.5 font-medium">Base Chain Required</p>
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            Switch your network to Base to unlock the referral system and start earning.
          </p>

          <button
            onClick={onSwitchToBase}
            className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            SWITCH TO BASE
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default SidebarReferralCard;