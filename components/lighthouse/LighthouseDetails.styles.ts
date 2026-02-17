'use client';

import styled from 'styled-components';
import { Variant } from './LighthouseDetails.types';

export const Container = styled.section`
  margin-top: 1rem;
  border: 1px solid #dddddd;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  background: #fafafa;
`;

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.75rem;
`;

export const UrlText = styled.div`
  font-size: 0.85rem;
  color: #555555;

  code {
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
      'Courier New', monospace;
    background: #f0f0f0;
    padding: 0.1rem 0.3rem;
    border-radius: 4px;
  }
`;

export const ErrorText = styled.p`
  color: #d93025;
  margin-top: 0.5rem;
`;

export const ScoresSection = styled.div`
  margin-top: 0.5rem;
`;

export const ScoresGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 0.75rem;
  align-items: flex-start;
`;

export const ScoreBubbleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
`;

interface ScoreCircleProps {
  $color: string;
}

export const ScoreCircle = styled.div<ScoreCircleProps>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
  color: #ffffff;
`;

export const ScoreLabel = styled.div`
  font-size: 0.9rem;
  color: #333333;
  text-align: center;
`;

/* Run-Kreis */

interface RunCircleProps {
  $disabled: boolean;
}

export const RunCircleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
`;

export const RunCircle = styled.button<RunCircleProps>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  padding: 0;
  margin: 0;
  background-color: ${({ $disabled }) => ($disabled ? '#bbbbbb' : '#1976d2')};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  color: #ffffff;
  font-size: 1.4rem;

  &:hover {
    background-color: ${({ $disabled }) => ($disabled ? '#bbbbbb' : '#1565c0')};
  }
`;

export const RunLabel = styled.div`
  font-size: 0.8rem;
  color: #333333;
  text-align: center;
`;

/* Tabs & Details */

export const TabsSection = styled.div`
  margin-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
  padding-top: 1rem;
`;

export const TabsHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
`;

interface TabButtonProps {
  $active: boolean;
}

export const TabButton = styled.button<TabButtonProps>`
  border: none;
  border-radius: 999px;
  padding: 0.4rem 0.9rem;
  font-size: 0.9rem;
  cursor: pointer;
  background: ${({ $active }) => ($active ? '#1976d2' : '#e0e0e0')};
  color: ${({ $active }) => ($active ? '#ffffff' : '#333333')};
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  transition:
    background 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: ${({ $active }) => ($active ? '#1565c0' : '#d5d5d5')};
  }
`;

export const TabContent = styled.div`
  margin-top: 0.5rem;
`;

export const GroupHeadline = styled.h4`
  font-size: 0.95rem;
  margin: 0.75rem 0 0.25rem;
`;

export const AuditList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const AuditItemLi = styled.li<{ $variant: Variant }>`
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;
  border: 1px solid
    ${({ $variant }) =>
      $variant === 'success'
        ? '#c5e1a5'
        : $variant === 'warning'
          ? '#ffe082'
          : '#ef9a9a'};
  background-color: ${({ $variant }) =>
    $variant === 'success'
      ? '#f1f8e9'
      : $variant === 'warning'
        ? '#fffde7'
        : '#ffeded'};
`;

export const AuditTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  align-items: baseline;
`;

export const AuditTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #222222;
`;

export const AuditScore = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: #666666;
`;

export const StatusIconWrapper = styled.span<{ $variant: Variant }>`
  display: inline-flex;
  align-items: center;
  font-size: 1rem;
  color: ${({ $variant }) =>
    $variant === 'success'
      ? '#2e7d32'
      : $variant === 'warning'
        ? '#f9a825'
        : '#c62828'};
`;

export const AuditMeta = styled.div`
  font-size: 0.8rem;
  color: #555555;
  margin-top: 0.15rem;
`;

export const AuditDescription = styled.div`
  font-size: 0.8rem;
  color: #666666;
  margin-top: 0.35rem;
`;
