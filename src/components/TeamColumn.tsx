import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import styled from 'styled-components';
import type { Member, Team } from '../types';
import { DropZone } from './DropZone';
import { MemberCard } from './MemberCard';

type Props = {
  team: Team;
  members: Member[];
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
};

const Column = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
  padding: 1rem;
  background: linear-gradient(180deg, #141414 0%, #101010 100%);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
`;

const Header = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 0.65rem;
  border-bottom: 2px solid ${({ theme }) => theme.colors.accent};
`;

const Title = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.75rem;
  letter-spacing: 0.06em;
  font-weight: 400;
`;

const Count = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.85rem;
`;

export function TeamColumn({ team, members, onEdit, onDelete }: Props) {
  const itemIds = members.map((member) => member.id);

  return (
    <Column>
      <Header>
        <Title>{team.name}</Title>
        <Count>{members.length}명</Count>
      </Header>
      <DropZone
        id={team.id}
        isEmpty={members.length === 0}
        emptyLabel="팀원을 여기로 드래그"
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
    </Column>
  );
}
