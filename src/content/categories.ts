import type { IssueCategoryId } from './types';

// Groepen in de lijst 'Wat is er aan de hand?'. Volgorde = volgorde in het paneel.
export const issueCategories: { id: IssueCategoryId; label: string }[] = [
  { id: 'offline', label: 'Ik heb geen internet' },
  { id: 'one-place', label: 'Eén apparaat of één kamer' },
  { id: 'unstable', label: 'Traag of haperend' },
];
