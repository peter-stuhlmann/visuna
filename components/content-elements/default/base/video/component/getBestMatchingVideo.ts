import { ScreenSizeOptions } from '../../../types';

const videoPriorityFallback: Record<ScreenSizeOptions, ScreenSizeOptions[]> = {
  s: ['s', 'm', 'l', 'xl', 'xxl', '3xl', '4xl'],
  m: ['m', 'l', 'xl', 'xxl', '3xl', '4xl', 's'],
  l: ['l', 'xl', 'xxl', '3xl', '4xl', 'm', 's'],
  xl: ['xl', 'xxl', '3xl', '4xl', 'l', 'm', 's'],
  xxl: ['xxl', '3xl', '4xl', 'xl', 'l', 'm', 's'],
  '3xl': ['3xl', '4xl', 'xxl', 'xl', 'l', 'm', 's'],
  '4xl': ['4xl', '3xl', 'xxl', 'xl', 'l', 'm', 's'],
};

export default function getBestMatchingVideo(
  videos: Partial<Record<ScreenSizeOptions, { src: string }>>,
  screen: ScreenSizeOptions
): { src: string } | null {
  const fallbackOrder = videoPriorityFallback[screen];
  for (const size of fallbackOrder) {
    if (videos[size]) return videos[size]!;
  }
  return null;
}
