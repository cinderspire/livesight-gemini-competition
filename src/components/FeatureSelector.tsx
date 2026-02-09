import React, { memo, useCallback } from 'react';
import type { ActiveFeature } from '../types';

interface FeatureSelectorProps {
  activeFeature: ActiveFeature;
  onSelect: (feature: ActiveFeature) => void;
  disabled?: boolean;
}

interface FeatureItem {
  id: ActiveFeature;
  icon: string;
  label: string;
  shortLabel: string;
  description: string;
}

const FEATURES: FeatureItem[] = [
  {
    id: 'navigation',
    icon: '🧭',
    label: 'Navigation',
    shortLabel: 'NAV',
    description: 'Real-time obstacle detection and guidance',
  },
  {
    id: 'expiration',
    icon: '📅',
    label: 'Expiration',
    shortLabel: 'EXP',
    description: 'Read expiration dates on products',
  },
  {
    id: 'color',
    icon: '🎨',
    label: 'Colors',
    shortLabel: 'CLR',
    description: 'Identify colors and clothing patterns',
  },
  {
    id: 'traffic',
    icon: '🚦',
    label: 'Traffic',
    shortLabel: 'TRF',
    description: 'Traffic light detection at crossings',
  },
  {
    id: 'explore',
    icon: '🔍',
    label: 'Explore',
    shortLabel: 'EXP',
    description: 'Explore and describe surroundings',
  },
];

/**
 * Feature Selector Component
 * Allows switching between different app features
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
              className={`flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(8,145,178,0.5)]'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="text-2xl" aria-hidden="true">{feature.icon}</span>
              <span className="text-[10px] font-mono font-bold tracking-wider">
                {feature.shortLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Current feature description */}
      <div className="mt-2 px-1">
        <p className="text-xs text-gray-500 font-mono">
          {FEATURES.find(f => f.id === activeFeature)?.description}
        </p>
      </div>
    </div>
  );
});

FeatureSelector.displayName = 'FeatureSelector';

export default FeatureSelector;
