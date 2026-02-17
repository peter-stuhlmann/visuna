'use client';

import { FC, useState } from 'react';
import styled from 'styled-components';
import { Workspace } from '@/lib/workspaces/workspaces.types';
import { useStatus } from '@/components/status/StatusContext';
import { useRouter } from 'next/navigation';

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-100);
  border-radius: var(--radius-m);
  margin-top: 1rem;
`;

const Label = styled.label`
  font-weight: 600;
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
`;

type Props = {
  workspace: Workspace | null;
};

const WorkspaceStatusToggle: FC<Props> = ({ workspace }) => {
  const router = useRouter();
  const { addStatus } = useStatus();
  const [loading, setLoading] = useState(false);

  // Optimistic UI state could be added here, but for simplicity relying on router.refresh()
  const isPrime = workspace?.plan === 'prime';

  const handleToggle = async () => {
    if (!workspace) return;
    setLoading(true);

    const newPlan = isPrime ? 'free' : 'prime';

    try {
      const res = await fetch(`/api/workspaces/${workspace._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan }),
      });

      if (!res.ok) throw new Error('Failed to update plan');

      addStatus({
        type: 'success',
        message: `Plan changed to ${newPlan.toUpperCase()}`,
      });
      router.refresh();
    } catch (error) {
      addStatus({ type: 'error', message: 'Error updating plan' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!workspace) return null;

  return (
    <ToggleContainer>
      <Checkbox
        type="checkbox"
        checked={isPrime}
        onChange={handleToggle}
        disabled={loading}
        id="prime-toggle"
      />
      <Label htmlFor="prime-toggle">
        Activate Prime Status (Current: {isPrime ? 'PRIME' : 'FREE'})
      </Label>
    </ToggleContainer>
  );
};

export default WorkspaceStatusToggle;
