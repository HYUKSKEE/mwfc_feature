import { css } from 'styled-components';
import { isHighlightSkill } from '../constants/skill';
import type { SkillLevel } from '../types';
import type { AppTheme } from './theme';

type SkillToneProps = {
  theme: AppTheme;
  $level: SkillLevel;
};

export function skillToneColors({ theme, $level }: SkillToneProps) {
  if (isHighlightSkill($level)) {
    return {
      border: theme.colors.accent,
      background: theme.colors.accentSoft,
      color: theme.colors.accent,
    };
  }

  return {
    border: theme.colors.border,
    background: theme.colors.bg,
    color: theme.colors.textMuted,
  };
}

/** 실력 등급에 따른 뱃지 톤 (border / background / color) */
export const skillBadgeTone = css<{ $level: SkillLevel }>`
  border: 1px solid ${({ theme, $level }) => skillToneColors({ theme, $level }).border};
  background: ${({ theme, $level }) => skillToneColors({ theme, $level }).background};
  color: ${({ theme, $level }) => skillToneColors({ theme, $level }).color};
`;
