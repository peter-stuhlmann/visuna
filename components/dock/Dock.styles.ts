'use client';

import styled from 'styled-components';

export const BlockHeading = styled.div`
  font-weight: bold;
  padding: 0.5rem 20px;
  box-sizing: border-box;
  text-transform: uppercase;
  font-size: 0.8rem;
  opacity: 1;
  transition: opacity 0.2s ease;
`;

export const Dock = styled.aside<{ $isFixed?: boolean }>`
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  z-index: 100000;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 1rem;
  opacity: 0.6;
  transition: 0.2s ease-in-out;

  margin-bottom: 30px;
  box-sizing: border-box;

  ${({ $isFixed }) =>
    $isFixed &&
    `opacity: 1;
    transform: translateX(-50%) translateY(-220px);
  `}

  @media (max-width: 1024px) {
    transform: translate(-50%, 0);
    top: 46px;
    border-radius: 0;
    opacity: 1;
  }

  &::before {
    width: 100%;
    height: 100%;
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    border-radius: 1rem;
    background: inherit;
    box-shadow: inset 0 0 0 200px rgba(255, 255, 255, 0.5);

    @media (max-width: 1024px) {
      border-radius: 0;
    }
  }

  nav {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 1rem;
    box-sizing: border-box;
    transition: 0.2s ease;
    border-radius: 1rem;
    display: flex;

    @media (max-width: 1024px) {
      padding: 0.5rem;
      border-radius: 0;
    }

    svg {
      width: 20px;
      height: 20px;
      flex: 0 0 20px;
    }

    a {
      gap: 10px;
    }

    ${BlockHeading} {
      transition: none;
      opacity: ${({ $isFixed }) => ($isFixed ? '0' : '1')};
    }
  }
`;

export const Block = styled.div`
  display: flex;
  width: 100%;
`;

export const DockContainer = styled.div<{
  $isFixed?: boolean;
  $itemCount: number;
}>`
  position: fixed;
  left: 50%;
  bottom: -60px;
  transform: translateX(-50%) translateY(0);
  z-index: 100000;
  width: calc(${({ $itemCount }) => $itemCount * 150}px + 2rem);
  box-sizing: border-box;
  height: 100px;
  border-radius: 1000px;

  @media (min-width: 1024px) {
    ${({ $isFixed }) =>
      !$isFixed &&
      `
    &:hover {
      ${Dock} {
        opacity: 1;
        transform: translateX(-50%) translateY(-220px);
      }
    }
  `}
  }

  @media (max-width: 1024px) {
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    transform: translateX(0) translateY(0);
  }
`;
