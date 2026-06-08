"use client";

import { useMemo } from "react";
import type { CalendarEvent, SlotItem, Court } from "@/lib/types";
import { courts, getParks, getParkInfo, haversineDistance } from "@/lib/courts";
import { eventsToSlotItems, computeFreeSlots, mergeItems, utcToLocalMinutes } from "@/lib/slots";
import TimelineCourt, { TimelineHeader } from "./timeline-court";

interface UnifiedViewProps {
  eventsByDay: Record<string, Record<number, CalendarEvent[]>>;
  days: { dateStr: string; date: Date }[];
  selectedPark: string | null;
  userPosition: { lat: number; lng: number } | null;
  viewStart: number;
  viewEnd: number;
}

function formatDayHeader(d: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return `${days[d.getDay()]}, ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function clampToRange(item: SlotItem, start: number, end: number, dateStr: string): SlotItem | null {
  const s = utcToLocalMinutes(item.startTimeISO);
  const e = utcToLocalMinutes(item.endTimeISO);
  if (e <= start || s >= end) return null;
  const cs = Math.max(s, start);
  const ce = Math.min(e, end);
  if (cs >= ce) return null;

  const us = ((cs) % 1440 + 1440) % 1440;
  const ue = ((ce) % 1440 + 1440) % 1440;
  return {
    ...item,
    startTimeISO: `${dateStr}T${String(Math.floor(us / 60)).padStart(2, "0")}:${String(us % 60).padStart(2, "0")}:00Z`,
    endTimeISO: `${dateStr}T${String(Math.floor(ue / 60)).padStart(2, "0")}:${String(ue % 60).padStart(2, "0")}:00Z`,
  };
}

export default function UnifiedView({
  eventsByDay,
  days,
  selectedPark,
  userPosition,
  viewStart,
  viewEnd,
}: UnifiedViewProps) {
  const now = useMemo(() => new Date(), []);
  const allParks = getParks();
  const visibleParks = selectedPark ? allParks.filter((p) => p === selectedPark) : allParks;

  return (
    <div className="space-y-8">
      {days.map(({ dateStr, date }) => {
        const dayEvents = eventsByDay[dateStr] || {};
        const isToday = isSameDay(date, now);

        return (
          <DaySection
            key={dateStr}
            dateStr={dateStr}
            dayEvents={dayEvents}
            isToday={isToday}
            parks={visibleParks}
            userPosition={userPosition}
            viewStart={viewStart}
            viewEnd={viewEnd}
          />
        );
      })}
    </div>
  );
}

function DaySection({
  dateStr,
  dayEvents,
  isToday,
  parks,
  userPosition,
  viewStart,
  viewEnd,
}: {
  dateStr: string;
  dayEvents: Record<number, CalendarEvent[]>;
  isToday: boolean;
  parks: string[];
  userPosition: { lat: number; lng: number } | null;
  viewStart: number;
  viewEnd: number;
}) {
  const { courtsWithItems, parkInfoMap } = useMemo(() => {
    const result: { court: Court; items: SlotItem[] }[] = [];
    const infoMap: Map<string, { addressLine1: string; lat: number; lng: number }> = new Map();

    for (const court of courts) {
      if (parks.length < getParks().length && !parks.includes(court.park)) continue;

      const events = dayEvents[court.id] || [];
      const eventItems = eventsToSlotItems(events, dateStr);
      const freeItems = computeFreeSlots(eventItems, dateStr);
      const allItems = mergeItems([...freeItems, ...eventItems]);

      // Filter to visible range
      const visible = allItems
        .map((item) => clampToRange(item, viewStart, viewEnd, dateStr))
        .filter((i): i is SlotItem => i !== null)
        .sort((a, b) => a.startTimeISO.localeCompare(b.startTimeISO));

      result.push({ court, items: visible });

      if (!infoMap.has(court.park)) {
        const pi = getParkInfo(court.park);
        if (pi) infoMap.set(court.park, pi);
      }
    }

    return { courtsWithItems: result, parkInfoMap: infoMap };
  }, [dayEvents, dateStr, parks, viewStart, viewEnd]);

  const dayDate = new Date(dateStr + "T00:00:00");

  const grouped = useMemo(() => {
    const map = new Map<string, { court: Court; items: SlotItem[] }[]>();
    for (const item of courtsWithItems) {
      const existing = map.get(item.court.park) || [];
      existing.push(item);
      map.set(item.court.park, existing);
    }
    return map;
  }, [courtsWithItems]);

  return (
    <div
      className={`rounded-xl border p-3 ${
        isToday
          ? "border-green-300 bg-green-50/50 dark:border-green-700 dark:bg-green-950/30"
          : "border-zinc-200 dark:border-zinc-700"
      }`}
    >
      <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
        {formatDayHeader(dayDate)}
        {isToday && (
          <span className="text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded-full">
            Today
          </span>
        )}
      </h2>

      <div>
        {parks.map((park) => {
          const parkItems = grouped.get(park);
          const pi = parkInfoMap.get(park);

          let distance: number | null = null;
          if (userPosition && pi) {
            distance = haversineDistance(
              userPosition.lat,
              userPosition.lng,
              pi.lat,
              pi.lng
            );
          }

          if (!parkItems || parkItems.length === 0) return null;

          return (
            <div key={park} className="mb-3 last:mb-0">
              <div className="flex items-baseline gap-2 mb-1.5">
                <h4 className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  {park}
                </h4>
                {pi && (
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    {pi.addressLine1}
                  </span>
                )}
                {distance !== null && (
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-auto">
                    {distance} mi
                  </span>
                )}
              </div>
              <div className="pl-1 space-y-2 text-xs">
                <TimelineHeader viewStart={viewStart} viewEnd={viewEnd} />
                {parkItems.map(({ court, items }) => (
                  <TimelineCourt
                    key={court.id}
                    label={court.shortName}
                    items={items}
                    viewStart={viewStart}
                    viewEnd={viewEnd}
                    facilityId={court.id}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
