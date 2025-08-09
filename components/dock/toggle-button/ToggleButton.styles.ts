'use client';

import { getPrimaryColor } from '@/components/content-elements/default/constants';
import styled from 'styled-components';

export const ToggleButton = styled.button<{ $isFixed: boolean }>`
  border: none;
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  cursor: pointer;
  white-space: nowrap;
  text-align: left;
  font-family: var(--primary-font), sans-serif;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: none;

  &:hover svg {
    fill: ${getPrimaryColor()['700']};
  }

  svg {
    fill: ${getPrimaryColor()['200']};
    width: 12px;
    height: 12px;
    transition: 0.2s ease-in-out;
  }
`;
