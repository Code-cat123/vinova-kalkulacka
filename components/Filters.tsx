"use client";

import { Medal } from "@/lib/oiv";

export type TypeFilter = "vse" | "tiche" | "sumive";
export type MedalFilter = "vse" | Medal;
export type SortBy = "datum" | "skore" | "nazev";
export type SortDir = "asc" | "desc";

export interface FilterState {
  search: string;
  type: TypeFilter;
  medal: MedalFilter;
  dateFrom: string;
  dateTo: string;
  sortBy: SortBy;
  sortDir: SortDir;
}

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  type: "vse",
  medal: "vse",
  dateFrom: "",
  dateTo: "",
  sortBy: "datum",
  sortDir: "desc",
};

export function Filters({
  value,
  onChange,
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
}) {
  function set<K extends keyof FilterState>(key: K, v: FilterState[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={value.search}
          onChange={(e) => set("search", e.target.value)}
          placeholder="Hledat (název, vinař, odrůda, poznámka)…"
          className="w-full flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-wine-500 focus:outline-none focus:ring-1 focus:ring-wine-500"
        />
        <button
          type="button"
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-600 hover:bg-stone-50"
        >
          Vymazat filtry
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Select
          label="Typ"
          value={value.type}
          onChange={(v) => set("type", v as TypeFilter)}
          options={[
            ["vse", "Vše"],
            ["tiche", "Tiché"],
            ["sumive", "Šumivé"],
          ]}
        />
        <Select
          label="Medaile"
          value={value.medal}
          onChange={(v) => set("medal", v as MedalFilter)}
          options={[
            ["vse", "Vše"],
            ["velka_zlata", "Velká zlatá"],
            ["zlata", "Zlatá"],
            ["stribrna", "Stříbrná"],
            ["zadna", "Bez medaile"],
          ]}
        />
        <label className="flex flex-col text-xs font-medium text-stone-500">
          Od
          <input
            type="date"
            value={value.dateFrom}
            onChange={(e) => set("dateFrom", e.target.value)}
            className="mt-1 rounded-lg border border-stone-300 px-2 py-1.5 text-sm text-stone-800 focus:border-wine-500 focus:outline-none"
          />
        </label>
        <label className="flex flex-col text-xs font-medium text-stone-500">
          Do
          <input
            type="date"
            value={value.dateTo}
            onChange={(e) => set("dateTo", e.target.value)}
            className="mt-1 rounded-lg border border-stone-300 px-2 py-1.5 text-sm text-stone-800 focus:border-wine-500 focus:outline-none"
          />
        </label>
        <Select
          label="Řadit dle"
          value={value.sortBy}
          onChange={(v) => set("sortBy", v as SortBy)}
          options={[
            ["datum", "Datum"],
            ["skore", "Skóre"],
            ["nazev", "Název"],
          ]}
        />
        <Select
          label="Směr"
          value={value.sortDir}
          onChange={(v) => set("sortDir", v as SortDir)}
          options={[
            ["desc", "Sestupně"],
            ["asc", "Vzestupně"],
          ]}
        />
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="flex flex-col text-xs font-medium text-stone-500">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 rounded-lg border border-stone-300 px-2 py-1.5 text-sm text-stone-800 focus:border-wine-500 focus:outline-none"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
