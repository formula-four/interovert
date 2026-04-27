import React, { useEffect, useState } from 'react';
import { AlertTriangle, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import apiClient from '../../../services/apiClient';

/**
 * SimilarEventsAtVenue
 *
 * Calls /api/events/by-venue using the resolved (lat,lng) of the picked venue
 * and warns the user if other events are happening at this venue.
 *
 * Props:
 *   lat, lng           – resolved venue coords
 *   excludeEventId     – optional, when used in an edit flow
 *   radiusMeters       – default 75
 */
export default function SimilarEventsAtVenue({ lat, lng, excludeEventId, radiusMeters = 75 }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    let active = true;
    setLoading(true);
    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      radiusMeters: String(radiusMeters),
      limit: '10',
    });
    if (excludeEventId) params.set('excludeEventId', String(excludeEventId));
    apiClient
      .get(`/api/events/by-venue?${params.toString()}`)
      .then(({ data }) => {
        if (!active) return;
        setEvents(data.events || []);
        setOpen((data.events || []).length > 0);
      })
      .catch(() => {
        if (active) setEvents([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [lat, lng, excludeEventId, radiusMeters]);

  if (loading || events.length === 0) return null;

  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left text-xs font-semibold text-amber-200"
      >
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5" />
          {events.length === 1
            ? '1 other event at this venue'
            : `${events.length} other events at this venue`}
        </span>
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      {open && (
        <ul className="mt-2 space-y-1.5">
          {events.map((ev) => {
            const when = ev.datetime ? new Date(ev.datetime) : null;
            return (
              <li key={ev._id}>
                <a
                  href={`/event/${ev._id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-2 rounded-md bg-zinc-900/60 px-2.5 py-2 text-xs text-zinc-200 ring-1 ring-zinc-800/80 transition-colors hover:bg-zinc-900 hover:ring-amber-500/40"
                >
                  <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300/80" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{ev.name}</div>
                    {when && (
                      <div className="text-[11px] text-zinc-500">
                        {when.toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                        {ev.distanceKm != null && (
                          <> · {(ev.distanceKm * 1000).toFixed(0)} m away</>
                        )}
                      </div>
                    )}
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
