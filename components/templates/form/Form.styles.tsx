'use client';

import styled from 'styled-components';

export const Form = styled.form`
  width: var(--wrapper-width);
  max-width: var(--wrapper-max-width);
  margin: 100px auto 200px auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 80px;
  padding: 25px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    width: 100%;
  }

  & > div {
    display: flex;
    flex-direction: column;
    gap: 30px;
    width: 100%;
  }
`;
