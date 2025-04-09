'use client';

import styled, { css } from 'styled-components';
import { PRIMARY_COLOR } from '../../content-elements.config';

type ContainerProps = {
  $margin?: 'none' | 'small' | 'medium' | 'large';
  $size?: 'small' | 'medium' | 'large';
  $variant?: 'text' | 'contained' | 'outlined';
  $fontWeight?: number;
  $speed?: number;
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

const variantMap: Record<string, string> = {
  text: `
    border: none;
    background-color: transparent;`,
  contained: `
    color: ${PRIMARY_COLOR['50']};
    background-color: ${PRIMARY_COLOR['600']};
    border: 1px solid ${PRIMARY_COLOR['800']};
  `,
  outlined: `
    background-color: ${PRIMARY_COLOR['50']}; 
    border: 1px solid ${PRIMARY_COLOR['300']};
  `,
};

const variantHoverMap: Record<string, string> = {
  text: `
    background-color: ${PRIMARY_COLOR['100']}; 
  `,
  contained: `
    background-color: ${PRIMARY_COLOR['700']}; 
    box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
  `,
  outlined: `
    background-color: ${PRIMARY_COLOR['100']}; 
    border: 1px solid ${PRIMARY_COLOR['400']};
  `,
};

export const ButtonContainer = styled.button<ContainerProps>`
  font-size: 1rem;
  font-weight: ${({ $fontWeight = '700' }) => $fontWeight};
  border-radius: 0.25rem;
  border-radius: 1000rem;
  cursor: pointer;
  text-decoration: none;
  color: ${PRIMARY_COLOR['900']};
  margin: ${({ $margin = 'none' }) => marginMap[$margin]};
  position: relative;
  overflow: hidden;
  width: fit-content;
  min-width: 4rem;
  box-sizing: border-box;
  transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out,
    border 0.2s ease-in-out;
  line-height: 1.5;
  text-align: center;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  ${({ $variant = 'contained' }) => css`
    ${variantMap[$variant]}
  `}

  &:hover {
    ${({ $variant = 'contained' }) => css`
      ${variantHoverMap[$variant]}
    `}
  }

  & > div {
    &:first-of-type {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 1;
      pointer-events: none;
      padding: ${({ $size = 'medium' }) => sizeMap[$size]};
      cursor: pointer;
    }
  }
`;
