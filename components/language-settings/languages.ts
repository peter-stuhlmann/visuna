export type LanguageCode =
  | 'de'
  | 'en'
  | 'es'
  | 'fr'
  | 'ru'
  | 'tr'
  | 'pt'
  | 'it'
  | 'zh';

type LanguageOption = {
  code: LanguageCode;
  label: string;
};

export const ALL_LANGUAGES: LanguageOption[] = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'Englisch' },
  { code: 'es', label: 'Spanisch' },
  { code: 'fr', label: 'Französisch' },
  { code: 'ru', label: 'Russisch' },
  { code: 'tr', label: 'Türkisch' },
  { code: 'pt', label: 'Portugiesisch' },
  { code: 'it', label: 'Italienisch' },
  { code: 'zh', label: 'Chinesisch' },
];

export const DEFAULT_LANGUAGES: LanguageCode[] = ['de'];
