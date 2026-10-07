// Nederlandse UI-teksten. Content (onderdelen, problemen) staat in src/content/.
export const nl = {
  'app.title': 'Zo werkt je internet',
  'app.intro':
    'Bekijk hoe je internet van KPN tot in je huis komt. Klik op een onderdeel voor uitleg, of kies wat er aan de hand is.',
  'connection.label': 'Jouw verbinding',
  'connection.fiber': 'Glasvezel',
  'connection.dsl': 'DSL (koper)',
  'issues.heading': 'Wat is er aan de hand?',
  'issues.empty': 'De problemen worden binnenkort toegevoegd.',
  'nodes.heading': 'Onderdelen van je verbinding',
  'nodes.empty': 'De onderdelen worden binnenkort toegevoegd.',
  'scene.loading': '3D-weergave laden…',
  'scene.ariaLabel': '3D-weergave van je internetverbinding. Alle informatie staat ook in het paneel.',
  'fallback.notice': 'Je apparaat ondersteunt geen 3D. Je ziet daarom een eenvoudige tekening.',
  'sheet.expand': 'Paneel uitklappen',
  'sheet.collapse': 'Paneel inklappen',
} as const;

export type MessageKey = keyof typeof nl;
