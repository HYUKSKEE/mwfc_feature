import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import styled from 'styled-components';
import { UNASSIGNED_ID } from '../constants';
import type { Member } from '../types';
import { DropZone } from './DropZone';
import { MemberCard } from './MemberCard';

export { UNASSIGNED_ID };

type Props = {
  members: Member[];
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
};

const Panel = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.1rem;
  background: ${({ theme }) => theme.colors.bgElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
`;

const Header = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
`;

const Title = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.6rem;
  letter-spacing: 0.05em;
  font-weight: 400;
`;

const Count = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.85rem;
`;

export function UnassignedPool({ members, onEdit, onDelete }: Props) {
  const itemIds = members.map((member) => member.id);

  return (
    <Panel>
      <Header>
        <Title>대기 인원</Title>
        <Count>{members.length}명</Count>
      </Header>
      <DropZone
        id={UNASSIGNED_ID}
        isEmpty={members.length === 0}
        emptyLabel="미배정 팀원이 없습니다"
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      </DropZone>
    </Panel>
  );
}
