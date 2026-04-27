import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Loader2, MapPin } from 'lucide-react';
import apiClient from '../../../services/apiClient';

/**
 * AddressValidator
 *
 * Lets the user click "Validate address" to call /api/geo/validate.
 * If status is 'ok', auto-locks the primary candidate.
 * If 'ambiguous', renders a candidate picker the user must pick from.
 * If 'not_found', renders an error.
 *
 * Props:
 *   addressFields  – { line1, line2, city, state, postalCode, country }
 *   onResolved({ lat, lng, displayName }) – called once a candidate is picked or the only-result is OK
 *   onCleared() – called when the user clears their pick (e.g. after editing the address)
 */
export default function AddressValidator({ addressFields, onResolved, onCleared }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [picked, setPicked] = useState(null);
  const [error, setError] = useState('');

  const reset = () => {
    setResult(null);
    setPicked(null);
    setError('');
    onCleared?.();
  };

  const validate = async () => {
    setError('');
    if (!addressFields.line1?.trim() || !addressFields.city?.trim()) {
      setError('Enter at least street + city before validating.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await apiClient.post('/api/geo/validate', addressFields);
      setResult(data);
      if (data.status === 'ok' && data.primary) {
        setPicked(data.primary);
        onResolved({
          lat: data.primary.lat,
          lng: data.primary.lng,
          displayName: data.primary.displayName,
        });
      } else if (data.status === 'not_found') {
        onCleared?.();
      } else {
        // ambiguous — wait for user to pick
        onCleared?.();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePick = (candidate) => {
    setPicked(candidate);
    onResolved({
      lat: candidate.lat,
      lng: candidate.lng,
      displayName: candidate.displayName,
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={validate}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-200 transition-colors hover:bg-violet-500/20 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <MapPin className="h-3.5 w-3.5" />
          )}
          {loading ? 'Validating…' : 'Validate address'}
        </button>
        {picked && (
          <button
            type="button"
            onClick={reset}
            className="text-[11px] text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
          >
            Re-validate
          </button>
        )}
      </div>

      {error && (
        <p className="flex items-start gap-1.5 text-xs text-rose-400">
          <XCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      {result?.status === 'not_found' && !error && (
        <p className="flex items-start gap-1.5 text-xs text-rose-400">
          <XCircle className="h-3.5 w-3.5 shrink-0" />
          We couldn&apos;t locate that address on the map. Please refine it.
        </p>
      )}

      {result?.status === 'ok' && picked && (
        <div className="flex items-start gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <div className="font-semibold">Address verified</div>
            <div className="text-emerald-300/80">{picked.displayName}</div>
            <div className="mt-0.5 text-emerald-300/60">
              {picked.lat.toFixed(5)}, {picked.lng.toFixed(5)}
            </div>
          </div>
        </div>
      )}

      {result?.status === 'ambiguous' && (
        <div className="space-y-1.5">
          <p className="flex items-start gap-1.5 text-xs text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Multiple matches — pick the right one:
          </p>
          <ul className="space-y-1">
            {result.candidates.map((c, i) => (
              <li key={`${c.lat},${c.lng},${i}`}>
                <button
                  type="button"
                  onClick={() => handlePick(c)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                    picked && picked.lat === c.lat && picked.lng === c.lng
                      ? 'border-emerald-500/60 bg-emerald-500/15 text-emerald-100'
                      : 'border-zinc-700/80 bg-zinc-900/60 text-zinc-300 hover:border-violet-500/50 hover:bg-zinc-800'
                  }`}
                >
                  <div className="line-clamp-2">{c.displayName}</div>
                  <div className="mt-0.5 text-[10px] text-zinc-500">
                    {c.type} · {c.lat.toFixed(4)}, {c.lng.toFixed(4)}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
