import type { ObstacleDetection, ObstacleCategory, RiskLevel, ClockDirection } from '../../types';
import { OBSTACLE_CONFIG } from '../../constants';

/**
 * Obstacle Detection Service
 * Categorizes and prioritizes detected obstacles
 */

/**
 * Determine risk level based on distance and category
 */
export function calculateRiskLevel(
  distance: number,
  category: ObstacleCategory
): RiskLevel {
  // Moving objects and vehicles are always higher priority
  const categoryMultiplier: Record<ObstacleCategory, number> = {
    vehicle: 1.5,
    moving: 1.3,
    drop: 1.2,
    overhead: 1.1,
    ground: 1.0,
    surface: 0.9,
  };

  const effectiveDistance = distance / (categoryMultiplier[category] || 1);

  if (effectiveDistance <= OBSTACLE_CONFIG.ALERT_DISTANCE_CRITICAL) {
    return 'critical';
  }
  if (effectiveDistance <= OBSTACLE_CONFIG.ALERT_DISTANCE_HIGH) {
    return 'high';
  }
  if (effectiveDistance <= OBSTACLE_CONFIG.ALERT_DISTANCE_MEDIUM) {
    return 'medium';
  }
  return 'low';
}

/**
 * Categorize obstacle type
 */
export function categorizeObstacle(obstacleType: string): ObstacleCategory {
  const type = obstacleType.toLowerCase();

  // Ground obstacles
  if (OBSTACLE_CONFIG.CATEGORIES.ground.some(o => type.includes(o))) {
    return 'ground';
  }

  // Overhead obstacles
  if (OBSTACLE_CONFIG.CATEGORIES.overhead.some(o => type.includes(o))) {
    return 'overhead';
  }

  // Moving obstacles
  if (OBSTACLE_CONFIG.CATEGORIES.moving.some(o => type.includes(o))) {
    return 'moving';
  }

  // Vehicles
  if (OBSTACLE_CONFIG.CATEGORIES.vehicle.some(o => type.includes(o))) {
    return 'vehicle';
  }

  // Surface hazards
  if (OBSTACLE_CONFIG.CATEGORIES.surface.some(o => type.includes(o))) {
    return 'surface';
  }

  // Drop hazards
  if (OBSTACLE_CONFIG.CATEGORIES.drop.some(o => type.includes(o))) {
    return 'drop';
  }

  // Default to ground
  return 'ground';
}

/**
 * Parse obstacle from AI response
 */
