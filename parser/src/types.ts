export interface Entry {
  raw: string;
  parsed: ParsedEntry;
}

export interface EntryName {
  firstNames: string[];
  lastName: string;
}

export interface BirthPlace {
  commune: string | null;
  country: string | null;
}

export interface BirthData {
  date: string;
  place: BirthPlace | null;
}

export type Sex = "M" | "F";

export enum EntryType {
  NAT = 1,
  EFF,
  REI,
  LIB,
  UNKNOWN,
}

export interface MinistryNumber {
  year: string;
  series: string;
  idx: string;
}

export interface DTNumber {
  DecreeID: string;
  ID: string;
}

export interface ParsedEntry {
  name: EntryName;
  birthData: BirthData;
  sex: Sex;
  type: EntryType;
  ministryNumber: MinistryNumber;
  department: string;
  dtNumber: DTNumber;
  rest: string;
}

export interface ParsedDecree {
  number: string;
  date: Date | null;
  entries: Entry[];
}
