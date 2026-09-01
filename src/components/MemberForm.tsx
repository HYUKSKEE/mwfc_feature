import { useState } from 'react';
import type { FormEvent } from 'react';
import styled from 'styled-components';
import { DEFAULT_SKILL, SKILL_OPTIONS } from '../constants/skill';
import type { SkillLevel } from '../types';
import { Tooltip } from './Tooltip';

type Props = {
  onSubmit: (name: string, skill: SkillLevel) => void;
};

const Form = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
`;

const NameTip = styled(Tooltip)`
  flex: 1 1 160px;
  min-width: 0;

  input {
    width: 100%;
  }
`;

const Input = styled.input`
  min-width: 0;
  min-height: 44px;
  padding: 0.8rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  transition: border-color 0.15s ease;
  font-size: 1rem;
  -webkit-appearance: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
  }

  @media (max-width: 860px) {
    min-height: 48px;
  }
`;

const Select = styled.select`
  flex: 0 1 120px;
  min-height: 44px;
  padding: 0.7rem 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  font-size: 1rem;

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
  }

  @media (max-width: 860px) {
    flex: 1 1 140px;
    min-height: 48px;
    font-size: 1.1rem;
  }
`;

const Button = styled.button`
  min-height: 44px;
  min-width: 0;
  max-width: 100%;
  padding: 0.8rem 1.15rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.white};
  font-weight: 600;
  letter-spacing: 0.02em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.accentHover};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  @media (max-width: 860px) {
    width: 100%;
  }
`;

const TipSlot = styled(Tooltip)`
  @media (max-width: 860px) {
    flex: 1 1 100%;

    ${Button} {
      width: 100%;
    }
  }
`;

export function MemberForm({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [skill, setSkill] = useState<SkillLevel>(DEFAULT_SKILL);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed, skill);
    setName('');
    setSkill(DEFAULT_SKILL);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <NameTip
        text="추가할 선수 이름을 입력합니다."
        textEn="Enter the player name to add."
        side="bottom"
      >
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="팀원 이름 입력..."
          aria-label="팀원 이름"
          enterKeyHint="done"
          autoComplete="off"
        />
      </NameTip>
      <Tooltip
        text="lv.1(낮음) ~ lv.7(높음). 밸런스 조짜기에 사용됩니다."
        textEn="lv.1 (low) to lv.7 (high) for balanced teams."
        side="bottom"
      >
        <Select
          value={skill}
          onChange={(event) => setSkill(Number(event.target.value) as SkillLevel)}
          aria-label="실력"
        >
          {SKILL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              lv.{option.value}
            </option>
          ))}
        </Select>
      </Tooltip>
      <TipSlot
        text="입력한 이름과 실력으로 대기 인원에 추가합니다."
        textEn="Add this player to the unassigned pool."
        side="bottom"
      >
        <Button type="submit" disabled={!name.trim()}>
          팀원 추가
        </Button>
      </TipSlot>
    </Form>
  );
}
