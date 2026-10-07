// CONCEPT – valideren met KPN Service
// Voorbeeldwaarden voor de rekenhulp 'Past het tegelijk?'. Indicatief: echte waarden
// hangen af van de dienst, de kwaliteit en het abonnement.

export type Activity = { id: string; label: string; mbps: number };

export const activities: Activity[] = [
  { id: 'stream4k', label: 'Een film of serie in 4K', mbps: 25 },
  { id: 'tvhd', label: 'Tv kijken in HD', mbps: 8 },
  { id: 'videocall', label: 'Videobellen', mbps: 4 },
  { id: 'gaming', label: 'Online gamen', mbps: 5 },
  { id: 'browse', label: 'Surfen en social media', mbps: 3 },
  { id: 'download', label: 'Een game of grote update downloaden', mbps: 200 },
];

/** Voorbeeldsnelheid van een abonnement per verbindingstype (Mbit/s). */
export const exampleSpeed = { fiber: 1000, dsl: 100 } as const;
