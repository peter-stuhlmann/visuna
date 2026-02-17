'use client';

export default function MediapoolLoading() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: 300,
        gap: 12,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '3px solid #e5e7eb',
          borderTopColor: '#0070f3',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      <span style={{ fontSize: '1rem', color: '#888' }}>Lade Medien …</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
