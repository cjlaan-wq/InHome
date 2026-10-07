import { t } from '../i18n';
import { houseSize } from '../state/homeGeometry';
import { useAppStore } from '../state/store';
import { useHome } from '../state/useHome';
import { useShowCoverage } from '../state/useShowCoverage';
import { RecenterIcon } from './Icons';
import { SignalBars } from './SignalBars';

const floorLabel = (floor: number) => t(`home.floor${Math.min(floor, 2)}` as 'home.floor0');

const chip =
  'pointer-events-auto rounded-full bg-surface/95 shadow-sm ring-1 ring-line focus-visible:outline-2 focus-visible:outline-kpn-green-dark';

/**
 * Bediening op de 3D-tekening zelf: beeld herstellen, verdieping kiezen en een legenda
 * voor de wifi-kleuren. Alles is ook gewone HTML, dus met toetsenbord en schermlezer te gebruiken.
 */
export function StageOverlay() {
  const recenter = useAppStore((s) => s.recenter);
  const mode = useAppStore((s) => s.mode);
  const showCoverage = useShowCoverage();
  const { house } = useHome();
  const { floors } = houseSize(house);
  const showFloors = floors > 1 && (mode === 'home' || showCoverage);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3">
      <div className="flex items-start justify-between gap-2">
        {showFloors ? <FloorPicker floors={floors} /> : <span />}
        <button type="button" onClick={recenter} aria-label={t('stage.recenter')} title={t('stage.recenter')} className={`${chip} p-2 text-ink hover:text-kpn-green-dark`}>
          <RecenterIcon />
        </button>
      </div>
      {showCoverage && (
        <div className={`${chip} flex flex-wrap items-center gap-x-3 gap-y-1 self-start rounded-xl px-3 py-1.5 text-xs`}>
          <span className="font-medium">{t('stage.legend')}</span>
          {(['good', 'fair', 'weak'] as const).map((q) => (
            <span key={q} className="flex items-center gap-1.5">
              <span aria-hidden="true" className={`size-3 rounded-sm opacity-60 ${swatch[q]}`} />
              <SignalBars quality={q} />
              {t(`quality.${q}`)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const swatch = { good: 'bg-coverage-good', fair: 'bg-coverage-fair', weak: 'bg-coverage-weak' } as const;

/** Verdieping bekijken: hogere verdiepingen verbergen om in de kamers eronder te kijken. */
function FloorPicker({ floors }: { floors: number }) {
  const visibleFloor = useAppStore((s) => s.visibleFloor);
  const setVisibleFloor = useAppStore((s) => s.setVisibleFloor);
  const options: (number | null)[] = [null, ...Array.from({ length: floors }, (_, i) => i)];

  return (
    <fieldset className={`${chip} flex flex-wrap gap-0.5 rounded-xl p-1`}>
      <legend className="sr-only">{t('home.floorLabel')}</legend>
      {options.map((floor) => (
        <label
          key={floor ?? 'all'}
          className="cursor-pointer whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium text-ink-muted has-checked:bg-kpn-green-dark has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-kpn-green-dark"
        >
          <input
            type="radio"
            name="visible-floor"
            checked={visibleFloor === floor}
            onChange={() => setVisibleFloor(floor)}
            className="sr-only"
          />
          {floor === null ? t('home.floorAll') : floorLabel(floor)}
        </label>
      ))}
    </fieldset>
  );
}
