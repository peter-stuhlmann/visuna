'use client';

import styled from 'styled-components';

export const HeaderContainer = styled.header`
  background-color: #fff;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.15);
  min-height: 70px;

  & > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    box-sizing: border-box;
    min-height: 70px;
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;

    .logo {
      text-transform: uppercase;
      font-weight: bold;
      font-size: 0.9rem;
      letter-spacing: 0.05rem;
      color: #133c59;

      & > span {
        &:nth-of-type(1) {
          color: rgb(209, 0, 105);
        }
        &:nth-of-type(3) {
          color: rgb(209, 0, 105);
        }
      }
    }

    svg {
      color: rgba(0, 0, 0, 0.6);
    }
  }
`;
