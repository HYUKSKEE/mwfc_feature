import { useId, useState, type ReactNode } from 'react';
import styled from 'styled-components';

type Props = {
  text: string;
  textEn?: string;
  children: ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
};

const Wrap = styled.span`
  position: relative;
  display: inline-flex;
  max-width: 100%;
  vertical-align: middle;

  > :first-child {
    max-width: 100%;
  }
`;

const Bubble = styled.span<{ $open: boolean; $side: 'top' | 'bottom' }>`
  position: absolute;
  left: 50%;
  z-index: 40;
  width: max-content;
  max-width: min(260px, 70vw);
  padding: 0.55rem 0.7rem;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: #1a1a1a;
  color: ${({ theme }) => theme.colors.text};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.78rem;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: 0;
  text-align: left;
  white-space: normal;
  pointer-events: none;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  visibility: ${({ $open }) => ($open ? 'visible' : 'hidden')};
  transform: translateX(-50%)
    ${({ $open, $side }) =>
      $open
        ? 'translateY(0)'
        : $side === 'top'
          ? 'translateY(4px)'
          : 'translateY(-4px)'};
  transition:
    opacity 0.12s ease,
    transform 0.12s ease,
    visibility 0.12s ease;

  ${({ $side }) =>
    $side === 'top'
      ? 'bottom: calc(100% + 8px);'
      : 'top: calc(100% + 8px);'}

  strong {
    display: block;
    margin-bottom: 0.15rem;
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
  }

  em {
    display: block;
    color: ${({ theme }) => theme.colors.textMuted};
    font-style: normal;
    font-weight: 400;
  }
`;

/** Hover/focus 시 한·영 간단한 설명을 보여줍니다. */
export function Tooltip({
  text,
  textEn,
  children,
  side = 'top',
  className,
}: Props) {
  const tipId = useId();
  const [open, setOpen] = useState(false);

  return (
    <Wrap
      className={className}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={() => setOpen(false)}
    >
      {children}
      <Bubble id={tipId} role="tooltip" $open={open} $side={side}>
        <strong>{text}</strong>
        {textEn ? <em>{textEn}</em> : null}
      </Bubble>
    </Wrap>
  );
}
