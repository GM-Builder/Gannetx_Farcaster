import React, { createContext, useContext, useState, useCallback } from 'react';

interface SuccessAnimationContextType {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  playSuccessSound: () => void;
  animationIntensity: 'subtle' | 'normal' | 'explosive';
  setAnimationIntensity: (intensity: 'subtle' | 'normal' | 'explosive') => void;
}

const SuccessAnimationContext = createContext<SuccessAnimationContextType | undefined>(undefined);

export const SuccessAnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('successSoundEnabled');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  const [animationIntensity, setAnimationIntensity] = useState<'subtle' | 'normal' | 'explosive'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('animationIntensity');
      return (saved as 'subtle' | 'normal' | 'explosive') || 'normal';
    }
    return 'normal';
  });

  const handleSetSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('successSoundEnabled', JSON.stringify(enabled));
    }
  }, []);

  const handleSetAnimationIntensity = useCallback((intensity: 'subtle' | 'normal' | 'explosive') => {
    setAnimationIntensity(intensity);
    if (typeof window !== 'undefined') {
      localStorage.setItem('animationIntensity', intensity);
    }
  }, []);

  const playSuccessSound = useCallback(() => {
    if (!soundEnabled) return;

    try {
      // Try to play success sound
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.3;
      audio.play().catch((e) => {
        console.log('Audio play prevented:', e);
      });
    } catch (e) {
      console.log('Audio not available');
    }
  }, [soundEnabled]);

  const value = {
    soundEnabled,
    setSoundEnabled: handleSetSoundEnabled,
    playSuccessSound,
    animationIntensity,
    setAnimationIntensity: handleSetAnimationIntensity,
  };

  return (
    <SuccessAnimationContext.Provider value={value}>
      {children}
    </SuccessAnimationContext.Provider>
  );
};

export const useSuccessAnimation = () => {
  const context = useContext(SuccessAnimationContext);
  if (context === undefined) {
    throw new Error('useSuccessAnimation must be used within a SuccessAnimationProvider');
  }
  return context;
};

// Hook for easy integration
export const useCheckinSuccess = () => {
  const { soundEnabled, playSuccessSound } = useSuccessAnimation();
  const [isAnimating, setIsAnimating] = useState(false);

  const triggerSuccess = useCallback((data: {
    checkinCount?: number;
    streak?: number;
    xpGained?: number;
    chainName?: string;
  }) => {
    setIsAnimating(true);
    playSuccessSound();
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
      setIsAnimating(false);
    }, 4000);

    return data;
  }, [playSuccessSound]);

  return {
    isAnimating,
    triggerSuccess,
    soundEnabled,
  };
};