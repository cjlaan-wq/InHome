import { linkId, type Issue } from './types';

// CONCEPT – valideren met KPN Service
// Alle probleemoplossende content in dit bestand is een concept en moet door
// KPN Service worden gevalideerd voordat het echt gebruikt wordt. Dat geldt ook
// voor de lampjeskleuren, wachttijden en de links hieronder.

const links = {
  outages: 'https://www.kpn.com/service/storingen',
  contact: 'https://www.kpn.com/service/contact',
  superWifi: 'https://www.kpn.com/internet/superwifi',
};

export const issues: Issue[] = [
  // CONCEPT – valideren met KPN Service
  {
    id: 'no-internet',
    title: 'Ik heb helemaal geen internet',
    symptom: 'Geen enkel apparaat in huis maakt verbinding met internet.',
    connectionTypes: ['fiber', 'dsl'],
    affectedNodes: ['house-connection', 'modem'],
    affectedLinks: [linkId('house-connection', 'modem')],
    visualEffect: 'blocked',
    steps: [
      {
        focusNodeId: 'modem',
        title: 'Het internet komt niet verder',
        body: 'Je apparaten krijgen geen internet van je KPN Box. Meestal ligt dat aan de KPN Box zelf of aan de kabel ervoor. Dat kun je vaak zelf oplossen.',
      },
      {
        focusNodeId: 'modem',
        title: 'Kijk naar de lampjes',
        body: 'De lampjes op je KPN Box laten zien wat er mis is. Is het internetlampje uit of rood? Dan heeft je KPN Box geen verbinding met buiten.',
      },
      {
        focusNodeId: 'house-connection',
        title: 'Kijk naar de kabel',
        body: 'Er loopt een kabel van de aansluiting in de muur naar je KPN Box. Zit die los of is hij geknikt? Dan komt er geen internet door.',
      },
      {
        focusNodeId: 'street-cabinet',
        title: 'Misschien ligt het niet aan jou',
        body: 'Soms is er een storing buiten je huis. Dan kun je thuis niets oplossen. Op de storingenpagina zie je of er een storing is bij jou in de buurt.',
      },
    ],
    fixesFocusNodeId: 'modem',
    fixes: [
      {
        title: 'Controleer de lampjes',
        steps: [
          'Kijk naar de lampjes aan de voorkant van je KPN Box.',
          'Brandt het internetlampje rustig? Dan is de verbinding met buiten in orde.',
          'Is het lampje uit of rood? Ga dan verder met de volgende stappen.',
        ],
      },
      {
        title: 'Herstart je KPN Box',
        steps: [
          'Haal de stekker van je KPN Box uit het stopcontact.',
          'Wacht 30 seconden.',
          'Stop de stekker er weer in.',
          'Wacht ongeveer 5 minuten tot de lampjes rustig branden.',
        ],
      },
      {
        title: 'Controleer de kabels',
        steps: [
          'Kijk of de kabel tussen de aansluiting in de muur en je KPN Box goed vastzit.',
          'Druk beide stekkers even stevig aan.',
          'Zie je een knik of een beschadiging? Gebruik dan een andere kabel als je die hebt.',
        ],
      },
      {
        title: 'Kijk of er een storing is',
        steps: ['Kijk op de storingenpagina van KPN of er een storing is bij jou in de buurt.'],
        cta: { label: 'Naar de storingenpagina', href: links.outages },
      },
    ],
    escalation: { label: 'Neem contact op met KPN', href: links.contact },
    draft: true,
  },

  // CONCEPT – valideren met KPN Service
  {
    id: 'slow-wifi-room',
    title: 'Mijn wifi is traag in één kamer',
    symptom: 'Dichtbij de KPN Box gaat het goed, maar in een kamer verderop is het traag.',
    connectionTypes: ['fiber', 'dsl'],
    affectedNodes: ['wifi', 'devices'],
    affectedParts: ['phone'],
    affectedLinks: [linkId('wifi', 'devices')],
    visualEffect: 'weak-signal',
    steps: [
      {
        focusNodeId: 'wifi',
        title: 'Wifi wordt zwakker met afstand',
        body: 'Wifi gaat door de lucht, vanaf je KPN Box. Hoe verder je weg bent, hoe zwakker het signaal. Dat is normaal.',
      },
      {
        focusNodeId: 'devices',
        title: 'Muren en vloeren houden wifi tegen',
        body: 'Je telefoon ligt boven in de slaapkamer. Het signaal moet door een vloer en een muur. Daardoor komt er minder aan en is je internet traag.',
      },
      {
        focusNodeId: 'modem',
        title: 'Waar staat je KPN Box?',
        body: 'Je KPN Box staat nu in de meterkast, in een hoek van het huis. Vanuit een kast of hoek komt het signaal minder ver.',
      },
    ],
    fixesFocusNodeId: 'wifi',
    fixes: [
      {
        title: 'Zet je KPN Box op een betere plek',
        steps: [
          'Zet je KPN Box zo centraal mogelijk in huis.',
          'Zet hem hoog en vrij, bijvoorbeeld op een kast.',
          'Liever niet in een dichte kast, achter de tv of op de grond.',
        ],
      },
      {
        title: 'Houd de ruimte rond je KPN Box vrij',
        steps: [
          'Zet geen spullen vlak voor of op je KPN Box.',
          'Zet hem niet naast grote metalen dingen, een aquarium of een magnetron.',
        ],
      },
      {
        title: 'Overweeg een SuperWifi-punt',
        steps: [
          'Een SuperWifi-punt zet je tussen je KPN Box en de kamer waar het traag is.',
          'Het vangt het signaal op en zendt het verder uit.',
          'Zo heb je ook verder weg in huis goede wifi.',
        ],
        demo: 'extender',
        cta: { label: 'Meer over SuperWifi', href: links.superWifi },
      },
    ],
    escalation: { label: 'Neem contact op met KPN', href: links.contact },
    draft: true,
  },

  // CONCEPT – valideren met KPN Service
  {
    id: 'outage-area',
    title: 'Er is een storing in mijn buurt',
    symptom: 'Alles werkte, en ineens doet niets het meer. Ook de buren hebben geen internet.',
    connectionTypes: ['fiber', 'dsl'],
    affectedNodes: ['backbone', 'street-cabinet'],
    affectedLinks: [linkId('backbone', 'street-cabinet')],
    visualEffect: 'blocked',
    steps: [
      {
        focusNodeId: 'backbone',
        title: 'Er is iets mis buiten je huis',
        body: 'Bij een storing is er een probleem in het netwerk in je wijk. Bijvoorbeeld een kapotte kabel in de grond of een probleem in de wijkkast.',
      },
      {
        focusNodeId: 'street-cabinet',
        title: 'De hele buurt heeft er last van',
        body: 'Alle huizen die via deze wijkkast internet krijgen, hebben geen internet. Ook je buren.',
      },
      {
        focusNodeId: 'modem',
        title: 'Thuis kun je niets doen',
        body: 'Je KPN Box en je apparaten zijn in orde. Herstarten of kabels controleren helpt nu niet. KPN lost de storing op.',
      },
    ],
    fixesFocusNodeId: 'street-cabinet',
    fixes: [
      {
        title: 'Bekijk de storingenpagina',
        steps: [
          'Kijk op de storingenpagina of de storing bekend is.',
          'Daar zie je ook wanneer KPN verwacht dat het weer werkt.',
        ],
        cta: { label: 'Naar de storingenpagina', href: links.outages },
      },
      {
        title: 'Wacht op een update',
        steps: [
          'KPN werkt aan een oplossing.',
          'Staat de storing al op de pagina? Dan hoef je hem niet zelf te melden.',
          'Is de storing voorbij en werkt je internet nog niet? Herstart dan één keer je KPN Box.',
        ],
      },
    ],
    escalation: { label: 'Staat de storing er niet bij? Neem contact op', href: links.contact },
    draft: true,
  },

  // CONCEPT – valideren met KPN Service
  {
    id: 'one-device',
    title: 'Eén apparaat maakt geen verbinding',
    symptom: 'Alles werkt, behalve één apparaat. Bijvoorbeeld je laptop.',
    connectionTypes: ['fiber', 'dsl'],
    affectedNodes: ['devices'],
    affectedParts: ['laptop'],
    affectedLinks: [linkId('wifi', 'devices')],
    visualEffect: 'device-only',
    steps: [
      {
        focusNodeId: 'wifi',
        title: 'Je wifi werkt gewoon',
        body: 'Je telefoon en je tv hebben wel internet. Je KPN Box en je wifi zijn dus in orde.',
      },
      {
        focusNodeId: 'devices',
        title: 'Het ligt aan dit ene apparaat',
        body: 'Je laptop vangt het signaal wel op, maar maakt geen verbinding. Vaak is het apparaat even in de war. Dat los je meestal snel zelf op.',
      },
    ],
    fixesFocusNodeId: 'devices',
    fixes: [
      {
        title: 'Zet wifi uit en weer aan',
        steps: ['Zet wifi uit op je apparaat.', 'Wacht 10 seconden.', 'Zet wifi weer aan en kies je eigen netwerk.'],
      },
      {
        title: 'Vergeet het netwerk en maak opnieuw verbinding',
        steps: [
          'Ga naar de wifi-instellingen van je apparaat.',
          'Kies je netwerk en kies "Vergeet dit netwerk".',
          'Maak opnieuw verbinding. Het wifi-wachtwoord staat op de sticker van je KPN Box.',
        ],
      },
      {
        title: 'Herstart je apparaat',
        steps: ['Zet je apparaat helemaal uit.', 'Zet het na een halve minuut weer aan.'],
      },
    ],
    escalation: { label: 'Lukt het niet? Neem contact op met KPN', href: links.contact },
    draft: true,
  },
];
