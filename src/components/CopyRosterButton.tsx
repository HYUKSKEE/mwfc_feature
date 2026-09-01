import { useState } from 'react';
import styled from 'styled-components';
import { copyText, formatRosterNames } from '../utils/copyText';
import { Tooltip } from './Tooltip';

type Props = {
  names: string[];
  disabled?: boolean;
};

const Button = styled.button<{ $copied: boolean }>`
  min-height: 36px;
  padding: 0.45rem 0.8rem;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid
    ${({ theme, $copied }) => ($copied ? theme.colors.accent : theme.colors.border)};
  background: ${({ theme, $copied }) =>
    $copied ? theme.colors.accentSoft : 'transparent'};
  color: ${({ theme, $copied }) =>
    $copied ? theme.colors.accent : theme.colors.text};
  font-weight: 600;
  font-size: 0.88rem;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.accentSoft};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export function CopyRosterButton({ names, disabled }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = formatRosterNames(names);
    if (!text) return;

    const ok = await copyText(text);
    if (!ok) {
      window.alert('복사에 실패했습니다.');
      return;
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Tooltip
      text="전체 명단을 줄바꿈으로 복사해 공유할 수 있습니다."
      textEn="Copy the full roster (one name per line) to share."
      side="bottom"
    >
      <Button
        type="button"
        $copied={copied}
        disabled={disabled || names.length === 0}
        onClick={() => void handleCopy()}
        aria-label="전체 명단 복사"
      >
        {copied ? '복사됨' : '명단 복사'}
      </Button>
    </Tooltip>
  );
}
