'use client';

import styled, { keyframes } from 'styled-components';

interface UserListSkeletonProps {
  count: number;
}

export default function UserListSkeleton({ count }: UserListSkeletonProps) {
  return (
    <Wrapper>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i}>
          <InfoCell>
            <SkeletonLine $width="55%" $height="16px" />
            <SkeletonLine $width="75%" $height="14px" />
          </InfoCell>
          <SkeletonLine $width="60px" $height="14px" />
          <SkeletonLine $width="40px" $height="14px" />
          <SkeletonLine $width="34px" $height="34px" $radius="10px" />
        </SkeletonCard>
      ))}
    </Wrapper>
  );
}

/* ---------- Styles ---------- */

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 2rem;
`;

const SkeletonCard = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
`;

const InfoCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SkeletonLine = styled.div<{
  $width: string;
  $height: string;
  $radius?: string;
}>`
  width: ${(p) => p.$width};
  height: ${(p) => p.$height};
  border-radius: ${(p) => p.$radius || '6px'};
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 800px 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
`;
