import { routes } from './routes';

export function generateRouting() {
  const pathnames: Record<string, { en: string; de: string }> = {};

  for (const key in routes) {
    if (Object.prototype.hasOwnProperty.call(routes, key)) {
      const typedKey = key as keyof typeof routes;
      pathnames[`/${key}`] = routes[typedKey];
    }
  }

  return pathnames;
}
