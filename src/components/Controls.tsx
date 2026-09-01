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
    gap: 0.6rem;
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

const Button = styled.button<{ $variant?: 'primary' | 'ghost' }>`
  min-height: 40px;
  padding: 0.65rem 1.1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid
    ${({ theme, $variant }) =>
      $variant === 'ghost' ? theme.colors.border : theme.colors.accent};
  background: ${({ theme, $variant }) =>
    $variant === 'ghost' ? 'transparent' : theme.colors.accent};
  color: ${({ theme }) => theme.colors.white};
  font-weight: 600;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
  width: 100%;

  &:hover:not(:disabled) {
    background: ${({ theme, $variant }) =>
      $variant === 'ghost' ? theme.colors.bgHover : theme.colors.accentHover};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const TipSlot = styled(Tooltip)`
  @media (max-width: 860px) {
    flex: 1 1 calc(50% - 0.3rem);
  }
`;

const Spacer = styled.div`
  flex: 1;

  @media (max-width: 860px) {
    display: none;
  }
`;

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
      <TipSlot
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
      </TipSlot>
      <Spacer />
      <TipSlot
        text="모든 팀원을 대기 인원으로 되돌립니다."
        textEn="Move everyone back to the unassigned pool."
      >
        <Button
          type="button"
          $variant="ghost"
          onClick={onClearAssignments}
          disabled={memberCount === 0 || isExporting}
        >
          배정 초기화
        </Button>
      </TipSlot>
      <TipSlot
        text="인원 수와 실력을 맞춰 팀을 고르게 나눕니다."
        textEn="Auto-balance teams by headcount and skill."
      >
        <Button
          type="button"
          onClick={onRandomAssign}
          disabled={memberCount === 0 || isExporting}
        >
          밸런스 랜덤 조짜기
        </Button>
      </TipSlot>
      <TipSlot
        text="배정된 선수를 코트/보드에 올려 전술을 배치합니다."
        textEn="Open the tactics board to place assigned players."
      >
        <Button
          type="button"
          $variant="ghost"
          onClick={onOpenTactics}
          disabled={memberCount === 0 || isExporting}
        >
          전술짜기
        </Button>
      </TipSlot>
    </Bar>
  );
}
