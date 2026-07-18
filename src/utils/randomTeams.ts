import type { Member, Team } from '../types';

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function assignRandomTeams(members: Member[], teams: Team[]): Member[] {
  if (teams.length === 0) {
    return members.map((member) => ({ ...member, teamId: null }));
  }

  const shuffled = shuffle(members);

  return shuffled.map((member, index) => ({
    ...member,
    teamId: teams[index % teams.length].id,
  }));
}

export function createTeams(count: number): Team[] {
  const safeCount = Math.max(1, Math.min(12, count));
  return Array.from({ length: safeCount }, (_, index) => ({
    id: `team-${index + 1}`,
    name: `${index + 1}조`,
  }));
}
