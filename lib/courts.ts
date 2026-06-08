import type { Court } from "./types";

export interface ParkInfo {
  name: string;
  addressLine1: string;
  cityStateZip: string;
  lat: number;
  lng: number;
}

export const parks: ParkInfo[] = [
  {
    name: "Schenley",
    addressLine1: "Forbes Ave & Schenley Drive",
    cityStateZip: "Pittsburgh, PA 15213",
    lat: 40.4401,
    lng: -79.9431,
  },
  {
    name: "Frick",
    addressLine1: "1981 Beechwood Boulevard",
    cityStateZip: "Pittsburgh, PA 15217",
    lat: 40.4363,
    lng: -79.9087,
  },
  {
    name: "Washington's Landing",
    addressLine1: "Herr's Island & Waterfront Drive",
    cityStateZip: "Pittsburgh, PA 15212",
    lat: 40.4603,
    lng: -79.983,
  },
  {
    name: "Allegheny Commons",
    addressLine1: "North & Cedar Avenues, Brighton Road",
    cityStateZip: "Pittsburgh, PA 15212",
    lat: 40.4537,
    lng: -80.0084,
  },
  {
    name: "Bud Hammer",
    addressLine1: "Bigelow & Bristol Streets",
    cityStateZip: "Pittsburgh, PA",
    lat: 40.4462,
    lng: -79.985,
  },
  {
    name: "Fineview",
    addressLine1: "Fineview Avenue & Myler Street",
    cityStateZip: "Pittsburgh, PA",
    lat: 40.4623,
    lng: -79.994,
  },
];

export const courts: Court[] = [
  { id: 266, name: "Schenley-Pickleball Court 1", shortName: "Court 1", park: "Schenley" },
  { id: 267, name: "Schenley-Pickleball Court 2", shortName: "Court 2", park: "Schenley" },
  { id: 268, name: "Schenley-Pickleball Court 3", shortName: "Court 3", park: "Schenley" },
  { id: 269, name: "Schenley-Pickleball Court 4", shortName: "Court 4", park: "Schenley" },
  { id: 281, name: "Frick-Pickleball Court 1", shortName: "Court 1", park: "Frick" },
  { id: 282, name: "Frick-Pickleball Court 2", shortName: "Court 2", park: "Frick" },
  { id: 283, name: "Frick-Pickleball Court 3", shortName: "Court 3", park: "Frick" },
  { id: 271, name: "Washington's Landing-Pickleball Court 1", shortName: "Court 1", park: "Washington's Landing" },
  { id: 272, name: "Washington's Landing-Pickleball Court 2", shortName: "Court 2", park: "Washington's Landing" },
  { id: 273, name: "Washington's Landing-Pickleball Court 3", shortName: "Court 3", park: "Washington's Landing" },
  { id: 274, name: "Washington's Landing-Pickleball Court 4", shortName: "Court 4", park: "Washington's Landing" },
  { id: 275, name: "Washington's Landing-Pickleball Court 5", shortName: "Court 5", park: "Washington's Landing" },
  { id: 276, name: "Washington's Landing-Pickleball Court 6", shortName: "Court 6", park: "Washington's Landing" },
  { id: 277, name: "Washington's Landing-Pickleball Court 7", shortName: "Court 7", park: "Washington's Landing" },
  { id: 278, name: "Washington's Landing-Pickleball Court 8", shortName: "Court 8", park: "Washington's Landing" },
  { id: 279, name: "Washington's Landing-Pickleball Court 9", shortName: "Court 9", park: "Washington's Landing" },
  { id: 280, name: "Washington's Landing-Pickleball Court 10", shortName: "Court 10", park: "Washington's Landing" },
  { id: 531, name: "Allegheny Commons Park EAST-Pickleball Court 1", shortName: "Court 1", park: "Allegheny Commons" },
  { id: 532, name: "Allegheny Commons Park EAST-Pickleball Court 2", shortName: "Court 2", park: "Allegheny Commons" },
  { id: 528, name: "Bud Hammer-Pickleball 1", shortName: "Court 1", park: "Bud Hammer" },
  { id: 529, name: "Bud Hammer-Pickleball 2", shortName: "Court 2", park: "Bud Hammer" },
  { id: 533, name: "Fineview Park-Pickleball Court 1", shortName: "Court 1", park: "Fineview" },
];

export function getParks(): string[] {
  return parks.map((p) => p.name);
}

export function getParkInfo(parkName: string): ParkInfo | undefined {
  return parks.find((p) => p.name === parkName);
}

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
