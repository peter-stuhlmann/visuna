import styled from 'styled-components';

import { mergedConfig } from '../../../default.config';

export const ImageContainer = styled.div<{
  $isLoading: boolean;
  $width: number;
  $height: number;
}>`
  font-size: 0.875rem;
  width: 100%;

  & > div {
    position: relative;
    height: 100%;

    & > img {
      width: 100%;
      height: auto;
      max-width: 100%;
      max-height: 100%;
      opacity: 1;
      object-fit: contain;
      vertical-align: middle;
      position: relative;
      z-index: 1;
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
