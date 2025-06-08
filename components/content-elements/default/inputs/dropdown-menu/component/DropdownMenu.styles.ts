import styled from 'styled-components';
import { DropdownMenuStyleProps } from './DropdownMenu.types';
import { borderRadiusMap } from '../../../styles.config';

export const DropdownMenuWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

export const DropdownMenuOptions = styled.ul<DropdownMenuStyleProps>`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: ${({ $borderRadius }) => borderRadiusMap[$borderRadius!]};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin: 0.5rem 0 0 0;
  padding: 0.5rem 0;
  list-style: none;
  z-index: 10000;
  min-width: 160px;
  overflow: hidden;
`;
