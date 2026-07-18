import { useEffect, useMemo, useState } from 'react';
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
import styled, { ThemeProvider, keyframes } from 'styled-components';
import { Controls } from './components/Controls';
import { MemberForm } from './components/MemberForm';
import { TeamColumn } from './components/TeamColumn';
import { UnassignedPool } from './components/UnassignedPool';
import { UNASSIGNED_ID } from './constants';
import { loadData, saveData } from './storage';
import { GlobalStyle } from './styles/GlobalStyle';
import { theme } from './styles/theme';
import type { Member } from './types';
import { createSortableCollisionDetection } from './utils/collision';
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
  overflow: hidden;
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
`;

const Brand = styled.header`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.35rem;
`;

const BrandMark = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(3rem, 8vw, 4.75rem);
  line-height: 0.9;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.white};

  span {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const Tagline = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 1rem;
  max-width: 36ch;
`;

const Panel = styled.section`
  padding: 1.1rem;
  background: ${({ theme }) => theme.colors.bgElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  animation: ${fadeUp} 0.55s ease 0.08s backwards;
`;

const PanelTitle = styled.h2`
  margin: 0 0 0.85rem;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.5rem;
  letter-spacing: 0.05em;
  font-weight: 400;
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
  display: flex;
  align-items: center;
  min-width: 200px;
  padding: 0.75rem 0.9rem;
  background: ${({ theme }) => theme.colors.bgElevated};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.glow};
  font-size: 0.95rem;
  font-weight: 500;
  cursor: grabbing;
  touch-action: none;
`;

function createId() {
  return crypto.randomUUID();
}

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

function App() {
  const [data, setData] = useState(() => loadData());
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [activeMember, setActiveMember] = useState<Member | null>(null);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
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

  const handleSubmitMember = (name: string) => {
    if (editingMember) {
      setData((prev) => ({
        ...prev,
        members: prev.members.map((member) =>
          member.id === editingMember.id ? { ...member, name } : member,
        ),
      }));
      setEditingMember(null);
      return;
    }

    setData((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        { id: createId(), name, teamId: null },
      ],
    }));
  };

  const handleDeleteMember = (id: string) => {
    setData((prev) => ({
      ...prev,
      members: prev.members.filter((member) => member.id !== id),
    }));
    if (editingMember?.id === id) setEditingMember(null);
  };

  const handleTeamCountChange = (count: number) => {
    const teams = createTeams(count);
    const teamIds = new Set(teams.map((team) => team.id));

    setData((prev) => ({
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
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Page>
        <Shell>
          <Brand>
            <BrandMark>
              TEAM<span>MAKER</span>
            </BrandMark>
            <Tagline>
              팀원을 추가하고, 드래그로 조를 편성하거나 랜덤으로 나눠보세요.
            </Tagline>
          </Brand>

          <Panel>
            <PanelTitle>팀원 관리</PanelTitle>
            <MemberForm
              editingMember={editingMember}
              onSubmit={handleSubmitMember}
              onCancelEdit={() => setEditingMember(null)}
            />
          </Panel>

          <Controls
            teamCount={data.teams.length}
            memberCount={data.members.length}
            onTeamCountChange={handleTeamCountChange}
            onRandomAssign={handleRandomAssign}
            onClearAssignments={handleClearAssignments}
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
                onEdit={setEditingMember}
                onDelete={handleDeleteMember}
              />
              <TeamGrid>
                {data.teams.map((team) => (
                  <TeamColumn
                    key={team.id}
                    team={team}
                    members={membersByTeam.get(team.id) ?? []}
                    onEdit={setEditingMember}
                    onDelete={handleDeleteMember}
                  />
                ))}
              </TeamGrid>
            </Board>

            <DragOverlay dropAnimation={null}>
              {activeMember ? <OverlayCard>{activeMember.name}</OverlayCard> : null}
            </DragOverlay>
          </DndContext>
        </Shell>
      </Page>
    </ThemeProvider>
  );
}

export default App;
