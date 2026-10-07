import type { HouseId, HousePreset } from './types';

// Woningtypes voor 'Jouw huis'. Kamers zijn rechthoeken per verdieping (≈ meters).
// Een tuin of balkon (kind 'garden') ligt vóór het huis: buiten, achter de voorgevel.
// Hogere verdiepingen liggen alleen achterin, zodat je in het opengewerkte huis
// van bovenaf in alle kamers kunt kijken. Namen en indeling zijn vrij aan te passen.

export const houses: HousePreset[] = [
  {
    id: 'apartment',
    label: 'Appartement',
    description: 'Alles op één verdieping',
    width: 9,
    depth: 6,
    rooms: [
      { id: 'hal', label: 'Hal', kind: 'hall', floor: 0, x: 0, z: -3, width: 2.5, depth: 2.5 },
      { id: 'slaapkamer', label: 'Slaapkamer', kind: 'bedroom', floor: 0, x: 0, z: -0.5, width: 2.5, depth: 3.5 },
      { id: 'woonkamer', label: 'Woonkamer', kind: 'living', floor: 0, x: 2.5, z: -3, width: 4, depth: 6 },
      { id: 'werkkamer', label: 'Werkkamer', kind: 'office', floor: 0, x: 6.5, z: -3, width: 2.5, depth: 3 },
      { id: 'kinderkamer', label: 'Kinderkamer', kind: 'bedroom', floor: 0, x: 6.5, z: 0, width: 2.5, depth: 3 },
      { id: 'balkon', label: 'Balkon', inPhrase: 'op het balkon', kind: 'garden', floor: 0, x: 2.5, z: 3, width: 4, depth: 1.6 },
    ],
    stairs: [],
    meterRoomId: 'hal',
    defaults: {
      modemRoomId: 'hal',
      extenderRoomId: 'woonkamer',
      deviceRooms: { laptop: 'woonkamer', tv: 'woonkamer', phone: 'kinderkamer', camera: 'balkon' },
    },
  },
  {
    id: 'terraced',
    label: 'Tussenwoning',
    description: 'Twee verdiepingen',
    width: 8,
    depth: 6,
    rooms: [
      { id: 'hal', label: 'Hal', kind: 'hall', floor: 0, x: 0, z: -3, width: 3, depth: 6 },
      { id: 'woonkamer', label: 'Woonkamer', kind: 'living', floor: 0, x: 3, z: -3, width: 5, depth: 6 },
      { id: 'overloop', label: 'Overloop', inPhrase: 'op de overloop', kind: 'landing', floor: 1, x: 0, z: -3, width: 3, depth: 2.8 },
      { id: 'slaapkamer', label: 'Slaapkamer', kind: 'bedroom', floor: 1, x: 3, z: -3, width: 5, depth: 2.8 },
      { id: 'tuin', label: 'Tuin', kind: 'garden', floor: 0, x: 0, z: 3, width: 8, depth: 3.5 },
    ],
    stairs: [{ floor: 0, x: 2.2, width: 1.2, zFrom: 2.6, zTo: -0.2 }],
    meterRoomId: 'hal',
    defaults: {
      modemRoomId: 'hal',
      extenderRoomId: 'overloop',
      deviceRooms: { laptop: 'woonkamer', tv: 'woonkamer', phone: 'slaapkamer', camera: 'tuin' },
    },
  },
  {
    id: 'detached',
    label: 'Vrijstaand huis',
    description: 'Drie verdiepingen, met zolder',
    width: 9,
    depth: 7,
    rooms: [
      { id: 'hal', label: 'Hal', kind: 'hall', floor: 0, x: 0, z: -3.5, width: 3, depth: 7 },
      { id: 'keuken', label: 'Keuken', kind: 'kitchen', floor: 0, x: 3, z: -3.5, width: 6, depth: 3 },
      { id: 'woonkamer', label: 'Woonkamer', kind: 'living', floor: 0, x: 3, z: -0.5, width: 6, depth: 4 },
      { id: 'overloop', label: 'Overloop', inPhrase: 'op de overloop', kind: 'landing', floor: 1, x: 0, z: -3.5, width: 3, depth: 3 },
      { id: 'slaapkamer', label: 'Slaapkamer', kind: 'bedroom', floor: 1, x: 3, z: -3.5, width: 3, depth: 3 },
      { id: 'werkkamer', label: 'Werkkamer', kind: 'office', floor: 1, x: 6, z: -3.5, width: 3, depth: 3 },
      { id: 'zolder', label: 'Zolder', inPhrase: 'op zolder', kind: 'attic', floor: 2, x: 0, z: -3.5, width: 9, depth: 1.9 },
      { id: 'tuin', label: 'Tuin', kind: 'garden', floor: 0, x: 0, z: 3.5, width: 9, depth: 4 },
    ],
    stairs: [
      { floor: 0, x: 2.2, width: 1.2, zFrom: 3.2, zTo: -0.5 },
      { floor: 1, x: 2.2, width: 1, zFrom: -0.6, zTo: -1.6 },
    ],
    meterRoomId: 'hal',
    defaults: {
      modemRoomId: 'hal',
      extenderRoomId: 'overloop',
      deviceRooms: { laptop: 'werkkamer', tv: 'woonkamer', phone: 'zolder', camera: 'tuin' },
    },
  },
];

export const defaultHouseId: HouseId = 'terraced';

export const getHouse = (id: HouseId) => houses.find((house) => house.id === id) ?? houses[1];
