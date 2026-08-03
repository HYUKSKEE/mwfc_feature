import type { SkillLevel } from '../types';

/**
 * 실력 값은 1부터 시작합니다. (밸런스 합산에 그대로 사용)
 * 1 최하 · 2 하 · 3 중하 · 4 중 · 5 중상 · 6 상 · 7 최상
 */
export const SKILL_OPTIONS = [
  { value: 1, label: '최하' },
  { value: 2, label: '하' },
  { value: 3, label: '중하' },
  { value: 4, label: '중' },
  { value: 5, label: '중상' },
  { value: 6, label: '상' },
  { value: 7, label: '최상' },
] as const satisfies ReadonlyArray<{ value: SkillLevel; label: string }>;

export const DEFAULT_SKILL: SkillLevel = 4;

/** 이 값 이상이면 강조(악센트) 톤으로 표시합니다. (상, 최상) */
export const HIGHLIGHT_SKILL_THRESHOLD: SkillLevel = 6;

export const MIN_SKILL: SkillLevel = SKILL_OPTIONS[0].value;
export const MAX_SKILL: SkillLevel = SKILL_OPTIONS[SKILL_OPTIONS.length - 1].value;

/** localStorage 스킬 스케일 버전 (1: 0~6, 2: 1~7) */
export const SKILL_SCHEMA_VERSION = 2;

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

/**
 * v1(0~6, 최하=0) → v2(1~7, 최하=1) 로 한 칸씩 올립니다.
 */
export function migrateSkillFromV1(value: unknown): SkillLevel {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_SKILL;
  }

  const shifted = Math.round(value) + 1;
  return normalizeSkill(shifted);
}

export function getSkillLabel(skill: SkillLevel): string {
  return SKILL_OPTIONS.find((option) => option.value === skill)?.label ?? '중';
}
