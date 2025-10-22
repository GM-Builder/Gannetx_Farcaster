import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFire, FaTrophy, FaCheckCircle, FaRocket } from 'react-icons/fa';

interface SuccessAnimationProps {
  isVisible: boolean;
  checkinCount?: number;
  streak?: number;
  chainName?: string;
  onComplete?: () => void;
  position?: 'card' | 'center';
  soundEnabled?: boolean;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  isVisible,
  checkinCount = 1,
  streak = 0,
  chainName = '',
  onComplete,
  position = 'card',
  soundEnabled = true
}) => {
  const [confettiPieces, setConfettiPieces] = useState<Array<{ 
    id: number; 
    x: number; 
    y: number;
    delay: number; 
    color: string;
    size: number;
  }>>([]);
  
  // ✅ FIX: Prevent sound loop with ref
  const hasPlayedSound = useRef(false);
  const animationTimer = useRef<NodeJS.Timeout | null>(null);

  // Check if streak milestone
  const isStreakMilestone = streak > 0 && (streak % 7 === 0 || streak % 30 === 0 || streak === 100);
  const getMilestoneText = () => {
    if (streak === 100) return '💯 Century Streak!';
    if (streak % 30 === 0) return '📅 Monthly Legend!';
    if (streak % 7 === 0) return '🔥 Weekly Warrior!';
    return '';
  };

  // ✅ FIX: Only run once when isVisible becomes true
  useEffect(() => {
    if (!isVisible) {
      hasPlayedSound.current = false;
      return;
    }

    // Generate enhanced confetti with varied sizes and positions
    const pieces = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 120, // Wider spread
      y: Math.random() * -20, // Start from different heights
      delay: Math.random() * 0.4,
      color: [
        '#06b6d4', '#0891b2', '#22d3ee', '#67e8f9', 
        '#fbbf24', '#f59e0b', '#a855f7', '#ec4899'
      ][Math.floor(Math.random() * 8)],
      size: Math.random() * 6 + 4 // Varied sizes 4-10px
    }));
    setConfettiPieces(pieces);

    // ✅ FIX: Play sound only once
    if (soundEnabled && !hasPlayedSound.current) {
      hasPlayedSound.current = true;
      try {
        const audio = new Audio('/sounds/success.mp3');
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Audio play failed:', e));
      } catch (e) {
        console.log('Audio not available');
      }
    }

    // Auto dismiss
    animationTimer.current = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000);

    return () => {
      if (animationTimer.current) {
        clearTimeout(animationTimer.current);
      }
    };
  }, [isVisible]); // ✅ Only depend on isVisible

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {/* ✅ FIX: Proper positioning overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 overflow-hidden">
        {/* Confetti with varied animations */}
        {confettiPieces.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{ 
              y: piece.y, 
              x: 0, 
              opacity: 1,
              scale: 1,
              rotate: 0
            }}
            animate={{ 
              y: [piece.y, piece.y - 100, 150],
              x: [0, piece.x * 1.5, piece.x * 2],
              opacity: [0, 1, 1, 0],
              scale: [0.8, 1.2, 1, 0.6],
              rotate: [0, Math.random() * 360, Math.random() * 720]
            }}
            transition={{ 
              duration: 2.5,
              delay: piece.delay,
              ease: [0.34, 1.56, 0.64, 1] // Bouncy easing
            }}
            className="absolute"
            style={{
              width: `${piece.size}px`,
              height: `${piece.size}px`,
              backgroundColor: piece.color,
              borderRadius: piece.size > 7 ? '50%' : '2px',
              boxShadow: `0 0 ${piece.size}px ${piece.color}40`
            }}
          />
        ))}

        {/* ✅ ENHANCED: Space-themed Success Card */}
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -10 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.1
          }}
          className="relative w-full max-w-[280px] mx-auto"
        >
          {/* Outer Glow Ring */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.4, 0.6, 0.4]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-2xl blur-2xl"
            style={{
              background: 'radial-gradient(circle, rgba(6,182,212,0.4) 0%, rgba(8,145,178,0.2) 50%, transparent 100%)',
            }}
          />

          {/* Main Card with Glass Morphism */}
          <div className="relative bg-gradient-to-br from-slate-900/95 via-cyan-900/90 to-blue-900/95 backdrop-blur-xl rounded-2xl border border-cyan-400/30 shadow-2xl overflow-hidden">
            {/* Animated Grid Background */}
            <div className="absolute inset-0 opacity-10">
              <motion.div
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="w-full h-full"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              />
            </div>

            {/* Scanning Line Effect */}
            <motion.div
              animate={{
                y: ['-100%', '200%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent"
              style={{
                filter: 'blur(10px)'
              }}
            />

            {/* Content */}
            <div className="relative z-10 px-6 py-5">
              {/* Icon with Orbit Animation */}
              <div className="relative flex items-center justify-center mb-4">
                {/* Orbit Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute w-20 h-20 border border-cyan-400/30 rounded-full"
                />
                
                {/* Main Icon */}
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.15, 1]
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: 2,
                    ease: "easeInOut"
                  }}
                  className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/50"
                >
                  {isStreakMilestone ? (
                    <FaTrophy className="text-2xl text-yellow-300 drop-shadow-lg" />
                  ) : (
                    <FaCheckCircle className="text-2xl text-white drop-shadow-lg" />
                  )}
                </motion.div>

                {/* Orbiting Particles */}
                {[0, 120, 240].map((angle, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      rotate: [angle, angle + 360]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 0.3
                    }}
                    className="absolute w-20 h-20"
                  >
                    <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" />
                  </motion.div>
                ))}
              </div>

              {/* Text Content */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center space-y-2"
              >
                <h2 className="text-xl font-black text-white leading-tight tracking-tight">
                  {isStreakMilestone ? (
                    <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      {getMilestoneText()}
                    </span>
                  ) : (
                    'GM Sent! 🎉'
                  )}
                </h2>

                {chainName && (
                  <p className="text-xs text-cyan-300/80 font-medium">
                    on <span className="text-cyan-200">{chainName}</span>
                  </p>
                )}
              </motion.div>

              {/* Stats Pills */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center gap-2 mt-4"
              >
                {/* Check-in Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 backdrop-blur-sm">
                  <FaRocket className="text-cyan-400 text-xs" />
                  <span className="text-sm font-bold text-white">+{checkinCount}</span>
                  <span className="text-[10px] text-cyan-300/70">GM</span>
                </div>

                {/* Streak Badge */}
                {streak > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 backdrop-blur-sm">
                    <FaFire className="text-orange-400 text-xs" />
                    <span className="text-sm font-bold text-white">{streak}</span>
                    <span className="text-[10px] text-orange-300/70">days</span>
                  </div>
                )}
              </motion.div>

              {/* Floating +1 Indicator */}
              <motion.div
                initial={{ y: 0, opacity: 0, scale: 0.5 }}
                animate={{ 
                  y: -80, 
                  opacity: [0, 1, 1, 0], 
                  scale: [0.5, 1.3, 1.3, 0.9] 
                }}
                transition={{ 
                  duration: 2.5, 
                  ease: [0.34, 1.56, 0.64, 1]
                }}
                className="absolute -top-20 left-1/2 -translate-x-1/2 pointer-events-none"
              >
                <div className="relative">
                  <div className="text-5xl font-black text-white drop-shadow-2xl">
                    +1
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 text-5xl font-black text-cyan-400 blur-xl opacity-70">
                    +1
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom Accent Line */}
            <motion.div
              animate={{
                x: ['-100%', '200%']
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
              className="h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            />
          </div>
        </motion.div>

        {/* ✅ ENHANCED: Milestone Celebration Effect */}
        {isStreakMilestone && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            className="absolute inset-0 pointer-events-none"
          >
            {[...Array(12)].map((_, i) => {
              const angle = (i * Math.PI * 2) / 12;
              return (
                <motion.div
                  key={i}
                  animate={{
                    x: Math.cos(angle) * 120,
                    y: Math.sin(angle) * 120,
                    opacity: [1, 0],
                    scale: [0.5, 1]
                  }}
                  transition={{ 
                    duration: 1.2, 
                    delay: 0.3 + i * 0.05,
                    ease: "easeOut"
                  }}
                  className="absolute top-1/2 left-1/2"
                >
                  <FaTrophy className="text-yellow-300 text-xl drop-shadow-lg" />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};

export default SuccessAnimation;