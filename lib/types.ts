export interface CalendarEvent {
  OrganizationId: number;
  EventId: number;
  EventScheduleId: number | null;
  EventType: string;
  EventName: string;
  EventUrl: string | null;
  FacilityId: number;
  FacilityName: string;
  FacilityUrl: string | null;
  MemberId: number;
  MemberName: string;
  Description: string | null;
  IsPrivate: boolean;
  AllDay: boolean;
  StartTimeISO8601: string;
  EndTimeISO8601: string;
  ItemColor: string;
  FontColor: string;
  AllowPreCart: boolean;
  InPreCart: boolean;
  PreCartName: string | null;
}

export type SlotKind = "free" | "open-play" | "reserved" | "event";

export interface SlotItem {
  kind: SlotKind;
  label: string;
  startTimeISO: string;
  endTimeISO: string;
  startTimeDisplay: string;
  endTimeDisplay: string;
}

export interface Court {
  id: number;
  name: string;
  park: string;
  shortName: string;
}
