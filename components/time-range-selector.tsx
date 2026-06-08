"use client";

interface TimeRangeSelectorProps {
  fromHour: number;
  toHour: number;
  onChange: (from: number, to: number) => void;
}

const HOURS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

function fmt(h: number): string {
  const ampm = h >= 12 ? "PM" : "AM";
  const d = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${d} ${ampm}`;
}

export default function TimeRangeSelector({ fromHour, toHour, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-zinc-500">
      <span>From</span>
      <select
        value={fromHour}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (v < toHour) onChange(v, toHour);
        }}
        className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
      >
        {HOURS.filter((h) => h < toHour).map((h) => (
          <option key={h} value={h}>{fmt(h)}</option>
        ))}
      </select>
      <span>To</span>
      <select
        value={toHour}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (v > fromHour) onChange(fromHour, v);
        }}
        className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
      >
        {HOURS.filter((h) => h > fromHour).map((h) => (
          <option key={h} value={h}>{fmt(h)}</option>
        ))}
      </select>
    </div>
  );
}
