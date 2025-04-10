import { FC } from 'react';

import { Wrapper } from '@/components/content-elements/default';

const HomePage: FC = async () => {
  return (
    <main>
      <Wrapper>
        <h1>Hello World!</h1>
      </Wrapper>
    </main>
  );
};

export default HomePage;
