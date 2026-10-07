import { useEffect, useRef } from 'react';

let firstViewShown = false;

/**
 * Zet de toetsenbordfocus op dit element zodra de weergave verschijnt (maar niet bij
 * het openen van de pagina). Zo raken toetsenbord- en schermlezergebruikers nooit kwijt
 * waar ze zijn als het paneel van weergave wisselt.
 */
export function useFocusOnMount<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (firstViewShown) ref.current?.focus({ preventScroll: true });
    firstViewShown = true;
  }, []);
  return ref;
}
