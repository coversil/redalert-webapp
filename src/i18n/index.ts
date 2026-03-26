import { he } from './he';
import { en } from './en';

export type Language = 'he' | 'en';
export type Translations = typeof he;

const translations: Record<Language, Translations> = { he, en };

export function t(lang: Language): Translations {
  return translations[lang];
}

export function isRTL(lang: Language): boolean {
  return lang === 'he';
}
