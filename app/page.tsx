"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { courts } from "@/lib/courts";
import type { CalendarEvent } from "@/lib/types";
import { useLocalStorage } from "@/lib/use-local-storage";
import DateRangeSelector from "@/components/date-range-selector";
import TimeRangeSelector from "@/components/time-range-selector";
import ParkSelector from "@/components/park-selector";
import UnifiedView from "@/components/unified-view";

function todayString(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function getDaysInRange(start: string, count: number): { dateStr: string; date: Date }[] {
  const days: { dateStr: string; date: Date }[] = [];
  for (let i = 0; i < count; i++) {
    const ds = addDays(start, i);
    days.push({ dateStr: ds, date: new Date(ds + "T00:00:00") });
  }
  return days;
}

async function fetchJson(url: string, body: unknown): Promise<Record<string, unknown[]>> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

function groupByDay<T extends { StartTimeISO8601: string }>(
  raw: Record<string, T[]>,
  days: { dateStr: string }[]
): Record<string, Record<number, T[]>> {
  const grouped: Record<string, Record<number, T[]>> = {};
  for (const { dateStr } of days) {
    const dayData: Record<number, T[]> = {};
    for (const [idStr, items] of Object.entries(raw)) {
      dayData[Number(idStr)] = items.filter(
        (item) => item.StartTimeISO8601.slice(0, 10) === dateStr
      );
    }
    grouped[dateStr] = dayData;
  }
  return grouped;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlPark = searchParams.get("park");
  const urlStart = searchParams.get("start");
  const urlDays = searchParams.get("days");
  const urlFrom = searchParams.get("from");
  const urlTo = searchParams.get("to");

  const [startDate, setStartDate] = useState(urlStart || todayString);
  const [rangeDays, setRangeDays] = useState(urlDays ? Number(urlDays) : 7);
  const [selectedPark, setSelectedPark] = useLocalStorage<string | null>("pickle-selected-park", urlPark || null);
  const [viewStart, setViewStart] = useLocalStorage("pickle-view-start", urlFrom ? Number(urlFrom) * 60 : 12 * 60);
  const [viewEnd, setViewEnd] = useLocalStorage("pickle-view-end", urlTo ? Number(urlTo) * 60 : 22 * 60);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [eventsByDay, setEventsByDay] = useState<Record<string, Record<number, CalendarEvent[]>> | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedPark) params.set("park", selectedPark);
    if (startDate !== todayString()) params.set("start", startDate);
    if (rangeDays !== 7) params.set("days", String(rangeDays));
    params.set("from", String(viewStart / 60));
    params.set("to", String(viewEnd / 60));
    const qs = params.toString();
    const url = qs ? `?${qs}` : "/";
    router.replace(url, { scroll: false });
  }, [selectedPark, startDate, rangeDays, viewStart, viewEnd, router]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const fetchData = useCallback(async () => {
    const id = ++fetchIdRef.current;
    const endDate = addDays(startDate, rangeDays - 1);
    const facilityIds = courts.map((c) => c.id);

    try {
      const eventsRaw = await fetchJson("/api/calendar", { facilityIds, startDate, endDate });

      if (id !== fetchIdRef.current) return;

      const days = getDaysInRange(startDate, rangeDays);
      setEventsByDay(groupByDay(eventsRaw as Record<string, CalendarEvent[]>, days));
      setLastRefreshed(new Date());
    } catch {}
  }, [startDate, rangeDays]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleParkChange = useCallback((park: string | null) => {
    setSelectedPark(park);
  }, [setSelectedPark]);

  const handleStartDateChange = useCallback((d: string) => {
    setStartDate(d);
  }, []);

  const handleRangeDaysChange = useCallback((n: number) => {
    setRangeDays(n);
  }, []);

  const handleTimeRangeChange = useCallback((from: number, to: number) => {
    setViewStart(from * 60);
    setViewEnd(to * 60);
  }, [setViewStart, setViewEnd]);

  const days = getDaysInRange(startDate, rangeDays);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Pickles</h1>
          <a
            href="https://github.com/awitkowski0/pickles"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            GitHub
          </a>
        </div>
        <ParkSelector selected={selectedPark} onChange={handleParkChange} />
      </div>
      <DateRangeSelector
        startDate={startDate}
        rangeDays={rangeDays}
        onStartDateChange={handleStartDateChange}
        onRangeDaysChange={handleRangeDaysChange}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TimeRangeSelector
          fromHour={viewStart / 60}
          toHour={viewEnd / 60}
          onChange={handleTimeRangeChange}
        />
        <div className="flex flex-wrap gap-2 text-[10px] text-zinc-400">
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-green-400" /> Free</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-amber-400" /> Open</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-zinc-700" /> Booked</span>
          <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-purple-400" /> Event</span>
        </div>
      </div>
      {lastRefreshed && (
        <p className="text-[10px] text-zinc-400 tabular-nums text-right">
          Refreshed {formatTime(lastRefreshed)}
        </p>
      )}
      {!eventsByDay ? (
        <p className="text-sm text-zinc-400 animate-pulse">Loading...</p>
      ) : (
        <UnifiedView
          eventsByDay={eventsByDay}
          days={days}
          selectedPark={selectedPark}
          userPosition={userPosition}
          viewStart={viewStart}
          viewEnd={viewEnd}
        />
      )}
    </div>
  );
}
