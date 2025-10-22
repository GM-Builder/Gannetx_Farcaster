// src/components/UnifiedAudioPlayer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { FaMusic, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const DEFAULT_MUSIC = '/music/dashboard-ambient.mp3';
const PROFILE_MUSIC = '/music/profile-ambient.mp3';

interface AudioPlayerProps {
  showOnFarcaster?: boolean; // Show floating player on /farcaster
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  showOnFarcaster = true 
}) => {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume] = useState(0.3);
  const [currentMusic, setCurrentMusic] = useState('');

  const isFarcasterPage = router.pathname === '/farcaster';

  // Don't render on farcaster if disabled
  if (isFarcasterPage && !showOnFarcaster) {
    return null;
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audio = new Audio();
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    const musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
    setIsPlaying(musicEnabled);

    if (musicEnabled) {
      setTimeout(() => {
        audio.play().catch(error => {
          console.log('Autoplay prevented:', error);
          setIsPlaying(false);
        });
      }, 1000);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Listen to music changes
  useEffect(() => {
    if (!audioRef.current) return;

    const musicPath = DEFAULT_MUSIC; // You can add logic for different pages
    
    if (currentMusic !== musicPath) {
      setCurrentMusic(musicPath);
      audioRef.current.src = musicPath;
      
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.log('Play failed:', error);
        });
      }
    }
  }, [currentMusic, isPlaying]);

  // Listen to toggle events from Settings
  useEffect(() => {
    const handleToggle = (event: Event) => {
      const customEvent = event as CustomEvent<{ enabled: boolean }>;
      const enabled = customEvent.detail.enabled;
      
      setIsPlaying(enabled);
      
      if (audioRef.current) {
        if (enabled) {
          audioRef.current.play().catch(error => {
            console.log('Play failed:', error);
          });
        } else {
          audioRef.current.pause();
        }
      }
    };

    window.addEventListener('toggle-music', handleToggle as EventListener);
    return () => {
      window.removeEventListener('toggle-music', handleToggle as EventListener);
    };
  }, []);

  // Handle mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [isMuted, volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    const newState = !isPlaying;
    setIsPlaying(newState);
    
    if (newState) {
      audioRef.current.play().catch(error => {
        console.log('Play failed:', error);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
    
    localStorage.setItem('musicEnabled', newState.toString());
    window.dispatchEvent(new CustomEvent('toggle-music', { detail: { enabled: newState } }));
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Only show floating controls on /farcaster or when explicitly enabled
  if (!isFarcasterPage) {
    return null; // Invisible player for other pages
  }

  return (
    <div className="fixed bottom-24 right-4 z-40 md:bottom-8 md:right-8">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200 dark:border-cyan-500/20 p-2 flex items-center gap-2">
        <button
          onClick={togglePlay}
          className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
            isPlaying 
              ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
        >
          {isPlaying ? (
            <div className="flex space-x-0.5">
              <div className="w-0.5 h-4 bg-cyan-400 animate-music-bar1"></div>
              <div className="w-0.5 h-3 bg-cyan-400 animate-music-bar2"></div>
              <div className="w-0.5 h-2 bg-cyan-400 animate-music-bar3"></div>
            </div>
          ) : (
            <FaMusic className="h-5 w-5" />
          )}
        </button>
        
        {isPlaying && (
          <button
            onClick={toggleMute}
            className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
              isMuted 
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400' 
                : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
            }`}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <FaVolumeMute className="h-5 w-5" /> : <FaVolumeUp className="h-5 w-5" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default AudioPlayer;