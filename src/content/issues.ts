import { linkId, type Issue } from './types';

// CONCEPT – valideren met KPN Service
// Alle probleemoplossende content in dit bestand is een concept en moet door
// KPN Service worden gevalideerd voordat het echt gebruikt wordt. Dat geldt ook
// voor de lampjeskleuren, wachttijden en de links hieronder.

const links = {
  outages: 'https://www.kpn.com/service/storingen',
  contact: 'https://www.kpn.com/service/contact',
  superWifi: 'https://www.kpn.com/internet/superwifi',
  internet: 'https://www.kpn.com/internet',
};

// In teksten met {…} worden waarden uit 'Jouw huis' ingevuld, zoals {tvRoomIn} ('in de woonkamer')
// en {tvQuality} ('redelijk'); zo ook voor laptop, phone en camera.

export const issues: Issue[] = [
  // CONCEPT – valideren met KPN Service
  {
    id: 'no-internet',
    category: 'offline',
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
    category: 'one-place',
    title: 'Mijn wifi is traag in één kamer',
    symptom: 'Dichtbij de KPN Box gaat het goed, maar in een kamer verderop is het traag.',
    connectionTypes: ['fiber', 'dsl'],
    affectedNodes: ['wifi', 'devices'],
    // Het betrokken apparaat komt uit 'Jouw huis': het apparaat met de zwakste wifi.
    affectedPartsFrom: 'weakest-wifi',
    affectedLinks: [linkId('wifi', 'devices')],
    visualEffect: 'weak-signal',
    // Teksten met {…} worden ingevuld met jouw huis:
    // {weakDevice}, {weakRoomIn}, {weakObstacles}, {modemRoomIn}, {adviceModemRoom}, {adviceExtenderRoomIn}.
    steps: [
      {
        focusNodeId: 'wifi',
        title: 'Wifi wordt zwakker met afstand',
        body: 'Wifi gaat door de lucht, vanaf je KPN Box. Hoe verder je weg bent, hoe zwakker het signaal. Dat is normaal.',
      },
      {
        focusNodeId: 'devices',
        title: 'Muren en vloeren houden wifi tegen',
        body: 'Je {weakDevice} staat {weakRoomIn}. Het signaal moet daar door {weakObstacles}. Daardoor komt er minder aan en is je internet traag.',
      },
      {
        focusNodeId: 'modem',
        title: 'Waar staat je KPN Box?',
        body: 'Je KPN Box staat nu {modemRoomIn}. Vanuit een kast of een hoek van het huis komt het signaal minder ver.',
      },
    ],
    fixesFocusNodeId: 'wifi',
    fixes: [
      {
        title: 'Zet je KPN Box op een betere plek',
        steps: [
          'Zet je KPN Box zo centraal mogelijk in huis. In jouw huis is de {adviceModemRoom} een goede plek.',
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
          'Een SuperWifi-punt zet je tussen je KPN Box en de kamer waar het traag is. In jouw huis bijvoorbeeld {adviceExtenderRoomIn}.',
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
    category: 'offline',
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
    category: 'one-place',
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

  // CONCEPT – valideren met KPN Service
  {
    id: 'tv-stutter',
    category: 'unstable',
    title: 'Het tv-beeld hapert',
    symptom: 'Het beeld van KPN TV hapert, wordt blokkerig of blijft even hangen.',
    connectionTypes: ['fiber', 'dsl'],
    affectedNodes: ['wifi', 'devices'],
    affectedParts: ['tv'],
    // Zit je decoder met een kabel aan de KPN Box? Dan ligt het niet aan je wifi.
    affectedPartsFrom: 'wifi-only',
    affectedLinks: [linkId('wifi', 'devices'), linkId('extender', 'devices')],
    visualEffect: 'unstable',
    steps: [
      {
        focusNodeId: 'devices',
        title: 'Je decoder zit op wifi',
        body: 'Je tv krijgt het beeld via de decoder. Die staat {tvRoomIn} en is via wifi verbonden. De wifi is daar {tvQuality}.',
      },
      {
        focusNodeId: 'wifi',
        title: 'Tv kijken vraagt een stabiele verbinding',
        body: 'Een zender of film is een constante stroom gegevens. Valt de wifi even weg, dan hapert het beeld. Wifi is daar gevoeliger voor dan een kabel.',
      },
      {
        focusNodeId: 'modem',
        title: 'Een kabel is de stabielste weg',
        body: 'Met een netwerkkabel tussen je KPN Box en je decoder heeft wifi geen invloed meer op je tv-beeld.',
      },
    ],
    fixesFocusNodeId: 'devices',
    fixes: [
      {
        title: 'Sluit je decoder aan met een netwerkkabel',
        steps: [
          'Gebruik een netwerkkabel tussen de decoder en je KPN Box.',
          'Staat je KPN Box ver weg? Een SuperWifi-punt bij de tv heeft ook een aansluiting voor een kabel.',
        ],
        demo: { wire: 'tv' },
      },
      {
        title: 'Herstart je decoder',
        steps: ['Haal de stekker van de decoder uit het stopcontact.', 'Wacht 10 seconden en stop hem er weer in.', 'Wacht tot het beeld terug is.'],
      },
      {
        title: 'Zorg voor betere wifi bij je tv',
        steps: ['Zet je KPN Box dichter bij de tv, of zet een SuperWifi-punt in de buurt van de tv.'],
        demo: 'extender',
      },
      {
        title: 'Kijk of er een storing is',
        steps: ['Hapert het beeld op alle zenders, ook met een kabel? Kijk dan op de storingenpagina.'],
        cta: { label: 'Naar de storingenpagina', href: links.outages },
      },
    ],
    escalation: { label: 'Neem contact op met KPN', href: links.contact },
    draft: true,
  },

  // CONCEPT – valideren met KPN Service
  {
    id: 'busy-home',
    category: 'unstable',
    title: 'Alles wordt traag als iedereen online is',
    symptom: 'Meestal gaat het prima, maar als het hele huis streamt, gamet en belt, wordt alles traag.',
    connectionTypes: ['fiber', 'dsl'],
    affectedNodes: ['house-connection', 'modem'],
    affectedLinks: [linkId('street-cabinet', 'house-connection')],
    visualEffect: 'slow',
    steps: [
      {
        focusNodeId: 'house-connection',
        title: 'Je verbinding is als een snelweg',
        body: 'Je abonnement bepaalt hoeveel er tegelijk door je verbinding past. Iedereen in huis deelt die ruimte.',
      },
      {
        focusNodeId: 'devices',
        title: 'Iedereen deelt dezelfde ruimte',
        body: 'Streamen in 4K, games downloaden en videobellen vragen veel tegelijk. Past het niet meer, dan wordt alles een beetje trager.',
      },
      {
        focusNodeId: 'modem',
        title: 'Ook wifi heeft grenzen',
        body: 'Via wifi haal je minder snelheid dan via een kabel. Hoe meer apparaten op wifi, hoe drukker het wordt.',
      },
    ],
    fixesFocusNodeId: 'modem',
    tool: 'bandwidth',
    fixes: [
      {
        title: 'Spreid de zware dingen',
        steps: [
          "Laat grote downloads en updates 's nachts draaien.",
          'Pauzeer back-ups naar de cloud als iemand gaat videobellen of gamen.',
        ],
      },
      {
        title: 'Gebruik een kabel voor vaste apparaten',
        steps: ['Sluit je tv/decoder of spelcomputer aan met een netwerkkabel. Dan blijft de wifi vrijer voor de rest.'],
        demo: { wire: 'tv' },
      },
      {
        title: 'Kijk of je abonnement past',
        steps: ['Bekijk welke snelheid je hebt en of die past bij hoe jullie internet gebruiken.'],
        cta: { label: 'Bekijk internetabonnementen', href: links.internet },
      },
    ],
    escalation: { label: 'Neem contact op met KPN', href: links.contact },
    draft: true,
  },

  // CONCEPT – valideren met KPN Service
  {
    id: 'video-calls',
    category: 'unstable',
    title: 'Videobellen hapert',
    symptom: 'Bij videobellen of thuiswerken valt het beeld weg, of klink je robotachtig.',
    connectionTypes: ['fiber', 'dsl'],
    affectedNodes: ['wifi', 'devices'],
    affectedParts: ['laptop'],
    affectedPartsFrom: 'wifi-only',
    affectedLinks: [linkId('wifi', 'devices'), linkId('extender', 'devices')],
    visualEffect: 'unstable',
    steps: [
      {
        focusNodeId: 'devices',
        title: 'Bellen vraagt een stabiele verbinding',
        body: 'Bij videobellen gaan beeld en geluid twee kanten op, zonder vertraging. Je laptop staat {laptopRoomIn}, waar de wifi {laptopQuality} is.',
      },
      {
        focusNodeId: 'wifi',
        title: 'Haperen is iets anders dan traag',
        body: 'Je internet kan snel genoeg zijn en toch haperen. Kleine onderbrekingen in de wifi merk je bij bellen meteen.',
      },
      {
        focusNodeId: 'modem',
        title: 'Andere dingen in huis tellen mee',
        body: 'Downloadt of streamt iemand anders tegelijk iets groots? Dan krijgt je gesprek minder ruimte.',
      },
    ],
    fixesFocusNodeId: 'devices',
    fixes: [
      {
        title: 'Gebruik een netwerkkabel',
        steps: [
          'Sluit je laptop met een netwerkkabel aan op je KPN Box. Dat is het stabielst.',
          'Heeft je laptop geen aansluiting? Gebruik een USB-netwerkadapter.',
        ],
        demo: { wire: 'laptop' },
      },
      {
        title: 'Zorg voor goede wifi waar je belt',
        steps: ['Bel in een kamer met goede wifi, of zet een SuperWifi-punt in je werkkamer.'],
        demo: 'extender',
      },
      {
        title: 'Maak ruimte voor je gesprek',
        steps: [
          'Sluit andere programma’s en tabbladen.',
          'Pauzeer grote downloads en back-ups naar de cloud tijdens het bellen.',
          'Blijft het haperen? Zet je camera even uit.',
        ],
      },
      {
        title: 'Kies de 5 GHz-wifi',
        steps: ['Kun je kiezen tussen twee wifi-netwerken van je KPN Box? Kies dan 5 GHz. Dat is sneller en rustiger.'],
      },
    ],
    escalation: { label: 'Neem contact op met KPN', href: links.contact },
    draft: true,
  },

  // CONCEPT – valideren met KPN Service
  {
    id: 'neighbours-wifi',
    category: 'unstable',
    title: "Mijn wifi is wisselend, vooral 's avonds",
    symptom: 'Je wifi is soms prima en soms ineens slecht, ook dicht bij je KPN Box. Je woont tussen veel buren.',
    connectionTypes: ['fiber', 'dsl'],
    affectedNodes: ['wifi'],
    affectedLinks: [linkId('wifi', 'devices'), linkId('wifi', 'extender'), linkId('extender', 'devices')],
    visualEffect: 'unstable',
    sceneExtra: 'interference',
    steps: [
      {
        focusNodeId: 'wifi',
        title: 'De lucht is druk',
        body: 'Wifi gebruikt een paar radiokanalen. In een appartement of rijtjeshuis zenden de netwerken van je buren op dezelfde kanalen.',
      },
      {
        focusNodeId: 'wifi',
        title: 'Netwerken zitten elkaar in de weg',
        body: "Is iedereen 's avonds online? Dan moeten de netwerken op elkaar wachten. Je wifi hapert dan, ook al is het signaal sterk.",
      },
      {
        focusNodeId: 'modem',
        title: 'Je KPN Box kan uitwijken',
        body: 'Je KPN Box zoekt zelf een rustig kanaal. Een herstart helpt hem soms om een beter kanaal te vinden.',
      },
    ],
    fixesFocusNodeId: 'wifi',
    fixes: [
      {
        title: 'Kies de 5 GHz-wifi',
        steps: ['5 GHz heeft meer kanalen en reikt minder ver. Daardoor heb je er minder last van de buren.'],
      },
      {
        title: 'Herstart je KPN Box',
        steps: ['Haal de stekker eruit, wacht 30 seconden en stop hem er weer in.', 'Je KPN Box kiest daarna opnieuw een kanaal.'],
      },
      {
        title: 'Gebruik kabels waar het kan',
        steps: ['Sluit vaste apparaten zoals je tv of computer aan met een netwerkkabel. Daar hebben de buren geen invloed op.'],
        demo: { wire: 'tv' },
      },
    ],
    escalation: { label: 'Neem contact op met KPN', href: links.contact },
    draft: true,
  },
];
