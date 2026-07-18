import { forwardRef } from 'react';
import styled from 'styled-components';
import type { Member, Team } from '../types';

type Props = {
  team: Team;
  members: Member[];
};

const Card = styled.div`
  width: 720px;
  padding: 40px 36px 32px;
  margin-bottom: 24px;
  background:
    radial-gradient(ellipse 70% 45% at 12% -8%, rgba(225, 6, 0, 0.22), transparent 55%),
    #0a0a0a;
  color: #f2f2f2;
  font-family: 'Outfit', sans-serif;
  box-sizing: border-box;
`;

const Header = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e10600;
`;

const Brand = styled.div`
  font-family: 'Bebas Neue', sans-serif;
  font-size: 48px;
  line-height: 0.9;
  letter-spacing: 0.08em;

  span {
    color: #e10600;
  }
`;

const Meta = styled.div`
  text-align: right;
  color: #8a8a8a;
  font-size: 16px;
  line-height: 1.4;
`;

const TeamBox = styled.section`
  padding: 22px;
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 14px;
`;

const TeamTitle = styled.h3`
  margin: 0 0 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e10600;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 40px;
  letter-spacing: 0.06em;
  font-weight: 400;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
`;

const Count = styled.span`
  color: #8a8a8a;
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  letter-spacing: 0;
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Item = styled.li`
  padding: 12px 14px;
  background: #0a0a0a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  font-size: 22px;
  font-weight: 500;
`;

const Empty = styled.p`
  margin: 28px 0 8px;
  color: #8a8a8a;
  font-size: 16px;
  text-align: center;
`;

const Footer = styled.footer`
  margin-top: 24px;
  color: #8a8a8a;
  font-size: 13px;
  text-align: right;
`;

function formatDate(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
}

export const TeamExportCard = forwardRef<HTMLDivElement, Props>(
  function TeamExportCard({ team, members }, ref) {
    return (
      <Card ref={ref} data-export-team={team.id}>
        <Header>
          <Brand>
            TEAM<span>MAKER</span>
          </Brand>
          <Meta>
            <div>조별 배정</div>
            <div>{formatDate(new Date())}</div>
          </Meta>
        </Header>

        <TeamBox>
          <TeamTitle>
            <span>{team.name}</span>
            <Count>{members.length}명</Count>
          </TeamTitle>
          {members.length === 0 ? (
            <Empty>배정된 인원 없음</Empty>
          ) : (
            <List>
              {members.map((member, index) => (
                <Item key={member.id}>
                  {index + 1}. {member.name}
                </Item>
              ))}
            </List>
          )}
        </TeamBox>

        <Footer>MWFC</Footer>
      </Card>
    );
  },
);
