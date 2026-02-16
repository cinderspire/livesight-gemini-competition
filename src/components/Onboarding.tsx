import React, { useState, useCallback } from 'react';
import { validateApiKey } from '../utils/apiKeyUtils';
import { FREE_TIER_INFO, API_CONFIG } from '../constants';

interface OnboardingProps {
  onApiKeySubmit: (key: string) => void;
}

const STEPS = [
  { title: 'Ucretsiz API Key Al', subtitle: 'Google AI Studio\'dan ucretsiz key olustur' },
  { title: 'Google ile Giris Yap', subtitle: 'Google hesabinla giris yap' },
  { title: 'API Key Olustur', subtitle: '"Create API Key" butonuna tikla' },
  { title: 'Key\'ini Yapistir', subtitle: 'Key\'ini buraya yapistir ve test et' },
];

const Onboarding: React.FC<OnboardingProps> = ({ onApiKeySubmit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [keyInput, setKeyInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleTestKey = useCallback(async () => {
    if (keyInput.length < API_CONFIG.MIN_API_KEY_LENGTH) {
      setValidationError('API key is too short');
      return;
    }

    setIsValidating(true);
    setValidationError(null);
    setIsValid(false);

    const result = await validateApiKey(keyInput);
    setIsValidating(false);

    if (result.valid) {
      setIsValid(true);
      setValidationError(null);
    } else {
      setValidationError(result.error || 'Invalid API key');
    }
  }, [keyInput]);

  const handleSubmit = useCallback(() => {
    if (keyInput.length >= API_CONFIG.MIN_API_KEY_LENGTH) {
      onApiKeySubmit(keyInput);
    }
  }, [keyInput, onApiKeySubmit]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#09090b] text-white p-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-sky-500/[0.07] blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/[0.05] blur-[100px]" />
      </div>

      <div className="w-full max-w-md z-10 space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="text-center">
          <div className="inline-block px-3 py-1.5 bg-white/[0.06] backdrop-blur-sm rounded-full text-[10px] tracking-[0.3em] text-sky-300 mb-5 border border-white/[0.08]">
            SEE BEYOND BARRIERS
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-3">
            LIVE<span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">SIGHT</span>
          </h1>
          <p className="text-gray-400 text-sm tracking-wide">
            Your Eyes to the World
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={4} aria-label={`Step ${currentStep + 1} of ${STEPS.length}`}>
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'bg-cyan-400 w-8 shadow-[0_0_10px_#22d3ee]'
                  : i < currentStep
                  ? 'bg-cyan-400/50'
                  : 'bg-gray-700'
              }`}
              aria-label={`Go to step ${i + 1}: ${STEPS[i]!.title}`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[260px]">
          {/* Step 1: Get Free API Key */}
          {currentStep === 0 && (
            <div className="space-y-4 animate-fade-in-up" role="region" aria-label="Step 1: Get free API key">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold">{STEPS[0]!.title}</h2>
                <p className="text-gray-400 text-sm">{STEPS[0]!.subtitle}</p>
              </div>

              <a
                href={FREE_TIER_INFO.AISTUDIO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 glass-card rounded-2xl text-center text-sm font-semibold tracking-wider hover:bg-white/[0.08] transition-all duration-300 active:scale-[0.98] text-sky-300"
                aria-label="Open Google AI Studio to get API key"
              >
                <svg className="w-5 h-5 inline mr-2 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                aistudio.google.com/apikey
              </a>

              <button
                onClick={handleNext}
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold tracking-widest rounded-2xl transition-all duration-300 shadow-[0_4px_20px_rgba(56,189,248,0.25)] active:scale-[0.98]"
              >
                DEVAM
              </button>
            </div>
          )}

          {/* Step 2: Sign in with Google */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in-up" role="region" aria-label="Step 2: Sign in with Google">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold">{STEPS[1]!.title}</h2>
                <p className="text-gray-400 text-sm">{STEPS[1]!.subtitle}</p>
              </div>

              <div className="p-4 bg-white/[0.04] rounded-2xl border border-white/[0.08] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-sky-500/20 rounded-lg flex items-center justify-center text-sky-400 flex-shrink-0">1</div>
                  <p className="text-sm text-gray-300">AI Studio sayfasinda "Sign in" butonuna tikla</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-sky-500/20 rounded-lg flex items-center justify-center text-sky-400 flex-shrink-0">2</div>
                  <p className="text-sm text-gray-300">Google hesabini sec ve giris yap</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleBack} className="flex-1 py-3 glass-card rounded-2xl text-sm font-semibold tracking-wider hover:bg-white/[0.08] transition-all">
                  GERI
                </button>
                <button onClick={handleNext} className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold tracking-widest rounded-2xl transition-all shadow-[0_4px_20px_rgba(56,189,248,0.25)] active:scale-[0.98]">
                  DEVAM
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Create API Key */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in-up" role="region" aria-label="Step 3: Create API key">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold">{STEPS[2]!.title}</h2>
                <p className="text-gray-400 text-sm">{STEPS[2]!.subtitle}</p>
              </div>

              <div className="p-4 bg-white/[0.04] rounded-2xl border border-white/[0.08] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-sky-500/20 rounded-lg flex items-center justify-center text-sky-400 flex-shrink-0">1</div>
                  <p className="text-sm text-gray-300">"Create API Key" butonuna tikla</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-sky-500/20 rounded-lg flex items-center justify-center text-sky-400 flex-shrink-0">2</div>
                  <p className="text-sm text-gray-300">Olusturulan key'i kopyala</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleBack} className="flex-1 py-3 glass-card rounded-2xl text-sm font-semibold tracking-wider hover:bg-white/[0.08] transition-all">
                  GERI
                </button>
                <button onClick={handleNext} className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold tracking-widest rounded-2xl transition-all shadow-[0_4px_20px_rgba(56,189,248,0.25)] active:scale-[0.98]">
                  DEVAM
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Paste Key */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in-up" role="region" aria-label="Step 4: Paste your API key">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold">{STEPS[3]!.title}</h2>
                <p className="text-gray-400 text-sm">{STEPS[3]!.subtitle}</p>
              </div>

              <input
                type="password"
                placeholder="API Key'ini buraya yapistir"
                value={keyInput}
                onChange={(e) => { setKeyInput(e.target.value); setValidationError(null); setIsValid(false); }}
                className="w-full bg-white/[0.04] border border-white/[0.08] p-4 rounded-2xl text-center text-sky-300 focus:border-sky-500/50 focus:bg-white/[0.06] outline-none transition-all duration-300 placeholder:text-gray-600"
                aria-label="API key input"
              />

              {/* Validation status */}
              {validationError && (
                <div className="text-center text-red-400 text-sm" role="alert">{validationError}</div>
              )}
              {isValid && (
                <div className="text-center text-emerald-400 text-sm" role="status">API key gecerli!</div>
              )}

              <button
                onClick={handleTestKey}
                disabled={isValidating || keyInput.length < API_CONFIG.MIN_API_KEY_LENGTH}
                className="w-full py-3 glass-card rounded-2xl text-sm font-semibold tracking-wider hover:bg-white/[0.08] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Test API key"
              >
                {isValidating ? 'Test ediliyor...' : 'TEST ET'}
              </button>

              <div className="flex gap-3">
                <button onClick={handleBack} className="flex-1 py-3 glass-card rounded-2xl text-sm font-semibold tracking-wider hover:bg-white/[0.08] transition-all">
                  GERI
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={keyInput.length < API_CONFIG.MIN_API_KEY_LENGTH}
                  className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 disabled:opacity-40 text-white font-bold tracking-widest rounded-2xl transition-all shadow-[0_4px_20px_rgba(56,189,248,0.25)] disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  BASLAT
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Free Tier Info Card - always visible */}
        <div className="p-4 bg-white/[0.04] rounded-2xl border border-white/[0.08] space-y-2" role="region" aria-label="Free tier information">
          <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold mb-2">
            UCRETSIZ PLAN
          </div>
          <ul className="space-y-1">
            {FREE_TIER_INFO.NOTES.map((note, i) => (
              <li key={i} className="text-xs text-gray-400 flex items-center gap-2">
                <span className="text-emerald-400">&#10003;</span>
                {note}
              </li>
            ))}
          </ul>
        </div>

        {/* Features Preview Grid */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Navigate', color: 'text-sky-400' },
            { label: 'Traffic', color: 'text-emerald-400' },
            { label: 'Expiry', color: 'text-amber-400' },
            { label: 'Colors', color: 'text-purple-400' },
            { label: 'SOS', color: 'text-rose-400' },
            { label: 'Explore', color: 'text-indigo-400' },
          ].map((feature) => (
            <div
              key={feature.label}
              className="text-center p-3 bg-white/[0.03] rounded-xl border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
            >
              <span className={`text-sm font-semibold ${feature.color}`}>{feature.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
