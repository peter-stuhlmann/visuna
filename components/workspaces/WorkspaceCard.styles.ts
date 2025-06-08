'use client';

import styled from 'styled-components';
import { roleColorMap } from '../content-elements/default/styles.config';
import { Role } from '../content-elements/default/types';
import { Button } from '../content-elements/default';

export const CardWrapper = styled.div<{ selected: boolean }>`
  position: relative;
  flex: 0 0 calc(25% - (3 * 20px / 4));
  overflow: hidden;
  border-radius: 1rem;
  box-shadow: ${({ selected }) =>
    selected ? '7px 7px 7px rgba(0, 0, 0, 0.5)' : 'none'};
`;

export const Card = styled.div<{ $backgroundImage: string }>`
  height: 200px;
  position: relative;
  background-image: url(${({ $backgroundImage }) => $backgroundImage});
  background-size: cover;
  background-position: center;
  color: white;
`;

export const CardOverlay = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  background-color: rgba(0, 0, 0, 0.2);
  position: relative;
`;

export const RoleLabel = styled.span<{ $role: Role }>`
  background-color: ${({ $role }) => roleColorMap[$role!]};
  color: #000;
  padding: 2px 5px;
  border-radius: 1000px;
  position: absolute;
  z-index: 1;
  top: 10px;
  right: 10px;
  font-size: 14px;
`;

export const NameLabel = styled.div`
  position: absolute;
  z-index: 1;
  bottom: 10px;
  left: 10px;
  padding: 2px 5px;
  border-radius: 4px;
`;

export const MenuButton = styled(Button)`
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.6);
`;

export const GradientOverlay = styled.div`
  width: 300%;
  height: 500%;
  position: absolute;
  bottom: 0;
  left: 0;
  background: radial-gradient(circle, rgba(0, 0, 0, 0) 70%, #000 100%);
  background-position: left bottom;
`;

export const ActionButton = styled.button`
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 2;
  color: white;
  background-color: rgba(0, 0, 0, 0.4);
  border: none;
  border-radius: 50%;
  padding: 6px;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 0, 0, 0.6);
  }
`;

export const Menu = styled.div`
  position: absolute;
  bottom: 40px;
  right: 10px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  z-index: 3;
`;

export const MenuItem = styled.div`
  padding: 10px;
  cursor: pointer;
  &:hover {
    background: #eee;
  }
`;
