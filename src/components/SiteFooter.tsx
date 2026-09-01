import styled from 'styled-components';
import { APP_VERSION } from '../constants';

const Footer = styled.footer`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  margin-top: 0.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.82rem;
  line-height: 1.4;
`;

const FooterMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem 0.75rem;
`;

const FooterVersion = styled.span`
  padding: 0.12rem 0.4rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
`;

const FooterLink = styled.a`
  color: ${({ theme }) => theme.colors.textMuted};
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    border-bottom-color: ${({ theme }) => theme.colors.borderStrong};
  }
`;

export function SiteFooter() {
  return (
    <Footer>
      <FooterMeta>
        <span>© {new Date().getFullYear()} hyukskee</span>
        <FooterVersion>v{APP_VERSION}</FooterVersion>
      </FooterMeta>
      <FooterLink href="mailto:gin280833@gmail.com">
        Contact: gin280833@gmail.com
      </FooterLink>
    </Footer>
  );
}
