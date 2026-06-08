import type { CalendarEvent, SlotItem } from "./types";

const TZ_OFFSET = 0;

export const DAY_START = 5 * 60;
export const DAY_END = 22 * 60;

export function utcToLocalMinutes(iso: string): number {
  const d = new Date(iso);
  const m = d.getUTCHours() * 60 + d.getUTCMinutes() - TZ_OFFSET;
  return ((m % 1440) + 1440) % 1440;
}

function localToUtcMinutes(localMin: number): number {
  return ((localMin + TZ_OFFSET) % 1440 + 1440) % 1440;
}

export function isoToDisplay(iso: string): string {
  const d = new Date(iso);
  let m = d.getUTCHours() * 60 + d.getUTCMinutes() - TZ_OFFSET;
  m = ((m % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const min = m % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const disp = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${disp}:${String(min).padStart(2, "0")} ${ampm}`;
}

function minutesToDisplay(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const disp = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${disp}:${String(m).padStart(2, "0")} ${ampm}`;
}

function makeSlot(kind: SlotItem["kind"], label: string, startMin: number, endMin: number, dateStr: string): SlotItem {
  const us = localToUtcMinutes(startMin);
  const ue = localToUtcMinutes(endMin);
  const startISO = `${dateStr}T${String(Math.floor(us / 60)).padStart(2, "0")}:${String(us % 60).padStart(2, "0")}:00Z`;
  const endISO = `${dateStr}T${String(Math.floor(ue / 60)).padStart(2, "0")}:${String(ue % 60).padStart(2, "0")}:00Z`;
  return {
    kind,
    label,
    startTimeISO: startISO,
    endTimeISO: endISO,
    startTimeDisplay: minutesToDisplay(startMin),
    endTimeDisplay: minutesToDisplay(endMin),
  };
}

export function eventsToSlotItems(events: CalendarEvent[], dateStr: string): SlotItem[] {
  const items: SlotItem[] = [];

  for (const ev of events) {
    let kind: SlotItem["kind"];
    let label: string;

    if (ev.EventName === "Open Play Pickleball") {
      kind = "open-play";
      label = `Open Play ${isoToDisplay(ev.StartTimeISO8601)} – ${isoToDisplay(ev.EndTimeISO8601)}`;
    } else if (ev.EventName === "** RESERVED **") {
      kind = "reserved";
      label = `Reserved ${isoToDisplay(ev.StartTimeISO8601)} – ${isoToDisplay(ev.EndTimeISO8601)}`;
    } else {
      kind = "event";
      label = `${ev.EventName} ${isoToDisplay(ev.StartTimeISO8601)} – ${isoToDisplay(ev.EndTimeISO8601)}`;
    }

    items.push(makeSlot(kind, label, utcToLocalMinutes(ev.StartTimeISO8601), utcToLocalMinutes(ev.EndTimeISO8601), dateStr));
  }

  return items.sort((a, b) => a.startTimeISO.localeCompare(b.startTimeISO));
}

export function mergeItems(items: SlotItem[]): SlotItem[] {
  if (items.length === 0) return [];

  const sorted = [...items].sort((a, b) => a.startTimeISO.localeCompare(b.startTimeISO));
  const merged: SlotItem[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const cur = sorted[i];

    if (
      last.kind === cur.kind &&
      last.endTimeISO === cur.startTimeISO
    ) {
      if (last.kind === "free") {
        last.label = `${last.startTimeDisplay} – ${cur.endTimeDisplay}`;
      } else {
        const prefix = last.label.split(" ")[0];
        last.label = `${prefix} ${last.startTimeDisplay} – ${cur.endTimeDisplay}`;
      }
      last.endTimeISO = cur.endTimeISO;
      last.endTimeDisplay = cur.endTimeDisplay;
    } else {
      merged.push(cur);
    }
  }

  return merged;
}

export function computeFreeSlots(items: SlotItem[], dateStr: string): SlotItem[] {
  const occupied = items
    .filter((i) => i.kind !== "free")
    .sort((a, b) => a.startTimeISO.localeCompare(b.startTimeISO));

  const free: SlotItem[] = [];
  let cursor = DAY_START;

  for (const occ of occupied) {
    const start = utcToLocalMinutes(occ.startTimeISO);
    const end = utcToLocalMinutes(occ.endTimeISO);

    if (cursor < start) {
      const freeEnd = Math.min(start, DAY_END);
      free.push(makeSlot("free", `${minutesToDisplay(cursor)} – ${minutesToDisplay(freeEnd)}`, cursor, freeEnd, dateStr));
    }
    cursor = Math.max(cursor, end);
  }

  if (cursor < DAY_END) {
    free.push(makeSlot("free", `${minutesToDisplay(cursor)} – ${minutesToDisplay(DAY_END)}`, cursor, DAY_END, dateStr));
  }

  return free;
}
