'use client';

import styled from 'styled-components';

export const FooterContainer = styled.footer`
  background-color: #fff;
  box-sizing: border-box;
  display: flex;
  flex-flow: row wrap;
  gap: 50px;
  justify-content: space-between;
  align-items: flex-start;
  min-height: 70px;
  width: 100%;
  margin-top: 50px;

  @media (max-width: 1280px) {
    flex-direction: column;
    gap: 20px;
  }

  & > .main-footer {
    flex: 0 0 100%;
    padding: 50px 20px 80px 20px;
    box-sizing: border-box;
    display: flex;
    gap: 50px;
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;

    @media (max-width: 1280px) {
      flex-direction: column;
    }

    & > div {
      min-width: 200px;
    }

    .title {
      text-transform: uppercase;
      font-family: var(--secondary-font);
      font-family: var(--secondary-font), sans-serif;
      font-weight: bold;
      font-size: 0.9rem;
      letter-spacing: 0.05rem;
      margin-bottom: 10px;
    }

    & > nav {
      flex: 0 0 auto;
      display: flex;
      justify-content: flex-end;
      gap: 20px;
      flex: 1;

      @media (max-width: 1280px) {
        width: 100%;
        justify-content: flex-start;
      }

      @media (max-width: 1024px) {
        flex-flow: row wrap;
        gap: 50px 20px;
      }

      & > div {
        @media (max-width: 1280px) {
          flex: 1;
        }

        @media (max-width: 1024px) {
          flex: 0 0 calc(100% / 2 - (1 / 2 * 20px));
        }

        @media (max-width: 480px) {
          flex: 0 0 100%;
        }

        & > ul {
          display: flex;
          flex-direction: column;
          margin: 0;
          padding: 0;
          list-style-type: none;
          min-width: 220px;

          @media (max-width: 1280px) {
            width: 100%;
            min-width: 0;
            justify-content: flex-start;
          }

          & > li {
            & > a {
              color: rgba(0, 0, 0, 1);
              text-decoration: none;
              padding: 5px 0;
              display: inline-block;
            }
          }
        }
      }
    }
  }
`;
