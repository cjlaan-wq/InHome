// Eén centrale plek voor kleuren, maten en timings.
// Later af te stemmen op het KPN design system.

export const colors = {
  kpnGreen: '#00C300',
  kpnGreenDark: '#008A00', // voor tekst op wit (voldoende contrast)
  warning: '#F28C28',
  warningDark: '#A84E00', // voor tekst/iconen en witte tekst op oranje (voldoende contrast)
  warningSoft: '#FFF1E5',
  error: '#E5412D',
  dimmed: '#B8BEC6',
  dimmedSurface: '#E6E9EC', // waar gedimde onderdelen naartoe vervagen

  // Scène
  sceneBackground: '#EEF2F5',
  ground: '#F7F9FA',
  groundPath: '#E4E9ED',
  fiberCable: '#00C300',
  copperCable: '#C9793A',
  indoorCable: '#9AA3AC',
  packet: '#7DFF6E',
  packetProblem: '#FF8A1F',
  wifiRing: '#00C300',

  building: '#FFFFFF',
  buildingShade: '#DDE3E8',
  wall: '#F3F5F7',
  floor: '#E8E2D8',
  roof: '#C5CDD5',
  cabinet: '#7F938A',
  furniture: '#D3D8DD',
  fabric: '#AFC3D6',
  device: '#2B3138',
  screen: '#3D4B5A',
  ledOn: '#00C300',

  // UI
  text: '#1A1F24',
  textMuted: '#5A646E',
  surface: '#FFFFFF',
  border: '#DCE1E6',
} as const;

export const layout = {
  panelWidth: 380, // px, desktop
  mobileCanvasHeight: 0.55, // aandeel van de schermhoogte
  desktopBreakpoint: 768, // px
} as const;

export const timings = {
  cameraFlight: 1.0, // s (≈0,8–1,2 s)
  uiTransition: 0.25, // s
  packetSpeed: 3.2, // scène-eenheden per seconde
  packetSpacing: 1.6, // afstand tussen pakketjes
  dslPacketSpeedFactor: 0.55, // koper is trager dan glas
  wifiPulse: 2.4, // s per uitdijende ring
  issuePulse: 3.2, // rad/s, pulseren van betrokken onderdelen
} as const;
