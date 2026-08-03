import {
  migrateSkillFromV1,
  normalizeSkill,
  SKILL_SCHEMA_VERSION,
} from './constants/skill';
import type { AppData, Member, Team } from './types';

const STORAGE_KEY = 'team-maker-data';

const DEFAULT_TEAMS: Team[] = [
  { id: 'team-1', name: '1팀' },
  { id: 'team-2', name: '2팀' },
];

function normalizeTeamName(name: string): string {
  return name.replace(/^(\d+)조$/, '$1팀');
}

export const DEFAULT_DATA: AppData = {
  version: SKILL_SCHEMA_VERSION,
  members: [],
  teams: DEFAULT_TEAMS,
};

function normalizeMember(
  raw: Partial<Member>,
  fromV1: boolean,
): Member | null {
  if (typeof raw.id !== 'string' || typeof raw.name !== 'string') return null;

  return {
    id: raw.id,
    name: raw.name,
    skill: fromV1 ? migrateSkillFromV1(raw.skill) : normalizeSkill(raw.skill),
    teamId: typeof raw.teamId === 'string' ? raw.teamId : null,
  };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;

    const parsed = JSON.parse(raw) as Partial<AppData>;
    if (!Array.isArray(parsed.members) || !Array.isArray(parsed.teams)) {
      return DEFAULT_DATA;
    }

    const storedVersion =
      typeof parsed.version === 'number' ? parsed.version : 1;
    const fromV1 = storedVersion < SKILL_SCHEMA_VERSION;

    const data: AppData = {
      version: SKILL_SCHEMA_VERSION,
      members: parsed.members
        .map((member) => normalizeMember(member, fromV1))
        .filter((member): member is Member => Boolean(member)),
      teams:
        parsed.teams.length > 0
          ? parsed.teams.map((team) => ({
              ...team,
              name: normalizeTeamName(team.name),
            }))
          : DEFAULT_TEAMS,
    };

    // 마이그레이션된 데이터를 바로 다시 저장해 이후 로드를 단순화
    if (fromV1) {
      saveData(data);
    }

    return data;
  } catch {
    return DEFAULT_DATA;
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...data,
      version: SKILL_SCHEMA_VERSION,
    }),
  );
}
