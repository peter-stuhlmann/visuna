// Server component — no 'use client', no styled-components, no hooks
// Safe to render inside Suspense fallback in a server component

function SkeletonBar({
  width,
  height,
  radius = '6px',
}: {
  width: string;
  height: string;
  radius?: string;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
        backgroundSize: '800px 100%',
        animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
      }}
    />
  );
}

function UserCardSkeleton() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr auto',
        alignItems: 'center',
        gap: '16px',
        padding: '12px 16px',
        borderRadius: '12px',
        background: '#fff',
        border: '1px solid #e5e7eb',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <SkeletonBar width="55%" height="16px" />
        <SkeletonBar width="75%" height="14px" />
      </div>
      <SkeletonBar width="60px" height="14px" />
      <SkeletonBar width="40px" height="14px" />
      <SkeletonBar width="34px" height="34px" radius="10px" />
    </div>
  );
}

function InvCardSkeleton() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 18px',
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: '12px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <SkeletonBar width="65%" height="14px" />
        <SkeletonBar width="50px" height="12px" />
      </div>
      <SkeletonBar width="80px" height="24px" radius="999px" />
      <SkeletonBar width="32px" height="32px" radius="8px" />
    </div>
  );
}

function SectionSkeleton({
  title,
  count,
  type,
}: {
  title: string;
  count: number;
  type: 'user' | 'invitation';
}) {
  const Card = type === 'user' ? UserCardSkeleton : InvCardSkeleton;
  return (
    <>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '1.5rem 0 0.75rem' }}>
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1rem' }}>
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} />
        ))}
      </div>
    </>
  );
}

export default function SuspenseFallback({
  userCount,
  showInvitations,
}: {
  userCount: number;
  showInvitations: boolean;
}) {
  return (
    <>
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
      `}</style>
      <SectionSkeleton title="Aktive Benutzer:innen" count={userCount} type="user" />
      {showInvitations && (
        <>
          <SectionSkeleton title="Ausstehende Einladungen" count={2} type="invitation" />
          <SectionSkeleton title="Abgelehnte Einladungen" count={1} type="invitation" />
          <SectionSkeleton title="Zurückgezogene Einladungen" count={1} type="invitation" />
        </>
      )}
    </>
  );
}
