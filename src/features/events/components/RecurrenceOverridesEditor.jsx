import React, { useMemo } from 'react';
import { CalendarClock, MapPin, X as XIcon } from 'lucide-react';
import AddressAutocomplete from '../../../components/AddressAutocomplete';
import AddressValidator from './AddressValidator';

/**
 * Lets the host plan a different venue for specific occurrences in a recurring series.
 *
 * Props:
 *   startDatetime    - ISO/parseable string for occurrence #0 datetime
 *   frequency        - 'weekly' | 'monthly'
 *   totalOccurrences - integer (>= 1) — counted-cap for the series
 *   overrides        - array: [{ occurrenceIndex, address: {...}, geocode: {lat,lng}|null }]
 *   setOverrides     - state setter
 */
export default function RecurrenceOverridesEditor({
  startDatetime,
  frequency,
  totalOccurrences,
  overrides,
  setOverrides,
}) {
  const N = Math.max(0, Math.min(52, Number(totalOccurrences) || 0));

  const occurrenceDates = useMemo(() => {
    if (!startDatetime || !N) return [];
    const start = new Date(startDatetime);
    if (Number.isNaN(start.getTime())) return [];
    const out = [];
    for (let i = 1; i < N; i++) {
      const d = new Date(start);
      if (frequency === 'monthly') d.setMonth(d.getMonth() + i);
      else d.setDate(d.getDate() + 7 * i);
      out.push({ index: i, date: d });
    }
    return out;
  }, [startDatetime, frequency, N]);

  const updateOne = (idx, partial) => {
    setOverrides((prev) => {
      const existing = prev.find((o) => o.occurrenceIndex === idx);
      if (existing) {
        return prev.map((o) =>
          o.occurrenceIndex === idx ? { ...o, ...partial } : o
        );
      }
      return [
        ...prev,
        {
          occurrenceIndex: idx,
          address: {
            addressLabel: '',
            addressLine1: '',
            addressLine2: '',
            addressCity: '',
            addressState: '',
            addressCountry: '',
            addressPostalCode: '',
          },
          geocode: null,
          ...partial,
        },
      ];
    });
  };

  const removeOne = (idx) => {
    setOverrides((prev) => prev.filter((o) => o.occurrenceIndex !== idx));
  };

  if (!N || N <= 1 || !startDatetime) return null;

  return (
    <div className="mt-4 rounded-xl border border-zinc-700/70 bg-zinc-900/40 p-4">
      <div className="mb-3 flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-violet-400" />
        <h4 className="text-sm font-semibold text-zinc-100">Per-occurrence venue</h4>
      </div>
      <p className="mb-3 text-xs text-zinc-500">
        Use the same venue for the whole series, or override it for specific occurrences below.
      </p>

      <div className="space-y-3">
        {occurrenceDates.map(({ index, date }) => {
          const ov = overrides.find((o) => o.occurrenceIndex === index);
          const enabled = Boolean(ov);

          return (
            <div
              key={index}
              className={`rounded-lg border p-3 transition-colors ${
                enabled
                  ? 'border-violet-500/50 bg-violet-500/5'
                  : 'border-zinc-700/70 bg-zinc-900/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-200">
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-violet-300">
                    #{index + 1}
                  </span>
                  {date.toLocaleString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
                {enabled ? (
                  <button
                    type="button"
                    onClick={() => removeOne(index)}
                    className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                  >
                    <XIcon className="h-3 w-3" />
                    Remove override
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => updateOne(index, {})}
                    className="rounded-md border border-violet-500/40 bg-violet-500/10 px-2 py-1 text-[11px] font-semibold text-violet-200 hover:bg-violet-500/20"
                  >
                    Different venue
                  </button>
                )}
              </div>

              {enabled && (
                <div className="mt-3 space-y-2">
                  <AddressAutocomplete
                    placeholder="Search venue for this occurrence…"
                    onSelect={(fields) =>
                      updateOne(index, {
                        address: {
                          ...ov.address,
                          addressLine1: fields.line1 || ov.address.addressLine1,
                          addressCity: fields.city || ov.address.addressCity,
                          addressState: fields.state || ov.address.addressState,
                          addressCountry: fields.country || ov.address.addressCountry,
                          addressPostalCode: fields.postalCode || ov.address.addressPostalCode,
                        },
                        geocode: null,
                      })
                    }
                    inputClassName="border-zinc-600 bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:border-violet-500/60"
                  />
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Street address"
                      value={ov.address.addressLine1}
                      onChange={(e) =>
                        updateOne(index, {
                          address: { ...ov.address, addressLine1: e.target.value },
                          geocode: null,
                        })
                      }
                      className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-violet-500/60 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={ov.address.addressCity}
                      onChange={(e) =>
                        updateOne(index, {
                          address: { ...ov.address, addressCity: e.target.value },
                          geocode: null,
                        })
                      }
                      className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:border-violet-500/60 focus:outline-none"
                    />
                  </div>
                  <AddressValidator
                    addressFields={{
                      line1: ov.address.addressLine1,
                      city: ov.address.addressCity,
                      state: ov.address.addressState,
                      postalCode: ov.address.addressPostalCode,
                      country: ov.address.addressCountry,
                    }}
                    onResolved={(g) => updateOne(index, { geocode: g })}
                    onCleared={() => updateOne(index, { geocode: null })}
                  />
                  {ov.geocode && (
                    <p className="flex items-center gap-1 text-[11px] text-emerald-300/80">
                      <MapPin className="h-3 w-3" />
                      {ov.geocode.lat.toFixed(4)}, {ov.geocode.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
