"use client";

import styled from 'styled-components';

export const WatermarkContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
`;

export const LogoWrapper = styled.div`
  svg {
    width: 150px;
    height: 50px;
  }
`;

export const WatermarkText = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;
