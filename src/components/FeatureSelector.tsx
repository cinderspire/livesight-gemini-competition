import React, { memo, useCallback } from 'react';
import type { ActiveFeature } from '../types';

interface FeatureSelectorProps {
  activeFeature: ActiveFeature;
  onSelect: (feature: ActiveFeature) => void;
  disabled?: boolean;
}

interface FeatureItem {
  id: ActiveFeature;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  activeColor: string;
  iconColor: string;
}

const FEATURES: FeatureItem[] = [
  {
    id: 'navigation',
    label: 'Navigation',
    shortLabel: 'NAV',
    description: 'Real-time obstacle detection and guidance',
    color: 'from-sky-500/20 to-cyan-500/20 border-sky-500/40',
    activeColor: 'from-sky-500 to-cyan-500',
    iconColor: 'text-sky-400',
  },
  {
    id: 'expiration',
    label: 'Expiration',
    shortLabel: 'EXP',
    description: 'Read expiration dates on products',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40',
    activeColor: 'from-amber-500 to-orange-500',
    iconColor: 'text-amber-400',
  },
  {
    id: 'color',
    label: 'Colors',
    shortLabel: 'CLR',
    description: 'Identify colors and clothing patterns',
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/40',
    activeColor: 'from-purple-500 to-pink-500',
    iconColor: 'text-purple-400',
  },
  {
    id: 'traffic',
    label: 'Traffic',
    shortLabel: 'TRF',
    description: 'Traffic light detection at crossings',
    color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/40',
    activeColor: 'from-emerald-500 to-green-500',
    iconColor: 'text-emerald-400',
  },
  {
    id: 'explore',
    label: 'Explore',
    shortLabel: 'EXP',
    description: 'Explore and describe surroundings',
    color: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/40',
    activeColor: 'from-indigo-500 to-blue-500',
    iconColor: 'text-indigo-400',
  },
];

// SVG icons for each feature
const FeatureIcon: React.FC<{ id: ActiveFeature; className?: string }> = ({ id, className = 'w-5 h-5' }) => {
  switch (id) {
    case 'navigation':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3 11 22 2 13 21 11 13 3 11" />
        </svg>
      );
    case 'expiration':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
        </svg>
      );
    case 'color':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="13.5" cy="6.5" r="2.5" />
          <circle cx="17.5" cy="10.5" r="2.5" />
          <circle cx="8.5" cy="7.5" r="2.5" />
          <circle cx="6.5" cy="12.5" r="2.5" />
          <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-1.5 5-3 5c-1 0-1.5-.5-2-1-.5.5-1.5 1-3 1s-2-.5-2-2" />
        </svg>
      );
    case 'traffic':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="1" width="12" height="22" rx="2" />
          <circle cx="12" cy="7" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="17" r="2" />
        </svg>
      );
    case 'explore':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <circle cx="11" cy="11" r="3" />
        </svg>
      );
    default:
      return null;
  }
};

/**
 * Feature Selector Component
 * Allows switching between different app features - modern glassmorphism design
 */
const FeatureSelector: React.FC<FeatureSelectorProps> = memo(({
  activeFeature,
  onSelect,
  disabled = false,
}) => {
  const handleSelect = useCallback((feature: ActiveFeature) => {
    if (!disabled) {
      onSelect(feature);
    }
  }, [disabled, onSelect]);

  return (
    <div className="w-full" role="tablist" aria-label="Feature selector">
      {/* Horizontal scroll container */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 px-1">
        {FEATURES.map((feature) => {
          const isActive = activeFeature === feature.id;

          return (
            <button
              key={feature.id}
              onClick={() => handleSelect(feature.id)}
              disabled={disabled}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${feature.id}`}
              className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-300 ${
                isActive
                  ? `bg-gradient-to-br ${feature.color} border shadow-lg`
                  : 'bg-white/[0.03] border border-white/[0.06] text-gray-400 hover:bg-white/[0.06] hover:text-white hover:border-white/10'
              } ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}
            >
              <div className={`${isActive ? feature.iconColor : ''} transition-colors duration-300`}>
                <FeatureIcon id={feature.id} className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-semibold tracking-wider ${isActive ? 'text-white' : ''}`}>
                {feature.shortLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Current feature description */}
      <div className="mt-2 px-1">
        <p className="text-[11px] text-gray-500">
          {FEATURES.find(f => f.id === activeFeature)?.description}
        </p>
      </div>
    </div>
  );
});

FeatureSelector.displayName = 'FeatureSelector';

export default FeatureSelector;
