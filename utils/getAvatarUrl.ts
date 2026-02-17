/**
 * Generates a Cloudinary avatar URL with face-centered crop at the given size.
 *
 * Sizes:
 *  - s:  64×64   (dock bar, small UI elements)
 *  - m: 128×128  (content elements, lists)
 *  - l: 256x256  (profile page)
 *
 * If the URL is not a Cloudinary URL (e.g. an OAuth provider avatar),
 * it is returned as-is.
 */

const SIZES = {
  s: 64,
  m: 128,
  l: 256,
} as const;

export type AvatarSize = keyof typeof SIZES;

export function getAvatarUrl(
  baseUrl: string | null | undefined,
  size: AvatarSize = 'm'
): string {
  if (!baseUrl?.trim()) return '';

  const url = baseUrl.trim();
  const px = SIZES[size];

  // Only transform Cloudinary URLs
  if (url.includes('/upload/')) {
    return url.replace(
      '/upload/',
      `/upload/w_${px},h_${px},c_fill,g_face,q_auto,f_auto/`
    );
  }

  // External URLs (Google, Discord, LinkedIn etc.) — return as-is
  return url;
}
