import { NextRequest, NextResponse } from "next/server";
import { fetchCalendarBatch } from "@/lib/recdesk";

export async function POST(request: NextRequest) {
  const { facilityIds, startDate, endDate } = await request.json();

  if (
    !Array.isArray(facilityIds) ||
    typeof startDate !== "string" ||
    typeof endDate !== "string"
  ) {
    return NextResponse.json(
      { error: "facilityIds (array), startDate (string), endDate (string) required" },
      { status: 400 }
    );
  }

  const map = await fetchCalendarBatch(facilityIds, startDate, endDate);

  const result: Record<number, unknown[]> = {};
  for (const [id, events] of map) {
    result[id] = events;
  }

  return NextResponse.json(result);
}
