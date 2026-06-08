"use client";

interface DateRangeSelectorProps {
  startDate: string;
  rangeDays: number;
  onStartDateChange: (d: string) => void;
  onRangeDaysChange: (n: number) => void;
}

export default function DateRangeSelector({
  startDate,
  rangeDays,
  onStartDateChange,
  onRangeDaysChange,
}: DateRangeSelectorProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Start Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Days ({rangeDays})
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={1}
            max={30}
            value={rangeDays}
            onChange={(e) => onRangeDaysChange(Number(e.target.value))}
            className="w-28 accent-green-600"
          />
          <span className="text-sm tabular-nums text-zinc-600 dark:text-zinc-400 min-w-[2ch]">
            {rangeDays}
          </span>
        </div>
      </div>

      <div className="flex gap-1.5">
        {[7, 14, 30].map((n) => (
          <button
            key={n}
            onClick={() => onRangeDaysChange(n)}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              rangeDays === n
                ? "bg-green-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            {n}d
          </button>
        ))}
      </div>
    </div>
  );
}
