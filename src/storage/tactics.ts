import {
  DEFAULT_TACTICS_DATA,
  type TacticsBoardData,
  type TacticsPlacement,
  type TacticsSport,
} from '../types/tactics';

const STORAGE_KEY = 'team-maker-tactics';

function normalizePlacement(raw: Partial<TacticsPlacement>): TacticsPlacement | null {
  if (typeof raw.memberId !== 'string') return null;
  const x = typeof raw.x === 'number' ? raw.x : 50;
  const y = typeof raw.y === 'number' ? raw.y : 50;
  return {
    memberId: raw.memberId,
    x: Math.min(100, Math.max(0, x)),
    y: Math.min(100, Math.max(0, y)),
  };
}

function normalizeSport(value: unknown): TacticsSport {
  if (value === 'soccer' || value === 'basketball' || value === 'default') {
    return value;
  }
  return 'default';
}

export function loadTacticsData(): TacticsBoardData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TACTICS_DATA;

    const parsed = JSON.parse(raw) as Partial<TacticsBoardData>;
    const placements = Array.isArray(parsed.placements)
      ? parsed.placements
          .map((item) => normalizePlacement(item))
          .filter((item): item is TacticsPlacement => Boolean(item))
      : [];

    return {
      sport: normalizeSport(parsed.sport),
      placements,
    };
  } catch {
    return DEFAULT_TACTICS_DATA;
  }
}

export function saveTacticsData(data: TacticsBoardData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
