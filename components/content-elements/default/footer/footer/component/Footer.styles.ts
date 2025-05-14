'use client';

import styled from 'styled-components';

export const FooterContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 50px;
  justify-content: space-between;
  align-items: flex-start;
  min-height: 70px;
  width: 100%;
  padding-bottom: 0;
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    padding-bottom: 0;
  }

  & > .main-footer {
    flex: 0 0 100%;
    box-sizing: border-box;
    display: flex;
    flex-flow: row wrap;
    gap: 50px;
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;

    @media (max-width: 1280px) {
      flex-direction: column;
    }

    .title {
      text-transform: uppercase;
      font-family: var(--tertiary-font);
      font-family: var(--tertiary-font), sans-serif;
      font-weight: bold;
      font-size: 0.9rem;
      letter-spacing: 0.05rem;
      margin-bottom: 10px;
      flex: 1;
    }

    & > nav {
      flex: 0 0 auto;
      display: flex;
      gap: 100px;

      @media (max-width: 1280px) {
        width: 100%;
        justify-content: flex-start;
      }

      @media (max-width: 768px) {
        flex-flow: row wrap;
        gap: 50px 20px;
      }

      & > div {
        flex: 0 0 auto;

        @media (max-width: 768px) {
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

          @media (max-width: 1280px) {
            width: 100%;
            min-width: 0;
            justify-content: flex-start;
          }

          & > li {
            & > a {
              color: inherit;
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
