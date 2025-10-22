// src/components/QuestDashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInfoCircle, FaTimes, FaCheckCircle, FaChevronDown } from 'react-icons/fa';
import { useUserStats } from '@/hooks/useSubgraph';

interface QuestDashboardProps {
  address?: string | null;
}

interface FaqItem {
  q: string; 
  a: string;
}

const QuestDashboard: React.FC<QuestDashboardProps> = ({ address }) => {
  const [showDetails, setShowDetails] = useState(false);
  const { data: userStats } = useUserStats(address || undefined);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const isQualified = (userStats?.totalCheckins || 0) >= 10;
  const progress = Math.min((userStats?.totalCheckins || 0) / 10 * 100, 100);
  
  const faqsData: FaqItem[] = [ 
    {
      q: "When will details be announced?",
      a: "NFT supply, pricing tiers, and mint date will be revealed as the program progresses."
    },
    {
      q: "Can I use multiple chains?",
      a: "Yes, check-ins on any supported chain count toward your 10 total."
    },
    {
      q: "What if I miss a day?",
      a: "No problem. There's no daily requirement—just reach 10 total check-ins to qualify."
    },
    {
      q: "Are there different whitelist tiers?",
      a: "Yes, higher positions may unlock free mints, while others might receive discounted pricing. Details to come!"
    }
  ];

  useEffect(() => {
    const targetDate = new Date('2025-11-15T23:59:59').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="w-full">
      {/* Compact Banner - Mobile Optimized */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-lg md:rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50"
      >
        {/* Subtle Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.2) 0%, transparent 50%)`
          }}></div>
        </div>

        <div className="relative z-10 p-4 md:p-6">
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-800/50 border border-slate-600/50 backdrop-blur-sm mb-3 md:mb-4"
          >
            <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-slate-300 text-[9px] md:text-[10px] font-semibold uppercase tracking-wider">Limited Program</span>
          </motion.div>

          {/* Content - Mobile First */}
          <div className="space-y-3 md:space-y-4">
            {/* Title - Compact */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                Early Adopter{' '}
                <span 
                  className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-400 bg-clip-text text-transparent"
                  style={{
                    textShadow: '0 0 20px rgba(34, 211, 238, 0.2)',
                  }}
                >
                  NFT Whitelist
                </span>
              </h1>
              <p className="text-slate-400 text-xs md:text-sm mt-2">
                Complete 10 check-ins to qualify • FCFS
              </p>
            </motion.div>

            {/* Countdown & CTA Row */}
            <div className="flex items-center justify-between gap-3">
              {/* Countdown - Compact */}
              <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                {/* Days */}
                <div className="flex flex-col items-center">
                  <div className="font-mono text-sm md:text-base font-bold text-cyan-400 tabular-nums leading-none">
                    {formatNumber(timeLeft.days)}
                  </div>
                  <div className="text-[7px] md:text-[8px] text-slate-500 uppercase">d</div>
                </div>
                <div className="text-slate-600 text-xs">:</div>
                {/* Hours */}
                <div className="flex flex-col items-center">
                  <div className="font-mono text-sm md:text-base font-bold text-cyan-400 tabular-nums leading-none">
                    {formatNumber(timeLeft.hours)}
                  </div>
                  <div className="text-[7px] md:text-[8px] text-slate-500 uppercase">h</div>
                </div>
                <div className="text-slate-600 text-xs">:</div>
                {/* Minutes */}
                <div className="flex flex-col items-center">
                  <div className="font-mono text-sm md:text-base font-bold text-cyan-400 tabular-nums leading-none">
                    {formatNumber(timeLeft.minutes)}
                  </div>
                  <div className="text-[7px] md:text-[8px] text-slate-500 uppercase">m</div>
                </div>
                <div className="text-slate-600 text-xs">:</div>
                {/* Seconds */}
                <div className="flex flex-col items-center">
                  <motion.div
                    key={timeLeft.seconds}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="font-mono text-sm md:text-base font-bold text-cyan-400 tabular-nums leading-none"
                  >
                    {formatNumber(timeLeft.seconds)}
                  </motion.div>
                  <div className="text-[7px] md:text-[8px] text-slate-500 uppercase">s</div>
                </div>
              </div>

              {/* CTA Button - Compact */}
              <motion.button
                onClick={() => setShowDetails(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300"
              >
                <span className="text-xs md:text-sm font-medium text-cyan-400">Details</span>
                <FaInfoCircle className="text-cyan-400/70 text-xs" />
              </motion.button>
            </div>

            {/* User Progress - Compact */}
            {address && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="pt-3 border-t border-slate-700/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Progress</span>
                    <span className="font-mono text-sm font-semibold text-white">
                      {userStats?.totalCheckins || 0}<span className="text-slate-500 text-xs">/10</span>
                    </span>
                  </div>
                  {isQualified && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30"
                    >
                      <FaCheckCircle className="text-emerald-400 text-[10px]" />
                      <span className="text-emerald-400 text-[10px] font-medium">Qualified</span>
                    </motion.div>
                  )}
                </div>

                {/* Progress Bar - Compact */}
                <div className="relative h-1 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    style={{ boxShadow: '0 0 8px rgba(34, 211, 238, 0.5)' }}
                  />
                </div>

                {!isQualified && (
                  <p className="text-[10px] text-slate-500 mt-1.5">
                    {10 - (userStats?.totalCheckins || 0)} more needed
                  </p>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Details Modal - Same as before but mobile-optimized */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetails(false)}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: '100%', scale: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: '100%', scale: 1 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-t-3xl md:rounded-2xl shadow-2xl z-[101] w-full md:max-w-2xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-slate-700/50 bg-slate-800/30">
                <h3 className="text-base md:text-lg font-semibold text-white">Program Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-slate-700 flex items-center justify-center transition-all"
                >
                  <FaTimes className="text-slate-400 text-sm" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="px-4 md:px-5 py-4 md:py-5 space-y-4 md:space-y-5 max-h-[calc(90vh-60px)] overflow-y-auto">
                {/* How to Qualify - Compact */}
                <div>
                  <h4 className="text-sm md:text-base font-semibold text-white mb-2 md:mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 md:h-5 bg-cyan-400 rounded-full"></div>
                    How to Qualify
                  </h4>
                  <div className="space-y-2 md:space-y-3">
                    {[
                      { step: "1", title: "10 Check-ins", desc: "Complete 10 check-ins on any chain" },
                      { step: "2", title: "Track Progress", desc: "Monitor in Hero Stats or banner" },
                      { step: "3", title: "Secure Position", desc: "Position locked via FCFS" }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 md:gap-3 p-2 md:p-3 rounded-lg md:rounded-xl bg-slate-800/50 border border-slate-700/50"
                      >
                        <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 border border-cyan-500/30">
                          <span className="text-cyan-400 font-bold text-xs md:text-sm">{item.step}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs md:text-sm font-medium text-slate-200 mb-0.5 md:mb-1">{item.title}</div>
                          <div className="text-[10px] md:text-xs text-slate-400 leading-relaxed">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQ - Compact */}
                <div>
                  <h4 className="text-sm md:text-base font-semibold text-white mb-2 md:mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 md:h-5 bg-cyan-400 rounded-full"></div>
                    FAQ
                  </h4>
                  <div className="space-y-2">
                    {faqsData.map((faq, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg md:rounded-xl bg-slate-800/30 border border-slate-700/30 overflow-hidden"
                      >
                        <button
                          onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                          className="flex justify-between items-center w-full p-3 md:p-4 text-left hover:bg-slate-700/50 transition-colors"
                        >
                          <span className="text-xs md:text-sm font-medium text-slate-200 flex items-start gap-2">
                            <span className="text-cyan-400 flex-shrink-0">Q:</span>
                            <span>{faq.q}</span>
                          </span>
                          <motion.div
                            animate={{ rotate: openFaq === idx ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <FaChevronDown className="text-slate-400 text-xs flex-shrink-0" />
                          </motion.div>
                        </button>
                        <AnimatePresence>
                          {openFaq === idx && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-3 md:p-4 pt-0 pl-8 md:pl-10 text-[10px] md:text-xs text-slate-400 leading-relaxed">
                                {faq.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestDashboard;