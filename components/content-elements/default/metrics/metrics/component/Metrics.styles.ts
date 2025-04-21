'use client';

import styled from 'styled-components';

export const MetricsContainer = styled.div<{
  $totalItems: number;
  $textColor: string;
}>`
  display: flex;
  gap: 1rem;
  padding: 1rem 0;

  @media (max-width: 660px) {
    flex-flow: row wrap;
  }

  & > div {
    flex: 0 0
      ${({ $totalItems }) =>
        `calc((100% - ${$totalItems - 1}rem) / ${$totalItems})`};
    padding: 1rem;
    box-sizing: border-box;
    border-radius: 1000px;
    text-align: center;
    position: relative;

    @media (max-width: 660px) {
      flex: 0 0 calc(50% - 0.5rem);
    }

    @media (max-width: 480px) {
      flex: 0 0 100%;
    }

    &::after {
      content: '';
      position: absolute;
      background-color: ${({ $textColor }) => $textColor};
      top: 0;
      right: -0.5rem;
      transform: translateX(-50%);
      width: 1px;
      height: 100%;

      @media (max-width: 660px) {
        width: 100%;
        max-width: 100px;
        height: 1px;
        right: 50%;
        top: calc(100% + 0.5rem);
        transform: translate(50%, -50%);
      }
    }

    &:last-of-type::after {
      display: none;
    }

    @media (min-width: 481px) and (max-width: 660px) {
      &:nth-of-type(${({ $totalItems }) => $totalItems - 1})::after {
        display: none;
      }
    }

    & > div {
      &:first-of-type {
        font-weight: bold;
        font-size: 1.5rem;
      }
    }
  }
`;
