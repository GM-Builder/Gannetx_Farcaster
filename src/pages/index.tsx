import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { WagmiProvider, useAccount, useConnect, useDisconnect } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/config/wagmi';
import { useFarcasterUser } from '@/hooks/useFarcasterContext';
import { useDirectProvider } from '@/hooks/useEthersProvider';
import FixedMultiChainCheckinGrid from '@/components/MultiChainCheckinGrid';
import BottomNav, { TabType } from '@/components/BottomNav';
import QuestDashboard from '@/components/QuestDashboard';
import LeaderboardView from '@/components/LeaderboardView';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaWallet, FaCopy, FaSignOutAlt, FaExclamationCircle } from 'react-icons/fa';
import { useUserStats, useUserCheckins } from '@/hooks/useSubgraph';
import { useUserChainStats } from '@/hooks/useUserChainStats';
import { useUserRanking } from '@/hooks/useUserRangking';
import { SUPPORTED_CHAINS, BASE_CHAIN_ID } from '@/utils/constants';
import { formatAddress } from '@/utils/web3';
import Notification from '@/components/Notification';
import toast from 'react-hot-toast';
import HeroStatsSection from '@/components/HeroStatsSection';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import Settings from '@/components/Settings';
import AudioPlayer from '@/components/AudioPlayer';
import SidebarReferralCard from '@/components/SidebarReferralCard';

const queryClient = new QueryClient();

