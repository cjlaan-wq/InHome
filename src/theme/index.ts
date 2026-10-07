// Eén centrale plek voor kleuren, maten en timings.
// Later af te stemmen op het KPN design system.

export const colors = {
  kpnGreen: '#00C300',
  kpnGreenDark: '#008A00', // voor tekst op wit (voldoende contrast)
  warning: '#F28C28',
  error: '#E5412D',
  dimmed: '#B8BEC6',

  // Scène
  sceneBackground: '#EEF2F5',
  ground: '#E2E8EE',
  fiberCable: '#00C300',
  copperCable: '#C9793A',

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
  packetSpeed: 1.0, // relatief
} as const;
