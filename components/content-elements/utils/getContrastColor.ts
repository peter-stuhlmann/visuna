import { PRIMARY_COLOR } from '../content-elements.config';

const getLuminanceFromHex = (hex: string): number => {
  // Entferne ggf. das führende '#' und unterstütze 3-stellige Hex-Werte
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  // Helligkeit nach der Formel (0.299*r + 0.587*g + 0.114*b)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

const getLuminanceFromRGB = (rgb: string): number => {
  // Unterstützt rgb() und rgba()
  const regex = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i;
  const match = rgb.match(regex);
  if (match) {
    const r = parseFloat(match[1]);
    const g = parseFloat(match[2]);
    const b = parseFloat(match[3]);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
  return 1; // Fallback: heller Wert
};

const getContrastColor = (
  inputColor: string,
  lightColor: string,
  darkColor: string
): string => {
  // Prüfe zuerst auf das oklch-Format
  const oklchRegex = /oklch\(\s*([\d.]+)(%?)[ ,]+([\d.]+)[ ,]+([\d.]+)/i;
  const oklchMatch = inputColor.match(oklchRegex);
  if (oklchMatch) {
    let L = parseFloat(oklchMatch[1]);
    if (oklchMatch[2] === '%') {
      L = L / 100;
    }
    return L < 0.58 ? lightColor : darkColor;
  }

  // Falls der Wert ein Hex-String ist
  if (inputColor.trim().startsWith('#')) {
    const luminance = getLuminanceFromHex(inputColor);
    return luminance < 0.58 ? lightColor : darkColor;
  }

  // Falls der Wert ein rgb/rgba-String ist
  if (inputColor.trim().toLowerCase().startsWith('rgb')) {
    const luminance = getLuminanceFromRGB(inputColor);
    return luminance < 0.58 ? PRIMARY_COLOR['0'] : PRIMARY_COLOR['1000'];
  }

  // Fallback
  return PRIMARY_COLOR['0'];
};

export default getContrastColor;
