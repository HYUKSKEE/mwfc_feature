import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { SiteFooter } from '../components/SiteFooter';
import { TacticsBoard } from '../components/TacticsBoard';
import { Tooltip } from '../components/Tooltip';
import { loadData } from '../storage';

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Page = styled.div`
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  background:
    radial-gradient(ellipse 80% 50% at 10% -10%, rgba(225, 6, 0, 0.18), transparent 55%),
    radial-gradient(ellipse 60% 40% at 90% 0%, rgba(225, 6, 0, 0.08), transparent 50%),
    ${({ theme }) => theme.colors.bg};
`;

const Shell = styled.main`
  position: relative;
  z-index: 1;
  width: min(1180px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 2.25rem 0 3.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  animation: ${fadeUp} 0.55s ease backwards;

  @media (max-width: 860px) {
    width: min(1180px, calc(100% - 1.25rem));
    padding: 1.25rem 0 2.5rem;
    gap: 0.9rem;
  }
`;

const TopBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

const Brand = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const BrandMark = styled.h1`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: clamp(2rem, 8vw, 3.2rem);
  line-height: 0.9;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.white};
  font-weight: 400;

  span {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const Subtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.9rem;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 0.45rem 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  font-size: 0.88rem;
  text-decoration: none;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.accentSoft};
  }
`;

export function TacticsPage() {
  const [data] = useState(() => loadData());

  const assignedCount = useMemo(
    () => data.members.filter((member) => member.teamId).length,
    [data.members],
  );

  return (
    <Page>
      <Shell>
        <TopBar>
          <Brand>
            <BrandMark>
              TEAM<span>MAKER</span>
            </BrandMark>
            <Subtitle>전술판 · {assignedCount}명 배정됨</Subtitle>
          </Brand>
          <Tooltip
            text="조 편성 화면으로 돌아갑니다."
            textEn="Back to the team assignment screen."
            side="bottom"
          >
            <BackLink to="/">← 조 편성으로</BackLink>
          </Tooltip>
        </TopBar>

        <TacticsBoard teams={data.teams} members={data.members} />
        <SiteFooter />
      </Shell>
    </Page>
  );
}
