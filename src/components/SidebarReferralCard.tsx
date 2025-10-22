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
      className="overflow-hidden rounded-2xl"
    >
      {canUseReferral ? (
        <>
          {/* Main Card - Clickable */}
          <div
            onClick={onCardClick}
            className="p-6 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200/60 dark:border-blue-700/60 cursor-pointer hover:shadow-lg transition-all group"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg group-hover:shadow-xl transition-shadow">
                  <FaGift className="text-xl text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Referral Program</h3>
                  {myReferralsCount > 0 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {myReferralsCount} {myReferralsCount === 1 ? 'Referral' : 'Referrals'}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Click indicator */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Referred By Info */}
            {userReferredBy && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                  Referred by
                </p>
                <code className="text-xs font-mono text-gray-900 dark:text-white">
                  {formatAddress(userReferredBy)}
                </code>
              </div>
            )}

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Invite friends and secure your exclusive spot for future rewards!
            </p>

            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              Click to view dashboard →
            </p>
          </div>

          {/* Copy Link Button - Separate */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopyLink();
            }}
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-x border-b border-blue-200/60 dark:border-blue-700/60 rounded-b-2xl font-medium text-gray-900 dark:text-white flex items-center justify-center gap-2 transition-all"
          >
            <FaCopy className="text-blue-500" />
            Copy Referral Link
          </button>
        </>
      ) : (
        <div className="p-6 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200/60 dark:border-amber-700/60 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <FaGift className="text-xl text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Referral System</h3>
              <p className="text-xs text-amber-600 dark:text-amber-400">Base Network Required</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Switch to Base network to access referral features
          </p>

          <button
            onClick={onSwitchToBase}
            className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all shadow-lg"
          >
            Switch to Base
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default SidebarReferralCard;