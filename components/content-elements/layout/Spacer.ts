'use client';

import styled from 'styled-components';

const sizeMap: Record<string, string> = {
  none: '0',
  small: '2rem',
  medium: '4rem',
  large: '8rem',
};

export const Spacer = styled.div<{
  $size?: 'none' | 'small' | 'medium' | 'large';
  $backgroundColor?: string;
}>`
  height: ${({ $size = 'large' }) => sizeMap[$size]};
  background-color: ${({ $backgroundColor = 'transparent' }) =>
    $backgroundColor};
  width: 100%;
`;

export default Spacer;
