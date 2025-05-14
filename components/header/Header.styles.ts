'use client';

import styled from 'styled-components';
import { getPrimaryColor } from '../content-elements/default/constants';

export const HeaderContainer = styled.header`
  background-color: #fff;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.15);
  height: 70px;

  & > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1rem;
    box-sizing: border-box;
    height: 70px;
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        fill: ${getPrimaryColor()['700']};
        width: auto;
        height: 24px;
      }
    }

    svg {
      color: rgba(0, 0, 0, 0.6);
      fill: rgba(0, 0, 0, 0.6);
      width: 24px;
      height: 24px;
    }
  }
`;
