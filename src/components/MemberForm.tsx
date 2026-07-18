import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import styled from 'styled-components';
import type { Member } from '../types';

type Props = {
  editingMember: Member | null;
  onSubmit: (name: string) => void;
  onCancelEdit: () => void;
};

const Form = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
`;

const Input = styled.input`
  flex: 1 1 180px;
  min-width: 0;
  padding: 0.8rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  transition: border-color 0.15s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'ghost' }>`
  padding: 0.8rem 1.15rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid
    ${({ theme, $variant }) =>
      $variant === 'ghost' ? theme.colors.border : theme.colors.accent};
  background: ${({ theme, $variant }) =>
    $variant === 'ghost' ? 'transparent' : theme.colors.accent};
  color: ${({ theme }) => theme.colors.white};
  font-weight: 600;
  letter-spacing: 0.02em;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    transform 0.15s ease;

  &:hover {
    background: ${({ theme, $variant }) =>
      $variant === 'ghost' ? theme.colors.bgHover : theme.colors.accentHover};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
  }
`;

export function MemberForm({ editingMember, onSubmit, onCancelEdit }: Props) {
  const [name, setName] = useState('');

  useEffect(() => {
    setName(editingMember?.name ?? '');
  }, [editingMember]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    if (!editingMember) setName('');
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={editingMember ? '이름 수정...' : '팀원 이름 입력...'}
        aria-label="팀원 이름"
        autoFocus={Boolean(editingMember)}
      />
      <Button type="submit" disabled={!name.trim()}>
        {editingMember ? '수정 저장' : '팀원 추가'}
      </Button>
      {editingMember && (
        <Button type="button" $variant="ghost" onClick={onCancelEdit}>
          취소
        </Button>
      )}
    </Form>
  );
}
