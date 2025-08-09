'use client';

import styled from 'styled-components';

type ContainerProps = {
  $imagePosition: 'left' | 'right';
  $textColor: string;
};

const imagePositionMap: Record<'left' | 'right', string> = {
  left: 'row-reverse',
  right: 'row',
};

export const Container = styled.div<ContainerProps>`
  display: flex;
  align-items: center;
  flex-direction: ${({ $imagePosition }) => imagePositionMap[$imagePosition]};
  gap: 5rem;
  color: ${({ $textColor }) => $textColor};

  /* Container Query ersetzen Media Queries */
  @container resizable-area (max-width: 1080px) {
    gap: 1rem;
  }

  @container resizable-area (max-width: 768px) {
    flex-direction: column;
  }

  & > div {
    &.text {
      flex: 0 0 calc(50% - 2.5rem - 2rem);
      width: 100%;

      @container resizable-area (max-width: 1080px) {
        flex: 0 0 calc(50% - 0.5rem);
      }

      @container resizable-area (max-width: 768px) {
        flex: 0 0 100%;
      }

      a {
        color: inherit;
      }
    }

    &.image {
      flex: 0 0 calc(50% - 2.5rem + 2rem);
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;

      @container resizable-area (max-width: 1080px) {
        flex: 0 0 calc(50% - 0.5rem);
      }

      @container resizable-area (max-width: 768px) {
        flex: 0 0 100%;
        margin-top: 2rem;
      }

      & > div > div {
        width: 100%;
        height: 100%;

        img {
          width: 100%;
          height: 100%;
          max-width: 100%;
          border-radius: 1rem;
        }
      }
    }
  }
`;
