'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function InvitationContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const workspace = searchParams.get('workspace');
  const invitedBy = searchParams.get('invitedBy');

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        margin: '0 20px',
        padding: '48px 40px',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        textAlign: 'center',
      }}>
        {status === 'accepted' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎉</div>
            <h1 style={{ fontSize: '22px', marginBottom: '12px', color: '#111827' }}>
              Einladung angenommen!
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: 1.6, marginBottom: '32px' }}>
              <strong>{invitedBy}</strong> hat Dich zum Workspace{' '}
              <strong>„{workspace}"</strong> auf VISUNA eingeladen.
              <br />
              Du bist jetzt Mitglied des Workspaces.
            </p>
            <a
              href="/login"
              style={{
                display: 'inline-block',
                background: '#0f0181',
                color: '#fff',
                padding: '14px 32px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '15px',
              }}
            >
              Zum Login
            </a>
          </>
        )}

        {status === 'declined' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>👋</div>
            <h1 style={{ fontSize: '22px', marginBottom: '12px', color: '#111827' }}>
              Einladung abgelehnt
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: 1.6, marginBottom: '32px' }}>
              Du hast die Einladung zum Workspace{' '}
              <strong>„{workspace}"</strong> abgelehnt.
            </p>
          </>
        )}

        {status === 'not_active' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
            <h1 style={{ fontSize: '22px', marginBottom: '12px', color: '#111827' }}>
              Diese Einladung ist nicht mehr aktiv.
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: 1.6 }}>
              Die Einladung wurde zurückgezogen oder bereits beantwortet.
            </p>
          </>
        )}

        {status === 'not_found' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
            <h1 style={{ fontSize: '22px', marginBottom: '12px', color: '#111827' }}>
              Einladung nicht gefunden
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: 1.6 }}>
              Diese Einladung existiert nicht oder ist abgelaufen.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚨</div>
            <h1 style={{ fontSize: '22px', marginBottom: '12px', color: '#111827' }}>
              Fehler aufgetreten
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: 1.6 }}>
              Beim Verarbeiten der Einladung ist ein Fehler aufgetreten.
              Bitte versuche es erneut oder kontaktiere den Administrator.
            </p>
          </>
        )}

        {!status && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📧</div>
            <h1 style={{ fontSize: '22px', marginBottom: '12px', color: '#111827' }}>
              Einladung
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: 1.6 }}>
              Bitte klicke auf den Link in deiner Einladungs-E-Mail.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function EinladungPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Laden...
      </div>
    }>
      <InvitationContent />
    </Suspense>
  );
}
