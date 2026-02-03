import type { UserStats, UserBadge } from '../../types';
import { GAMIFICATION_CONFIG } from '../../constants';

/**
 * Gamification Service
 * Manages points, badges, achievements, and streaks
 */

/**
 * Award points for an action
 */
export function awardPoints(
  currentStats: UserStats,
  action: keyof typeof GAMIFICATION_CONFIG.POINTS
): { newStats: Partial<UserStats>; pointsAwarded: number } {
  const pointsAwarded = GAMIFICATION_CONFIG.POINTS[action] || 0;

  return {
    newStats: {
      points: currentStats.points + pointsAwarded,
    },
    pointsAwarded,
  };
}

/**
 * Check and update streak
 */
export function updateStreak(currentStats: UserStats): Partial<UserStats> {
  const now = new Date();
  const today = now.toDateString();

  // Get last activity date from localStorage
  const lastActivity = localStorage.getItem('livesight_last_activity');

  if (!lastActivity) {
    // First activity
    localStorage.setItem('livesight_last_activity', today);
    return {
      currentStreak: 1,
      longestStreak: Math.max(1, currentStats.longestStreak),
    };
  }

  const lastDate = new Date(lastActivity);
  const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  localStorage.setItem('livesight_last_activity', today);

  if (daysDiff === 0) {
    // Same day, no change
    return {};
  } else if (daysDiff === 1) {
    // Consecutive day, increment streak
    const newStreak = currentStats.currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, currentStats.longestStreak),
    };
  } else {
    // Streak broken
    return {
      currentStreak: 1,
    };
  }
}

/**
 * Check for badge eligibility
 */
export function checkBadgeEligibility(
  currentStats: UserStats
): UserBadge[] {
  const newBadges: UserBadge[] = [];
  const earnedBadgeIds = new Set(
    currentStats.badges.filter(b => b.earnedAt).map(b => b.id)
  );

  // Check each badge - using badge IDs from GAMIFICATION_CONFIG.BADGES
  for (const badgeConfig of GAMIFICATION_CONFIG.BADGES) {
    if (earnedBadgeIds.has(badgeConfig.id)) continue;

    let earned = false;

    // Match badge IDs from constants
    if (badgeConfig.id === 'first_steps') {
      earned = currentStats.totalNavigations >= 1;
    } else if (badgeConfig.id === 'explorer_10') {
      earned = currentStats.totalNavigations >= 10;
    } else if (badgeConfig.id === 'explorer_50') {
      earned = currentStats.totalNavigations >= 50;
    } else if (badgeConfig.id === 'explorer_100') {
      earned = currentStats.totalNavigations >= 100;
    } else if (badgeConfig.id === 'helper') {
      earned = currentStats.helpGiven >= 1;
    } else if (badgeConfig.id === 'community_hero') {
      earned = currentStats.helpGiven >= 10;
    } else if (badgeConfig.id === 'route_creator') {
      earned = currentStats.routesShared >= 1;
    } else if (badgeConfig.id === 'streak_7') {
      earned = currentStats.currentStreak >= 7;
    } else if (badgeConfig.id === 'streak_30') {
      earned = currentStats.currentStreak >= 30;
    }

    if (earned) {
      newBadges.push({
        id: badgeConfig.id,
        name: badgeConfig.name,
        description: badgeConfig.description,
        icon: badgeConfig.icon,
        earnedAt: Date.now(),
      });
    }
  }

  return newBadges;
}

/**
 * Get badge progress for a specific badge
 */
export function getBadgeProgress(
  badgeId: string,
  currentStats: UserStats
): { current: number; target: number; percentage: number } {
  const targets: Record<string, { stat: keyof UserStats; target: number }> = {
    first_steps: { stat: 'totalNavigations', target: 1 },
    explorer_10: { stat: 'totalNavigations', target: 10 },
    explorer_50: { stat: 'totalNavigations', target: 50 },
    explorer_100: { stat: 'totalNavigations', target: 100 },
    helper: { stat: 'helpGiven', target: 1 },
    community_hero: { stat: 'helpGiven', target: 10 },
    route_creator: { stat: 'routesShared', target: 1 },
    streak_7: { stat: 'currentStreak', target: 7 },
    streak_30: { stat: 'currentStreak', target: 30 },
  };

  const targetInfo = targets[badgeId];
  if (!targetInfo) {
    return { current: 0, target: 1, percentage: 0 };
  }

  const current = currentStats[targetInfo.stat] as number;
  const percentage = Math.min((current / targetInfo.target) * 100, 100);

  return {
    current,
    target: targetInfo.target,
    percentage,
  };
}

/**
 * Get current level info
 */
export function getLevelInfo(points: number): {
  level: number;
  name: string;
  currentPoints: number;
  nextLevelPoints: number;
  progress: number;
} {
  const levels = GAMIFICATION_CONFIG.LEVELS;
  let currentLevelData = { level: 1, name: 'Beginner', minPoints: 0 };
  let nextLevelData: { level: number; name: string; minPoints: number } | null = levels[1] ? { ...levels[1] } : null;

  for (let i = levels.length - 1; i >= 0; i--) {
    const levelItem = levels[i];
    if (levelItem && points >= levelItem.minPoints) {
      currentLevelData = { level: levelItem.level, name: levelItem.name, minPoints: levelItem.minPoints };
      const nextItem = levels[i + 1];
      nextLevelData = nextItem ? { level: nextItem.level, name: nextItem.name, minPoints: nextItem.minPoints } : null;
      break;
    }
  }

  const pointsInLevel = points - currentLevelData.minPoints;
  const pointsNeeded = nextLevelData
    ? nextLevelData.minPoints - currentLevelData.minPoints
    : 1;
  const progress = nextLevelData
    ? Math.min((pointsInLevel / pointsNeeded) * 100, 100)
    : 100;

  return {
    level: currentLevelData.level,
    name: currentLevelData.name,
    currentPoints: points,
    nextLevelPoints: nextLevelData?.minPoints || currentLevelData.minPoints,
    progress,
  };
}

/**
 * Generate achievement announcement
 */
export function getAchievementAnnouncement(badge: UserBadge): string {
  return `Congratulations! You've earned the "${badge.name}" badge! ${badge.description}`;
}

/**
 * Get all available badges with progress
 */
export function getAllBadgesWithProgress(currentStats: UserStats): UserBadge[] {
  return GAMIFICATION_CONFIG.BADGES.map(badgeConfig => {
    const earned = currentStats.badges.find(b => b.id === badgeConfig.id && b.earnedAt);
    const progress = getBadgeProgress(badgeConfig.id, currentStats);

    return {
      id: badgeConfig.id,
      name: badgeConfig.name,
      description: badgeConfig.description,
      icon: badgeConfig.icon,
      earnedAt: earned?.earnedAt,
      progress: progress.current,
      target: progress.target,
    };
  });
}

/**
 * Record navigation completion
 */
export function recordNavigation(
  currentStats: UserStats,
  distanceMeters: number
): Partial<UserStats> {
  const { newStats } = awardPoints(currentStats, 'NAVIGATION_COMPLETE');
  const streakUpdate = updateStreak(currentStats);

  return {
    ...newStats,
    ...streakUpdate,
    totalNavigations: currentStats.totalNavigations + 1,
    totalDistance: currentStats.totalDistance + distanceMeters,
  };
}

export default {
  awardPoints,
  updateStreak,
  checkBadgeEligibility,
  getBadgeProgress,
  getLevelInfo,
  getAchievementAnnouncement,
  getAllBadgesWithProgress,
  recordNavigation,
};
