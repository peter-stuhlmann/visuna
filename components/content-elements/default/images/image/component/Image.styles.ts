import styled from 'styled-components';

import { mergedConfig } from '../../../default.config';

export const ImageContainer = styled.div<{
  $isLoading: boolean;
  $width: number;
  $height: number;
}>`
  font-size: 0.875rem;

  & > div {
    position: relative;
    height: 100%;

    & > img {
      max-width: 100%;
      max-height: 100%;
      opacity: ${({ $isLoading }) => ($isLoading ? 0 : 1)};
      object-fit: contain;
      vertical-align: middle;
    }

    & > .${mergedConfig.classPrefix + '-'}skeleton {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
`;
