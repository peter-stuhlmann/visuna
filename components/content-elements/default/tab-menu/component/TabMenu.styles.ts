'use client';

import styled from 'styled-components';
import Button from '../../core/button';
import { getPrimaryColor } from '../../constants';

export const TabBar = styled.div`
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid #ccc;
  margin-bottom: 2rem;
`;

export const Tab = styled(Button)<{ $active?: boolean }>`
  background: ${({ $active }) =>
    $active ? getPrimaryColor()[700] : 'transparent'};
  color: ${({ $active }) =>
    $active ? getPrimaryColor()[50] : getPrimaryColor()[700]};
  text-decoration: none;
  font-size: 1rem;
  border-radius: 1rem 1rem 0 0;
  min-width: 100px;
  justify-content: center;
  transition: 0.4s ease-in-out;
  margin-bottom: -1px;
`;
