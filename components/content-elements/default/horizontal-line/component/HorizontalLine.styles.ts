'use client';

import styled from 'styled-components';

export const HorizontalLineContainer = styled.hr<{ $color?: string }>`
  border: none;
  border-top: 2px solid ${({ $color }) => $color};
`;
