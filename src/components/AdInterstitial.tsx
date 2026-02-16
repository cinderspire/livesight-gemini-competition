import React, { useState, useEffect, useCallback } from 'react';
import { isNativePlatform } from '../services/adService';

interface AdInterstitialProps {
  show: boolean;
  onClose: () => void;
}

/**
 * Web Interstitial Ad Component
 * - Full screen overlay modal
 * - "Close" button appears after 5 seconds
 * - Auto-closes after 10 seconds
 * - Only renders on web (native uses AdMob)
 */
const AdInterstitial: React.FC<AdInterstitialProps> = ({ show, onClose }) => {
  const [canClose, setCanClose] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!show) {
      setCanClose(false);
      setCountdown(5);
      return;
    }

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanClose(true);
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-close after 10 seconds
    const autoCloseTimer = setTimeout(() => {
      onClose();
    }, 10000);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(autoCloseTimer);
    };
  }, [show, onClose]);

  const handleClose = useCallback(() => {
    if (canClose) {
      onClose();
    }
  }, [canClose, onClose]);

  // Don't render on native platform (AdMob handles it)
  if (!show || isNativePlatform()) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
      role="dialog"
      aria-label="Advertisement"
      aria-modal="true"
    >
      <div className="relative w-full max-w-sm mx-4 animate-fade-in-up">
        {/* Ad content area */}
        <div className="bg-[#0d0d12] border border-gray-800 rounded-3xl p-8 text-center space-y-6">
          {/* Ad placeholder */}
          <div className="w-full h-48 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl flex items-center justify-center border border-gray-700/50">
            <div className="text-gray-600 text-sm font-mono">Advertisement</div>
          </div>

          {/* Branding */}
          <div className="space-y-1">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">LiveSight is free thanks to ads</p>
            <p className="text-[10px] text-gray-700 uppercase tracking-wider">Ads never appear during navigation</p>
          </div>

          {/* Close button */}
          {canClose ? (
            <button
              onClick={handleClose}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-bold tracking-widest rounded-xl transition active:scale-[0.98] uppercase text-sm"
              aria-label="Close advertisement"
            >
              Kapat
            </button>
          ) : (
            <div className="py-3 text-gray-500 text-xs font-mono">
              {countdown}s sonra kapatilabilir
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdInterstitial;
