'use client';

import styled from 'styled-components';

type SubFooterContainerProps = {
  $backgroundColor?: string | null;
  $textColor?: string;
  $fontSize?: 'small' | 'medium' | 'large';
  $align?: 'left' | 'center' | 'right';
};

const fontSizeMap: Record<string, string> = {
  small: '0.875rem',
  medium: '1rem',
  large: '1.25rem',
};

export const SubFooterContainer = styled.footer<SubFooterContainerProps>`
  background-color: ${({ $backgroundColor, theme }) =>
    $backgroundColor ?? theme.subFooter?.backgroundColor ?? '#fff'};
  color: ${({ $textColor, theme }) =>
    $textColor ?? theme.subFooter?.textColor ?? 'var(--primary-text-color)'};
  width: 100%;

  & > .wrapper {
    padding: 20px;
    box-sizing: border-box;
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;
    text-align: ${({ $align, theme }) =>
      $align ?? theme.subFooter?.align ?? 'left'};
    font-size: ${({ $fontSize = 'medium' }) => fontSizeMap[$fontSize]};
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`;
