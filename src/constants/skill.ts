import type { SkillLevel } from '../types';

/**
 * 기존 저장 데이터(1~5)와 호환되도록 인덱스를 밀지 않습니다.
 * - 최하: 0 (기존 범위 밖)
 * - 하~상: 1~5 (기존 그대로)
 * - 최상: 6 (기존 범위 밖)
 */
export const SKILL_OPTIONS = [
  { value: 0, label: '최하' },
  { value: 1, label: '하' },
  { value: 2, label: '중하' },
  { value: 3, label: '중' },
  { value: 4, label: '중상' },
  { value: 5, label: '상' },
  { value: 6, label: '최상' },
] as const satisfies ReadonlyArray<{ value: SkillLevel; label: string }>;

export const DEFAULT_SKILL: SkillLevel = 3;

/** 이 값 이상이면 강조(악센트) 톤으로 표시합니다. */
export const HIGHLIGHT_SKILL_THRESHOLD: SkillLevel = 5;

export const MIN_SKILL: SkillLevel = SKILL_OPTIONS[0].value;
export const MAX_SKILL: SkillLevel = SKILL_OPTIONS[SKILL_OPTIONS.length - 1].value;

export function isHighlightSkill(skill: SkillLevel): boolean {
  return skill >= HIGHLIGHT_SKILL_THRESHOLD;
}

const SKILL_VALUES = new Set<number>(SKILL_OPTIONS.map((option) => option.value));

export function isSkillLevel(value: unknown): value is SkillLevel {
  return typeof value === 'number' && SKILL_VALUES.has(value);
}

export function normalizeSkill(value: unknown): SkillLevel {
  return isSkillLevel(value) ? value : DEFAULT_SKILL;
}

export function getSkillLabel(skill: SkillLevel): string {
  return SKILL_OPTIONS.find((option) => option.value === skill)?.label ?? '중';
}
