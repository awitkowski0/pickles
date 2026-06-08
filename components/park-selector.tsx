"use client";

import { getParks } from "@/lib/courts";

interface ParkSelectorProps {
  selected: string | null;
  onChange: (park: string | null) => void;
}

export default function ParkSelector({ selected, onChange }: ParkSelectorProps) {
  const parks = getParks();

  return (
    <select
      value={selected ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
    >
      <option value="">All Parks</option>
      {parks.map((p) => (
        <option key={p} value={p}>
          {p}
        </option>
      ))}
    </select>
  );
}
