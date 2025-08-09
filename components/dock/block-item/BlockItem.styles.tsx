'use client';

import { getPrimaryColor } from '@/components/content-elements/default/constants';
import styled from 'styled-components';

export const BlockItemContainer = styled.div<{
  $isActive: boolean;
  $noArrow: boolean;
}>`
  flex: 0 0 calc(100% / 5);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  transition: 0.2s ease;
  position: relative;
  border-radius: 1rem;
  /* background-color: ${({ $isActive }) =>
    $isActive ? getPrimaryColor()['950'] : 'transparent'}; */

  &:hover {
    /* transform: scale(1.4) translateY(-5px); */
    box-shadow: 0px 0px 25px 5px rgba(0, 0, 0, 0.05);

    & > a {
      & > span.block-item-label {
      }
      & > svg {
        transform: scale(4) translateY(-8px);
      }
    }
  }

  a {
    padding: 1rem;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    text-decoration: none;
    color: inherit;
    width: 100%;
    align-items: center;
    gap: 10px;
    text-align: center;
    transition: 0.2s ease;
    color: ${getPrimaryColor()['900']};

    span.block-item-label {
      width: 100%;
      /* overflow: hidden; */
      white-space: nowrap;
      transition: 0.2s ease;
    }

    svg {
      fill: ${getPrimaryColor()['700']};
      transition: 0.2s ease;
    }
  }
`;
