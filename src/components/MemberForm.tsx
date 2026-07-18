import { useState } from 'react';
import type { FormEvent } from 'react';
import styled from 'styled-components';
import { DEFAULT_SKILL, SKILL_OPTIONS } from '../constants/skill';
import type { SkillLevel } from '../types';

type Props = {
  onSubmit: (name: string, skill: SkillLevel) => void;
};

const Form = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
`;

const Input = styled.input`
  flex: 1 1 160px;
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
`;

const Button = styled.button`
  min-height: 44px;
  padding: 0.8rem 1.15rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.white};
  font-weight: 600;
  letter-spacing: 0.02em;
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
    flex: 1 1 100%;
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
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="팀원 이름 입력..."
        aria-label="팀원 이름"
        enterKeyHint="done"
        autoComplete="off"
      />
      <Select
        value={skill}
        onChange={(event) => setSkill(Number(event.target.value) as SkillLevel)}
        aria-label="실력"
      >
        {SKILL_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            실력 {option.label}
          </option>
        ))}
      </Select>
      <Button type="submit" disabled={!name.trim()}>
        팀원 추가
      </Button>
    </Form>
  );
}
