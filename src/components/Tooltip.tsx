import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import styled from 'styled-components';

type Side = 'top' | 'bottom';

type Props = {
  text: string;
  textEn?: string;
  children: ReactNode;
  side?: Side;
  className?: string;
};

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
  $side: Side;
  $shiftX: number;
}>`
  position: absolute;
  left: 50%;
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
  transform: translateX(calc(-50% + ${({ $shiftX }) => $shiftX}px))
    ${({ $open, $side }) =>
      $open
        ? 'translateY(0)'
        : $side === 'top'
          ? 'translateY(4px)'
          : 'translateY(-4px)'};
  transition:
    opacity 0.12s ease,
    visibility 0.12s ease;

  ${({ $side }) =>
    $side === 'top'
      ? 'bottom: calc(100% + 8px); top: auto;'
      : 'top: calc(100% + 8px); bottom: auto;'}

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

function fitPlacement(
  wrap: DOMRect,
  bubble: DOMRect,
  preferred: Side,
): { side: Side; shiftX: number } {
  const gap = 8;
  let side = preferred;
  const need = bubble.height + gap;
  const spaceAbove = wrap.top;
  const spaceBelow = window.innerHeight - wrap.bottom;

  if (side === 'top' && need > spaceAbove && spaceBelow > spaceAbove) {
    side = 'bottom';
  } else if (side === 'bottom' && need > spaceBelow && spaceAbove > spaceBelow) {
    side = 'top';
  }

  const centerX = wrap.left + wrap.width / 2;
  const idealLeft = centerX - bubble.width / 2;
  const minLeft = EDGE;
  const maxLeft = Math.max(EDGE, window.innerWidth - EDGE - bubble.width);
  const clampedLeft = Math.min(maxLeft, Math.max(minLeft, idealLeft));

  return { side, shiftX: clampedLeft - idealLeft };
}

/** Hover/focus 또는 ? 아이콘 탭으로 한·영 설명을 보여줍니다. */
export function Tooltip({
  text,
  textEn,
  children,
  side = 'top',
  className,
}: Props) {
  const tipId = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [placedSide, setPlacedSide] = useState<Side>(side);
  const [shiftX, setShiftX] = useState(0);
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
      setShiftX(0);
      setPlacedSide(side);
      return;
    }

    const update = () => {
      const wrapEl = wrapRef.current;
      const bubbleEl = bubbleRef.current;
      if (!wrapEl || !bubbleEl) return;

      const next = fitPlacement(
        wrapEl.getBoundingClientRect(),
        bubbleEl.getBoundingClientRect(),
        side,
      );
      setPlacedSide(next.side);
      setShiftX(next.shiftX);
    };

    update();
    // side flip 후 한 번 더 재측정
    const frame = window.requestAnimationFrame(update);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, side, text, textEn]);

  return (
    <Wrap
      ref={wrapRef}
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Main>{children}</Main>
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
        $side={placedSide}
        $shiftX={shiftX}
      >
        <strong>{text}</strong>
        {textEn ? <em>{textEn}</em> : null}
      </Bubble>
    </Wrap>
  );
}
