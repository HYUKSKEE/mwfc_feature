import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styled from 'styled-components';
import type { Member } from '../types';

type Props = {
  member: Member;
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
};

const Card = styled.div<{ $dragging: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0.9rem;
  background: ${({ theme, $dragging }) =>
    $dragging ? 'transparent' : theme.colors.bgElevated};
  border: 1px ${({ $dragging }) => ($dragging ? 'dashed' : 'solid')}
    ${({ theme, $dragging }) => ($dragging ? theme.colors.accent : theme.colors.border)};
  border-radius: ${({ theme }) => theme.radii.md};
  opacity: ${({ $dragging }) => ($dragging ? 0.4 : 1)};
  cursor: grab;
  touch-action: none;
  transition: border-color 0.15s ease;

  &:active {
    cursor: grabbing;
  }

  &:hover {
    border-color: ${({ theme, $dragging }) =>
      $dragging ? theme.colors.accent : theme.colors.borderStrong};
  }
`;

const Name = styled.span<{ $dragging: boolean }>`
  flex: 1;
  min-width: 0;
  font-size: 0.95rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  visibility: ${({ $dragging }) => ($dragging ? 'hidden' : 'visible')};
`;

const Actions = styled.div<{ $dragging: boolean }>`
  display: flex;
  gap: 0.35rem;
  flex-shrink: 0;
  visibility: ${({ $dragging }) => ($dragging ? 'hidden' : 'visible')};
`;

const IconButton = styled.button`
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  transition:
    color 0.15s ease,
    border-color 0.15s ease,
    background 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.borderStrong};
    background: ${({ theme }) => theme.colors.bgHover};
  }

  &[data-danger='true']:hover {
    color: ${({ theme }) => theme.colors.accent};
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.accentSoft};
  }
`;

export function MemberCard({ member, onEdit, onDelete }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: member.id,
    data: { type: 'member', member },
  });

  // DragOverlay를 쓸 때는 원본에 drag transform을 주면 커서 대비 위치가 두 번 적용됩니다.
  const style = {
    transform: isDragging ? undefined : CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      $dragging={isDragging}
      {...listeners}
      {...attributes}
    >
      <Name $dragging={isDragging}>{member.name}</Name>
      <Actions
        $dragging={isDragging}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <IconButton
          type="button"
          aria-label={`${member.name} 수정`}
          onClick={() => onEdit(member)}
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
    </Card>
  );
}
