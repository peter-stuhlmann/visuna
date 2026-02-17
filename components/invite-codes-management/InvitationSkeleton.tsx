'use client';

import styled, { keyframes } from 'styled-components';

interface InvitationSkeletonProps {
  count?: number;
}

export default function InvitationSkeleton({ count = 2 }: InvitationSkeletonProps) {
  return (
    <Wrapper>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i}>
          <InfoCell>
            <SkeletonLine $width="65%" $height="14px" />
            <SkeletonLine $width="50px" $height="12px" />
          </InfoCell>
          <SkeletonLine $width="80px" $height="24px" $radius="999px" />
          <SkeletonLine $width="32px" $height="32px" $radius="8px" />
        </SkeletonCard>
      ))}
    </Wrapper>
  );
}

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const SkeletonCard = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
`;

const InfoCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
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
