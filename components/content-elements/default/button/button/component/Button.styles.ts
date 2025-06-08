'use client';

import styled, { css } from 'styled-components';
import { getPrimaryColor } from '../../../constants';
import { ButtonStyleProps } from './Button.types';
import { borderRadiusMap } from '../../../styles.config';
// import { AlignOptions } from '../../../types';

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

// const alignFlexMap: Record<AlignOptions, string> = {
//   left: 'flex-start',
//   right: 'flex-end',
//   center: 'center',
//   justify: 'flex-start',
// };

export const ButtonContainer = styled.button<ButtonStyleProps>`
  font-size: 1rem;
  font-weight: ${({ $fontWeight }) => $fontWeight};
  border-radius: ${({ $borderRadius }) => borderRadiusMap[$borderRadius!]};
  cursor: pointer;
  text-decoration: none;
  color: ${({ $textColor }) => $textColor || getPrimaryColor()['900']};
  margin: ${({ $margin }) => marginMap[$margin!]};
  position: relative;
  overflow: hidden;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  min-width: 48px;
  min-height: 48px;
  box-sizing: border-box;
  transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out,
    border 0.2s ease-in-out;
  line-height: 1.5;
  text-align: ${({ $align }) => $align};
  background-color: red;
  padding: 0;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;

  @media (max-width: 768px) {
    ${({ $showOnlyIconOnMobile }) =>
      $showOnlyIconOnMobile && `width: 48px; height: 48px;`};
  }

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
    pointer-events: none;
  }

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

  &:focus-visible {
    outline: 2px solid #fff;
    outline-offset: -2px;
  }

  & > div {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
    pointer-events: none;
    padding: ${({ $size }) => sizeMap[$size!]};
    cursor: pointer;
    gap: ${({ $gap }) => $gap};

    .icon {
      padding-right: 0;
      display: flex;
    }

    .button-text {
      width: 100%;
      justify-content: ${({ $align }) => $align};

      @media (max-width: 768px) {
        display: ${({ $showOnlyIconOnMobile }) =>
          $showOnlyIconOnMobile ? 'none' : 'block'};
      }
    }

    &.ripple {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      z-index: 0;
    }
  }
`;
