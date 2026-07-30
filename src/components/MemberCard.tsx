import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled from 'styled-components';
import { getSkillLabel, SKILL_OPTIONS } from '../constants/skill';
import { skillBadgeTone } from '../styles/mixins';
import type { Member, SkillLevel } from '../types';

type Props = {
  member: Member;
  onUpdate: (id: string, patch: { name: string; skill: SkillLevel }) => void;
  onDelete: (id: string) => void;
};

const Card = styled.div<{ $dragging: boolean; $editing: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.65rem 0.7rem;
  background: ${({ theme, $dragging }) =>
    $dragging ? 'transparent' : theme.colors.bgElevated};
  border: 1px ${({ $dragging }) => ($dragging ? 'dashed' : 'solid')}
    ${({ theme, $dragging, $editing }) =>
      $dragging || $editing ? theme.colors.accent : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  opacity: ${({ $dragging }) => ($dragging ? 0.4 : 1)};
  touch-action: pan-y;
  transition: border-color 0.15s ease;

  @media (min-width: 861px) {
    &:hover {
      border-color: ${({ theme, $dragging, $editing }) =>
        $dragging || $editing ? theme.colors.accent : theme.colors.borderStrong};
    }
  }
`;

const Handle = styled.button`
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: grab;
  touch-action: none;
  user-select: none;
  font-size: 1rem;
  line-height: 1;

  &:active {
    cursor: grabbing;
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

const Info = styled.div<{ $dragging: boolean }>`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  visibility: ${({ $dragging }) => ($dragging ? 'hidden' : 'visible')};
`;

const Name = styled.button`
  padding: 0;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
  font-weight: 500;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: ${({ theme }) => theme.radii.sm};

  &:focus-visible {
    outline: 1px solid ${({ theme }) => theme.colors.accent};
  }
`;

const SkillBadge = styled.span<{ $level: SkillLevel }>`
  align-self: flex-start;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  ${skillBadgeTone}
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.02em;
`;

const EditForm = styled.form`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
`;

const Input = styled.input`
  flex: 1 1 90px;
  min-width: 0;
  min-height: 36px;
  padding: 0.45rem 0.65rem;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
  outline: none;
  -webkit-appearance: none;
`;

const Select = styled.select`
  flex: 0 0 auto;
  min-height: 36px;
  padding: 0.35rem 0.45rem;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.85rem;
  outline: none;
`;

const Actions = styled.div<{ $dragging: boolean }>`
  display: flex;
  gap: 0.3rem;
  flex-shrink: 0;
  visibility: ${({ $dragging }) => ($dragging ? 'hidden' : 'visible')};
`;

const IconButton = styled.button`
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 1rem;
  transition:
    color 0.15s ease,
    border-color 0.15s ease,
    background 0.15s ease;

  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.borderStrong};
    background: ${({ theme }) => theme.colors.bgHover};
  }

  &[data-danger='true']:hover,
  &[data-danger='true']:focus-visible {
    color: ${({ theme }) => theme.colors.accent};
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.accentSoft};
  }

  &[data-accent='true'] {
    color: ${({ theme }) => theme.colors.white};
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.accent};
  }
`;

export function MemberCard({ member, onUpdate, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(member.name);
  const [draftSkill, setDraftSkill] = useState<SkillLevel>(member.skill);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: member.id,
    data: { type: 'member', member },
    disabled: isEditing,
  });

  useEffect(() => {
    if (!isEditing) {
      setDraftName(member.name);
      setDraftSkill(member.skill);
    }
  }, [member.name, member.skill, isEditing]);

  useEffect(() => {
    if (!isEditing) return;
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.select();
  }, [isEditing]);

  const style = {
    transform: isDragging ? undefined : CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
  };

  const startEditing = () => {
    setDraftName(member.name);
    setDraftSkill(member.skill);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraftName(member.name);
    setDraftSkill(member.skill);
    setIsEditing(false);
  };

  const saveEditing = () => {
    const trimmed = draftName.trim();
    if (!trimmed) {
      cancelEditing();
      return;
    }

    if (trimmed !== member.name || draftSkill !== member.skill) {
      onUpdate(member.id, { name: trimmed, skill: draftSkill });
    }
    setIsEditing(false);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveEditing();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelEditing();
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      $dragging={isDragging}
      $editing={isEditing}
    >
      <Handle
        ref={setActivatorNodeRef}
        type="button"
        aria-label={`${member.name} 드래그`}
        disabled={isEditing}
        {...listeners}
        {...attributes}
      >
        ⋮⋮
      </Handle>

      {isEditing ? (
        <EditForm onSubmit={handleSubmit}>
          <Input
            ref={inputRef}
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            onKeyDown={handleKeyDown}
            aria-label={`${member.name} 이름 수정`}
            enterKeyHint="done"
          />
          <Select
            value={draftSkill}
            onChange={(event) =>
              setDraftSkill(Number(event.target.value) as SkillLevel)
            }
            onMouseDown={(event) => event.stopPropagation()}
            aria-label="실력 수정"
          >
            {SKILL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Actions $dragging={false}>
            <IconButton
              type="submit"
              data-accent="true"
              aria-label="수정 저장"
              onMouseDown={(event) => event.preventDefault()}
            >
              ✓
            </IconButton>
            <IconButton
              type="button"
              aria-label="수정 취소"
              onMouseDown={(event) => event.preventDefault()}
              onClick={cancelEditing}
            >
              ×
            </IconButton>
          </Actions>
        </EditForm>
      ) : (
        <>
          <Info $dragging={isDragging}>
            <Name
              type="button"
              onClick={startEditing}
              aria-label={`${member.name} 수정`}
            >
              {member.name}
            </Name>
            <SkillBadge $level={member.skill}>
              {getSkillLabel(member.skill)}
            </SkillBadge>
          </Info>
          <Actions $dragging={isDragging}>
            <IconButton
              type="button"
              aria-label={`${member.name} 수정`}
              onClick={startEditing}
            >
              ✎
            </IconButton>
            <IconButton
              type="button"
              data-danger="true"
              aria-label={`${member.name} 삭제`}
              onClick={() => onDelete(member.id)}
            >
              ×
            </IconButton>
          </Actions>
        </>
      )}
    </Card>
  );
}
