import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import styled from 'styled-components';
import { loadTacticsData, saveTacticsData } from '../storage/tactics';
import type { Member, Team } from '../types';
import {
  TACTICS_SPORTS,
  type TacticsBoardData,
  type TacticsSport,
} from '../types/tactics';
import { TacticsField } from './TacticsField';
import { Tooltip } from './Tooltip';

type Props = {
  teams: Team[];
  members: Member[];
};

const TEAM_COLORS = [
  '#e10600',
  '#3b82f6',
  '#22c55e',
  '#eab308',
  '#a855f7',
  '#f97316',
  '#14b8a6',
  '#ec4899',
  '#84cc16',
  '#06b6d4',
] as const;

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
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Title = styled.h2`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 1.6rem;
  letter-spacing: 0.05em;
  font-weight: 400;
`;

const Hint = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.85rem;
  line-height: 1.4;
  max-width: 48ch;
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
`;

const SportButton = styled.button<{ $active: boolean }>`
  min-height: 34px;
  padding: 0.35rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.accent : theme.colors.border};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.accentSoft : 'transparent'};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.accent : theme.colors.textMuted};
  font-size: 0.82rem;
  font-weight: 600;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }
`;

const GhostButton = styled.button`
  min-height: 34px;
  padding: 0.35rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.82rem;
  font-weight: 600;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(160px, 220px) minmax(0, 1fr);
  gap: 0.85rem;
  align-items: start;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const Roster = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: min(70vh, 560px);
  overflow: auto;
  padding-right: 0.15rem;

  @media (max-width: 860px) {
    max-height: 180px;
  }
`;

const TeamBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const TeamLabel = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.78rem;
  font-weight: 600;

  &::before {
    content: '';
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 999px;
    background: ${({ $color }) => $color};
  }
`;

const ChipList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
`;

const Chip = styled.button<{ $color: string; $onBoard: boolean }>`
  min-height: 30px;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  border: 1px solid
    ${({ $color, $onBoard }) => ($onBoard ? $color : `${$color}66`)};
  background: ${({ $color, $onBoard }) =>
    $onBoard ? `${$color}33` : 'transparent'};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.78rem;
  font-weight: 600;
  opacity: ${({ $onBoard }) => ($onBoard ? 0.55 : 1)};

  &:hover:not(:disabled) {
    background: ${({ $color }) => `${$color}44`};
  }

  &:disabled {
    cursor: default;
  }
`;

const EmptyRoster = styled.p`
  margin: 0.5rem 0 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.82rem;
  line-height: 1.4;
`;

const BoardWrap = styled.div`
  display: flex;
  justify-content: center;
  min-width: 0;
`;

const BoardFrame = styled.div`
  position: relative;
  width: 100%;
  max-width: min(420px, 100%);
  aspect-ratio: 10 / 16;
  min-height: 320px;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
  background: #0d0d0d;
  touch-action: none;
  user-select: none;

  @media (max-width: 860px) {
    max-width: min(360px, 100%);
    min-height: 420px;
  }
`;

const Token = styled.button<{ $color: string; $x: number; $y: number; $dragging: boolean }>`
  position: absolute;
  left: ${({ $x }) => $x}%;
  top: ${({ $y }) => $y}%;
  z-index: ${({ $dragging }) => ($dragging ? 5 : 2)};
  box-sizing: border-box;
  min-width: 60px;
  max-width: 5.5rem;
  min-height: 2.4rem;
  padding: 0.3rem 0.45rem;
  border: 2px solid ${({ theme }) => theme.colors.white};
  border-radius: 999px;
  background: ${({ $color }) => $color};
  color: #fff;
  box-shadow: ${({ $dragging }) =>
    $dragging
      ? '0 10px 24px rgba(0, 0, 0, 0.45)'
      : '0 4px 12px rgba(0, 0, 0, 0.35)'};
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.15;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transform: translate(-50%, -50%)
    ${({ $dragging }) => ($dragging ? 'scale(1.06)' : 'scale(1)')};
  cursor: grab;
  touch-action: none;

  &:active {
    cursor: grabbing;
  }
