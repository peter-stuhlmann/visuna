'use client';

import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  gap: 10px;
`;

export const Container = styled.div`
  position: relative;
  display: flex;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #d1d5db;
  background: #f3f4f6;
`;

export const Button = styled.button<{ $isActive?: boolean }>`
  position: relative;
  z-index: 2;
  width: 34px;
  height: 34px;
  background: ${({ $isActive }) => ($isActive ? '#45adf3ff' : 'transparent')};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111;
  outline: none;
  border-radius: 10px;

  &:focus-visible {
    background-color: #f4f4f4;
  }
`;

export const ActiveBackground = styled.div<{ $activeIdx: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  z-index: 1;

  background: ${({ $activeIdx }) =>
    $activeIdx === 0 ? '#ef4444' : $activeIdx === 1 ? '#facc15' : '#22c55e'};

  transform: translateX(${({ $activeIdx }) => $activeIdx * 34}px);

  transition:
    transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.25s ease;
`;
