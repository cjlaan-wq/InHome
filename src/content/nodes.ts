import type { NetworkNode } from './types';

// Netwerkonderdelen van de keten, van ver (KPN) naar dichtbij (je apparaten).
// Teksten: B1-niveau, korte zinnen, "je/jij".
export const nodes: NetworkNode[] = [
  {
    id: 'kpn-core',
    label: 'KPN netwerk',
    title: 'Het netwerk van KPN',
    description:
      'Hier begint je internet. In grote datacenters is KPN verbonden met de rest van de wereld. Van hieruit gaat alles wat je online doet naar jou toe.',
    connectionTypes: ['fiber', 'dsl'],
  },
  {
    id: 'backbone',
    label: 'Glasvezelnetwerk',
    title: 'Het glasvezelnetwerk',
    description:
      'Dunne kabels van glas onder de grond brengen het internet naar jouw wijk. Het signaal reist als licht, dus heel snel en over grote afstanden.',
    connectionTypes: ['fiber', 'dsl'],
  },
  {
    id: 'street-cabinet',
    label: 'Wijkkast',
    title: 'De wijkkast',
    description:
      'In deze kast in de straat wordt de verbinding verdeeld over de huizen in de buurt. Je hebt er zelf niets mee te doen.',
    connectionTypes: ['fiber', 'dsl'],
    variants: {
      dsl: {
        description:
          'In deze kast in de straat komt het glasvezelnetwerk aan. Hier gaat het signaal over op de koperen telefoonkabel naar jouw huis. Je hebt er zelf niets mee te doen.',
      },
    },
  },
  {
    id: 'house-connection',
    label: 'Aansluiting',
    title: 'De aansluiting in je huis',
    description: 'Hier komt de kabel van buiten je huis binnen.',
    connectionTypes: ['fiber', 'dsl'],
    variants: {
      fiber: {
        label: 'Glasvezelkastje',
        title: 'Het glasvezelkastje (FTU)',
        description:
          'Hier komt de glasvezelkabel je huis binnen. Het is een klein wit kastje aan de muur, vaak in de meterkast. Vanaf hier gaat een kabel naar je KPN Box.',
      },
      dsl: {
        label: 'Wandcontactdoos',
        title: 'De wandcontactdoos',
        description:
          'Hier komt de koperen telefoonkabel je huis binnen. Het is een stopcontact voor je internet, vaak in de meterkast of woonkamer. Vanaf hier gaat een kabel naar je KPN Box.',
      },
    },
  },
  {
    id: 'modem',
    label: 'KPN Box',
    title: 'Je KPN Box (modem)',
    description:
      'De KPN Box is het hart van je internet thuis. Hij haalt het internet binnen via de kabel en maakt er wifi van. Je kunt er ook apparaten met een kabel op aansluiten.',
    connectionTypes: ['fiber', 'dsl'],
  },
  {
    id: 'wifi',
    label: 'Wifi',
    title: 'Het wifi-signaal',
    description:
      'Wifi is internet zonder kabel, via radiogolven. Hoe verder je van de KPN Box bent, hoe zwakker het signaal. Muren, vloeren en grote spullen houden het signaal ook tegen.',
    connectionTypes: ['fiber', 'dsl'],
  },
  {
    id: 'extender',
    label: 'SuperWifi',
    title: 'SuperWifi-punt',
    description:
      'Een SuperWifi-punt vangt het wifi-signaal op en zendt het verder uit. Zo heb je ook in kamers ver van je KPN Box goede wifi. Het is een extra kastje dat je zelf neerzet.',
    connectionTypes: ['fiber', 'dsl'],
    optional: true,
  },
  {
    id: 'devices',
    label: 'Apparaten',
    title: 'Je apparaten',
    description:
      'Je laptop, telefoon en tv maken verbinding met je wifi. Elk apparaat heeft een eigen ontvanger. Daarom kan het gebeuren dat één apparaat het niet doet en de rest wel.',
    connectionTypes: ['fiber', 'dsl'],
    parts: [
      { id: 'laptop', label: 'Laptop', room: 'woonkamer' },
      { id: 'tv', label: 'Tv', room: 'woonkamer' },
      { id: 'phone', label: 'Telefoon', room: 'slaapkamer boven' },
    ],
  },
];
