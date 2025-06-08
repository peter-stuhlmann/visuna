'use client';

import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  min-height: 100vh;
`;

export const Wrapper = styled.div`
  flex: 1;
  min-width: 800px;
  padding: 25px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 1280px) {
    width: calc(100%);
    min-width: auto;
  }

  & > div {
    width: 100%;
    max-width: 600px;
  }
`;

export const PageReducer = styled.div`
  background-color: rgb(60, 0, 80);
  height: 100vh;
  flex: 1;

  @media (max-width: 1280px) {
    flex: 0 0 25px;
    width: 25px;
  }

  @media (max-width: 480px) {
    display: none;
  }
`;
