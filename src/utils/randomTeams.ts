import { MAX_SKILL, MIN_SKILL, normalizeSkill } from '../constants/skill';
import type { Member, SkillLevel, Team } from '../types';

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** 최하(0)도 합산에 반영되도록 +1 가중치를 사용합니다. */
function skillWeight(skill: SkillLevel): number {
  return normalizeSkill(skill) + 1;
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
 * 인원 수를 먼저 균등하게 맞추고, 그다음 실력 합을 고르게 맞춥니다.
 * 강한 인원부터 배치합니다.
 */
export function assignRandomTeams(members: Member[], teams: Team[]): Member[] {
  if (teams.length === 0) {
    return members.map((member) => ({ ...member, teamId: null }));
  }

  const ordered = orderMembersForBalance(members);
  const totals = teams.map(() => 0);
  const counts = teams.map(() => 0);
  const assignedTeamIndex = new Map<string, number>();
  const maxPerTeam = Math.ceil(Math.max(members.length, 1) / teams.length);

  for (const member of ordered) {
    let bestIndex = -1;

    for (let index = 0; index < teams.length; index += 1) {
      if (counts[index] >= maxPerTeam) continue;

      if (bestIndex < 0) {
        bestIndex = index;
        continue;
      }

      // 1) 인원 수 우선
      if (counts[index] < counts[bestIndex]) {
        bestIndex = index;
        continue;
      }
      if (counts[index] > counts[bestIndex]) continue;

      // 2) 인원이 같으면 실력 합이 낮은 팀
      if (totals[index] < totals[bestIndex]) {
        bestIndex = index;
        continue;
      }
      if (totals[index] > totals[bestIndex]) continue;

      // 3) 동점이면 랜덤
      if (Math.random() < 0.5) {
        bestIndex = index;
      }
    }

    // 모든 팀이 max인 경우 폴백 (이론상 거의 없음)
    if (bestIndex < 0) {
      bestIndex = counts.indexOf(Math.min(...counts));
    }

    assignedTeamIndex.set(member.id, bestIndex);
    totals[bestIndex] += skillWeight(member.skill);
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
