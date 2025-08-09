'use client';

import { getPrimaryColor } from '@/components/content-elements/default/constants';
import styled from 'styled-components';

export const BlockItemContainer = styled.div<{
  $isActive: boolean;
  $noArrow: boolean;
}>`
  transition: background-color 0.2s ease;
  position: relative;
  background-color: ${({ $isActive }) =>
    $isActive ? getPrimaryColor()['950'] : 'transparent'};

  &::after {
    ${({ $noArrow }) => $noArrow && `display: none;`}
    content: '';
    position: absolute;
    top: 50%;
    right: -10px;
    width: 0px;
    height: 0px;
    transform: rotate(360deg) translateY(-50%);
    border-style: solid;
    border-width: 10px 0 10px 10px;
    border-color: ${({ $isActive }) =>
      $isActive
        ? `transparent transparent transparent ${getPrimaryColor()['950']}`
        : 'transparent transparent transparent transparent'};
    transition: border-color 0.2s ease;
  }

  &:hover {
    background-color: ${getPrimaryColor()['700']};

    &::after {
      border-color: transparent transparent transparent
        ${getPrimaryColor()['700']};
    }
  }

  a {
    padding: 0.5rem 20px;
    box-sizing: border-box;
    display: flex;
    text-decoration: none;
    color: inherit;
    width: 100%;
    align-items: center;
    gap: 10px;
    color: ${getPrimaryColor()['50']};

    span.block-item-label {
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      transition: width 0.2s ease;
    }

    svg {
      fill: ${getPrimaryColor()['400']};
    }
  }
`;
