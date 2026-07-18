import styled from 'styled-components';
import type { ReactNode } from 'react';

const Host = styled.div`
  position: fixed;
  left: -10000px;
  top: 0;
  width: max-content;
  pointer-events: none;
  opacity: 1;
`;

type Props = {
  children: ReactNode;
};

/** 화면 밖에 두고 캡처용으로만 쓰는 호스트 */
export function ExportHost({ children }: Props) {
  return <Host aria-hidden="true">{children}</Host>;
}
