'use client';

import styled from 'styled-components';
import { getPrimaryColor } from '../content-elements/default/constants';

export const BlockHeading = styled.div`
  font-weight: bold;
  padding: 0.5rem 20px;
  box-sizing: border-box;
  text-transform: uppercase;
  font-size: 0.8rem;
  opacity: 1;
  transition: opacity 0.2s ease;
`;

export const Navbar = styled.aside<{ $isCollapsed?: boolean }>`
  position: fixed;
  margin-bottom: 50px;
  padding-right: 20px;
  box-sizing: border-box;
  width: ${({ $isCollapsed }) => ($isCollapsed ? '80px' : '350px')};

  @media (max-width: 768px) {
    width: ${({ $isCollapsed }) => ($isCollapsed ? '80px' : '270px')};
  }

  nav {
    background-color: ${getPrimaryColor()['800']};
    padding-top: 50px;
    padding-bottom: 50px;
    transition: 0.2s ease;
    border-radius: 0 0 150px 0;

    svg {
      width: 20px;
      height: 20px;
      flex: 0 0 20px;
    }

    a {
      gap: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '10px')};
    }

    ${BlockHeading} {
      transition: none;
      opacity: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '1')};
    }
  }
`;

export const Block = styled.div`
  margin-bottom: 1rem;
  color: ${getPrimaryColor()['50']};

  &:last-of-type {
    margin-bottom: 0;
  }
`;
