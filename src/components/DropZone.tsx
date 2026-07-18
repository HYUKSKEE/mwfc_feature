import { useDroppable } from '@dnd-kit/core';
import styled from 'styled-components';
import type { ReactNode } from 'react';

type Props = {
  id: string;
  children: ReactNode;
  emptyLabel?: string;
  isEmpty?: boolean;
};

const Zone = styled.div<{ $over: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  min-height: 120px;
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px dashed
    ${({ theme, $over }) => ($over ? theme.colors.accent : theme.colors.border)};
  background: ${({ theme, $over }) =>
    $over ? theme.colors.accentSoft : 'transparent'};
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
`;

const Empty = styled.p`
  margin: auto;
  padding: 1.5rem 0.5rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.85rem;
`;

export function DropZone({ id, children, emptyLabel, isEmpty }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: 'container' },
  });

  return (
    <Zone ref={setNodeRef} $over={isOver}>
      {isEmpty && <Empty>{emptyLabel ?? '여기에 드롭하세요'}</Empty>}
      {children}
    </Zone>
  );
}
