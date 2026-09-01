import styled, { css } from 'styled-components';
import type { TacticsSport } from '../types/tactics';

const FieldBase = css`
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
  pointer-events: none;
`;

const DefaultField = styled.div`
  ${FieldBase}
  background:
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.04), transparent 55%),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 31px,
      rgba(255, 255, 255, 0.035) 31px,
      rgba(255, 255, 255, 0.035) 32px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 31px,
      rgba(255, 255, 255, 0.035) 31px,
      rgba(255, 255, 255, 0.035) 32px
    ),
    #121212;

  &::after {
    content: '';
    position: absolute;
    inset: 8%;
    border: 1px dashed rgba(255, 255, 255, 0.12);
    border-radius: 8px;
  }
`;

const SoccerField = styled.div`
  ${FieldBase}
  background:
    linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.1) 0%,
      transparent 8%,
      transparent 92%,
      rgba(0, 0, 0, 0.1) 100%
    ),
    repeating-linear-gradient(
      0deg,
      #1f7a3a 0%,
      #1f7a3a 12.5%,
      #246f3a 12.5%,
      #246f3a 25%
    );
`;

const FieldSvg = styled.svg`
  ${FieldBase}
`;

const DefaultLabel = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: rgba(255, 255, 255, 0.18);
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(1.8rem, 7vw, 3rem);
  letter-spacing: 0.12em;
  pointer-events: none;
`;

type Props = {
  sport: TacticsSport;
};

/** 세로형(포트레이트) 전술 코트 */
export function TacticsField({ sport }: Props) {
  if (sport === 'soccer') {
    return (
      <>
        <SoccerField aria-hidden />
        <FieldSvg viewBox="0 0 64 100" preserveAspectRatio="none" aria-hidden>
          <rect
            x="3"
            y="3"
            width="58"
            height="94"
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="0.7"
          />
          <line
            x1="3"
            y1="50"
            x2="61"
            y2="50"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="0.55"
          />
          <circle
            cx="32"
            cy="50"
            r="9"
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="0.55"
          />
          <circle cx="32" cy="50" r="0.75" fill="rgba(255,255,255,0.9)" />
          {/* top penalty */}
          <rect
            x="14"
            y="3"
            width="36"
            height="14"
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="0.55"
          />
          <rect
            x="22"
            y="3"
            width="20"
            height="6"
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="0.55"
          />
          {/* bottom penalty */}
          <rect
            x="14"
            y="83"
            width="36"
            height="14"
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="0.55"
          />
          <rect
            x="22"
            y="91"
            width="20"
            height="6"
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="0.55"
          />
        </FieldSvg>
      </>
    );
  }

  if (sport === 'basketball') {
    return (
      <FieldSvg viewBox="0 0 54 100" preserveAspectRatio="none" aria-hidden>
        <rect width="54" height="100" fill="#c47a3a" />
        <rect
          x="2"
          y="2"
          width="50"
          height="96"
          fill="none"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="0.75"
        />
        <line
          x1="2"
          y1="50"
          x2="52"
          y2="50"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="0.55"
        />
        <circle
          cx="27"
          cy="50"
          r="6.5"
          fill="none"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="0.55"
        />
        {/* top key */}
        <rect
          x="14"
          y="2"
          width="26"
          height="16"
          fill="none"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="0.55"
        />
        <circle
          cx="27"
          cy="18"
          r="6.5"
          fill="none"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="0.55"
        />
        <path
          d="M8 2 Q8 22 27 22 Q46 22 46 2"
          fill="none"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="0.55"
        />
        {/* bottom key */}
        <rect
          x="14"
          y="82"
          width="26"
          height="16"
          fill="none"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="0.55"
        />
        <circle
          cx="27"
          cy="82"
          r="6.5"
          fill="none"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="0.55"
        />
        <path
          d="M8 98 Q8 78 27 78 Q46 78 46 98"
          fill="none"
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="0.55"
        />
      </FieldSvg>
    );
  }

  return (
    <>
      <DefaultField aria-hidden />
      <DefaultLabel>BOARD</DefaultLabel>
    </>
  );
}
