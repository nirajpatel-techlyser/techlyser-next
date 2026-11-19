"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCountryName,
  listCategoryGroups,
  listPriorityCountries,
  listOpportunityCountries,
  listPopularCities,
  normalizeManualCity,
  searchCategories,
  searchCities,
} from "@/lib/business-discovery";

export default function DiscoverForm({
  providerLabel = "OpenStreetMap (Overpass)",
}: {
  providerLabel?: string;
}) {
  const router = useRouter();
  const priorityCountries = useMemo(() => listPriorityCountries(), []);
  const allCountries = useMemo(() => listOpportunityCountries(), []);
  const groups = useMemo(() => listCategoryGroups(), []);

  const [countryCode, setCountryCode] = useState("IN");
  const [cityQuery, setCityQuery] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("");
  const [manualCity, setManualCity] = useState("");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [radiusKm, setRadiusKm] = useState(10);
  const [resultLimit, setResultLimit] = useState(25);
  const [websiteFilter, setWebsiteFilter] = useState("no_website_listed");
  const [requireEmail, setRequireEmail] = useState(false);
  const [requirePhone, setRequirePhone] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const popularCities = useMemo(
    () => listPopularCities(countryCode),
    [countryCode],
  );
  const cityResults = useMemo(
    () => searchCities(countryCode, cityQuery, 30),
    [countryCode, cityQuery],
  );
  const categoryResults = useMemo(
    () => searchCategories(categoryQuery),
    [categoryQuery],
  );

  function toggleCity(name: string) {
    setSelectedCities((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name],
    );
  }

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  function addManualCity() {
    const city = normalizeManualCity(countryCode, manualCity);
    if (!city) {
      setMessage("Enter a valid city name (2–80 characters).");
      return;
    }
    setSelectedCities((prev) =>
      prev.includes(city.name) ? prev : [...prev, city.name],
    );
    setManualCity("");
    setMessage("");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!countryCode) {
      setMessage("Select a country.");
      return;
    }
    if (selectedCities.length === 0) {
      setMessage("Select or enter at least one city.");
      return;
    }
    if (selectedCategories.length === 0) {
      setMessage("Select at least one business category.");
      return;
    }

    setBusy(true);
    setMessage("Starting discovery…");

    const create = await fetch("/api/admin/business-opportunities/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        countryCode,
        cities: selectedCities,
        categories: selectedCategories,
        radiusKm,
        resultLimit,
        websiteFilter,
        requireEmail,
        requirePhone,
      }),
    });
    const created = (await create.json()) as {
      error?: string;
      job?: { id: string };
    };
    if (!create.ok || !created.job) {
      setBusy(false);
      setMessage(created.error || "Discovery could not start.");
      return;
    }

    setMessage("Querying OpenStreetMap…");
    const step = await fetch(
      `/api/admin/business-opportunities/jobs/${created.job.id}/step`,
      { method: "POST" },
    );
    const state = (await step.json()) as {
      error?: string;
      discoveredCount?: number;
      errorMessage?: string | null;
      status?: string;
    };
    setBusy(false);

    if (!step.ok) {
      setMessage(state.error || "Discovery step failed.");
      return;
    }

    const count = state.discoveredCount ?? 0;
    setMessage(
      count > 0
        ? `Found ${count} business${count === 1 ? "" : "es"} in ${getCountryName(countryCode)}. Open Business Leads for PDF preview and email drafts (send is off).`
        : state.errorMessage ||
            "No businesses matched these filters. Try another city or category.",
    );
    router.refresh();
    if (count > 0) {
      router.push("/admin/business-opportunities/leads");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        Provider: <span className="font-semibold">{providerLabel}</span> ·
        results are public OSM listings only · emails are never sent from this
        screen
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">1. Country</h2>
        <div className="flex flex-wrap gap-2">
          {priorityCountries.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => {
                setCountryCode(country.code);
                setSelectedCities([]);
                setCityQuery("");
              }}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                countryCode === country.code
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {country.name}
            </button>
          ))}
        </div>
        <label className="block text-sm text-slate-700">
          Or choose any country
          <select
            value={countryCode}
            onChange={(e) => {
              setCountryCode(e.target.value);
              setSelectedCities([]);
              setCityQuery("");
            }}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          >
            {allCountries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">2. Cities</h2>
        <p className="text-sm text-slate-600">
          Popular cities for {getCountryName(countryCode)}. Search the full city
          list or add a city manually.
        </p>
        <div className="flex flex-wrap gap-2">
          {popularCities.map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => toggleCity(city.name)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                selectedCities.includes(city.name)
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
        <input
          value={cityQuery}
          onChange={(e) => setCityQuery(e.target.value)}
          placeholder="Search cities…"
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
        />
        {cityQuery.trim() ? (
          <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
            {cityResults.length === 0 ? (
              <p className="px-2 py-1 text-sm text-slate-500">No cities found.</p>
            ) : (
              cityResults.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => toggleCity(city.name)}
                  className="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  {city.name}
                  {city.stateCode ? ` (${city.stateCode})` : ""}
                  {selectedCities.includes(city.name) ? " ✓" : ""}
                </button>
              ))
            )}
          </div>
        ) : null}
        <div className="flex gap-2">
          <input
            value={manualCity}
            onChange={(e) => setManualCity(e.target.value)}
            placeholder="Manual city entry"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          />
          <button
            type="button"
            onClick={addManualCity}
            className="shrink-0 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold"
          >
            Add city
          </button>
        </div>
        {selectedCities.length > 0 ? (
          <p className="text-sm text-slate-600">
            Selected: {selectedCities.join(", ")}
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">3. Categories</h2>
        <input
          value={categoryQuery}
          onChange={(e) => setCategoryQuery(e.target.value)}
          placeholder="Filter categories…"
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
        />
        <div className="space-y-4">
          {(categoryQuery.trim()
            ? [{ group: "Results", categories: categoryResults }]
            : groups
          ).map((block) => (
            <div key={block.group}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {block.group}
              </p>
              <div className="flex flex-wrap gap-2">
                {block.categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                      selectedCategories.includes(cat.id)
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm text-slate-700">
          Search radius (km)
          <input
            type="number"
            min={1}
            max={100}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value) || 10)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          />
        </label>
        <label className="text-sm text-slate-700">
          Result limit
          <input
            type="number"
            min={5}
            max={100}
            value={resultLimit}
            onChange={(e) => setResultLimit(Number(e.target.value) || 25)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          />
        </label>
        <label className="text-sm text-slate-700">
          Website status filter
          <select
            value={websiteFilter}
            onChange={(e) => setWebsiteFilter(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          >
            <option value="any">Any</option>
            <option value="no_website_listed">No website listed</option>
            <option value="unverified">Website listed (unverified)</option>
          </select>
        </label>
        <div className="space-y-2 pt-6 text-sm text-slate-700">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={requireEmail}
              onChange={(e) => setRequireEmail(e.target.checked)}
            />
            Public email available
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={requirePhone}
              onChange={(e) => setRequirePhone(e.target.checked)}
            />
            Public phone available
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Discovering…" : "Find businesses"}
        </button>
        <p className="text-xs text-slate-500">
          Uses live OpenStreetMap data. Google Places can be added later with an
          API key.
        </p>
      </div>

      {message ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message}
        </p>
      ) : null}
    </form>
  );
}
