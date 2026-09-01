import styled from 'styled-components';
import { Tooltip } from './Tooltip';

type Props = {
  teamCount: number;
  memberCount: number;
  isExporting?: boolean;
  onTeamCountChange: (count: number) => void;
  onRandomAssign: () => void;
  onClearAssignments: () => void;
  onOpenTactics: () => void;
};

const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.bgElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};

  @media (max-width: 860px) {
    gap: 0.65rem;
  }
`;

const CountTip = styled(Tooltip)`
  flex: 0 0 auto;
  min-width: 0;

  @media (max-width: 860px) {
    flex: 1 1 100%;
  }
`;

const Label = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.9rem;
`;

const Select = styled.select`
  min-height: 40px;
  padding: 0.55rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  font-size: 1rem;

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const Spacer = styled.div`
  flex: 1 1 auto;
  min-width: 0.5rem;

  @media (max-width: 860px) {
    display: none;
  }
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: 0.6rem;
  flex: 0 1 auto;
  min-width: 0;

  @media (max-width: 860px) {
    flex: 1 1 100%;
    width: 100%;
  }

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

const ActionTip = styled(Tooltip)`
  display: flex;
  width: 100%;
  min-width: 0;
  max-width: 100%;

  /* Tooltip Main */
  & > :first-child {
    flex: 1 1 auto;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
  }

  & > :first-child > * {
    width: 100%;
    max-width: 100%;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'ghost' }>`
  box-sizing: border-box;
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.35rem 0.45rem;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  min-height: 40px;
  padding: 0.55rem 0.7rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid
    ${({ theme, $variant }) =>
      $variant === 'ghost' ? theme.colors.border : theme.colors.accent};
  background: ${({ theme, $variant }) =>
    $variant === 'ghost' ? 'transparent' : theme.colors.accent};
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.92rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1.2;
  text-align: center;
  overflow: hidden;
  overflow-wrap: anywhere;
  word-break: keep-all;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;

  &:hover:not(:disabled) {
    background: ${({ theme, $variant }) =>
      $variant === 'ghost' ? theme.colors.bgHover : theme.colors.accentHover};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  svg {
    display: block;
    flex-shrink: 0;
  }

  @media (max-width: 860px) {
    padding: 0.5rem 0.55rem;
    font-size: 0.85rem;
  }
`;

const ButtonLabel = styled.span`
  flex: 0 1 auto;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

function DiceIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="3.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="8.25" cy="8.25" r="1.35" fill="currentColor" />
      <circle cx="15.75" cy="8.25" r="1.35" fill="currentColor" />
      <circle cx="12" cy="12" r="1.35" fill="currentColor" />
      <circle cx="8.25" cy="15.75" r="1.35" fill="currentColor" />
      <circle cx="15.75" cy="15.75" r="1.35" fill="currentColor" />
    </svg>
  );
}

export function Controls({
  teamCount,
  memberCount,
  isExporting = false,
  onTeamCountChange,
  onRandomAssign,
  onClearAssignments,
  onOpenTactics,
}: Props) {
  return (
    <Bar>
      <CountTip
        text="나눌 팀(조) 개수를 선택합니다."
        textEn="Choose how many teams to split into."
        side="bottom"
      >
        <Label>
          조 개수
          <Select
            value={teamCount}
            onChange={(event) => onTeamCountChange(Number(event.target.value))}
            aria-label="조 개수"
          >
            {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => (
              <option key={count} value={count}>
                {count}팀
              </option>
            ))}
          </Select>
        </Label>
      </CountTip>
      <Spacer />
      <Actions>
        <ActionTip
          text="모든 팀원을 대기 인원으로 되돌립니다."
          textEn="Move everyone back to the unassigned pool."
        >
          <Button
            type="button"
            $variant="ghost"
            onClick={onClearAssignments}
            disabled={memberCount === 0 || isExporting}
          >
            <ButtonLabel>배정 초기화</ButtonLabel>
          </Button>
        </ActionTip>
        <ActionTip
          text="인원 수와 실력을 맞춰 팀을 고르게 나눕니다."
          textEn="Auto-balance teams by headcount and skill."
        >
          <Button
            type="button"
            onClick={onRandomAssign}
            disabled={memberCount === 0 || isExporting}
            aria-label="밸런스 랜덤 조짜기"
            title="Randomize teams"
          >
            <DiceIcon />
            <ButtonLabel>Randomize</ButtonLabel>
          </Button>
        </ActionTip>
        <ActionTip
          text="배정된 선수를 코트/보드에 올려 전술을 배치합니다."
          textEn="Open the tactics board to place assigned players."
        >
          <Button
            type="button"
            $variant="ghost"
            onClick={onOpenTactics}
            disabled={memberCount === 0 || isExporting}
          >
            <ButtonLabel>전술짜기</ButtonLabel>
          </Button>
        </ActionTip>
      </Actions>
    </Bar>
  );
}
