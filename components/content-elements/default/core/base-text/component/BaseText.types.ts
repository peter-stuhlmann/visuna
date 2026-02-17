import { AlignOptions } from '../../../types';

export type LocalizedString =
  | string
  | Record<string, string | null | undefined>
  | null
  | undefined;

export type BaseTextProps = {
  textTransform?: 'none' | 'uppercase' | 'lowercase';
  align?: AlignOptions;
  textColor?: string;
  element?: string;

  /**
   * Plain-Text (als Text gerendert)
   * Kann string oder {de,en,...} sein
   */
  value?: LocalizedString;

  /**
   * HTML (als HTML gerendert)
   * Kann string oder {de,en,...} sein
   */
  htmlValue?: LocalizedString;

  /**
   * Optional: Sprache (z.B. "de", "en")
   * Wenn nicht gesetzt -> versucht aus data.currentLanguage zu lesen
   */
  currentLanguage?: string;

  /**
   * Optional: falls du BaseText irgendwo als "Element" verwendest, das data bekommt
   */
  data?: { currentLanguage?: string } | null;
};

export type BaseTextStyleProps = {
  $textTransform: BaseTextProps['textTransform'];
  $align: BaseTextProps['align'];
  $color: BaseTextProps['textColor'];
};
