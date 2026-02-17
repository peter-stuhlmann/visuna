'use client';

import styled from 'styled-components';

export const SimpleHeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 11000;

    svg {
      width: auto;
      height: 24px;
    }
  }

  & > div {
    display: flex;
    gap: 1rem;
  }

  .menu-button {
    display: none;

    @media (max-width: 1280px) {
      display: block;
      position: relative;
      z-index: 11000;
    }
  }
`;

export const Navigation = styled.nav<{ $isMenuOpen: boolean }>`
  display: flex;
  gap: 2rem;

  @media (max-width: 1280px) {
    display: ${({ $isMenuOpen }) => ($isMenuOpen ? 'flex' : 'none')};
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 10000;
    background-color: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  & > ul {
    display: flex;
    gap: 2rem;
    list-style: none;
    margin: 0;
    padding: 0;

    @media (max-width: 1280px) {
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
    }

    li a {
      padding: 0.5rem 1rem;
      display: inline-block;
      text-decoration: none;
      color: inherit;
      font-weight: bold;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        height: 2px;
        width: 0;
        background-color: #000;
        transform-origin: left;
        transition: width 0.2s ease-in-out;
      }

      &:hover::after {
        width: 100%;
      }
    }
  }
`;
