import { FC, ReactNode } from 'react';

import { Container, PageReducer, Wrapper } from './AuthScreenLayout.styles';

type AuthScreenLayoutProps = {
  children: ReactNode;
};

const AuthScreenLayout: FC<AuthScreenLayoutProps> = ({ children }) => {
  return (
    <Container>
      <PageReducer />
      <Wrapper>
        <div>{children}</div>
      </Wrapper>
    </Container>
  );
};

export default AuthScreenLayout;
