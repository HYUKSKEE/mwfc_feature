import { UNASSIGNED_ID } from '../constants';
import type { Member } from '../types';

export function getContainerId(member: Member): string {
  return member.teamId ?? UNASSIGNED_ID;
}

export function toTeamId(containerId: string): string | null {
  return containerId === UNASSIGNED_ID ? null : containerId;
}

export function groupMemberIds(
  members: Member[],
  containerIds: string[],
): Record<string, string[]> {
  const groups: Record<string, string[]> = Object.fromEntries(
    containerIds.map((id) => [id, [] as string[]]),
  );

  for (const member of members) {
    const containerId = getContainerId(member);
    if (groups[containerId]) {
      groups[containerId].push(member.id);
    }
  }

  return groups;
}

export function findContainerId(
  memberId: string,
  groups: Record<string, string[]>,
): string | undefined {
  return Object.keys(groups).find((containerId) =>
    groups[containerId].includes(memberId),
  );
}

export function flattenGroups(
  members: Member[],
  groups: Record<string, string[]>,
  containerIds: string[],
): Member[] {
  const byId = new Map(members.map((member) => [member.id, member]));
  const next: Member[] = [];

  for (const containerId of containerIds) {
    const teamId = toTeamId(containerId);
    for (const id of groups[containerId] ?? []) {
      const member = byId.get(id);
      if (member) {
        next.push({ ...member, teamId });
      }
    }
  }

  return next;
}