export function parseObstacleResponse(response: string): ObstacleDetection[] {
  const obstacles: ObstacleDetection[] = [];

  // Split by potential obstacle descriptions
  const segments = response.split(/[.!]/);

  for (const segment of segments) {
    if (!segment) continue;

    const lower = segment.toLowerCase();

    // Skip if no obstacle keywords
    if (!lower.match(/obstacle|hazard|warning|caution|danger|ahead|meter|o'clock/i)) {
      continue;
    }

    // Extract obstacle type
    const typeMatch = segment.match(
      /(?:a|an)\s+(\w+(?:\s+\w+)?)|(\w+)\s+(?:at|ahead|detected|obstacle)/i
    );
    const type = typeMatch?.[1] || typeMatch?.[2] || 'obstacle';

    // Extract distance
    const distanceMatch = segment.match(/(\d+(?:\.\d+)?)\s*(?:meters?|m\b)/i);
    const distanceStr = distanceMatch?.[1];
    const distance = distanceStr ? parseFloat(distanceStr) : 5;

    // Extract direction (clock notation)
    const directionMatch = segment.match(/(\d{1,2})\s*o['']?clock/i);
    let direction: ClockDirection = 12;
    if (directionMatch?.[1]) {
      const dir = parseInt(directionMatch[1], 10);
      if (dir >= 1 && dir <= 12) {
        direction = dir as ClockDirection;
      }
    }

    // Determine category
    const category = categorizeObstacle(type);

    // Calculate risk level
    const riskLevel = calculateRiskLevel(distance, category);

    obstacles.push({
      id: `obs-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      category,
      riskLevel,
      distance,
      direction,
      confidence: 0.8,
    });
  }

  return obstacles;
}

/**
 * Generate obstacle announcement
 */
export function getObstacleAnnouncement(obstacle: ObstacleDetection): string {
  const directionText = obstacle.direction === 12
    ? 'directly ahead'
    : `at ${obstacle.direction} o'clock`;

  const distanceText = obstacle.distance < 1
    ? 'less than 1 meter'
    : `${Math.round(obstacle.distance)} meters`;

  // Urgency prefix based on risk level
  const prefixes: Record<RiskLevel, string> = {
    critical: 'DANGER! ',
    high: 'WARNING! ',
    medium: 'CAUTION. ',
    low: '',
  };

  // Action recommendation based on category
  const actions: Record<ObstacleCategory, string> = {
    ground: 'Step carefully.',
    overhead: 'Duck or move around.',
    moving: 'Wait or proceed with caution.',
    surface: 'Watch your footing.',
    drop: 'Stop! Do not proceed.',
    vehicle: 'Stop and wait.',
  };

  const prefix = prefixes[obstacle.riskLevel];
  const action = actions[obstacle.category];

  return `${prefix}${obstacle.type} ${directionText}, ${distanceText}. ${action}`;
}

/**
 * Sort obstacles by priority
 */
export function sortObstaclesByPriority(obstacles: ObstacleDetection[]): ObstacleDetection[] {
  const riskOrder: Record<RiskLevel, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return [...obstacles].sort((a, b) => {
    // First by risk level
    const riskDiff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    if (riskDiff !== 0) return riskDiff;

    // Then by distance
    return a.distance - b.distance;
  });
}

/**
 * Filter obstacles within alert range
 */
export function filterAlertableObstacles(
  obstacles: ObstacleDetection[],
  maxDistance: number = OBSTACLE_CONFIG.DETECTION_RANGE
): ObstacleDetection[] {
  return obstacles.filter(obs => obs.distance <= maxDistance);
}

/**
 * Get navigation guidance based on obstacles
 */
export function getNavigationGuidance(
  obstacles: ObstacleDetection[]
): { direction: 'left' | 'right' | 'forward' | 'stop'; message: string } {
  if (obstacles.length === 0) {
    return { direction: 'forward', message: 'Path is clear. Proceed forward.' };
  }

  const sorted = sortObstaclesByPriority(obstacles);
  const mostUrgent = sorted[0];

  if (!mostUrgent) {
    return { direction: 'forward', message: 'Path is clear. Proceed forward.' };
  }

  if (mostUrgent.riskLevel === 'critical') {
    return { direction: 'stop', message: 'STOP! Immediate hazard detected.' };
  }

  // Determine best direction based on obstacle position
  if (mostUrgent.direction >= 10 || mostUrgent.direction <= 2) {
    // Obstacle ahead - check sides
    const leftObstacles = obstacles.filter(o => o.direction >= 9 && o.direction <= 11);
    const rightObstacles = obstacles.filter(o => o.direction >= 1 && o.direction <= 3);

    if (leftObstacles.length < rightObstacles.length) {
      return { direction: 'left', message: 'Obstacle ahead. Move left.' };
    }
    return { direction: 'right', message: 'Obstacle ahead. Move right.' };
  }

  if (mostUrgent.direction >= 3 && mostUrgent.direction <= 6) {
    return { direction: 'left', message: 'Obstacle on right. Bear left.' };
  }

  if (mostUrgent.direction >= 6 && mostUrgent.direction <= 9) {
    return { direction: 'right', message: 'Obstacle on left. Bear right.' };
  }

  return { direction: 'forward', message: 'Proceed with caution.' };
}

export default {
  calculateRiskLevel,
  categorizeObstacle,
  parseObstacleResponse,
  getObstacleAnnouncement,
  sortObstaclesByPriority,
  filterAlertableObstacles,
  getNavigationGuidance,
};
