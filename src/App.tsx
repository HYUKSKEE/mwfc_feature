import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import styled, { ThemeProvider, keyframes } from 'styled-components';
import { BatchImportModal } from './components/BatchImportModal';
import { CopyRosterButton } from './components/CopyRosterButton';
import { Controls } from './components/Controls';
import { ExportHost } from './components/ExportHost';
import { MemberForm } from './components/MemberForm';
import { SiteFooter } from './components/SiteFooter';
import { TeamColumn } from './components/TeamColumn';
import { TeamExportCard } from './components/TeamExportCard';
import { Tooltip } from './components/Tooltip';
import { UnassignedPool } from './components/UnassignedPool';
import { UNASSIGNED_ID } from './constants';
import { TacticsPage } from './pages/TacticsPage';
import { loadData, saveData } from './storage';
import { GlobalStyle } from './styles/GlobalStyle';
import { theme } from './styles/theme';
import type { Member, SkillLevel } from './types';
import { createSortableCollisionDetection } from './utils/collision';
import { downloadNodeAsImage } from './utils/exportImage';
import {
  findContainerId,
  flattenGroups,
  groupMemberIds,
} from './utils/memberOrder';
import { assignRandomTeams, createTeams } from './utils/randomTeams';

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Page = styled.div`
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  background:
    radial-gradient(ellipse 80% 50% at 10% -10%, rgba(225, 6, 0, 0.18), transparent 55%),
    radial-gradient(ellipse 60% 40% at 90% 0%, rgba(225, 6, 0, 0.08), transparent 50%),
    ${({ theme }) => theme.colors.bg};
`;

const Shell = styled.main`
  position: relative;
  z-index: 1;
  width: min(1180px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 2.25rem 0 3.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  animation: ${fadeUp} 0.55s ease backwards;

  @media (max-width: 860px) {
    width: min(1180px, calc(100% - 1.25rem));
    padding: 1.25rem 0 2.5rem;
    gap: 0.9rem;
  }
`;

const Brand = styled.header`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.35rem;
`;

