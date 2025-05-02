export const isMapConsentGiven = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    sessionStorage.getItem('mapConsent') === 'true' ||
    localStorage.getItem('mapConsent') === 'true'
  );
};
