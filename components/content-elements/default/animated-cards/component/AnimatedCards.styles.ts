'use client';

import styled, { css } from 'styled-components';
import { borderRadiusMap } from '../../styles.config';
import { BorderRadiusOptions } from '../../types';

export const Grid = styled.div<{
  $cols: number;
  $count: number;
  $stretch: boolean;
  $minCard?: string;
  $maxCard?: string;
}>`
  --min-card: ${({ $minCard }) => $minCard || '240px'};
  --max-card: ${({ $maxCard }) => $maxCard || '320px'};
  display: grid;
  gap: 1rem;

  ${({ $stretch, $cols, $count }) => {
    if ($stretch) {
      const c = $cols;
      return css`
        grid-template-columns: repeat(${c}, minmax(0, 1fr));

        @container (max-width: 1280px) {
          grid-template-columns: repeat(${Math.min(c, 4)}, minmax(0, 1fr));
        }
        @container (max-width: 1024px) {
          grid-template-columns: repeat(${Math.min(c, 3)}, minmax(0, 1fr));
        }
        @container (max-width: 768px) {
          grid-template-columns: repeat(${Math.min(c, 2)}, minmax(0, 1fr));
        }
        @container (max-width: 480px) {
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }
      `;
    } else {
      const c = Math.max(1, Math.min($cols, $count));
      return css`
        grid-template-columns: repeat(
          ${c},
          minmax(var(--min-card), var(--max-card))
        );
        justify-content: center;

        @container (max-width: 1024px) {
          grid-template-columns: repeat(
            ${Math.max(1, Math.min(3, c))},
            minmax(200px, var(--max-card))
          );
        }
        @container (max-width: 768px) {
          grid-template-columns: repeat(
            ${Math.max(1, Math.min(2, c))},
            minmax(180px, 1fr)
          );
        }
        @container (max-width: 480px) {
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }
      `;
    }
  }}
`;

export const BigIconWrap = styled.div<{ $color?: string }>`
  position: absolute;
  z-index: 10;
  top: -3rem;
  right: -3rem;
  pointer-events: none;

  svg {
    font-size: 8rem;
    color: ${({ $color }) => $color ?? 'currentColor'};
    transition: transform 300ms ease, color 300ms ease;
  }
`;

export const SmallIconWrap = styled.div<{ $color?: string }>`
  position: relative;
  z-index: 10;
  margin-bottom: 0.5rem;

  svg {
    font-size: 1.5rem;
    color: ${({ $color }) => $color ?? 'currentColor'};
    transition: color 300ms ease;
  }
`;

export const Title = styled.h3<{
  $color?: string;
  $textAlign?: 'left' | 'center' | 'right';
  $transform?: 'normal' | 'uppercase';
}>`
  position: relative;
  z-index: 10;
  font-size: 1.2rem;
  font-weight: bold;
  color: ${({ $color }) => $color};
  text-align: ${({ $textAlign }) => $textAlign};
  text-transform: ${({ $transform }) =>
    $transform === 'uppercase' ? 'uppercase' : 'none'};
  transition: color 300ms ease;
  margin: 0;
`;

export const Subtitle = styled.p<{
  $color?: string;
  $textAlign?: 'left' | 'center' | 'right';
  $transform?: 'normal' | 'uppercase';
}>`
  position: relative;
  z-index: 10;
  color: ${({ $color }) => $color};
  text-align: ${({ $textAlign }) => $textAlign};
  text-transform: ${({ $transform }) =>
    $transform === 'uppercase' ? 'uppercase' : 'none'};
  transition: color 300ms ease;
  margin: 0.25rem 0 0 0;
`;

/* CardLink mit Overlay + hover/focus-Farben aus Props */
export const CardLink = styled.a<{
  $borderColor?: string;
  $borderRadius?: BorderRadiusOptions;
  $backgroundColor?: string;
  $overlayColor?: string;
  $titleHoverColor?: string;
  $subTitleHoverColor?: string;
  $smallIconHoverColor?: string;
  $bigIconHoverColor?: string;
}>`
  display: block;
  width: 100%;
  padding: 1rem;
  box-sizing: border-box;
  border-radius: ${({ $borderRadius }) =>
    $borderRadius ? borderRadiusMap[$borderRadius] : borderRadiusMap.none};
  border: 1px solid ${({ $borderColor }) => $borderColor};
  position: relative;
  overflow: hidden;
  background: ${({ $backgroundColor }) => $backgroundColor};
  text-decoration: none;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ $overlayColor }) => $overlayColor};
    outline-offset: 2px;
  }

  &:where(button) {
    appearance: none;
    background-color: ${({ $backgroundColor }) => $backgroundColor};
    border: 1px solid ${({ $borderColor }) => $borderColor};
    border-radius: ${({ $borderRadius }) =>
      $borderRadius ? borderRadiusMap[$borderRadius] : borderRadiusMap.none};
    padding: 1rem;
    box-sizing: border-box;
    width: 100%;
    text-align: left;
    font: inherit;
    color: inherit;
  }

  /* Overlay fährt von unten hoch */
  &::before {
    content: '';
    position: absolute;
    left: -1px;
    right: -1px;
    bottom: -1px;
    height: calc(100% + 2px);
    border-radius: inherit;
    pointer-events: none;
    background: ${({ $overlayColor }) => $overlayColor};
    transform: translate3d(0, 100%, 0);
    transition: transform 300ms ease;
    will-change: transform;
    backface-visibility: hidden;
  }

  &:hover::before,
  &:focus-visible::before {
    transform: translate3d(0, 0, 0);
  }

  /* Farben bei Hover/Focus (gleichzeitig mit Overlay) */
  &:hover ${SmallIconWrap} svg,
  &:focus-visible ${SmallIconWrap} svg {
    color: ${({ $smallIconHoverColor }) =>
      $smallIconHoverColor ?? 'currentColor'};
  }

  &:hover ${BigIconWrap} svg,
  &:focus-visible ${BigIconWrap} svg {
    transform: rotate(12deg);
    color: ${({ $bigIconHoverColor }) => $bigIconHoverColor ?? 'currentColor'};
  }

  &:hover ${Title}, &:focus-visible ${Title} {
    color: ${({ $titleHoverColor }) => $titleHoverColor};
  }

  &:hover ${Subtitle}, &:focus-visible ${Subtitle} {
    color: ${({ $subTitleHoverColor }) => $subTitleHoverColor};
  }
`;
