// CONCEPT – valideren met KPN Service
// Uitleg over de twee soorten wifi die de KPN Box uitzendt (getoond bij het onderdeel Wifi).

export type WifiBandInfo = { id: '2.4' | '5'; label: string; title: string; description: string };

export const wifiBandsIntro =
  'Je KPN Box zendt twee soorten wifi uit. Meestal kiest je apparaat zelf de beste. Bekijk het verschil:';

export const wifiBands: WifiBandInfo[] = [
  {
    id: '2.4',
    label: '2,4 GHz',
    title: 'Verder, maar trager',
    description:
      'Dit signaal komt beter door muren en vloeren en reikt verder. Maar het is trager, en drukker: veel apparaten en buren gebruiken het ook.',
  },
  {
    id: '5',
    label: '5 GHz',
    title: 'Sneller, maar minder ver',
    description:
      'Dit signaal is veel sneller en rustiger. Maar het komt minder goed door muren en vloeren. Dichtbij je KPN Box is dit de beste keuze.',
  },
];
