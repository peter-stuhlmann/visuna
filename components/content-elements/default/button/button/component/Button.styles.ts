'use client';

import styled, { css } from 'styled-components';
import { getPrimaryColor } from '../../../constants';

type ContainerProps = {
  $margin?: 'none' | 'small' | 'medium' | 'large';
  $size?: 'small' | 'medium' | 'large';
  $variant?: 'text' | 'contained' | 'outlined';
  $fontWeight?: number;
  $speed?: number;
  $primaryColor: Record<string, string>;
  $textColor?: string;
};

const marginMap: Record<string, string> = {
  none: '0',
  small: '0.5rem 0',
  medium: '1rem',
  large: '2rem',
};

const sizeMap: Record<string, string> = {
  small: '0.25rem 0.5rem',
  medium: '0.5rem 1rem',
  large: '1rem 2rem',
};

export const ButtonContainer = styled.button<ContainerProps>`
  font-size: 1rem;
  font-weight: ${({ $fontWeight }) => $fontWeight};
  border-radius: 1000rem;
  cursor: pointer;
  text-decoration: none;
  color: ${({ $textColor }) => $textColor || getPrimaryColor()['900']};
  margin: ${({ $margin }) => marginMap[$margin!]};
  position: relative;
  overflow: hidden;
  width: fit-content;
  min-width: 4rem;
  min-height: 45px;
  box-sizing: border-box;
  transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out,
    border 0.2s ease-in-out;
  line-height: 1.5;
  text-align: center;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  ${({ $variant, $primaryColor }) => {
    switch ($variant) {
      case 'outlined':
        return css`
          background-color: transparent;
          border: 1px solid ${$primaryColor['300']};
        `;
      case 'text':
        return css`
          background-color: transparent;
          border: none;
        `;
      case 'contained':
        return css`
          color: ${$primaryColor['50']};
          background-color: ${$primaryColor['600']};
          border: 1px solid ${$primaryColor['800']};
        `;
    }
  }}

  &:hover {
    ${({ $variant, $primaryColor }) => {
      switch ($variant) {
        case 'outlined':
          return css`
            background-color: rgba(0, 0, 0, 0.05);
            border: 1px solid ${getPrimaryColor()['400']};
          `;
        case 'text':
          return css`
            background-color: ${$primaryColor['100']};
          `;
        case 'contained':
          return css`
            background-color: ${$primaryColor['700']};
            box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2),
              0px 2px 2px 0px rgba(0, 0, 0, 0.14),
              0px 1px 5px 0px rgba(0, 0, 0, 0.12);
          `;
      }
    }}
  }

  & > div {
    &:first-of-type {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 1;
      pointer-events: none;
      padding: ${({ $size }) => sizeMap[$size!]};
      cursor: pointer;
    }
  }
`;
