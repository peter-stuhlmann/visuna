'use client';

import styled from 'styled-components';

type FlexProps = {
  $direction?: 'row' | 'column';
  $justifyContent?: 'left' | 'center' | 'right';
  $alignItems?: 'left' | 'center' | 'right';
  $gap?: string;
};

const directionMap: Record<string, string> = {
  left: 'left',
  center: 'center',
  right: 'right',
};

const justifyContentMap: Record<string, string> = {
  left: 'left',
  center: 'center',
  right: 'right',
};

const alignItemsMap: Record<string, string> = {
  left: 'left',
  center: 'center',
  right: 'right',
};

export const Flex = styled.div<FlexProps>`
  display: flex;
  flex-direction: ${({ $direction = 'row' }) => directionMap[$direction]};
  justify-content: ${({ $justifyContent = 'flex-start' }) =>
    justifyContentMap[$justifyContent]};
  align-items: ${({ $alignItems = 'flex-start' }) =>
    alignItemsMap[$alignItems]};
  gap: ${({ $gap = '0' }) => $gap};
`;