const FarcasterContent = () => {
  const { user, isLoading: userLoading, isReady } = useFarcasterUser();
  
  const { address, isConnected, chainId: wagmiChainId } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { provider, signer, loading: providerLoading, error: providerError } = useDirectProvider();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [lastCheckinChainId, setLastCheckinChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState<boolean>(false);
  const [showErrorNotification, setShowErrorNotification] = useState<boolean>(false);
  const [animationTrigger, setAnimationTrigger] = useState<{
    chainId: number;
    chainName: string;
  } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const chainId = wagmiChainId ? Number(wagmiChainId) : BASE_CHAIN_ID;

  // Auto-connect ONLY Farcaster connector
  useEffect(() => {
    const autoConnect = async () => {
      if (isReady && !isConnected && !isConnecting) {
        try {
          console.log('🔌 Available connectors:', connectors.map(c => ({ name: c.name, id: c.id, type: c.type })));

          // Prefer the miniapp connector id
          const farcasterConnector = connectors.find(c => c.id === 'farcasterMiniApp') ||
                                    connectors.find(c => c.id === 'farcasterFrame') ||
                                    connectors.find(c => c.name?.toLowerCase().includes('farcaster'));

          if (farcasterConnector) {
            console.log('🎯 Auto-connecting with Farcaster connector:', farcasterConnector.name, farcasterConnector.id);
            await connect({ connector: farcasterConnector });
          } else {
            console.warn('⚠️ No Farcaster connector found!');
          }
        } catch (err) {
          console.error('Failed to auto-connect:', err);
        }
      }
    };

    const timer = setTimeout(autoConnect, 1200);
    return () => clearTimeout(timer);
  }, [isReady, isConnected, isConnecting, connect, connectors]);

  const { data: userCheckins } = useUserCheckins(address || undefined, 365);
  const { data: userStats, loading: userStatsLoading } = useUserStats(address || undefined);
  const { data: currentChainStats, loading: chainStatsLoading } = useUserChainStats(
    BASE_CHAIN_ID,
    address || null
  );
  const { data: userRanking, loading: rankingLoading } = useUserRanking(address || null);

  const getAvatarUrl = (addr: string): string => 
    `https://api.dicebear.com/6.x/identicon/svg?seed=${addr}`;

  const handleCheckinSuccess = useCallback((chainId: number, txHash: string): void => {
    setLastTxHash(txHash);
    setLastCheckinChainId(chainId);
    setShowSuccessNotification(true);

    const chainConfig = SUPPORTED_CHAINS[chainId];
    setAnimationTrigger({
      chainId: chainId,
      chainName: chainConfig?.chainName || 'Unknown Chain',
    });

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }, []);

  const router = useRouter();

  const handleCopyAddress = useCallback(() => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopySuccess(true);
      toast.success('Address copied!', { duration: 2000 });
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [address]);

  const handleManualConnect = useCallback(() => {
    const farcasterConnector = connectors.find(
      c => c.id === 'farcasterFrame' || 
           c.type === 'farcasterFrame' ||
           c.name?.toLowerCase().includes('farcaster')
    );

    if (farcasterConnector) {
      connect({ connector: farcasterConnector });
    } else {
      toast.error('Farcaster connector not found');
    }
  }, [connect, connectors]);

  if (userLoading || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-cyan-100 dark:from-black dark:via-gray-900 dark:to-cyan-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Farcaster...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-cyan-100 dark:from-black dark:via-gray-900 dark:to-cyan-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20 backdrop-blur-md bg-white/90 dark:bg-gray-900/90">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between">
            <img 
              src="/logo.png" 
              alt="GannetX Logo" 
              className="h-10 w-auto object-contain"
            />
            {user && (
              <div className="flex items-center gap-2">
                {user.pfpUrl ? (
                  <img 
                    src={user.pfpUrl} 
                    alt={user.username || 'User'} 
                    className="w-8 h-8 rounded-full border-2 border-cyan-500"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center">
                    <FaUser className="text-white text-xs" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Notification
        isOpen={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        onAwesomeClick={() => setShowSuccessNotification(false)}
        type="success"
        title="GM Sent Successfully!"
        message="Your daily GM has been recorded on the blockchain."
        txHash={lastTxHash}
        chainId={lastCheckinChainId}
      />
      
      <Notification
        isOpen={showErrorNotification}
        onClose={() => setShowErrorNotification(false)}
        type="error"
        title="Operation Failed"
        message={error || "An unknown error occurred. Please try again."}
      />

      <div className="pb-20 md:pb-6">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 py-4"
              >
                {isConnected && address && (
                  <QuestDashboard address={address} />
                )}

                {providerError && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-600 dark:text-red-400">{providerError}</p>
                  </div>
                )}

                {isConnected && provider && signer ? (
                  <FixedMultiChainCheckinGrid
                    isConnected={isConnected}
                    currentChainId={BASE_CHAIN_ID}
                    address={address || null}
                    signer={signer}
                    provider={provider}
                    onCheckinSuccess={handleCheckinSuccess}
                    networkType="mainnet"
                    triggerAnimation={animationTrigger}
                    onAnimationComplete={() => setAnimationTrigger(null)}
                  />
                ) : providerLoading || isConnecting ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {providerLoading ? 'Loading provider...' : 'Connecting Farcaster wallet...'}
                    </p>
                  </div>
                ) : (
                  <motion.div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-6 text-center shadow-lg">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaWallet className="text-white text-3xl" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Connect Wallet</h3>
                    <p className="text-white/80 mb-4 text-sm">
                      Connect your Farcaster wallet to start
                    </p>
                    <button
                      onClick={handleManualConnect}
                      className="bg-white text-cyan-600 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                    >
                      Connect Farcaster Wallet
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="py-4"
              >
                <Settings />
              </motion.div>
            )}

            {activeTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="py-4"
              >
                <LeaderboardView address={address || null} />
              </motion.div>
            )}
            
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 py-4"
              >
                {isConnected && address ? (
                  <>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-cyan-400/30">
                          <img 
                            src={getAvatarUrl(address)} 
                            alt="Avatar" 
                            className="w-full h-full"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Address</p>
                          <div 
                            onClick={handleCopyAddress}
                            className="flex items-center gap-2 font-mono text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            <span className="text-gray-800 dark:text-gray-200">
                              {formatAddress(address)}
                            </span>
                            <FaCopy className={`text-xs ${copySuccess ? 'text-green-500' : 'text-gray-400'}`} />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => disconnect()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <FaSignOutAlt />
                        <span className="font-medium">Disconnect</span>
                      </button>
                    </div>

                    {user && (
                      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-3">FARCASTER ACCOUNT</p>
                        <div className="flex items-center gap-3">
                          {user.pfpUrl ? (
                            <img src={user.pfpUrl} alt={user.username || 'User'} className="w-12 h-12 rounded-full" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                              <FaUser className="text-white" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {user.displayName || user.username || 'Farcaster User'}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              @{user.username} • FID: {user.fid}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">Your Statistics</h3>
                      
                      <HeroStatsSection
                        currentChainId={BASE_CHAIN_ID}
                        currentChainName="Base"
                        currentChainCheckins={currentChainStats?.totalCheckins || 0}
                        currentChainStreak={currentChainStats?.currentStreak || 0}
                        totalCheckins={userStats?.totalCheckins || 0}
                        totalChains={userStats?.chains.length || 0}
                        maxStreak={userStats?.maxStreak || 0}
                        userRank={userRanking?.rank || 0}
                        totalUsers={userRanking?.totalUsers || 0}
                        loading={chainStatsLoading || userStatsLoading || rankingLoading}
                      />

                      {/* Heatmap — render with fallbacks so profile always shows the section */}
                      <ActivityHeatmap
                        checkins={userCheckins || []}
                        currentStreak={userStats?.currentStreak || 0}
                        maxStreak={userStats?.maxStreak || 0}
                      />

                        <SidebarReferralCard
                          canUseReferral={true}
                          myReferralsCount={0}
                          userReferredBy={null}
                          onCopyLink={() => {
                            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
                            const referralLink = `${baseUrl.replace(/\/$/, '')}/?ref=${address}`;
                            navigator.clipboard.writeText(referralLink);
                            toast.success('Referral link copied!');
                          }}
                          onCardClick={() => {
                            // Open the /share page with viewerFid so user can share via Farcaster
                            if (address) {
                              router.push(`/share?viewerFid=${address}`);
                            } else {
                              toast('Connect wallet to open referral dashboard');
                            }
                          }}
                          onSwitchToBase={() => toast('Already on Base chain!')}
                          formatAddress={formatAddress}
                        />
                    </div>
                  </>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaUser className="text-gray-400 text-2xl" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Connect wallet to view profile</p>
                    <button
                      onClick={handleManualConnect}
                      className="bg-cyan-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-cyan-600 transition-colors"
                    >
                      Connect Wallet
                    </button>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Global audio player (non-blocking) */}
      <AudioPlayer />

      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        hasNotification={!isConnected}
      />
    </div>
  );
};

export default function Home() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <FarcasterContent />
      </QueryClientProvider>
    </WagmiProvider>
  );
}