import { houses } from '../content';
import type { HouseId, HousePreset } from '../content/types';
import { t } from '../i18n';
import { deviceOrder, houseSize, maxExtenders } from '../state/homeGeometry';
import { extenderItem, useAppStore, type PlaceableId } from '../state/store';
import { qualityWord, useHome } from '../state/useHome';
import { SignalBars } from './SignalBars';
import { useFocusOnMount } from './useFocusOnMount';

const floorLabel = (floor: number) => t(`home.floor${Math.min(floor, 2)}` as 'home.floor0');

/** 'Jouw huis': woningtype kiezen, alles in de juiste kamer zetten en zien hoe goed de wifi is. */
export function HomeEditor() {
  const heading = useFocusOnMount<HTMLHeadingElement>();
  const home = useHome();
  const { house, placement, hasExtender, coverage } = home;
  const backToExplore = useAppStore((s) => s.backToExplore);
  const setHouse = useAppStore((s) => s.setHouse);
  const place = useAppStore((s) => s.place);
  const resetHome = useAppStore((s) => s.resetHome);

  return (
    <article className="flex flex-col gap-6 p-5" aria-labelledby="home-title">
      <button
        type="button"
        onClick={backToExplore}
        className="self-start rounded-lg py-1 text-sm font-medium text-kpn-green-dark hover:underline focus-visible:outline-2 focus-visible:outline-kpn-green-dark"
      >
        ← {t('home.done')}
      </button>

      <header>
        <h2 id="home-title" ref={heading} tabIndex={-1} className="text-xl font-bold outline-none">
          {t('home.title')}
        </h2>
        <p className="mt-1 text-sm text-ink-muted">{t('home.intro')}</p>
      </header>

      <fieldset>
        <legend className="mb-2 font-semibold">{t('home.type')}</legend>
        <div className="grid grid-cols-3 gap-2">
          {houses.map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-line p-2 text-center text-xs has-checked:border-kpn-green-dark has-checked:bg-scene has-checked:ring-1 has-checked:ring-kpn-green-dark has-focus-visible:outline-2 has-focus-visible:outline-kpn-green-dark"
            >
              <input
                type="radio"
                name="house-type"
                value={option.id}
                checked={house.id === option.id}
                onChange={() => setHouse(option.id)}
                className="sr-only"
              />
              <HouseIcon id={option.id} />
              <span className="font-medium text-ink">{option.label}</span>
              <span className="text-ink-muted">{option.description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <FloorPicker house={house} />

      <section aria-labelledby="modem-heading" className="flex flex-col gap-2">
        <h3 id="modem-heading" className="font-semibold">
          {t('home.modem')}
        </h3>
        <RoomSelect house={house} item="modem" label={t('home.modem')} value={placement.modemRoomId} onChange={place} />
      </section>

      <Extenders />

      <section aria-labelledby="devices-heading" className="flex flex-col gap-2">
        <h3 id="devices-heading" className="font-semibold">
          {t('home.devices')}
        </h3>
        {deviceOrder.map((id) => (
          <div key={id} className="grid grid-cols-[6rem_1fr] items-center gap-2 text-sm">
            <label htmlFor={`room-${id}`}>{home.deviceLabel(id)}</label>
            <RoomSelect house={house} item={id} label={home.deviceLabel(id)} value={placement.deviceRooms[id]} onChange={place} />
          </div>
        ))}
        <p className="text-xs text-ink-muted">{t('home.dragHint')}</p>
      </section>

      <section aria-labelledby="coverage-heading" className="flex flex-col gap-3">
        <h3 id="coverage-heading" className="font-semibold">
          {t('home.coverage')}
        </h3>
        <ul className="flex flex-col gap-1 text-sm">
          {house.rooms.map((room) => {
            const reading = coverage.rooms[room.id];
            const devicesHere = deviceOrder.filter((id) => placement.deviceRooms[id] === room.id);
            return (
              <li key={room.id} className="flex items-center justify-between gap-2 rounded-lg bg-scene px-3 py-2">
                <span>
                  <span className="font-medium">{room.label}</span>
                  {devicesHere.length > 0 && (
                    <span className="text-ink-muted"> · {devicesHere.map(home.deviceLabel).join(', ')}</span>
                  )}
                </span>
                <span className="flex shrink-0 items-center gap-2 text-ink-muted">
                  {qualityWord(reading.quality)}
                  {hasExtender && reading.servedBy === 'extender' && (
                    <span className="text-xs">
                      (
                      {placement.extenderRoomIds.length > 1
                        ? t('home.servedByExtenderN', { n: (reading.extenderIndex ?? 0) + 1 })
                        : t('home.servedByExtender')}
                      )
                    </span>
                  )}
                  <SignalBars quality={reading.quality} />
                </span>
              </li>
            );
          })}
        </ul>
        <Advice />
        <p className="text-xs text-ink-muted">{t('home.coverageNote')}</p>
      </section>

      <button
        type="button"
        onClick={resetHome}
        className="self-start text-sm text-ink-muted underline underline-offset-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-kpn-green-dark"
      >
        {t('home.reset')}
      </button>
    </article>
  );
}

/** SuperWifi-punten: toevoegen (tot maxExtenders), per punt een kamer kiezen of weghalen. */
function Extenders() {
  const { house, placement, coverage, roomIn } = useHome();
  const place = useAppStore((s) => s.place);
  const addExtender = useAppStore((s) => s.addExtender);
  const removeExtender = useAppStore((s) => s.removeExtender);
  const ids = placement.extenderRoomIds;
  const full = ids.length >= maxExtenders;
  // Nieuw punt: in de kamer waar het het meest helpt, anders de standaardkamer.
  const suggestion = coverage.bestExtenderRoomId ?? house.defaults.extenderRoomId;

  return (
    <section aria-labelledby="extenders-heading" className="flex flex-col gap-2">
      <h3 id="extenders-heading" className="font-semibold">
        {t('home.extenders')}
      </h3>
      {ids.length === 0 && <p className="text-sm text-ink-muted">{t('home.extendersNone')}</p>}
      {ids.map((roomId, i) => {
        const feed = coverage.extenderFeeds[i] ?? -1;
        const label = t('home.extenderN', { n: i + 1 });
        return (
          <div key={i} className="flex flex-col gap-1 rounded-lg bg-scene p-2 text-sm">
            <div className="grid grid-cols-[6rem_1fr_auto] items-center gap-2">
              <label htmlFor={`room-${extenderItem(i)}`} className="font-medium">
                {label}
              </label>
              <RoomSelect house={house} item={extenderItem(i)} label={label} value={roomId} onChange={place} />
              <button
                type="button"
                onClick={() => removeExtender(i)}
                aria-label={t('home.extenderRemove', { name: label })}
                className="rounded-lg px-2 py-1 text-ink-muted hover:bg-surface hover:text-ink focus-visible:outline-2 focus-visible:outline-kpn-green-dark"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-ink-muted">
              {feed >= 0 ? t('home.extenderFedByExtender', { n: feed + 1 }) : t('home.extenderFedByModem')}
            </p>
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => addExtender(suggestion)}
        disabled={full}
        className="self-start rounded-lg border border-kpn-green-dark px-3 py-1.5 text-sm font-medium text-kpn-green-dark hover:bg-scene disabled:border-line disabled:text-ink-muted focus-visible:outline-2 focus-visible:outline-kpn-green-dark"
      >
        {full ? t('home.extenderMax', { max: maxExtenders }) : `+ ${t('home.extenderAdd', { roomIn: roomIn(suggestion) })}`}
      </button>
    </section>
  );
}

/** Persoonlijk advies, met knoppen die het advies meteen in de tekening toepassen. */
function Advice() {
  const home = useHome();
  const place = useAppStore((s) => s.place);
  const addExtender = useAppStore((s) => s.addExtender);
  const { coverage } = home;
  const weakest = coverage.devices[coverage.weakestDevice];

  if (weakest.quality === 'good') {
    return <p className="rounded-xl bg-scene p-3 text-sm">{t('home.adviceAllGood')}</p>;
  }
  const device = home.deviceLabel(coverage.weakestDevice).toLowerCase();
  const modemRoom = coverage.betterModemRoomId;
  const extenderRoom = coverage.bestExtenderRoomId;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-line p-3 text-sm" aria-live="polite">
      <h4 className="font-semibold">{t('home.adviceTitle')}</h4>
      <p>
        {t('home.adviceWeak', {
          device,
          roomIn: home.roomIn(weakest.roomId),
          quality: qualityWord(weakest.quality),
        })}
      </p>
      {modemRoom && (
        <>
          <p>{t('home.adviceModem', { roomIn: home.roomIn(modemRoom), device })}</p>
          <ApplyButton onClick={() => place('modem', modemRoom)}>
            {t('home.adviceModemApply', { roomIn: home.roomIn(modemRoom) })}
          </ApplyButton>
        </>
      )}
      {extenderRoom && (
        <>
          <p>
            {t(home.hasExtender ? 'home.adviceExtenderExtra' : 'home.adviceExtender', {
              roomIn: home.roomIn(extenderRoom),
            })}
          </p>
          <ApplyButton onClick={() => addExtender(extenderRoom)}>
            {t('home.adviceExtenderApply', { roomIn: home.roomIn(extenderRoom) })}
          </ApplyButton>
        </>
      )}
      {!modemRoom && !extenderRoom && <p>{t('home.adviceCloser', { device })}</p>}
    </div>
  );
}

function ApplyButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="self-start rounded-lg border border-kpn-green-dark px-3 py-1.5 font-medium text-kpn-green-dark hover:bg-scene focus-visible:outline-2 focus-visible:outline-kpn-green-dark"
    >
      {children}
    </button>
  );
}

type RoomSelectProps = {
  house: HousePreset;
  item: PlaceableId;
  label: string;
  value: string;
  onChange: (item: PlaceableId, roomId: string) => void;
};

/** Kamerkeuze, gegroepeerd per verdieping. Volledig met het toetsenbord te bedienen. */
function RoomSelect({ house, item, label, value, onChange }: RoomSelectProps) {
  const floors = [...new Set(house.rooms.map((room) => room.floor))];
  const options = (floor: number) =>
    house.rooms
      .filter((room) => room.floor === floor)
      .map((room) => (
        <option key={room.id} value={room.id}>
          {room.label}
        </option>
      ));
  return (
    <select
      id={`room-${item}`}
      aria-label={label}
      value={value}
      onChange={(e) => onChange(item, e.target.value)}
      className="w-full rounded-lg border border-line bg-surface px-2 py-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-kpn-green-dark"
    >
      {floors.length === 1
        ? options(floors[0])
        : floors.map((floor) => (
            <optgroup key={floor} label={floorLabel(floor)}>
              {options(floor)}
            </optgroup>
          ))}
    </select>
  );
}

/** Verdieping bekijken: hogere verdiepingen verbergen om in de kamers eronder te kijken. */
function FloorPicker({ house }: { house: HousePreset }) {
  const visibleFloor = useAppStore((s) => s.visibleFloor);
  const setVisibleFloor = useAppStore((s) => s.setVisibleFloor);
  const { floors } = houseSize(house);
  if (floors < 2) return null;
  const options: (number | null)[] = [null, ...Array.from({ length: floors }, (_, i) => i)];

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink-muted">{t('home.floorLabel')}</legend>
      <div className="flex flex-wrap gap-1 rounded-xl bg-scene p-1">
        {options.map((floor) => (
          <label
            key={floor ?? 'all'}
            className="flex-1 cursor-pointer whitespace-nowrap rounded-lg px-2 py-1.5 text-center text-xs font-medium has-checked:bg-surface has-checked:shadow-sm has-focus-visible:outline-2 has-focus-visible:outline-kpn-green-dark"
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
      </div>
    </fieldset>
  );
}

/** Eenvoudige pictogrammen per woningtype. */
function HouseIcon({ id }: { id: HouseId }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinejoin: 'round' as const };
  return (
    <svg viewBox="0 0 40 32" className="h-8 w-10 text-kpn-green-dark" aria-hidden="true">
      {id === 'apartment' && (
        <>
          <rect x="8" y="3" width="24" height="27" {...common} />
          {[9, 16, 23].map((y) => [13, 22].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="5" height="4" {...common} />))}
        </>
      )}
      {id === 'terraced' && (
        <>
          <path d="M2 30V14l9-8 9 8 9-8 9 8v16Z" {...common} />
          <path d="M20 14v16" {...common} />
          <rect x="8" y="20" width="5" height="10" {...common} />
          <rect x="26" y="20" width="5" height="10" {...common} />
        </>
      )}
      {id === 'detached' && (
        <>
          <path d="M7 30V14L20 3l13 11v16Z" {...common} />
          <rect x="17" y="9" width="6" height="4" {...common} />
          <rect x="11" y="17" width="5" height="4" {...common} />
          <rect x="24" y="17" width="5" height="4" {...common} />
          <rect x="17" y="23" width="6" height="7" {...common} />
        </>
      )}
    </svg>
  );
}

