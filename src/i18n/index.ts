import { nl, type MessageKey } from './nl';

// Eenvoudige t()-helper. Engels kan later als tweede woordenboek worden toegevoegd.
export type Locale = 'nl';

const dictionaries: Record<Locale, Record<MessageKey, string>> = { nl };

let locale: Locale = 'nl';

export const setLocale = (next: Locale) => {
  locale = next;
};

export const t = (key: MessageKey): string => dictionaries[locale][key] ?? key;
