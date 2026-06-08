function toMdy(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

export async function fetchCalendarEvents(
  facilityId: number,
  startDate: string,
  endDate: string
): Promise<unknown[]> {
  const body = {
    facilityId,
    startDate: toMdy(startDate),
    endDate: toMdy(endDate),
    getChildren: "false",
    SelectedView: "month",
    SelectedMonth: "",
    SelectedYear: "",
  };

  const res = await fetch(
    "https://pittsburgh.recdesk.com/Community/Calendar/GetCalendarItems",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json, text/javascript, */*; q=0.01",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    throw new Error(
      `RecDesk Calendar API error: ${res.status} for facility ${facilityId}`
    );
  }

  const json = await res.json();
  return json.Events || [];
}

export async function fetchCalendarBatch(
  facilityIds: number[],
  startDate: string,
  endDate: string
): Promise<Map<number, unknown[]>> {
  const results = await Promise.allSettled(
    facilityIds.map((id) => fetchCalendarEvents(id, startDate, endDate))
  );

  const map = new Map<number, unknown[]>();
  facilityIds.forEach((id, i) => {
    const result = results[i];
    if (result.status === "fulfilled") {
      map.set(id, result.value);
    } else {
      map.set(id, []);
    }
  });

  return map;
}
