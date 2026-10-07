import { houses, nodes } from '../content';
import type { HouseId, HousePreset, WallType } from '../content/types';
import { t } from '../i18n';
import { deviceOrder, maxExtenders } from '../state/homeGeometry';
import { extenderItem, useAppStore, type PlaceableId } from '../state/store';
import { qualityWord, useHome } from '../state/useHome';
import { Button } from './Button';
import { SignalBars } from './SignalBars';
import { useFocusOnMount } from './useFocusOnMount';

/** Apparaten die met een netwerkkabel op de KPN Box kunnen (uit de content). */
const wireable = new Set(nodes.find((node) => node.id === 'devices')?.parts?.filter((p) => p.wireable).map((p) => p.id));

const wallOptions: { id: WallType; label: 'home.wallsLight' | 'home.wallsBrick' | 'home.wallsConcrete' }[] = [
  { id: 'light', label: 'home.wallsLight' },
  { id: 'brick', label: 'home.wallsBrick' },
  { id: 'concrete', label: 'home.wallsConcrete' },
];

/** Muurtype: bepaalt in het dekkingsmodel hoeveel muren en vloeren tegenhouden. */
function WallPicker() {
  const wallType = useAppStore((s) => s.placement.wallType);
  const setWallType = useAppStore((s) => s.setWallType);
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{t('home.walls')}</legend>
      <div className="flex gap-1 rounded-xl bg-scene p-1">
        {wallOptions.map((option) => (
          <label
            key={option.id}
            className="flex-1 cursor-pointer rounded-lg px-2 py-1.5 text-center text-sm font-medium has-checked:bg-surface has-checked:shadow-sm has-focus-visible:outline-2 has-focus-visible:outline-kpn-green-dark"
          >
            <input
              type="radio"
              name="wall-type"
              checked={wallType === option.id}
              onChange={() => setWallType(option.id)}
              className="sr-only"
            />
            {t(option.label)}
          </label>
        ))}
      </div>
      <p className="mt-1 text-xs text-ink-muted">{t('home.wallsHint')}</p>
    </fieldset>
  );
}

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
  const setDeviceWired = useAppStore((s) => s.setDeviceWired);

  return (
    <article className="flex min-h-full flex-col" aria-labelledby="home-title">
      <div className="flex flex-1 flex-col gap-7 p-5">
        <Button variant="back" onClick={backToExplore}>
          ← {t('home.back')}
        </Button>

        <header>
          <h2 id="home-title" ref={heading} tabIndex={-1} className="text-xl font-bold outline-none">
            {t('home.title')}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">{t('home.intro')}</p>
        </header>

        <Step n={1} title={t('home.stepHouse')}>
          <fieldset>
            <legend className="sr-only">{t('home.type')}</legend>
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
          <WallPicker />
        </Step>

        <Step n={2} title={t('home.stepWifi')}>
          <div className="grid grid-cols-[6rem_1fr] items-center gap-2 text-sm">
            <label htmlFor="room-modem" className="font-medium">
              {t('home.modemLabel')}
            </label>
            <RoomSelect house={house} item="modem" label={t('home.modem')} value={placement.modemRoomId} onChange={place} />
          </div>
          <Extenders />
        </Step>

        <Step n={3} title={t('home.stepDevices')}>
          {deviceOrder.map((id) => (
            <div key={id} className="grid grid-cols-[6rem_1fr_auto] items-center gap-2 text-sm">
              <label htmlFor={`room-${id}`} className="font-medium">
                {home.deviceLabel(id)}
              </label>
              <RoomSelect house={house} item={id} label={home.deviceLabel(id)} value={placement.deviceRooms[id]} onChange={place} />
              {wireable.has(id) ? (
                <label className="flex items-center gap-1.5 whitespace-nowrap text-xs">
                  <input
                    type="checkbox"
                    checked={placement.wiredDevices.includes(id)}
                    onChange={(e) => setDeviceWired(id, e.target.checked)}
                    aria-label={t('home.wiredLabel', { device: home.deviceLabel(id) })}
                    className="size-4 accent-kpn-green-dark"
                  />
                  {t('home.wired')}
                </label>
              ) : (
                <span />
              )}
            </div>
          ))}
          <p className="text-xs text-ink-muted">{t('home.dragHint')}</p>
        </Step>

        <section id="home-result" aria-labelledby="coverage-heading" className="flex scroll-mt-4 flex-col gap-3 border-t border-line pt-6">
          <h3 id="coverage-heading" className="text-lg font-semibold">
            {t('home.coverage')}
          </h3>
          <Advice />
          <ul className="flex flex-col gap-1 text-sm">
            {house.rooms.map((room) => {
              const reading = coverage.rooms[room.id];
              const devicesHere = deviceOrder.filter((id) => placement.deviceRooms[id] === room.id);
              return (
                <li key={room.id} className="flex items-center justify-between gap-2 rounded-lg bg-scene px-3 py-2">
                  <span>
                    <span className="font-medium">{room.label}</span>
                    {devicesHere.length > 0 && (
                      <span className="text-ink-muted">
                        {' · '}
                        {devicesHere
                          .map((id) =>
                            placement.wiredDevices.includes(id) ? `${home.deviceLabel(id)} (${t('home.servedByCable')})` : home.deviceLabel(id),
                          )
                          .join(', ')}
                      </span>
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
          <p className="text-xs text-ink-muted">{t('home.coverageNote')}</p>
          <button
            type="button"
            onClick={resetHome}
            className="self-start text-sm text-ink-muted underline underline-offset-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-kpn-green-dark"
          >
            {t('home.reset')}
          </button>
        </section>
      </div>

      {/* Vaste balk onderaan: het effect van elke keuze is altijd zichtbaar, ook op mobiel. */}
      <div className="sticky bottom-0 flex items-center gap-3 border-t border-line bg-surface p-4">
        <a
          href="#home-result"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('home-result')?.scrollIntoView({ block: 'start' });
          }}
          className="min-w-0 flex-1 rounded-lg text-sm focus-visible:outline-2 focus-visible:outline-kpn-green-dark"
          aria-live="polite"
        >
          <span className="block text-xs text-ink-muted">{t('home.summaryLabel')}</span>
          <span className="flex flex-wrap items-center gap-x-3">
            {(['good', 'fair', 'weak'] as const)
              .filter((q) => home.deviceSummary[q] > 0)
              .map((q) => (
                <span key={q} className="flex items-center gap-1 font-medium">
                  <SignalBars quality={q} />
                  {t('home.summaryCount', { count: home.deviceSummary[q], quality: t(`quality.${q}`) })}
                </span>
              ))}
          </span>
        </a>
        <Button variant="primary" onClick={backToExplore}>
          {t('home.done')}
        </Button>
      </div>
    </article>
  );
}

/** Genummerde stap in 'Jouw huis'. */
function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`home-step-${n}`} className="flex flex-col gap-3">
      <h3 id={`home-step-${n}`} className="flex items-center gap-2 font-semibold">
        <span aria-hidden="true" className="flex size-6 items-center justify-center rounded-full bg-kpn-green-dark text-xs text-white">
          {n}
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

/** SuperWifi-punten: toevoegen (tot maxExtenders), per punt een kamer kiezen of weghalen. */
function Extenders() {
  const { house, placement, coverage, roomIn } = useHome();
  const place = useAppStore((s) => s.place);
  const addExtender = useAppStore((s) => s.addExtender);
  const removeExtender = useAppStore((s) => s.removeExtender);
  const setExtenderWired = useAppStore((s) => s.setExtenderWired);
  const ids = placement.extenderRoomIds;
  const full = ids.length >= maxExtenders;
  // Nieuw punt: in de kamer waar het het meest helpt, anders de standaardkamer.
  const suggestion = coverage.bestExtenderRoomId ?? house.defaults.extenderRoomId;

  return (
    <section aria-labelledby="extenders-heading" className="flex flex-col gap-2">
      <h4 id="extenders-heading" className="text-sm font-medium">
        {t('home.extenders')}
      </h4>
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
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={placement.wiredExtenders[i] ?? false}
                onChange={(e) => setExtenderWired(i, e.target.checked)}
                className="size-4 accent-kpn-green-dark"
              />
              {t('home.extenderWired')}
            </label>
            <p className="text-xs text-ink-muted">
              {feed === -2
                ? t('home.extenderFedByCable')
                : feed >= 0
                  ? t('home.extenderFedByExtender', { n: feed + 1 })
                  : t('home.extenderFedByModem')}
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
  const setDeviceWired = useAppStore((s) => s.setDeviceWired);
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
      {wireable.has(coverage.weakestDevice) && (
        <>
          <p>{t('home.adviceWire', { device })}</p>
          <ApplyButton onClick={() => setDeviceWired(coverage.weakestDevice, true)}>
            {t('home.adviceWireApply', { device })}
          </ApplyButton>
        </>
      )}
      {!modemRoom && !extenderRoom && !wireable.has(coverage.weakestDevice) && <p>{t('home.adviceCloser', { device })}</p>}
    </div>
  );
}

function ApplyButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <Button variant="secondary" onClick={onClick} className="self-start">
      {children}
    </Button>
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

