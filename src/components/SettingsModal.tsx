import React, { useState, useCallback, memo } from 'react';
import { useLiveSight } from '../contexts/LiveSightContext';
import type { SettingsModalProps, MobilityAid, VoiceSpeed, VoiceType, Language, ContrastMode } from '../types';

const MOBILITY_OPTIONS: MobilityAid[] = ['none', 'cane', 'guide_dog', 'wheelchair'];
const VOICE_SPEED_OPTIONS: VoiceSpeed[] = ['slow', 'normal', 'fast'];
const VOICE_TYPE_OPTIONS: VoiceType[] = ['male', 'female', 'neutral'];
const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'tr', label: 'Türkçe' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'العربية' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
];

type SettingsTab = 'general' | 'voice' | 'safety' | 'advanced';

/**
 * Settings Modal Component
 * Comprehensive settings for all app features
 */
const SettingsModal: React.FC<SettingsModalProps> = memo(({ isOpen, onClose }) => {
  const { settings, updateSettings, emergencyContacts } = useLiveSight();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  // Toggle handlers
  const handleToggle = useCallback((key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
  }, [settings, updateSettings]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'voice', label: 'Voice', icon: '🔊' },
    { id: 'safety', label: 'Safety', icon: '🛡️' },
    { id: 'advanced', label: 'Advanced', icon: '🔧' },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Modal Content */}
      <div className="relative bg-[#09090b] border border-gray-800 w-full max-w-md rounded-[2rem] shadow-[0_0_60px_rgba(8,145,178,0.15)] overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gray-900/30 p-4 border-b border-gray-800 flex justify-between items-center backdrop-blur-xl flex-shrink-0">
          <div>
            <h2
              id="settings-title"
              className="text-lg font-black text-white tracking-widest font-mono"
            >
              SETTINGS
            </h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">
              Customize Your Experience
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-800/50 border border-gray-700 flex items-center justify-center text-gray-400 hover:bg-cyan-900/20 hover:text-cyan-400 hover:border-cyan-500/50 transition"
            aria-label="Close settings"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 bg-gray-900/20 flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">

          {/* General Tab */}
          {activeTab === 'general' && (
            <>
              {/* Mobility Aid */}
              <fieldset className="space-y-3">
                <legend className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest font-bold">
                  Mobility Aid
                </legend>
                <div className="grid grid-cols-2 gap-2" role="radiogroup">
                  {MOBILITY_OPTIONS.map((aid) => (
                    <button
                      key={aid}
                      onClick={() => updateSettings({ mobilityAid: aid })}
                      className={`p-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                        settings.mobilityAid === aid
                          ? 'bg-cyan-950/30 border-cyan-500 text-cyan-400'
                          : 'bg-gray-900/50 border-gray-800 text-gray-500 hover:border-gray-600'
                      }`}
                      role="radio"
                      aria-checked={settings.mobilityAid === aid}
                    >
                      {aid.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Contrast Mode */}
              <fieldset className="space-y-3">
                <legend className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest font-bold">
                  Display Contrast
                </legend>
                <div className="flex bg-black p-1 rounded-xl border border-gray-800">
                  {(['normal', 'high'] as ContrastMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateSettings({ contrastMode: mode })}
                      className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase transition-all ${
                        settings.contrastMode === mode
                          ? 'bg-gray-800 text-white border border-gray-700'
                          : 'text-gray-600 hover:text-gray-400'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Proactive Mode */}
              <ToggleSwitch
                label="Proactive Mode"
                description="Continuous environmental scanning"
                checked={settings.proactiveMode}
                onChange={() => handleToggle('proactiveMode')}
                color="green"
              />

              {/* Haptic Feedback */}
              <ToggleSwitch
                label="Haptic Feedback"
                description="Vibration alerts for hazards"
                checked={settings.hapticFeedback}
                onChange={() => handleToggle('hapticFeedback')}
              />
            </>
          )}

          {/* Voice Tab */}
          {activeTab === 'voice' && (
            <>
              {/* Language */}
              <fieldset className="space-y-3">
                <legend className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest font-bold">
                  Language
                </legend>
                <select
                  value={settings.language}
                  onChange={(e) => updateSettings({ language: e.target.value as Language })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none"
                >
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </fieldset>

              {/* Voice Type */}
              <fieldset className="space-y-3">
                <legend className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest font-bold">
                  Voice Type
                </legend>
                <div className="flex bg-black p-1 rounded-xl border border-gray-800">
                  {VOICE_TYPE_OPTIONS.map((type) => (
                    <button
                      key={type}
                      onClick={() => updateSettings({ voiceType: type })}
                      className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase transition-all ${
                        settings.voiceType === type
                          ? 'bg-gray-800 text-white border border-gray-700'
                          : 'text-gray-600 hover:text-gray-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Voice Speed */}
              <fieldset className="space-y-3">
                <legend className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest font-bold">
                  Speech Rate
                </legend>
                <div className="flex bg-black p-1 rounded-xl border border-gray-800">
                  {VOICE_SPEED_OPTIONS.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => updateSettings({ voiceSpeed: speed })}
                      className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase transition-all ${
                        settings.voiceSpeed === speed
                          ? 'bg-gray-800 text-white border border-gray-700'
                          : 'text-gray-600 hover:text-gray-400'
                      }`}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Note: Spatial Audio removed - not yet implemented */}
            </>
          )}

          {/* Safety Tab */}
          {activeTab === 'safety' && (
            <>
              {/* Emergency Contacts Info */}
              <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">Emergency Contacts</span>
                  <span className="text-xs text-cyan-400 font-mono">
                    {emergencyContacts.length} saved
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Manage contacts in the Emergency Contacts section
                </p>
              </div>

              {/* Auto SOS */}
              <ToggleSwitch
                label="Auto SOS"
                description="Auto-trigger SOS on fall detection"
                checked={settings.autoSOS}
                onChange={() => handleToggle('autoSOS')}
                color="red"
              />

              {/* Battery Alert */}
              <ToggleSwitch
                label="Battery Alerts"
                description="Warn when battery is low"
                checked={settings.batteryAlert}
                onChange={() => handleToggle('batteryAlert')}
                color="yellow"
              />
            </>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <>
              {/* Quiet Hours */}
              <div className="space-y-3">
                <ToggleSwitch
                  label="Quiet Hours"
                  description="Reduce notifications during set hours"
                  checked={settings.quietHours.enabled}
                  onChange={() => updateSettings({
                    quietHours: { ...settings.quietHours, enabled: !settings.quietHours.enabled }
                  })}
                />

                {settings.quietHours.enabled && (
                  <div className="flex gap-4 pl-4">
                    <div className="flex-1">
                      <label htmlFor="quiet-start" className="text-[10px] text-gray-500 uppercase block mb-1">Start</label>
                      <input
                        id="quiet-start"
                        type="time"
                        value={settings.quietHours.start}
                        onChange={(e) => updateSettings({
                          quietHours: { ...settings.quietHours, start: e.target.value }
                        })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="quiet-end" className="text-[10px] text-gray-500 uppercase block mb-1">End</label>
                      <input
                        id="quiet-end"
                        type="time"
                        value={settings.quietHours.end}
                        onChange={(e) => updateSettings({
                          quietHours: { ...settings.quietHours, end: e.target.value }
                        })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* App Info */}
              <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Version</span>
                  <span className="text-gray-300 font-mono">2.0.0</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">AI Engine</span>
                  <span className="text-gray-300 font-mono">Gemini Live API</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Model</span>
                  <span className="text-gray-300 font-mono">Gemini 3 Flash</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/30 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-black py-3 rounded-xl transition active:scale-[0.98] shadow-[0_0_20px_rgba(8,145,178,0.3)] tracking-widest uppercase text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
});

SettingsModal.displayName = 'SettingsModal';

/**
 * Toggle Switch Component
 */
interface ToggleSwitchProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  color?: 'cyan' | 'green' | 'red' | 'yellow';
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = memo(({
  label,
  description,
  checked,
  onChange,
  color = 'cyan',
}) => {
  const colors = {
    cyan: { bg: 'bg-cyan-500/20', border: 'border-cyan-500', dot: 'bg-cyan-400', shadow: 'shadow-[0_0_8px_#22d3ee]' },
    green: { bg: 'bg-green-500/20', border: 'border-green-500', dot: 'bg-green-400', shadow: 'shadow-[0_0_8px_#4ade80]' },
    red: { bg: 'bg-red-500/20', border: 'border-red-500', dot: 'bg-red-400', shadow: 'shadow-[0_0_8px_#f87171]' },
    yellow: { bg: 'bg-yellow-500/20', border: 'border-yellow-500', dot: 'bg-yellow-400', shadow: 'shadow-[0_0_8px_#facc15]' },
  };

  const colorClass = colors[color];

  return (
    <button
      onClick={onChange}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        checked
          ? `${colorClass.bg} ${colorClass.border}`
          : 'bg-gray-900/30 border-gray-800 hover:border-gray-700'
      }`}
      role="switch"
      aria-checked={checked}
    >
      <div className="flex justify-between items-center">
        <div>
          <span className={`block font-bold text-sm ${checked ? 'text-white' : 'text-gray-400'}`}>
            {label}
          </span>
          <span className="text-[10px] text-gray-500 block mt-0.5">
            {description}
          </span>
        </div>
        <div
          className={`w-11 h-6 rounded-full transition-colors relative ${
            checked
              ? `${colorClass.bg} border ${colorClass.border}`
              : 'bg-gray-800 border border-gray-700'
          }`}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300 ${
              checked
                ? `translate-x-6 ${colorClass.dot} ${colorClass.shadow}`
                : 'translate-x-1 bg-gray-500'
            }`}
          />
        </div>
      </div>
    </button>
  );
});

ToggleSwitch.displayName = 'ToggleSwitch';

export default SettingsModal;
