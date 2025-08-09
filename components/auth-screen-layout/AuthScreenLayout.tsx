import { FC, ReactNode } from 'react';

import { Container, PageReducer } from './AuthScreenLayout.styles';

type AuthScreenLayoutProps = {
  children: ReactNode;
};

const AuthScreenLayout: FC<AuthScreenLayoutProps> = ({ children }) => {
  return (
    <Container>
      <PageReducer />
      <div className="content">{children}</div>
    </Container>
  );
};

export default AuthScreenLayout;
