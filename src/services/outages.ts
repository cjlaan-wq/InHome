// Aansluitpunt voor een echte storingsfeed (buiten scope in fase 1).
// Later: storingen in de buurt ophalen en bijvoorbeeld het probleem
// 'outage-area' voorstellen of de storingsmelding in het paneel tonen.

export type OutageStatus = {
  /** Gebied, bijv. postcode of wijknaam. */
  area: string;
  message: string;
  expectedFixAt?: string;
};

export async function getOutageStatus(_postcode: string): Promise<OutageStatus | null> {
  return null;
}
