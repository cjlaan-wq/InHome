import { nl, type MessageKey } from './nl';

// Eenvoudige t()-helper. Engels kan later als tweede woordenboek worden toegevoegd.
export type Locale = 'nl';

const dictionaries: Record<Locale, Record<MessageKey, string>> = { nl };

let locale: Locale = 'nl';

export const setLocale = (next: Locale) => {
  locale = next;
};

/** Vertaalt een sleutel; {naam} in de tekst wordt vervangen door vars.naam. */
export const t = (key: MessageKey, vars?: Record<string, string | number>): string => {
  const text = dictionaries[locale][key] ?? key;
  return vars ? text.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`)) : text;
};
