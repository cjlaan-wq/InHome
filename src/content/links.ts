import { linkId, type NetworkLink } from './types';

// Verbindingen tussen netwerkonderdelen. Elke verbinding is een losse entiteit,
// zodat hij apart uitgelicht kan worden. Wifi-verbindingen starten bij de KPN Box.
export const links: NetworkLink[] = [
  { id: linkId('kpn-core', 'backbone'), from: 'kpn-core', to: 'backbone', connectionTypes: ['fiber', 'dsl'] },
  { id: linkId('backbone', 'street-cabinet'), from: 'backbone', to: 'street-cabinet', connectionTypes: ['fiber', 'dsl'] },
  {
    id: linkId('street-cabinet', 'house-connection'),
    from: 'street-cabinet',
    to: 'house-connection',
    connectionTypes: ['fiber', 'dsl'],
  },
  { id: linkId('house-connection', 'modem'), from: 'house-connection', to: 'modem', connectionTypes: ['fiber', 'dsl'] },
  { id: linkId('wifi', 'devices'), from: 'wifi', to: 'devices', connectionTypes: ['fiber', 'dsl'] },
  { id: linkId('wifi', 'extender'), from: 'wifi', to: 'extender', connectionTypes: ['fiber', 'dsl'] },
  { id: linkId('extender', 'devices'), from: 'extender', to: 'devices', connectionTypes: ['fiber', 'dsl'] },
];
