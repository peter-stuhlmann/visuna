'use client';

import styled from 'styled-components';
import { PRIMARY_COLOR } from '../../content-elements.config';

export const Container = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: 120px repeat(${({ $columns }) => $columns}, 1fr);

  @media (max-width: 660px) {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.875rem;
  }
`;

export const HeaderCell = styled.div`
  font-weight: bold;
  text-align: center;
  margin-bottom: 1rem;

  &:first-child {
    text-align: left;
  }

  @media (max-width: 660px) {
    display: none;
  }
`;

export const ColorName = styled.div`
  font-weight: 400;
  display: flex;
  align-items: center;

  @media (max-width: 660px) {
    font-weight: bold;
    margin-top: 4rem;
    margin-bottom: 2rem;
  }
`;

export const ColorValue = styled.div`
  display: none;

  @media (max-width: 660px) {
    display: block;
  }
`;

export const ColorBlock = styled.div`
  height: 2.5rem;
  width: 100%;
  transition: transform 0.2s ease;
  border-width: 1px;
  border-style: solid;
  cursor: pointer;
  position: relative;

  &:focus-visible {
    outline: 2px solid ${PRIMARY_COLOR['900']};
    transform: scale(1.2);
    z-index: 1;
  }

  &:hover {
    outline: 2px solid ${PRIMARY_COLOR['900']};
    transform: scale(1.2);
    z-index: 1;

    @media (max-width: 660px) {
      transform: scale(1);
    }
  }

  @media (max-width: 660px) {
    flex: 0 0 5rem;
  }

  @media (max-width: 370px) {
    flex: 0 0 3rem;
  }

  .shade {
    display: none;

    @media (max-width: 660px) {
      display: block;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      user-select: none;
    }
  }
`;

export const Tooltip = styled.div<{ $visible?: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${PRIMARY_COLOR['1000']};
  color: ${PRIMARY_COLOR['0']};
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
  transition: opacity 0.2s ease;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
`;

export const ColorBlockWrapper = styled.div`
  position: relative;
  margin: 0 1px;

  &:hover ${Tooltip} {
    opacity: 1;
  }

  @media (max-width: 660px) {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
`;
