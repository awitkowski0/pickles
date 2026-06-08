"use client";

import { useState, useEffect, useCallback } from "react";
import type { SlotItem } from "@/lib/types";
import { utcToLocalMinutes } from "@/lib/slots";

interface TimelineCourtProps {
  label: string;
  items: SlotItem[];
  viewStart: number;
  viewEnd: number;
  facilityId: number;
}

const colorMap: Record<SlotItem["kind"], string> = {
  free: "bg-green-400",
  "open-play": "bg-amber-400",
  reserved: "bg-zinc-700",
  event: "bg-purple-400",
};

function itemToTooltip(item: SlotItem): string {
  switch (item.kind) {
    case "free":
      return `Available ${item.startTimeDisplay} – ${item.endTimeDisplay}`;
    case "open-play":
      return `Open Play ${item.startTimeDisplay} – ${item.endTimeDisplay}`;
    case "reserved":
      return `Reserved ${item.startTimeDisplay} – ${item.endTimeDisplay}`;
    case "event":
      return item.label;
  }
}

export default function TimelineCourt({ label, items, viewStart, viewEnd, facilityId }: TimelineCourtProps) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const viewRange = viewEnd - viewStart;

  const selectItem = useCallback((e: React.MouseEvent, item: SlotItem) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip((prev) => {
      const text = itemToTooltip(item);
      if (prev && prev.text === text) return null;
      return { text, x: rect.left + rect.width / 2, y: rect.top - 4 };
    });
  }, []);

  const reserveLink = `https://pittsburgh.recdesk.com/Community/Facility/Reserve?facilityId=${facilityId}&r=l`;

  if (items.length === 0) {
    return (
      <div className="flex items-center gap-1.5 h-7">
        <span className="text-[10px] text-zinc-500 shrink-0">{label}</span>
        <div className="flex-1 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800" />
        <a href={reserveLink} target="_blank" rel="noopener noreferrer" className="text-[9px] text-green-600 hover:text-green-700 shrink-0">
          Reserve
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-1.5 h-7">
        <span className="text-[10px] text-zinc-500 shrink-0">{label}</span>
        <div className="flex-1 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative">
          {items.map((item, i) => {
            const start = utcToLocalMinutes(item.startTimeISO);
            const end = utcToLocalMinutes(item.endTimeISO);
            const left = ((start - viewStart) / viewRange) * 100;
            const w = ((end - start) / viewRange) * 100;
            const isFirst = i === 0;
            const isLast = i === items.length - 1;
            return (
              <button
                key={i}
                className={`absolute top-0 h-full cursor-pointer border-0 p-0 ${isFirst ? "rounded-l-full" : ""} ${isLast ? "rounded-r-full" : ""} ${colorMap[item.kind]}`}
                style={{ left: `${left}%`, width: `${w}%` }}
                onClick={(e) => selectItem(e, item)}
                type="button"
                aria-label={itemToTooltip(item)}
              />
            );
          })}
        </div>
        <a href={reserveLink} target="_blank" rel="noopener noreferrer" className="text-[9px] text-green-600 hover:text-green-700 shrink-0">
          Reserve
        </a>
      </div>
      {tooltip && (
        <div
          className="fixed z-50 px-2 py-1 rounded-md bg-zinc-900 text-white text-xs whitespace-nowrap shadow-lg pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </>
  );
}

interface TimelineHeaderProps {
  viewStart: number;
  viewEnd: number;
}

export function TimelineHeader({ viewStart, viewEnd }: TimelineHeaderProps) {
  const viewRange = viewEnd - viewStart;
  const startH = Math.ceil(viewStart / 60);
  const endH = Math.floor(viewEnd / 60);
  const hours: number[] = [];
  for (let h = startH; h <= endH; h++) hours.push(h);

  return (
    <div className="flex items-center gap-1.5 h-4 mb-1">
      <span className="w-16 shrink-0" />
      <div className="flex-1 relative">
        {hours.map((h) => {
          const left = ((h * 60 - viewStart) / viewRange) * 100;
          const ampm = h >= 12 ? "P" : "A";
          const disp = h === 0 ? 12 : h > 12 ? h - 12 : h;
          return (
            <div
              key={h}
              className="absolute -translate-x-1/2 text-[9px] text-zinc-400"
              style={{ left: `${left}%` }}
            >
              {disp}{ampm}
            </div>
          );
        })}
      </div>
      <span className="w-10 shrink-0" />
    </div>
  );
}