const BrandMark = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(2.6rem, 10vw, 4.75rem);
  line-height: 0.9;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.white};
  font-weight: 400;

  span {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const Tagline = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.95rem;
  max-width: 52ch;
  line-height: 1.45;
`;

const TaglineEn = styled.span`
  display: block;
  margin-top: 0.25rem;
  font-size: 0.86rem;
  color: ${({ theme }) => theme.colors.textMuted};
  opacity: 0.85;
`;

const Panel = styled.section`
  padding: 1.1rem;
  background: ${({ theme }) => theme.colors.bgElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  animation: ${fadeUp} 0.55s ease 0.08s backwards;
`;

const PanelHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  margin-bottom: 0.85rem;
`;

const PanelTitle = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.5rem;
  letter-spacing: 0.05em;
  font-weight: 400;
`;

const PanelActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
`;

const GhostButton = styled.button`
  min-height: 36px;
  padding: 0.45rem 0.8rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: 0.88rem;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.accentSoft};
  }
`;

const Board = styled.div`
  display: grid;
  grid-template-columns: minmax(220px, 280px) 1fr;
  gap: 1rem;
  animation: ${fadeUp} 0.55s ease 0.16s backwards;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  align-content: start;
`;

const OverlayCard = styled.div`
  box-sizing: border-box;
  min-width: 60px;
  max-width: min(240px, 70vw);
  padding: 0.75rem 0.9rem;
  background: ${({ theme }) => theme.colors.bgElevated};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.glow};
  font-size: 0.95rem;
  font-weight: 500;
  cursor: grabbing;
  touch-action: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

function createId() {
  return crypto.randomUUID();
}

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

function HomePage() {
  const navigate = useNavigate();
  const [data, setData] = useState(() => loadData());
  const [activeMember, setActiveMember] = useState<Member | null>(null);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportingTeamId, setExportingTeamId] = useState<string | null>(null);
  const [batchImportOpen, setBatchImportOpen] = useState(false);
  const exportHostRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // 핸들에서만 리스너를 쓰므로, 짧은 이동 후에만 드래그 시작
      activationConstraint: { distance: 8 },
    }),
  );

  useEffect(() => {
    saveData(data);
  }, [data]);

  const containerIds = useMemo(
    () => [UNASSIGNED_ID, ...data.teams.map((team) => team.id)],
    [data.teams],
  );

  const groups = useMemo(
    () => groupMemberIds(data.members, containerIds),
    [data.members, containerIds],
  );

  const unassigned = useMemo(
    () =>
      (groups[UNASSIGNED_ID] ?? [])
        .map((id) => data.members.find((member) => member.id === id))
        .filter((member): member is Member => Boolean(member)),
    [groups, data.members],
  );

  const membersByTeam = useMemo(() => {
    const map = new Map<string, Member[]>();
    for (const team of data.teams) {
      map.set(
        team.id,
        (groups[team.id] ?? [])
          .map((id) => data.members.find((member) => member.id === id))
          .filter((member): member is Member => Boolean(member)),
      );
    }
    return map;
  }, [data.members, data.teams, groups]);

  const collisionDetection = useMemo(
    () => createSortableCollisionDetection(containerIds, groups, activeId),
    [containerIds, groups, activeId],
  );

  const handleAddMember = (name: string, skill: SkillLevel) => {
    setData((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        { id: createId(), name, skill, teamId: null },
      ],
    }));
  };

  const handleBatchAddMembers = (names: string[], skill: SkillLevel) => {
    setData((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        ...names.map((name) => ({
          id: createId(),
          name,
          skill,
          teamId: null,
        })),
      ],
    }));
  };

  const handleUpdateMember = (
    id: string,
    patch: { name: string; skill: SkillLevel },
  ) => {
    setData((prev) => ({
      ...prev,
      members: prev.members.map((member) =>
        member.id === id ? { ...member, ...patch } : member,
      ),
    }));
  };

  const handleDeleteMember = (id: string) => {
    setData((prev) => ({
      ...prev,
      members: prev.members.filter((member) => member.id !== id),
    }));
  };

  const handleTeamCountChange = (count: number) => {
    const teams = createTeams(count);
    const teamIds = new Set(teams.map((team) => team.id));

    setData((prev) => ({
      ...prev,
      teams,
      members: prev.members.map((member) =>
        member.teamId && teamIds.has(member.teamId)
          ? member
          : { ...member, teamId: null },
      ),
    }));
  };

  const handleRandomAssign = () => {
    setData((prev) => ({
      ...prev,
      members: assignRandomTeams(prev.members, prev.teams),
    }));
  };

  const handleClearAssignments = () => {
    setData((prev) => ({
      ...prev,
      members: prev.members.map((member) => ({ ...member, teamId: null })),
    }));
  };

  const handleExportTeamImage = async (teamId: string) => {
    if (!exportHostRef.current || isExporting) return;

    const node = exportHostRef.current.querySelector<HTMLElement>(
      `[data-export-team="${teamId}"]`,
    );
    const team = data.teams.find((item) => item.id === teamId);

    if (!node || !team) {
      window.alert('저장할 조를 찾지 못했습니다.');
      return;
    }

    const memberCount = data.members.filter((member) => member.teamId === teamId)
      .length;
    if (memberCount === 0) {
      window.alert('배정된 인원이 없습니다.');
      return;
    }

    setIsExporting(true);
    setExportingTeamId(teamId);
    try {
      const stamp = new Date().toISOString().slice(0, 10);
      await downloadNodeAsImage(node, `${team.name}-${stamp}.png`);
    } catch (error) {
      console.error(error);
      window.alert('이미지 저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsExporting(false);
      setExportingTeamId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveMember(null);
    setActiveId(null);
    if (!over) return;

    const activeMemberId = String(active.id);
    const overId = String(over.id);

    setData((prev) => {
      const ids = [UNASSIGNED_ID, ...prev.teams.map((team) => team.id)];
      const currentGroups = groupMemberIds(prev.members, ids);
      const activeContainer = findContainerId(activeMemberId, currentGroups);
      const overContainer = ids.includes(overId)
        ? overId
        : findContainerId(overId, currentGroups);

      if (!activeContainer || !overContainer) return prev;

      if (activeContainer === overContainer) {
        const items = currentGroups[activeContainer];
        const oldIndex = items.indexOf(activeMemberId);
        const newIndex = ids.includes(overId)
          ? items.length - 1
          : items.indexOf(overId);

        if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return prev;

        return {
          ...prev,
          members: flattenGroups(
            prev.members,
            {
              ...currentGroups,
              [activeContainer]: arrayMove(items, oldIndex, newIndex),
            },
            ids,
          ),
        };
      }

      const activeItems = [...currentGroups[activeContainer]];
      const overItems = [...currentGroups[overContainer]];
      const activeIndex = activeItems.indexOf(activeMemberId);
      if (activeIndex < 0) return prev;

      activeItems.splice(activeIndex, 1);

      const overIndex = overItems.indexOf(overId);
      const insertIndex = overIndex >= 0 ? overIndex : overItems.length;
      overItems.splice(insertIndex, 0, activeMemberId);

      return {
        ...prev,
        members: flattenGroups(
          prev.members,
          {
            ...currentGroups,
            [activeContainer]: activeItems,
            [overContainer]: overItems,
          },
          ids,
        ),
      };
    });
  };

  return (
    <Page>
      <Shell>
          <Brand>
            <BrandMark>
              TEAM<span>MAKER</span>
            </BrandMark>
            <Tagline>
              실력을 정해 팀원을 추가하면, 밸런스 랜덤 조짜기로 고르게 나눌 수 있어요.
              <TaglineEn>
                Add players with skill levels, then drag into teams or auto-balance.
              </TaglineEn>
            </Tagline>
          </Brand>

          <Panel>
            <PanelHeader>
              <PanelTitle>팀원 추가</PanelTitle>
              <PanelActions>
                <CopyRosterButton
                  names={data.members.map((member) => member.name)}
                />
                <Tooltip
                  text="텍스트 붙여넣기 또는 명단 이미지 OCR로 여러 명을 한 번에 등록합니다."
                  textEn="Bulk-add players via pasted names or roster image OCR."
                  side="bottom"
                >
                  <GhostButton
                    type="button"
                    onClick={() => setBatchImportOpen(true)}
                  >
                    일괄 등록
                  </GhostButton>
                </Tooltip>
              </PanelActions>
            </PanelHeader>
            <MemberForm onSubmit={handleAddMember} />
          </Panel>

          <BatchImportModal
            open={batchImportOpen}
            existingNames={data.members.map((member) => member.name)}
            onClose={() => setBatchImportOpen(false)}
            onConfirm={handleBatchAddMembers}
          />

          <Controls
            teamCount={data.teams.length}
            memberCount={data.members.length}
            isExporting={isExporting}
            onTeamCountChange={handleTeamCountChange}
            onRandomAssign={handleRandomAssign}
            onClearAssignments={handleClearAssignments}
            onOpenTactics={() => navigate('/tactics')}
          />

          <DndContext
            sensors={sensors}
            measuring={measuring}
            collisionDetection={collisionDetection}
            onDragStart={(event) => {
              const member = data.members.find((item) => item.id === event.active.id);
              setActiveMember(member ?? null);
              setActiveId(event.active.id);
            }}
            onDragEnd={handleDragEnd}
            onDragCancel={() => {
              setActiveMember(null);
              setActiveId(null);
            }}
          >
            <Board>
              <UnassignedPool
                members={unassigned}
                onUpdate={handleUpdateMember}
                onDelete={handleDeleteMember}
              />
              <TeamGrid>
                {data.teams.map((team) => (
                  <TeamColumn
                    key={team.id}
                    team={team}
                    members={membersByTeam.get(team.id) ?? []}
                    exportDisabled={isExporting}
                    isSavingImage={exportingTeamId === team.id}
                    onUpdate={handleUpdateMember}
                    onDelete={handleDeleteMember}
                    onExportImage={handleExportTeamImage}
                  />
                ))}
              </TeamGrid>
            </Board>

            <DragOverlay dropAnimation={null}>
              {activeMember ? <OverlayCard>{activeMember.name}</OverlayCard> : null}
            </DragOverlay>
          </DndContext>

          <SiteFooter />

          <ExportHost>
            <div ref={exportHostRef}>
              {data.teams.map((team) => (
                <TeamExportCard
                  key={team.id}
                  team={team}
                  members={membersByTeam.get(team.id) ?? []}
                />
              ))}
            </div>
          </ExportHost>
        </Shell>
      </Page>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tactics" element={<TacticsPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
