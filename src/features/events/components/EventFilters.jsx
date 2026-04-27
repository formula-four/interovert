import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  ChevronDown,
  MapPin,
  Navigation,
  SlidersHorizontal,
  UserCircle2,
  Building2,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import apiClient from '../../../services/apiClient';
import AddressAutocomplete from '../../../components/AddressAutocomplete';

const RADIUS_OPTIONS = [10, 25, 50, 100];

export default function EventFilters({
  categories,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  filterMenuOpen,
  setFilterMenuOpen,
  nearMe,
  setNearMe,
  radius,
  setRadius,
  userAddress,
  customOrigin,
  setCustomOrigin,
  selectedCity,
  setSelectedCity,
  myEvents,
  setMyEvents,
  currentUser,
}) {
  const menuRef = useRef(null);
  const originMenuRef = useRef(null);
  const cityMenuRef = useRef(null);

  const [originPickerOpen, setOriginPickerOpen] = useState(false);
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [originDraft, setOriginDraft] = useState(null);

  useEffect(() => {
    if (!filterMenuOpen) return;
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setFilterMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [filterMenuOpen, setFilterMenuOpen]);

  useEffect(() => {
    if (!originPickerOpen) return;
    const close = (e) => {
      if (originMenuRef.current && !originMenuRef.current.contains(e.target)) {
        setOriginPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [originPickerOpen]);

  useEffect(() => {
    if (!cityPickerOpen) return;
    const close = (e) => {
      if (cityMenuRef.current && !cityMenuRef.current.contains(e.target)) {
        setCityPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [cityPickerOpen]);

  useEffect(() => {
    if (!cityPickerOpen || cities.length > 0) return;
    setCitiesLoading(true);
    apiClient
      .get('/api/events/cities')
      .then(({ data }) => setCities(data.cities || []))
      .catch(() => setCities([]))
      .finally(() => setCitiesLoading(false));
  }, [cityPickerOpen, cities.length]);

  const pill = (active) =>
    `shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
      active
        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-900/40 ring-1 ring-white/10'
        : 'bg-zinc-800/80 text-zinc-400 ring-1 ring-zinc-700/80 hover:bg-zinc-800 hover:text-zinc-200'
    }`;

  // Active "Near Me" origin label
  const activeOrigin = customOrigin
    ? customOrigin
    : userAddress?.geocode
    ? {
        label: userAddress.label || userAddress.city || 'My address',
        lat: userAddress.geocode.lat,
        lng: userAddress.geocode.lng,
      }
    : null;

  const handlePickAddress = async (fields) => {
    const formatted = [fields.line1, fields.city, fields.state, fields.country]
      .filter(Boolean)
      .join(', ');
    setValidating(true);
    try {
      const { data } = await apiClient.post('/api/geo/validate', { address: formatted });
      if (data.primary) {
        setOriginDraft({
          label: fields.city || fields.line1 || 'Custom point',
          lat: data.primary.lat,
          lng: data.primary.lng,
        });
      }
    } catch {
      // ignore
    } finally {
      setValidating(false);
    }
  };

  const confirmOrigin = () => {
    if (originDraft) {
      setCustomOrigin(originDraft);
      setNearMe(true);
      setOriginPickerOpen(false);
      setOriginDraft(null);
    }
  };

  return (
    <div className="mb-10 space-y-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
        <input
          type="search"
          placeholder="Search by title, description, or place…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-zinc-700/60 bg-zinc-900/60 py-3.5 pl-12 pr-4 text-sm text-white shadow-inner shadow-black/20 placeholder:text-zinc-500 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
          autoComplete="off"
        />
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 pt-0.5 [scrollbar-width:thin]">
        <button type="button" onClick={() => setSelectedCategory('all')} className={pill(selectedCategory === 'all')}>
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={pill(selectedCategory === category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Filter & Sort dropdown — disabled when Near Me is active since geo sort takes over */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => !nearMe && setFilterMenuOpen(!filterMenuOpen)}
            disabled={nearMe}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              nearMe
                ? 'bg-gray-800 opacity-40 cursor-not-allowed'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
            Sort & filters
            <ChevronDown className={`h-4 w-4 text-zinc-500 transition ${filterMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {filterMenuOpen && !nearMe && (
            <div className="absolute mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-10">
              <div className="p-4 space-y-2">
                <h3 className="font-semibold mb-2">Sort by</h3>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={sortBy === 'date'}
                    onChange={() => setSortBy('date')}
                    className="form-radio text-indigo-600"
                  />
                  <span>Date</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={sortBy === 'name'}
                    onChange={() => setSortBy('name')}
                    className="form-radio text-indigo-600"
                  />
                  <span>Name</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* My Events — only shown when logged in */}
        {currentUser && (
          <button
            type="button"
            onClick={() => setMyEvents(!myEvents)}
            title="Events you created and events you joined"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              myEvents
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            <UserCircle2 size={16} />
            My events
          </button>
        )}

        {/* City filter */}
        <div className="relative" ref={cityMenuRef}>
          <button
            type="button"
            onClick={() => setCityPickerOpen((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              selectedCity
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            <Building2 size={16} />
            {selectedCity || 'City'}
            <ChevronDown size={14} className={cityPickerOpen ? 'rotate-180' : ''} />
          </button>
          {cityPickerOpen && (
            <div className="absolute z-30 mt-2 w-64 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl">
              <div className="border-b border-zinc-800 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Filter by city
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {selectedCity && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCity(null);
                      setCityPickerOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-xs text-rose-300 hover:bg-zinc-800"
                  >
                    <span className="flex items-center gap-1.5">
                      <X className="h-3 w-3" />
                      Clear city
                    </span>
                  </button>
                )}
                {citiesLoading && (
                  <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-zinc-500">
                    <Loader2 className="h-3 w-3 animate-spin" /> Loading cities…
                  </div>
                )}
                {!citiesLoading && cities.length === 0 && (
                  <div className="px-3 py-2 text-xs text-zinc-500">No cities yet.</div>
                )}
                {cities.map((c) => (
                  <button
                    key={c.city}
                    type="button"
                    onClick={() => {
                      setSelectedCity(c.city);
                      setCityPickerOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs transition-colors ${
                      selectedCity === c.city
                        ? 'bg-indigo-600/30 text-white'
                        : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-indigo-400/70" />
                      {c.city}
                    </span>
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                      {c.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Near Me — works for everyone now (with or without saved address) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (!nearMe && !activeOrigin) {
                setOriginPickerOpen(true);
              } else {
                setNearMe(!nearMe);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              nearMe
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <Navigation size={16} className={nearMe ? 'text-white' : 'text-gray-400'} />
            Near Me
          </button>

          {/* Radius selector — only visible when Near Me is on */}
          {nearMe && activeOrigin && (
            <div className="flex items-center gap-1">
              {RADIUS_OPTIONS.map((km) => (
                <button
                  key={km}
                  onClick={() => setRadius(km)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    radius === km
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {km}km
                </button>
              ))}
            </div>
          )}

          {/* Origin chip — clickable to change */}
          {nearMe && activeOrigin && (
            <div className="relative" ref={originMenuRef}>
              <button
                type="button"
                onClick={() => setOriginPickerOpen((v) => !v)}
                className="flex items-center gap-1 rounded-md bg-zinc-800/80 px-2 py-1 text-xs text-zinc-300 ring-1 ring-zinc-700/80 hover:text-white"
              >
                <MapPin size={12} className="text-indigo-400" />
                {activeOrigin.label}
                <ChevronDown size={12} />
              </button>

              {originPickerOpen && (
                <div className="absolute z-30 mt-2 w-80 rounded-xl border border-zinc-700 bg-zinc-900 p-3 shadow-2xl">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Search from a different point
                  </p>
                  <AddressAutocomplete
                    placeholder="e.g. MG Road, Bangalore"
                    onSelect={handlePickAddress}
                    inputClassName="border-zinc-700 bg-zinc-950 text-zinc-100 placeholder-zinc-500 focus:border-indigo-500"
                  />
                  {validating && (
                    <p className="mt-2 flex items-center gap-1 text-[11px] text-zinc-500">
                      <Loader2 className="h-3 w-3 animate-spin" /> Locating…
                    </p>
                  )}
                  {originDraft && (
                    <div className="mt-2 flex items-center justify-between rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-2 text-xs text-emerald-200">
                      <div>
                        <div className="font-medium">{originDraft.label}</div>
                        <div className="text-[10px] text-emerald-300/70">
                          {originDraft.lat.toFixed(4)}, {originDraft.lng.toFixed(4)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={confirmOrigin}
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-500/30 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500/50"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Use
                      </button>
                    </div>
                  )}
                  <div className="mt-3 flex gap-2 border-t border-zinc-800 pt-3">
                    {userAddress?.geocode && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomOrigin(null);
                          setOriginPickerOpen(false);
                        }}
                        className="flex-1 rounded-md bg-zinc-800 px-2 py-1.5 text-[11px] text-zinc-300 hover:bg-zinc-700"
                      >
                        Use my saved address
                      </button>
                    )}
                    {customOrigin && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomOrigin(null);
                          setOriginPickerOpen(false);
                        }}
                        className="flex-1 rounded-md bg-rose-500/20 px-2 py-1.5 text-[11px] text-rose-200 hover:bg-rose-500/30"
                      >
                        Clear custom point
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Picker shown standalone when Near Me toggled with no origin yet */}
          {originPickerOpen && !activeOrigin && (
            <div ref={originMenuRef} className="absolute z-30 mt-2 w-80 rounded-xl border border-zinc-700 bg-zinc-900 p-3 shadow-2xl">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Pick a search origin
              </p>
              <AddressAutocomplete
                placeholder="e.g. MG Road, Bangalore"
                onSelect={handlePickAddress}
                inputClassName="border-zinc-700 bg-zinc-950 text-zinc-100 placeholder-zinc-500 focus:border-indigo-500"
              />
              {validating && (
                <p className="mt-2 flex items-center gap-1 text-[11px] text-zinc-500">
                  <Loader2 className="h-3 w-3 animate-spin" /> Locating…
                </p>
              )}
              {originDraft && (
                <button
                  type="button"
                  onClick={confirmOrigin}
                  className="mt-2 flex w-full items-center justify-center gap-1 rounded-md bg-emerald-500/30 px-2 py-2 text-xs font-semibold text-white hover:bg-emerald-500/50"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Use {originDraft.label}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
