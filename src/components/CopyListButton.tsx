import { useState } from 'react';
import styled from 'styled-components';
import { copyText, formatMemberList } from '../utils/copyText';

type Props = {
  title: string;
  members: Array<{ name: string; skillLabel?: string }>;
  disabled?: boolean;
};

const Button = styled.button<{ $copied: boolean }>`
  min-height: 30px;
  padding: 0.3rem 0.65rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid
    ${({ theme, $copied }) => ($copied ? theme.colors.accent : theme.colors.border)};
  background: ${({ theme, $copied }) =>
    $copied ? theme.colors.accentSoft : 'transparent'};
  color: ${({ theme, $copied }) =>
    $copied ? theme.colors.accent : theme.colors.textMuted};
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  transition:
    color 0.15s ease,
    border-color 0.15s ease,
    background 0.15s ease;

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

export function CopyListButton({ title, members, disabled }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyText(formatMemberList(title, members));
    if (!ok) {
      window.alert('복사에 실패했습니다.');
      return;
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Button
      type="button"
      $copied={copied}
      onClick={handleCopy}
      disabled={disabled || members.length === 0}
      aria-label={`${title} 명단 복사`}
    >
      {copied ? '복사됨' : '리스트 복사'}
    </Button>
  );
}
