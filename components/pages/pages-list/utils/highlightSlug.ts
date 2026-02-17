export const highlightSlug = (slug: string | undefined): string => {
  const s = (slug ?? '').trim();

  switch (s) {
    case 'home':
      return 'Startseite';
    case '404':
      return 'Error 404';
    default:
      return slug ?? '?';
  }
};
