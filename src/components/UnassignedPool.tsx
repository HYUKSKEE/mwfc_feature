import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import styled from 'styled-components';
import { getSkillLabel } from '../constants/skill';
import { UNASSIGNED_ID } from '../constants';
import type { Member, SkillLevel } from '../types';
import { CopyListButton } from './CopyListButton';
import { DropZone } from './DropZone';
import { MemberCard } from './MemberCard';

export { UNASSIGNED_ID };

type Props = {
  members: Member[];
  onUpdate: (id: string, patch: { name: string; skill: SkillLevel }) => void;
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
  flex-direction: column;
  gap: 0.55rem;
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
  font-size: 1.6rem;
  letter-spacing: 0.05em;
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

export function UnassignedPool({ members, onUpdate, onDelete }: Props) {
  const itemIds = members.map((member) => member.id);
  const copyMembers = members.map((member) => ({
    name: member.name,
    skillLabel: getSkillLabel(member.skill),
  }));

  return (
    <Panel>
      <Header>
        <TitleRow>
          <Title>대기 인원</Title>
          <Count>{members.length}명</Count>
        </TitleRow>
        <Actions>
          <CopyListButton title="대기 인원" members={copyMembers} />
        </Actions>
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
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      </DropZone>
    </Panel>
  );
}
