import styled from 'styled-components';

type Props = {
  teamCount: number;
  memberCount: number;
  onTeamCountChange: (count: number) => void;
  onRandomAssign: () => void;
  onClearAssignments: () => void;
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
`;

const Label = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.9rem;
`;

const Select = styled.select`
  padding: 0.55rem 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'ghost' }>`
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
    border-color 0.15s ease,
    transform 0.15s ease;

  &:hover:not(:disabled) {
    background: ${({ theme, $variant }) =>
      $variant === 'ghost' ? theme.colors.bgHover : theme.colors.accentHover};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

export function Controls({
  teamCount,
  memberCount,
  onTeamCountChange,
  onRandomAssign,
  onClearAssignments,
}: Props) {
  return (
    <Bar>
      <Label>
        조 개수
        <Select
          value={teamCount}
          onChange={(event) => onTeamCountChange(Number(event.target.value))}
          aria-label="조 개수"
        >
          {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => (
            <option key={count} value={count}>
              {count}조
            </option>
          ))}
        </Select>
      </Label>
      <Spacer />
      <Button
        type="button"
        $variant="ghost"
        onClick={onClearAssignments}
        disabled={memberCount === 0}
      >
        배정 초기화
      </Button>
      <Button
        type="button"
        onClick={onRandomAssign}
        disabled={memberCount === 0}
      >
        랜덤 조짜기
      </Button>
    </Bar>
  );
}
