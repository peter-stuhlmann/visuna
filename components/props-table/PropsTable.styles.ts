'use client';

import styled from 'styled-components';
import { getPrimaryColor } from '../content-elements/default/constants';

const primaryColor = getPrimaryColor();

export const TableHead = styled.div`
  display: flex;
  font-weight: 700;
  margin-bottom: 2rem;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1rem;
    height: 1px;
    background-color: ${primaryColor['600']};
  }

  @media (max-width: 1280px) {
    display: none;
  }

  & > div {
    &:nth-of-type(1) {
      flex: 0 0 10rem;
    }

    &:nth-of-type(2) {
      flex: 1;
    }

    &:nth-of-type(3) {
      flex: 0 0 10rem;
    }

    &:nth-of-type(4) {
      flex: 1;
    }
  }
`;

export const TableBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;

  & > div {
    display: flex;
    position: relative;

    @media (max-width: 1280px) {
      flex-direction: column;
    }

    @media (max-width: 660px) {
      gap: 0.5rem;
    }

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: -1rem;
      height: 1px;
      background-color: ${primaryColor['600']};
    }

    & > div {
      @media (max-width: 1280x) {
        flex-direction: column;
        gap: 0.5rem;
        padding-bottom: 1rem;

        & > div {
          flex: unset !important;
          width: 100%;
          font-family: inherit;

          &:nth-of-type(1)::before {
            content: 'Prop: ';
            font-weight: bold;
          }

          &:nth-of-type(2)::before {
            content: 'Typ: ';
            font-weight: bold;
          }

          &:nth-of-type(3)::before {
            content: 'Default: ';
            font-weight: bold;
          }

          &:nth-of-type(4)::before {
            content: 'Beschreibung: ';
            font-weight: bold;
          }
        }
      }

      &:nth-of-type(1) {
        flex: 0 0 10rem;
        font-weight: bold;

        @media (max-width: 1280px) {
          flex: 0 0 auto;
        }
      }

      &:nth-of-type(2) {
        flex: 1;
        font-family: monospace;
        font-size: 0.95rem;
      }

      &:nth-of-type(3) {
        flex: 0 0 10rem;
        font-family: monospace;
        font-size: 0.95rem;

        @media (max-width: 1280px) {
          flex: 0 0 auto;
        }
      }

      &:nth-of-type(4) {
        flex: 1;
      }

      & > span {
        display: none;

        @media (max-width: 1280px) {
          display: inline-block;
          font-weight: bold;
          width: 9rem;
          text-transform: uppercase;
          letter-spacing: 0.05rem;
          font-size: 0.875rem;
          font-family: var(--primary-font);
        }

        @media (max-width: 660px) {
          display: flex;
          flex-direction: column;
          width: 7rem;
        }
      }
    }
  }
`;
