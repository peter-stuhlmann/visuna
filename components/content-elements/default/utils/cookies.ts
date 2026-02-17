/**
 * Set a cookie on the client side
 */
export function setClientCookie(name: string, value: string | number | boolean, days = 365) {
  if (typeof window === 'undefined') return;
  
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + d.toUTCString();
  
  const encodedValue = encodeURIComponent(String(value));
  document.cookie = name + "=" + encodedValue + ";" + expires + ";path=/;SameSite=Lax";
}

/**
 * Get a cookie on the client side (fallback if needed)
 */
export function getClientCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i=0;i < ca.length;i++) {
    let c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}
