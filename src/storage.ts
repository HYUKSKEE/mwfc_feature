import type { AppData, Team } from './types';

const STORAGE_KEY = 'team-maker-data';

const DEFAULT_TEAMS: Team[] = [
  { id: 'team-1', name: '1조' },
  { id: 'team-2', name: '2조' },
];

export const DEFAULT_DATA: AppData = {
  members: [],
  teams: DEFAULT_TEAMS,
};

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;

    const parsed = JSON.parse(raw) as AppData;
    if (!Array.isArray(parsed.members) || !Array.isArray(parsed.teams)) {
      return DEFAULT_DATA;
    }

    return {
      members: parsed.members,
      teams: parsed.teams.length > 0 ? parsed.teams : DEFAULT_TEAMS,
    };
  } catch {
    return DEFAULT_DATA;
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
