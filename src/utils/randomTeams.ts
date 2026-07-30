import { MAX_SKILL, MIN_SKILL, normalizeSkill } from '../constants/skill';
import type { Member, Team } from '../types';

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** 같은 실력끼리 섞은 뒤, 높은 실력부터 배치 순서를 만듭니다. */
function orderMembersForBalance(members: Member[]): Member[] {
  const buckets = new Map<number, Member[]>();

  for (const member of members) {
    const skill = normalizeSkill(member.skill);
    const list = buckets.get(skill) ?? [];
    list.push(member);
    buckets.set(skill, list);
  }

  const ordered: Member[] = [];
  for (let skill = MAX_SKILL; skill >= MIN_SKILL; skill -= 1) {
    ordered.push(...shuffle(buckets.get(skill) ?? []));
  }
  return ordered;
}

/**
 * 실력 합과 인원 수를 고르게 맞추는 밸런스 랜덤 배정.
 * 강한 인원부터 현재 합이 가장 낮은 조에 배치합니다.
 */
export function assignRandomTeams(members: Member[], teams: Team[]): Member[] {
  if (teams.length === 0) {
    return members.map((member) => ({ ...member, teamId: null }));
  }

  const ordered = orderMembersForBalance(members);
  const totals = teams.map(() => 0);
  const counts = teams.map(() => 0);
  const assignedTeamIndex = new Map<string, number>();

  for (const member of ordered) {
    let bestIndex = 0;

    for (let index = 1; index < teams.length; index += 1) {
      const betterSum = totals[index] < totals[bestIndex];
      const sameSumFewerPeople =
        totals[index] === totals[bestIndex] && counts[index] < counts[bestIndex];
      const sameSumSamePeopleCoinFlip =
        totals[index] === totals[bestIndex] &&
        counts[index] === counts[bestIndex] &&
        Math.random() < 0.5;

      if (betterSum || sameSumFewerPeople || sameSumSamePeopleCoinFlip) {
        bestIndex = index;
      }
    }

    assignedTeamIndex.set(member.id, bestIndex);
    totals[bestIndex] += normalizeSkill(member.skill);
    counts[bestIndex] += 1;
  }

  return members.map((member) => {
    const teamIndex = assignedTeamIndex.get(member.id);
    return {
      ...member,
      teamId: teamIndex === undefined ? null : teams[teamIndex].id,
    };
  });
}

export function createTeams(count: number): Team[] {
  const safeCount = Math.max(1, Math.min(12, count));
  return Array.from({ length: safeCount }, (_, index) => ({
    id: `team-${index + 1}`,
    name: `${index + 1}팀`,
  }));
}
