import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import styled from 'styled-components';
import type { Member, SkillLevel, Team } from '../types';
import { CopyListButton } from './CopyListButton';
import { DropZone } from './DropZone';
import { MemberCard } from './MemberCard';
import { Tooltip } from './Tooltip';

type Props = {
  team: Team;
  members: Member[];
  exportDisabled?: boolean;
  isSavingImage?: boolean;
  onUpdate: (id: string, patch: { name: string; skill: SkillLevel }) => void;
  onDelete: (id: string) => void;
  onExportImage: (teamId: string) => void;
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
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.4rem;
`;

const ExportButton = styled.button`
  min-height: 30px;
  min-width: 0;
  max-width: 100%;
  padding: 0.3rem 0.65rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.8rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.borderStrong};
    background: ${({ theme }) => theme.colors.bgHover};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export function TeamColumn({
  team,
  members,
  exportDisabled = false,
  isSavingImage = false,
  onUpdate,
  onDelete,
  onExportImage,
}: Props) {
  const itemIds = members.map((member) => member.id);
  const skillTotal = members.reduce((sum, member) => sum + member.skill, 0);
  const copyMembers = members.map((member) => ({
    name: member.name,
  }));

  return (
    <Column>
      <Header>
        <TitleRow>
          <Tooltip
            text="드래그로 팀원을 넣고 빼며 이 조를 구성합니다."
            textEn="Drag players here to build this team."
            side="bottom"
          >
            <Title>{team.name}</Title>
          </Tooltip>
          <Count>
            {members.length}명 · 실력합 {skillTotal}
          </Count>
        </TitleRow>
        <Actions>
          <CopyListButton title={team.name} members={copyMembers} />
          <Tooltip
            text="이 조 명단을 이미지(PNG)로 저장합니다."
            textEn="Download this team's roster as a PNG image."
          >
            <ExportButton
              type="button"
              disabled={members.length === 0 || exportDisabled}
              onClick={() => onExportImage(team.id)}
              aria-label={`${team.name} 이미지 저장`}
            >
              {isSavingImage ? '저장 중...' : '이미지 저장'}
            </ExportButton>
          </Tooltip>
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
