import type { SkillLevel } from '../types';

export const DEFAULT_SKILL: SkillLevel = 3;

export const SKILL_OPTIONS: ReadonlyArray<{ value: SkillLevel; label: string }> = [
  { value: 1, label: '하' },
  { value: 2, label: '중하' },
  { value: 3, label: '중' },
  { value: 4, label: '중상' },
  { value: 5, label: '상' },
];

export function isSkillLevel(value: unknown): value is SkillLevel {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

export function normalizeSkill(value: unknown): SkillLevel {
  return isSkillLevel(value) ? value : DEFAULT_SKILL;
}

export function getSkillLabel(skill: SkillLevel): string {
  return SKILL_OPTIONS.find((option) => option.value === skill)?.label ?? '중';
}
