import styled from 'styled-components';

interface RippleContainerProps {
  $duration: number;
  $color: string;
}

export const RippleContainer = styled.div<RippleContainerProps>`
  position: absolute;
  display: inline-block;
  overflow: hidden;
  cursor: pointer;
  height: 100%;
  width: 100%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  & > span {
    position: absolute;
    border-radius: 50%;
    transform: scale(0);
    background-color: ${({ $color }) => $color};
    animation: rippleAnimation ${({ $duration }) => $duration}ms linear;
  }

  @keyframes rippleAnimation {
    to {
      transform: scale(2.5);
      opacity: 0;
    }
  }
`;
