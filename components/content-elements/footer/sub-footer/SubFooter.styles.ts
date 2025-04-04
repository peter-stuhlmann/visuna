'use client';

import styled from 'styled-components';

type SubFooterContainerProps = {
  $backgroundColor?: string | null;
  $textColor?: string;
  $fontSize?: 'small' | 'medium' | 'large';
  $align?: 'left' | 'center' | 'right';
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
    font-size: ${({ $fontSize, theme }) => {
      if ($fontSize) {
        return $fontSize === 'small'
          ? '0.875rem'
          : $fontSize === 'large'
          ? '1.2rem'
          : '1rem';
      }
      // Fallback: Nutze den Wert aus dem Theme, falls vorhanden, ansonsten '1rem'
      return theme.subFooter?.fontSize === 'small'
        ? '0.875rem'
        : theme.subFooter?.fontSize === 'large'
        ? '1.2rem'
        : '1rem';
    }};
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`;
