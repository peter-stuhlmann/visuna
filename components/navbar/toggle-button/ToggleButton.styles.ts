'use client';

import { getPrimaryColor } from '@/components/content-elements/default/constants';
import styled from 'styled-components';

export const ToggleButton = styled.button<{ $isCollapsed: boolean }>`
  border: none;
  background: none;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 20px;
  color: ${getPrimaryColor()['50']};
  white-space: nowrap;
  width: 100%;
  text-align: left;
  margin-top: 60px;
  font-family: var(--primary-font), sans-serif;

  span.block-item-label {
    width: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '100%')};
    overflow: hidden;
    white-space: nowrap;
    transition: width 0.2s ease;
  }

  svg {
    fill: ${getPrimaryColor()['400']};
    width: 20px;
    height: 20px;
  }
`;
