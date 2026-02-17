'use client';

import styled from 'styled-components';
import { MdRefresh, MdDelete, MdClose } from 'react-icons/md';
import { useStatus } from '../status/StatusContext';
import type { InvitationDB } from '@/lib/invitations/invitations.types';
import { getRoleLabel } from '@/lib/roles/roles';

type Props = {
  invitations: InvitationDB[];
  onUpdate: (invitations: InvitationDB[]) => void;
  type: 'pending' | 'declined' | 'revoked';
};

export default function InvitationsList({ invitations, onUpdate, type }: Props) {
  const { addStatus } = useStatus();

  const filtered = invitations.filter((inv) => inv.status === type);

  if (filtered.length === 0) {
    const emptyMessages: Record<string, string> = {
      pending: 'Keine ausstehenden Einladungen vorhanden.',
      declined: 'Keine abgelehnten Einladungen vorhanden.',
      revoked: 'Keine zurückgezogenen Einladungen vorhanden.',
    };
    return (
      <ListWrapper>
        <EmptyCard>{emptyMessages[type]}</EmptyCard>
      </ListWrapper>
    );
  }

  const handleReinvite = async (id: string) => {
    const prev = [...invitations];
    // Optimistic: move to pending
    onUpdate(invitations.map((i) => i._id === id ? { ...i, status: 'pending' as const } : i));
    try {
      const res = await fetch(`/api/invitations/${id}`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        onUpdate(prev);
        addStatus({ type: 'error', message: data.message });
      }
    } catch {
      onUpdate(prev);
      addStatus({ type: 'error', message: 'Fehler beim erneuten Einladen.' });
    }
  };

  const handleDelete = async (id: string) => {
    const prev = [...invitations];
    // Optimistic: remove
    onUpdate(invitations.filter((i) => i._id !== id));
    try {
      const res = await fetch(`/api/invitations/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        onUpdate(prev);
        addStatus({ type: 'error', message: data.message });
      }
    } catch {
      onUpdate(prev);
      addStatus({ type: 'error', message: 'Fehler beim Löschen.' });
    }
  };

  const handleRevoke = async (id: string) => {
    const prev = [...invitations];
    // Optimistic: move to revoked
    onUpdate(invitations.map((i) => i._id === id ? { ...i, status: 'revoked' as const } : i));
    try {
      const res = await fetch(`/api/invitations/${id}`, { method: 'PATCH' });
      if (!res.ok) {
        const data = await res.json();
        onUpdate(prev);
        addStatus({ type: 'error', message: data.message });
      }
    } catch {
      onUpdate(prev);
      addStatus({ type: 'error', message: 'Fehler beim Zurückziehen.' });
    }
  };

  const getStatusLabel = () => {
    switch (type) {
      case 'pending': return 'Ausstehend';
      case 'declined': return 'Abgelehnt';
      case 'revoked': return 'Zurückgezogen';
    }
  };

  const getStatusColor = () => {
    switch (type) {
      case 'pending': return { text: '#92400e', bg: '#fef3c7' };
      case 'declined': return { text: '#991b1b', bg: '#fee2e2' };
      case 'revoked': return { text: '#374151', bg: '#e5e7eb' };
    }
  };

  const statusColor = getStatusColor();

  return (
    <ListWrapper>
      {filtered.map((inv) => (
        <InvCard key={inv._id}>
          <InfoCell>
            <Email>{inv.email}</Email>
            <Meta>{getRoleLabel(inv.role, 'de')}</Meta>
          </InfoCell>
          <StatusBadge $color={statusColor!.text} $bg={statusColor!.bg}>
            {getStatusLabel()}
          </StatusBadge>
          <ActionsCell>
            {type === 'pending' && (
              <IconBtn
                $bg="#fef3c7"
                $color="#92400e"
                onClick={() => handleRevoke(inv._id)}
                title="Einladung zurückziehen"
              >
                <MdClose size={18} />
              </IconBtn>
            )}
            {(type === 'declined' || type === 'revoked') && (
              <>
                <IconBtn
                  $bg="#dbeafe"
                  $color="#1d4ed8"
                  onClick={() => handleReinvite(inv._id)}
                  title="Erneut einladen"
                >
                  <MdRefresh size={18} />
                </IconBtn>
                <IconBtn
                  $bg="#fee2e2"
                  $color="#b91c1c"
                  onClick={() => handleDelete(inv._id)}
                  title="Einladung löschen"
                >
                  <MdDelete size={18} />
                </IconBtn>
              </>
            )}
          </ActionsCell>
        </InvCard>
      ))}
    </ListWrapper>
  );
}

/* ---------- Styles ---------- */

const ListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const InvCard = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
`;

const EmptyCard = styled.div`
  padding: 14px 18px;
  background: #fafafa;
  border: 1px dashed rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  color: #6b7280;
  font-size: 14px;
  text-align: center;
`;

const InfoCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const Email = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Meta = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
`;

const StatusBadge = styled.span<{ $color: string; $bg: string }>`
  font-size: 12px;
  font-weight: 600;
  color: ${(p) => p.$color};
  background: ${(p) => p.$bg};
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
`;

const ActionsCell = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const IconBtn = styled.button<{ $bg: string; $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.8;
  }
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