`;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function TacticsBoard({ teams, members }: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<TacticsBoardData>(() => loadTacticsData());
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    saveTacticsData(data);
  }, [data]);

  // 삭제된 멤버 배치 정리
  useEffect(() => {
    const ids = new Set(members.map((member) => member.id));
    setData((prev) => {
      const next = prev.placements.filter((item) => ids.has(item.memberId));
      if (next.length === prev.placements.length) return prev;
      return { ...prev, placements: next };
    });
  }, [members]);

  const teamColor = useMemo(() => {
    const map = new Map<string, string>();
    teams.forEach((team, index) => {
      map.set(team.id, TEAM_COLORS[index % TEAM_COLORS.length]);
    });
    return map;
  }, [teams]);

  const memberMap = useMemo(() => {
    const map = new Map<string, Member>();
    for (const member of members) map.set(member.id, member);
    return map;
  }, [members]);

  const onBoardIds = useMemo(
    () => new Set(data.placements.map((item) => item.memberId)),
    [data.placements],
  );

  const assignedByTeam = useMemo(() => {
    return teams
      .map((team) => ({
        team,
        members: members.filter((member) => member.teamId === team.id),
        color: teamColor.get(team.id) ?? TEAM_COLORS[0],
      }))
      .filter((group) => group.members.length > 0);
  }, [teams, members, teamColor]);

  const setSport = (sport: TacticsSport) => {
    setData((prev) => ({ ...prev, sport }));
  };

  const placeMember = (memberId: string) => {
    if (onBoardIds.has(memberId)) return;

    const count = data.placements.length;
    const x = 20 + (count % 5) * 15;
    const y = 25 + Math.floor(count / 5) * 18;

    setData((prev) => ({
      ...prev,
      placements: [
        ...prev.placements,
        {
          memberId,
          x: clamp(x, 8, 92),
          y: clamp(y, 12, 88),
        },
      ],
    }));
  };

  const clearBoard = () => {
    setData((prev) => ({ ...prev, placements: [] }));
  };

  const pointToPercent = useCallback((clientX: number, clientY: number) => {
    const board = boardRef.current;
    if (!board) return { x: 50, y: 50 };
    const rect = board.getBoundingClientRect();
    return {
      x: clamp(((clientX - rect.left) / rect.width) * 100, 4, 96),
      y: clamp(((clientY - rect.top) / rect.height) * 100, 6, 94),
    };
  }, []);

  const onTokenPointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
    memberId: string,
  ) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingId(memberId);

    const placement = data.placements.find((item) => item.memberId === memberId);
    if (!placement || !boardRef.current) return;

    const rect = boardRef.current.getBoundingClientRect();
    const tokenCenterX = rect.left + (placement.x / 100) * rect.width;
    const tokenCenterY = rect.top + (placement.y / 100) * rect.height;
    dragOffset.current = {
      x: event.clientX - tokenCenterX,
      y: event.clientY - tokenCenterY,
    };
  };

  const onTokenPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!draggingId || !event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }

    const next = pointToPercent(
      event.clientX - dragOffset.current.x,
      event.clientY - dragOffset.current.y,
    );

    setData((prev) => ({
      ...prev,
      placements: prev.placements.map((item) =>
        item.memberId === draggingId ? { ...item, ...next } : item,
      ),
    }));
  };

  const onTokenPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDraggingId(null);
  };

  const removeMember = (memberId: string) => {
    setData((prev) => ({
      ...prev,
      placements: prev.placements.filter((item) => item.memberId !== memberId),
    }));
  };

  return (
    <Panel>
      <Header>
        <TitleBlock>
          <Tooltip
            text="팀 선수를 전술판에 올리고 드래그로 위치를 잡습니다."
            textEn="Add team players to the board and drag to position them."
            side="bottom"
          >
            <Title>전술판</Title>
          </Tooltip>
          <Hint>
            조에 배정된 선수를 눌러 올리고, 보드에서 드래그하세요. 더블클릭하면
            제거됩니다.
          </Hint>
        </TitleBlock>
        <Toolbar>
          {TACTICS_SPORTS.map((sport) => (
            <SportButton
              key={sport.id}
              type="button"
              $active={data.sport === sport.id}
              onClick={() => setSport(sport.id)}
              aria-pressed={data.sport === sport.id}
            >
              {sport.label}
            </SportButton>
          ))}
          <GhostButton
            type="button"
            onClick={clearBoard}
            disabled={data.placements.length === 0}
          >
            보드 비우기
          </GhostButton>
        </Toolbar>
      </Header>

      <Layout>
        <Roster>
          {assignedByTeam.length === 0 ? (
            <EmptyRoster>
              먼저 팀원을 조에 배정하면 여기에서 전술판에 올릴 수 있습니다.
            </EmptyRoster>
          ) : (
            assignedByTeam.map(({ team, members: teamMembers, color }) => (
              <TeamBlock key={team.id}>
                <TeamLabel $color={color}>{team.name}</TeamLabel>
                <ChipList>
                  {teamMembers.map((member) => {
                    const onBoard = onBoardIds.has(member.id);
                    return (
                      <Chip
                        key={member.id}
                        type="button"
                        $color={color}
                        $onBoard={onBoard}
                        disabled={onBoard}
                        onClick={() => placeMember(member.id)}
                        title={
                          onBoard
                            ? '이미 전술판에 있습니다'
                            : '전술판에 추가'
                        }
                      >
                        {member.name}
                      </Chip>
                    );
                  })}
                </ChipList>
              </TeamBlock>
            ))
          )}
        </Roster>

        <BoardWrap>
          <BoardFrame ref={boardRef} aria-label="전술판">
            <TacticsField sport={data.sport} />
            {data.placements.map((placement) => {
              const member = memberMap.get(placement.memberId);
              if (!member) return null;
              const color =
                (member.teamId && teamColor.get(member.teamId)) || TEAM_COLORS[0];

              return (
                <Token
                  key={placement.memberId}
                  type="button"
                  $color={color}
                  $x={placement.x}
                  $y={placement.y}
                  $dragging={draggingId === placement.memberId}
                  aria-label={`${member.name} 위치 이동`}
                  onPointerDown={(event) =>
                    onTokenPointerDown(event, placement.memberId)
                  }
                  onPointerMove={onTokenPointerMove}
                  onPointerUp={onTokenPointerUp}
                  onPointerCancel={onTokenPointerUp}
                  onDoubleClick={() => removeMember(placement.memberId)}
                >
                  {member.name}
                </Token>
              );
            })}
          </BoardFrame>
        </BoardWrap>
      </Layout>
    </Panel>
  );
}
