import React, { memo, useMemo } from 'react';
import type { UserStats } from '../types';
import { GAMIFICATION_CONFIG } from '../constants';
import BadgeDisplay from './BadgeDisplay';

interface StatsCardProps {
  stats: UserStats;
  compact?: boolean;
}

/**
 * Stats Card Component
 * Displays user statistics and achievements
 */
const StatsCard: React.FC<StatsCardProps> = memo(({ stats, compact = false }) => {
  // Calculate progress to next level
  const levelProgress = useMemo(() => {
    const currentLevel = GAMIFICATION_CONFIG.LEVELS.find(l => l.level === stats.level);
    const nextLevel = GAMIFICATION_CONFIG.LEVELS.find(l => l.level === stats.level + 1);

    if (!currentLevel || !nextLevel) return 100;

    const pointsInLevel = stats.points - currentLevel.minPoints;
    const pointsNeeded = nextLevel.minPoints - currentLevel.minPoints;

    return Math.min((pointsInLevel / pointsNeeded) * 100, 100);
  }, [stats.points, stats.level]);

  const currentLevelName = useMemo(() => {
    const level = GAMIFICATION_CONFIG.LEVELS.find(l => l.level === stats.level);
    return level?.name || 'Beginner';
  }, [stats.level]);

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-xl border border-gray-800">
        {/* Level Badge */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <span className="text-lg font-black text-white">{stats.level}</span>
        </div>

        {/* Stats */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-white truncate">{currentLevelName}</span>
            <span className="text-[10px] text-cyan-400 font-mono">{stats.points} pts</span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>

        {/* Streak */}
        {stats.currentStreak > 0 && (
          <div className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-orange-500/20 rounded-lg">
            <span className="text-orange-400">🔥</span>
            <span className="text-xs font-bold text-orange-400">{stats.currentStreak}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6 space-y-6">
      {/* Header with Level */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          <span className="text-2xl font-black text-white">{stats.level}</span>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">{currentLevelName}</h3>
          <p className="text-sm text-cyan-400 font-mono">{stats.points} points</p>

          {/* Level progress */}
          <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-800/50 rounded-xl">
          <p className="text-2xl font-bold text-white">{stats.totalNavigations}</p>
          <p className="text-[10px] text-gray-500 font-mono uppercase">Navigations</p>
        </div>

        <div className="text-center p-3 bg-gray-800/50 rounded-xl">
          <p className="text-2xl font-bold text-white">
            {(stats.totalDistance / 1000).toFixed(1)}
          </p>
          <p className="text-[10px] text-gray-500 font-mono uppercase">KM Walked</p>
        </div>

        <div className="text-center p-3 bg-gray-800/50 rounded-xl">
          <p className="text-2xl font-bold text-orange-400">{stats.currentStreak}</p>
          <p className="text-[10px] text-gray-500 font-mono uppercase">Day Streak</p>
        </div>
      </div>

      {/* Community Stats */}
      <div className="flex justify-between py-3 border-t border-gray-800">
        <div className="text-center">
          <p className="text-lg font-bold text-green-400">{stats.routesShared}</p>
          <p className="text-[10px] text-gray-500 font-mono">Routes Shared</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-blue-400">{stats.helpGiven}</p>
          <p className="text-[10px] text-gray-500 font-mono">Help Given</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-purple-400">{stats.helpReceived}</p>
          <p className="text-[10px] text-gray-500 font-mono">Help Received</p>
        </div>
      </div>

      {/* Badges */}
      {stats.badges.length > 0 && (
        <div>
          <h4 className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-3">
            Badges ({stats.badges.filter(b => b.earnedAt).length}/{stats.badges.length})
          </h4>
          <div className="flex flex-wrap gap-4">
            {stats.badges.slice(0, 6).map((badge) => (
              <BadgeDisplay key={badge.id} badge={badge} size="small" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

StatsCard.displayName = 'StatsCard';

export default StatsCard;
