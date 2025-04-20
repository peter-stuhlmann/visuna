'use client';

import styled from 'styled-components';

type ContainerProps = {
  $imagePosition: 'left' | 'right';
};

const imagePositionMap: Record<string, string> = {
  left: 'row-reverse',
  right: 'row',
};

export const Container = styled.div<ContainerProps>`
  display: flex;
  align-items: center;
  flex-direction: ${({ $imagePosition }) => imagePositionMap[$imagePosition]};
  gap: 5rem;

  @media (max-width: 1440px) {
  }
  @media (max-width: 1280px) {
  }
  @media (max-width: 1080px) {
    gap: 1rem;
  }
  @media (max-width: 768px) {
    flex-direction: column;
  }
  @media (max-width: 660px) {
  }
  @media (max-width: 480px) {
  }
  @media (max-width: 370px) {
  }

  & > div {
    &.text {
      flex: 0 0 calc(50% - 2.5rem - 2rem);
      width: 100%;

      @media (max-width: 1440px) {
      }
      @media (max-width: 1280px) {
      }
      @media (max-width: 1080px) {
        flex: 0 0 calc(50% - 0.5rem);
      }
      @media (max-width: 768px) {
        flex: 0 0 100%;
      }
      @media (max-width: 660px) {
      }
      @media (max-width: 480px) {
      }
      @media (max-width: 370px) {
      }

      a {
        color: inherit;
      }
    }

    &.image {
      /* background-color: rgba(0, 0, 0, 0.1); */
      flex: 0 0 calc(50% - 2.5rem + 2rem);
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;

      @media (max-width: 1440px) {
      }
      @media (max-width: 1280px) {
      }
      @media (max-width: 1080px) {
        flex: 0 0 calc(50% - 0.5rem);
      }
      @media (max-width: 768px) {
        flex: 0 0 100%;
        margin-top: 2rem;
      }
      @media (max-width: 660px) {
      }
      @media (max-width: 480px) {
      }
      @media (max-width: 370px) {
      }

      & > div > div {
        width: 100%;
        height: 100%;

        img {
          width: 100%;
          height: auto;
          max-width: 100%;
        }
      }
    }
  }
`;
