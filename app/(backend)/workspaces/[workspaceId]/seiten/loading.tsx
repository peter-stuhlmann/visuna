export default function SeitenLoading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: '60vh',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: '3px solid #e5e7eb',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'seiten-spin 0.7s linear infinite',
        }}
      />
      <style>{`
        @keyframes seiten-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
