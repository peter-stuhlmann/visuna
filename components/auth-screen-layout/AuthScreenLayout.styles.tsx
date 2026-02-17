'use client';

import styled from 'styled-components';
import { getPrimaryColor } from '../content-elements/default/constants';

export const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  min-height: 100vh;

  @media (max-width: 1280px) {
    grid-template-columns: 25px 1fr;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }

  & > div.content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    view-transition-name: auth-content;

    & > section:first-of-type {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      & > div {
        width: 100%;
      }
    }
  }
`;

export const PageReducer = styled.div`
  background-color: ${getPrimaryColor()['800']};
  height: 100%;
  width: 100%;

  @media (max-width: 480px) {
    display: none;
  }
`;

export const Wrapper = styled.div`
  min-width: 800px;
  padding: 25px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 1280px) {
    min-width: auto;
    width: 100%;
  }

  & > div {
    width: 100%;
    max-width: 600px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    & > section:first-of-type {
      width: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  }
`;

export const AuthNote = styled.div`
  margin-top: 50px;
  font-size: 14px;
  color: rgb(100 100 100 / 1);
  line-height: 1.4;
  opacity: 0;

  animation: fadeInUp 0.6s ease forwards 0.6s;

  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translateY(30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
