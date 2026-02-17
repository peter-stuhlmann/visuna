'use client';

import styled from 'styled-components';
import { VideoStyleProps } from './Video.types';

export const VideoContainer = styled.video<VideoStyleProps>`
  object-fit: ${({ $objectFit }) => $objectFit};
`;
