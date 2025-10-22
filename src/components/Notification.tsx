import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaTimes,
  FaExternalLinkAlt,
  FaArrowRight
} from 'react-icons/fa';
import { getChainConfig } from '@/utils/constants';

interface NotificationProps {
  isOpen: boolean;
  onClose: () => void;
  onAwesomeClick?: () => void; // ✅ NEW: Callback for Awesome button
  type: 'success' | 'error';
  title: string;
  message: string;
  txHash?: string | null;
  chainId?: number | null;
}

const Notification: React.FC<NotificationProps> = ({ 
  isOpen, 
  onClose, 
  onAwesomeClick, // ✅ NEW
  type, 
  title, 
  message, 
  txHash = null, 
  chainId = null 
}) => {
  const getTxExplorerUrl = (): string | null => {
    if (!txHash || !chainId) return null;
    
    const chainConfig = getChainConfig(chainId);
    if (!chainConfig || !chainConfig.blockExplorerUrls || chainConfig.blockExplorerUrls.length === 0) {
      return null;
    }
    
    return `${chainConfig.blockExplorerUrls[0]}/tx/${txHash}`;
  };

  const handleAwesomeClick = () => {
    // ✅ Trigger animation callback if provided
    if (onAwesomeClick) {
      onAwesomeClick();
    }
    // Then close notification
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />
          
          <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-md w-full p-6 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700
                         bg-white dark:bg-gray-800 backdrop-filter backdrop-blur-lg bg-opacity-95 dark:bg-opacity-95"
              onClick={(e) => e.stopPropagation()} 
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-full ${
                  type === 'success'
                    ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}>
                  {type === 'success' ? (
                    <FaCheckCircle className="h-6 w-6" />
                  ) : (
                    <FaExclamationTriangle className="h-6 w-6" />
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 
                             transition-colors p-2"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
              
              <h3 className={`text-xl font-bold mb-2 ${
                type === 'success'
                  ? 'text-cyan-600 dark:text-cyan-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {message}
              </p>
              
              {txHash && (
                <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Transaction Hash:</span>
                      <span className="text-xs font-mono text-gray-600 dark:text-gray-300">
                        {txHash.substring(0, 8)}...{txHash.substring(txHash.length - 8)}
                      </span>
                    </div>
                    
                    {getTxExplorerUrl() && (
                      <a 
                        href={getTxExplorerUrl() || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-center py-2 px-4 rounded-lg bg-cyan-100 dark:bg-cyan-900/20 
                                   text-cyan-700 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-800/30
                                   transition-colors flex items-center justify-center"
                      >
                        <span>View on Explorer</span>
                        <FaExternalLinkAlt className="ml-2 h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleAwesomeClick} // ✅ Updated to trigger animation
                  className={`py-2 px-4 rounded-lg text-white transition-colors flex items-center ${
                    type === 'success'
                      ? 'bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700'
                      : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'
                  }`}
                >
                  <span>{type === 'success' ? 'Awesome!' : 'Dismiss'}</span>
                  <FaArrowRight className="ml-2 h-3 w-3" />
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Notification;