import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import styled from 'styled-components';

type Side = 'top' | 'bottom' | 'left' | 'right';

type Props = {
  text: string;
  textEn?: string;
  children: ReactNode;
  /** @deprecated 항상 아이콘 옆(right→left) 12px 간격을 사용합니다. */
  side?: Side;
  className?: string;
};

const GAP = 12;
const EDGE = 12;

const Wrap = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  max-width: 100%;
  vertical-align: middle;
`;

const Main = styled.span`
  display: inline-flex;
  flex: 1 1 auto;
  min-width: 0;
  max-width: 100%;

  > * {
    max-width: 100%;
  }
`;

const Anchor = styled.span`
  position: relative;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
`;

const HintButton = styled.button`
  flex: 0 0 auto;
  display: inline-grid;
  place-items: center;
  width: 1.25rem;
  height: 1.25rem;
  margin: 0;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1;
  cursor: help;
  touch-action: manipulation;

  &:hover,
  &:focus-visible {
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.accentSoft};
    outline: none;
  }

  &[aria-expanded='true'] {
    color: ${({ theme }) => theme.colors.accent};
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.accentSoft};
  }
`;

const Bubble = styled.span<{
  $open: boolean;
  $placement: 'left' | 'right';
  $shiftY: number;
}>`
  position: absolute;
  z-index: 40;
  box-sizing: border-box;
  width: max-content;
  max-width: min(260px, calc(100vw - ${EDGE * 2}px));
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
  word-break: keep-all;
  overflow-wrap: anywhere;
  pointer-events: none;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  visibility: ${({ $open }) => ($open ? 'visible' : 'hidden')};
  top: 50%;
  transform: translateY(calc(-50% + ${({ $shiftY }) => $shiftY}px));
  transition: opacity 0.12s ease, visibility 0.12s ease;

  ${({ $placement }) =>
    $placement === 'right'
      ? `left: calc(100% + ${GAP}px); right: auto;`
      : `right: calc(100% + ${GAP}px); left: auto;`}

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

function fitBeside(
  anchor: DOMRect,
  bubble: DOMRect,
): { placement: 'left' | 'right'; shiftY: number } {
  const spaceRight = window.innerWidth - anchor.right - GAP;
  const spaceLeft = anchor.left - GAP;
  const placement =
    spaceRight >= bubble.width || spaceRight >= spaceLeft ? 'right' : 'left';

  const idealTop = anchor.top + anchor.height / 2 - bubble.height / 2;
  const minTop = EDGE;
  const maxTop = Math.max(EDGE, window.innerHeight - EDGE - bubble.height);
  const clampedTop = Math.min(maxTop, Math.max(minTop, idealTop));
  const shiftY = clampedTop - idealTop;

  return { placement, shiftY };
}

/** ? 아이콘 옆 12px 간격으로 한·영 설명을 보여줍니다. */
export function Tooltip({ text, textEn, children, className }: Props) {
  const tipId = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [placement, setPlacement] = useState<'left' | 'right'>('right');
  const [shiftY, setShiftY] = useState(0);
  const open = hovered || pinned;

  useEffect(() => {
    if (!pinned) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (wrapRef.current && target && !wrapRef.current.contains(target)) {
        setPinned(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [pinned]);

  useLayoutEffect(() => {
    if (!open) {
      setPlacement('right');
      setShiftY(0);
      return;
    }

    const update = () => {
      const anchorEl = anchorRef.current;
      const bubbleEl = bubbleRef.current;
      if (!anchorEl || !bubbleEl) return;

      const next = fitBeside(
        anchorEl.getBoundingClientRect(),
        bubbleEl.getBoundingClientRect(),
      );
      setPlacement(next.placement);
      setShiftY(next.shiftY);
    };

    update();
    const frame = window.requestAnimationFrame(update);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, text, textEn]);

  return (
    <Wrap
      ref={wrapRef}
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Main>{children}</Main>
      <Anchor ref={anchorRef}>
        <HintButton
          type="button"
          aria-label="기능 설명"
          aria-expanded={open}
          aria-describedby={open ? tipId : undefined}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setPinned((prev) => !prev);
          }}
        >
          ?
        </HintButton>
        <Bubble
          ref={bubbleRef}
          id={tipId}
          role="tooltip"
          $open={open}
          $placement={placement}
          $shiftY={shiftY}
        >
          <strong>{text}</strong>
          {textEn ? <em>{textEn}</em> : null}
        </Bubble>
      </Anchor>
    </Wrap>
  );
}
