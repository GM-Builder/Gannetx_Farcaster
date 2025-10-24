import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaExternalLinkAlt, FaClock } from 'react-icons/fa';
import { SiOpensea } from 'react-icons/si';

const NFTMinting = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ 
    days: 0, 
    hours: 0, 
    minutes: 0, 
    seconds: 0,
    isLive: false 
  });

  // Countdown to 16 November 2025, 19:00 WIB (12:00 UTC)
  useEffect(() => {
    const targetDate = new Date('2025-11-16T12:00:00Z').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
          isLive: false
        });
      } else {
        setTimeLeft({ 
          days: 0, 
          hours: 0, 
          minutes: 0, 
          seconds: 0, 
          isLive: true 
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  const designationPrivileges = [
    {
      title: 'Guaranteed Future Token Airdrop Allocation',
      description: 'Early Adopter NFT holders receive priority allocation in all future token distribution events with tier-based multipliers.'
    },
    {
      title: 'Exclusive OG Community Access & Roles',
      description: 'Access to private governance channels, early feature previews, and direct communication with the development team.'
    },
    {
      title: 'Future Platform Privileges',
      description: 'Reduced transaction fees, priority access to new features, and exclusive benefits across the GannetX ecosystem.'
    }
  ];

  const programParameters = [
    { label: 'Issuance Network', value: 'Base Mainnet' },
    { label: 'Total Supply', value: '2,210 Units' },
    { label: 'Token Standard', value: 'ERC-721' },
    { label: 'Acquisition Criteria', value: 'Completion of 10 GM Check-ins on GannetX DApp' },
    { label: 'Pricing Structure', value: 'Based on FCFS ranking' },
    { label: 'Contract Address', value: 'Verified on BaseScan' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center items-center gap-4 mb-8">
            <img src="/logo.png" alt="GannetX" className="h-12 md:h-16" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0A1929] mb-4 tracking-tight font-serif">
            GannetX <span className='bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]'>Early Adopter</span>
            <br />
            NFT Issuance
          </h1>
          
          <p className="text-xl md:text-2xl font-medium text-gray-700">
            Secure Your Unique Identifier and Guaranteed Future Allocation
          </p>
          
          <div className="w-24 h-1 bg-[#00FFFF] mx-auto mt-8"></div>
        </motion.div>

        

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-16 mb-20">
          {/* Left Column - NFT Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="w-full max-w-md">
              <div className="relative bg-gradient-to-br from-[#0A1929] to-[#1a2942] rounded-2xl border-8 border-[#0A1929] shadow-2xl">
                {/* NFT Image */}
                <div className="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden">
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                      <div className="w-12 h-12 border-4 border-[#00FFFF] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  <img 
                    src="/001.gif" 
                    alt="GannetX Early Adopter NFT" 
                    className={`w-full h-full object-contain transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                  />
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 uppercase tracking-wider font-semibold">
                  Early Adopter Collection
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Limited Edition • ERC-721
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Program Parameters */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-lg">
              <h2 className="text-3xl font-bold text-[#0A1929] mb-6 font-serif">
                Program Parameters
              </h2>
              
              <div className="space-y-4">
                {programParameters.map((param, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.08 }}
                    className="pb-4 border-b border-gray-300 last:border-b-0"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                        {param.label}
                      </span>
                      <span className="text-sm text-[#0A1929] font-medium text-right max-w-xs">
                        {param.value}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-[#00FFFF]/10 border-l-4 border-[#00FFFF] rounded">
                <p className="text-xs text-gray-700 leading-relaxed">
                  <span className="font-semibold">Note:</span> Final pricing is determined by your qualification tier. 
                  Complete check-ins on the GannetX DApp to secure preferential rates.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Designation Privileges Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0A1929] mb-3 font-serif">
              Designation Privileges
            </h2>
            <p className="text-gray-600">Universal Benefits for All Early Adopter Tiers</p>
            <div className="w-16 h-1 bg-[#00FFFF] mx-auto mt-4"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {designationPrivileges.map((privilege, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.15 }}
                className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-[#00FFFF] transition-all duration-300 hover:shadow-lg"
              >
                <div className="w-12 h-12 bg-[#0A1929] rounded-lg flex items-center justify-center mb-6">
                  <span className="text-[#00FFFF] text-2xl font-bold">{index + 1}</span>
                </div>
                
                <h3 className="text-xl font-bold text-[#0A1929] mb-3 leading-tight">
                  {privilege.title}
                </h3>
                
                <p className="text-sm text-gray-600 leading-relaxed">
                  {privilege.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Countdown Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-xl mx-auto mb-20"
        >
          <div className="bg-gradient-to-br from-[#0A1929] to-[#1a2942] rounded-2xl p-8 md:p-10 border-2 border-[#00FFFF]/30 shadow-2xl">
            {timeLeft.isLive ? (
              <div className="text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-500/20 border-2 border-green-500 rounded-full mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-bold text-lg uppercase tracking-wider">
                    Minting is Live!
                  </span>
                </div>
                <p className="text-white/80 text-lg">
                  The Early Adopter NFT collection is now available on OpenSea
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 text-[#00FFFF] mb-4">
                    <FaClock className="text-xl" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Minting Opens In</span>
                  </div>
                  <p className="text-white/70 text-sm">
                    November 16, 2025 • 12:00 UTC
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-4 md:gap-6">
                  {[
                    { label: 'D', value: timeLeft.days },
                    { label: 'H', value: timeLeft.hours },
                    { label: 'M', value: timeLeft.minutes },
                    { label: 'S', value: timeLeft.seconds }
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-[#00FFFF]/20"
                    >
                      <div className="text-center">
                        <motion.div
                          key={item.value}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-3xl md:text-5xl font-bold text-[#00FFFF] mb-2 font-mono tabular-nums"
                        >
                          {formatNumber(item.value)}
                        </motion.div>
                        <div className="text-xs md:text-sm text-white/60 uppercase tracking-wider font-semibold">
                          {item.label}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <p className="text-white/50 text-xs md:text-sm">
                    Be ready to mint when the countdown reaches zero
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="max-w-2xl mx-auto space-y-4"
        >
          {/* Primary CTA */}
          <a
            href="https://opensea.io/collection/gannetx-early-adopter"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-5 bg-[#0A1929] text-white rounded-xl font-bold text-lg hover:bg-[#0d2136] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <SiOpensea className="text-2xl" />
              <span>GET YOUR EARLY ADOPTER NFT</span>
              <FaExternalLinkAlt className="text-base" />
            </motion.button>
          </a>

          {/* Secondary CTA */}
          <a href="/" className="block">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-4 bg-white border-2 border-[#0A1929] text-[#0A1929] rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <span>View Qualification Leaderboard</span>
              <FaExternalLinkAlt className="text-sm" />
            </motion.button>
          </a>
        </motion.div>

        {/* Footer Information */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-20 pt-12 border-t-2 border-gray-200"
        >
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Official Collection
              </p>
              <a 
                href="https://opensea.io/collection/gannetx-early-adopter/overview"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00FFFF] hover:underline text-sm"
              >
                View on OpenSea
              </a>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Community
              </p>
              <div className="flex justify-center gap-4">
                <a 
                  href="https://x.com/gannetx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0A1929] hover:text-[#00FFFF] transition-colors"
                >
                  X
                </a>
                <a 
                  href="https://t.me/gannetx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0A1929] hover:text-[#00FFFF] transition-colors"
                >
                  Telegram
                </a>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Platform
              </p>
              <a 
                href="/"
                className="text-[#00FFFF] hover:underline text-sm"
              >
                GannetX DApp
              </a>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              © 2025 GannetX. All Rights Reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NFTMinting;