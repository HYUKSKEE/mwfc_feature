import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import styled from 'styled-components';
import type { Member, SkillLevel, Team } from '../types';
import { CopyListButton } from './CopyListButton';
import { DropZone } from './DropZone';
import { MemberCard } from './MemberCard';

type Props = {
  team: Team;
  members: Member[];
  onUpdate: (id: string, patch: { name: string; skill: SkillLevel }) => void;
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
  flex-direction: column;
  gap: 0.55rem;
  padding-bottom: 0.65rem;
  border-bottom: 2px solid ${({ theme }) => theme.colors.accent};
`;

const TitleRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
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

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export function TeamColumn({ team, members, onUpdate, onDelete }: Props) {
  const itemIds = members.map((member) => member.id);
  const skillTotal = members.reduce((sum, member) => sum + member.skill, 0);
  const copyMembers = members.map((member) => ({
    name: member.name,
  }));

  return (
    <Column>
      <Header>
        <TitleRow>
          <Title>{team.name}</Title>
          <Count>
            {members.length}명 · 실력합 {skillTotal}
          </Count>
        </TitleRow>
        <Actions>
          <CopyListButton title={team.name} members={copyMembers} />
        </Actions>
      </Header>
      <DropZone
        id={team.id}
        isEmpty={members.length === 0}
        emptyLabel="핸들로 팀원을 여기로 드래그"
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      </DropZone>
    </Column>
  );
}
