import styled from 'styled-components';

export const SliderContainer = styled.div<{
  $totalSlides: number;
  $activeSlideIndex: number;
  $slideOffset: string;
}>`
  .slider-container {
    height: calc(800px + 130px);
    margin: 50px 0;
    position: relative;

    @media (max-width: 1440px) {
      height: calc(700px + 130px);
    }

    @media (max-width: 1280px) {
      height: calc(600px + 130px);
    }

    @media (max-width: 768px) {
      height: calc(700px + 130px);
    }

    & > div {
      position: absolute;
      width: 100%;
    }
  }

  .slide-list-wrapper {
    width: 100%;
    overflow: hidden;

    & > div {
      margin: 0 auto;
      width: 80%;
      max-width: 1500px;
      position: relative;

      @media (max-width: 768px) {
        width: 90%;
      }

      @media (max-width: 480px) {
        width: 100%;
      }
    }
  }

  .slides-list {
    display: flex;
    justify-content: center;
    margin: 0;
    padding: 0;
    width: calc(${({ $totalSlides }) => $totalSlides} * 100%);
    transition: transform 0.5s ease-in-out;
    transform: translateX(${({ $slideOffset }) => $slideOffset});

    & > li {
      flex: 0 0 calc(100% / ${({ $totalSlides }) => $totalSlides});
      height: 800px;
      max-height: calc(100vh - 2rem);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0;
      margin: 0;

      @media (max-width: 1440px) {
        height: 700px;
      }

      @media (max-width: 1280px) {
        height: 600px;
      }

      @media (max-width: 768px) {
        height: 700px;
      }

      & > div {
        background-color: transparent;
        width: 100%;
        height: 100%;
        overflow: hidden;
        position: relative;
      }
    }
  }
`;

export const SliderControl = styled.div<{ $progress: number }>`
  position: sticky;
  bottom: 2rem;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 4rem;
  margin-bottom: 50px;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;

  &.is-visible {
    opacity: 1;
  }

  > div {
    /* width: 300px; */
    display: flex;
    gap: 1rem;
    position: absolute;
    bottom: 0;

    > div {
      background-color: rgba(0, 0, 0, 0.5);
      -webkit-backdrop-filter: blur(7px);
      backdrop-filter: blur(7px);
      height: 45px;
      border-radius: 1000px;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;

      &:first-child {
        width: 45px;
      }

      &:last-child {
        flex: 1;
        padding: 0 1rem;

        @media (max-width: 768px) {
          padding: 0 0.5rem;
        }
      }
    }
  }

  .slide-animation-control-button {
    svg {
      fill: #fff;
    }
  }

  .dots {
    display: flex;
    justify-content: center;
    align-items: center;
    list-style-type: none;
    margin: 0;
    padding: 0;

    li {
      margin: -2px 0 0 0;
    }
  }

  .dot {
    padding: 8px;
    background: none;
    border: none;
    cursor: pointer;

    & > div {
      width: 8px;
      height: 8px;
      background-color: #cfcfd2;
      border: none;
      border-radius: 4px;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease-in-out;
    }

    &.is-active > div {
      width: 50px;
    }
  }

  .progress {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: #f5f5f7;
    border-radius: 4px;
    width: ${({ $progress }) => $progress}%;
    transition: width 0.05s linear;
  }
`;
