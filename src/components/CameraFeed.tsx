import React, { memo, useRef, useState, useEffect, useCallback } from 'react';
import { useLiveSight } from '../contexts/LiveSightContext';
import type { CameraFeedProps } from '../types';
import { VIDEO_CONFIG } from '../constants';

/**
 * Camera Feed Component
 * Displays video feed with HUD overlays
 */
const CameraFeed: React.FC<CameraFeedProps> = memo(({ onVideoReady, isActive, isScanning, demoVideoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    activeFeature,
    lastTrafficDetection,
    lastColorDetection,
    lastExpirationDetection
  } = useLiveSight();

  const startDemoVideo = useCallback(() => {
    if (!videoRef.current || !demoVideoUrl) return;
    setError(null);
    setIsLoading(true);
    const video = videoRef.current;
    video.srcObject = null;
    video.src = demoVideoUrl;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.onloadedmetadata = () => {
      video.play()
        .then(() => {
          setIsLoading(false);
          onVideoReady(video);
        })
        .catch(e => {
          console.error('[CameraFeed] Demo video play error:', e);
          setError('Demo video playback failed');
          setIsLoading(false);
        });
    };
    video.onerror = () => {
      setError('Demo video load failed');
      setIsLoading(false);
    };
  }, [demoVideoUrl, onVideoReady]);

  const startCamera = useCallback(async () => {
    // If demo mode, use video file instead of camera
    if (demoVideoUrl) {
      startDemoVideo();
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: VIDEO_CONFIG.CAMERA_WIDTH },
          height: { ideal: VIDEO_CONFIG.CAMERA_HEIGHT },
          frameRate: { ideal: VIDEO_CONFIG.CAMERA_FPS },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                setIsLoading(false);
                onVideoReady(videoRef.current!);
              })
              .catch(e => {
                console.error('[CameraFeed] Play error:', e);
                setError('Camera playback failed');
                setIsLoading(false);
              });
          }
        };
      }
    } catch (err) {
      console.error('[CameraFeed] Camera error:', err);
      setError('Camera Access Denied');
      setIsLoading(false);
    }
  }, [onVideoReady, demoVideoUrl, startDemoVideo]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    if (videoRef.current?.src && demoVideoUrl) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }
  }, [demoVideoUrl]);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive, startCamera, stopCamera]);

  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div
      className="relative w-full h-full bg-[#0d0d12] overflow-hidden rounded-3xl border border-white/[0.06] flex items-center justify-center group isolate"
      role="img"
      aria-label={isScanning ? 'Live camera feed with active scanning' : 'Camera feed on standby'}
    >
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d12] z-10">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 border-2 border-white/[0.06] rounded-full" />
            <div className="absolute inset-0 border-t-2 border-sky-400 rounded-full animate-spin" />
          </div>
          <p className="text-xs text-sky-400/80 uppercase tracking-[0.3em] font-medium">
            Initializing Camera...
          </p>
        </div>
      )}

      {/* Standby UI (Only if camera is OFF and not loading) */}
      {!isActive && !error && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d12] z-10">
          <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 border border-white/[0.06] rounded-full" />
            <div className="absolute inset-0 border-t-2 border-sky-400/50 rounded-full animate-spin-slow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-12 h-12 text-sky-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-sky-400/70 uppercase tracking-[0.3em] animate-pulse font-medium">
            Initializing Sensors...
          </p>
        </div>
      )}

      {/* Error UI */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-gray-900 z-20" role="alert">
          <div className="text-5xl mb-4 opacity-50" aria-hidden="true">🚫</div>
          <h3 className="text-xl font-bold text-red-500 mb-2 font-mono tracking-wider">
            SIGNAL LOST
          </h3>
          <p className="text-gray-400 text-xs mb-6 font-mono">{error}</p>
          <button
            onClick={handleReload}
            className="px-6 py-2 bg-red-900/30 border border-red-500/50 text-red-200 rounded-lg text-xs font-bold hover:bg-red-900/50 transition focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Reboot system to retry camera access"
          >
            REBOOT SYSTEM
          </button>
        </div>
      )}

      {/* Video Layer */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover transition-opacity duration-1000 ${isActive && !error && !isLoading
          ? isScanning
            ? 'opacity-80'
            : 'opacity-40 grayscale'
          : 'opacity-0'
          }`}
        playsInline
        muted
        autoPlay
        aria-hidden="true"
      />

      {/* HUD Overlay - Only visible when Active */}
      {isActive && !error && !isLoading && (
        <>
          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none vignette" aria-hidden="true" />

          {/* Scanlines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10 bg-[length:100%_2px] bg-repeat-y bg-[linear-gradient(0deg,transparent_50%,rgba(0,0,0,0.5)_50%)] z-10"
            aria-hidden="true"
          />

          {/* Tactical Grid (Always visible but dim) */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10 tactical-grid"
            aria-hidden="true"
          />

          {/* Active Scanning Elements */}
          {isScanning && (
            <>
              {/* Reticle */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-sky-400/20 rounded-full flex items-center justify-center pointer-events-none animate-pulse-ring"
                aria-hidden="true"
              >
                <div className="w-1.5 h-1.5 bg-sky-400 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.6)]" />
                <div className="absolute inset-0 border-t-2 border-b-2 border-transparent border-l-sky-400/30 border-r-sky-400/30 w-full h-full rounded-full animate-spin-slow" />
              </div>

              {/* TRAFFIC MODE OVERLAY */}
              {activeFeature === 'traffic' && lastTrafficDetection && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 pointer-events-none flex flex-col items-center justify-center">
                  {/* Dynamic Traffic Reticle */}
                  <div className={`absolute inset-0 border-4 rounded-full transition-all duration-500 opacity-80 ${lastTrafficDetection.state === 'red' ? 'border-red-500 shadow-[0_0_30px_red]' :
                    lastTrafficDetection.state === 'green' ? 'border-green-500 shadow-[0_0_30px_#4ade80]' :
                      lastTrafficDetection.state === 'yellow' ? 'border-yellow-500 shadow-[0_0_30px_yellow]' :
                        'border-gray-500'
                    }`} />

                  <div className={`text-2xl font-bold font-mono tracking-widest mt-64 px-4 py-1 bg-black/80 backdrop-blur rounded uppercase border-l-4 transition-colors ${lastTrafficDetection.state === 'red' ? 'text-red-500 border-red-500' :
                    lastTrafficDetection.state === 'green' ? 'text-green-500 border-green-500' :
                      lastTrafficDetection.state === 'yellow' ? 'text-yellow-500 border-yellow-500' :
                        'text-gray-400 border-gray-400'
                    }`}>
                    {lastTrafficDetection.state === 'red' ? 'STOP' :
                      lastTrafficDetection.state === 'green' ? 'GO' :
                        lastTrafficDetection.state === 'yellow' ? 'WAIT' :
                          'SCANNING...'}
                  </div>
                </div>
              )}

              {/* COLOR MODE OVERLAY */}
              {activeFeature === 'color' && lastColorDetection && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4 transition-all duration-500 animate-fade-in-up">
                  <div
                    className="w-16 h-16 rounded-full border-2 border-white/50 shadow-lg"
                    style={{ backgroundColor: lastColorDetection.primary.hex }}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">DETECTED COLOR</span>
                    <span className="text-xl font-bold capitalize">{lastColorDetection.primary.name}</span>
                    {lastColorDetection.pattern && (
                      <span className="text-sm text-cyan-400">{lastColorDetection.pattern} pattern</span>
                    )}
                  </div>
                </div>
              )}

              {/* EXPIRATION MODE OVERLAY */}
              {activeFeature === 'expiration' && (
                <>
                  {/* Laser Scan Line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-80 shadow-[0_0_20px_orange] animate-scan-beam pointer-events-none" />

                  {lastExpirationDetection?.found && (
                    <div className={`absolute bottom-32 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl backdrop-blur-md border-2 shadow-2xl flex flex-col items-center animate-bounce-short ${lastExpirationDetection.status === 'expired' ? 'bg-red-900/80 border-red-500' :
                      lastExpirationDetection.status === 'expiring_soon' ? 'bg-yellow-900/80 border-yellow-500' :
                        'bg-green-900/80 border-green-500'
                      }`}>
                      <span className="text-xs font-mono uppercase opacity-80 mb-1">
                        {lastExpirationDetection.status === 'expired' ? 'EXPIRED' :
                          lastExpirationDetection.status === 'expiring_soon' ? 'EXPIRING SOON' :
                            'SAFE'}
                      </span>
                      <span className="text-3xl font-bold tracking-widest font-mono">
                        {lastExpirationDetection.dateString}
                      </span>
                      {lastExpirationDetection.productName && (
                        <span className="text-sm mt-1 border-t border-white/20 pt-1 w-full text-center">
                          {lastExpirationDetection.productName}
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Scanner Line (Default) */}
              {activeFeature !== 'expiration' && (
                <div
                  className="absolute inset-x-0 h-[2px] bg-sky-400/25 shadow-[0_0_15px_rgba(56,189,248,0.4)] animate-scan pointer-events-none"
                  aria-hidden="true"
                />
              )}

              {/* Live Indicator */}
              <div
                className="absolute top-6 right-6 flex items-center gap-2 glass-card px-3 py-1.5 rounded-xl animate-fade-in-up"
                role="status"
                aria-live="polite"
              >
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-blink shadow-[0_0_6px_rgba(244,63,94,0.6)]" aria-hidden="true" />
                <span className="text-[10px] font-semibold text-white/80 tracking-widest">
                  LIVE
                </span>
              </div>

              {/* Compass Ticks */}
              <div className="absolute top-4 left-0 right-0 h-4 flex justify-center gap-2 opacity-20 overflow-hidden px-12" aria-hidden="true">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-[1px] ${i % 5 === 0 ? 'h-3 bg-sky-400' : 'h-1 bg-white'}`}
                  />
                ))}
              </div>

              {/* Corners */}
              <div className="absolute inset-4 pointer-events-none opacity-30" aria-hidden="true">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-sky-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-sky-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-sky-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-sky-400 rounded-br-lg" />
              </div>
            </>
          )}

          {/* Standby Overlay (when active but not scanning) */}
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/40 backdrop-blur-sm px-6 py-2 rounded-full border border-gray-700">
                <span className="text-xs font-mono text-gray-400 tracking-widest">SENSORS STANDBY</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
});

CameraFeed.displayName = 'CameraFeed';

export default CameraFeed;
