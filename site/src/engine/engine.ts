import {
  init as initParser,
  parseDecreeFile,
  ParsedDecree as ParsedDecreeLib,
  Entry,
  EntryType,
} from "@zuurheid/french-nat-decrees-parser";
import { getDepartmentName } from "./departments";

initParser();

export interface TotalMinistrySeries {
  ministrySeries: MinistrySeries;
  count: number;
}

export interface TotalDepartments {
  department: Department;
  count: number;
}

interface TotalStats {
  totalNaturalizationsCount: number;
  totalMinistrySeriesStats: TotalMinistrySeries[];
  totalDepartmentsStats: TotalDepartments[];
}

export interface DecreesStats {
  decrees: ParsedDecree[];
  totalStats: TotalStats;
}

interface ParsedDecree extends ParsedDecreeLib {
  naturalizationsCount: number;
  ministrySeriesStats: GroupStats<MinistrySeries>[];
  departmentsStats: GroupStats<Department>[];
}

export async function parseFile(f: File): Promise<ParsedDecree[]> {
  let contents = await readPDF(f);
  let baseParsedDecrees = await parseDecreeFile(contents);
  return baseParsedDecrees.map((d) => {
    let naturalised = d.entries.filter((e) => e.parsed.type !== EntryType.EFF);
    let pd: ParsedDecree = {
      ...d,
      naturalizationsCount: naturalised.length,
      ministrySeriesStats: groupByMinistryNumber(naturalised),
      departmentsStats: groupByDept(naturalised),
    };
    return pd;
  });
}

export function getDecreesStats(decrees: ParsedDecree[]): DecreesStats {
  return {
    decrees,
    totalStats: {
      totalNaturalizationsCount: decrees.reduce(
        (acc, currEl) => acc + currEl.naturalizationsCount,
        0
      ),
      totalMinistrySeriesStats: calculateTotalMinistrySeriesStats(decrees),
      totalDepartmentsStats: calculateTotalDepartmentsStats(decrees),
    },
  };
}

async function readPDF(f: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    try {
      let fr = new FileReader();
      fr.onload = () => {
        if (fr.result == null) {
          return reject(new Error("read document result is null"));
        }
        resolve(new Uint8Array(fr.result as ArrayBuffer));
      };

      fr.readAsArrayBuffer(f);
    } catch (e) {
      return reject(new Error("reading a PDF document failed: " + e));
    }
  });
}

// TODO: group with calculateTotalDepartmentsStats
function calculateTotalMinistrySeriesStats(
  decrees: ParsedDecree[]
): TotalMinistrySeries[] {
  let m = new Map<string, number>();
  decrees.forEach((d) => {
    d.ministrySeriesStats.forEach((s) => {
      let key = ministryNumberToString(s.group);
      if (!m.has(key)) {
        m.set(key, 0);
      }
      m.set(key, m.get(key)! + s.entries.length);
    });
  });
  return Array.from(m.entries()).map(
    ([ministrySeriesString, entriesCount]) => ({
      ministrySeries: ministryNumberFromString(ministrySeriesString),
      count: entriesCount,
    })
  );
}

function calculateTotalDepartmentsStats(
  decrees: ParsedDecree[]
): TotalDepartments[] {
  let m = new Map<
    string,
    {
      department: Department;
      count: number;
    }
  >();
  decrees.forEach((d) => {
    d.departmentsStats.forEach((s) => {
      if (!m.has(s.group.number)) {
        m.set(s.group.number, {
          count: 0,
          department: s.group,
        });
      }
      let prevDeptState = m.get(s.group.number)!;
      m.set(s.group.number, {
        ...prevDeptState,
        count: prevDeptState.count + s.entries.length,
      });
    });
  });
  return Array.from(m.values());
}

/*

export interface TotalDeptStats {
  department: Department;
  count: number;
}

export interface DecreesStats {
  decrees: ParsedDecree[];
  totalEntries: number;
  totalMinistryNumberStats: [string, number][];
  totalDepartmentsStats: TotalDeptStats[];
}

export async function prepareStats(
  decrees: ParsedDecree[]
): Promise<DecreesStats> {
  return {
    decrees,
    totalEntries: decrees.reduce(
      (acc, currEl) => acc + currEl.entries.length,
      0
    ),
    totalMinistryNumberStats: calculateTotalMinistryNumberStats(decrees),
    totalDepartmentsStats: calculateTotalDepartmentsStats(decrees),
  };
}




*/

const potentialEntryRe = /Dt\. \d*?\/\d*/g;

/*
function getExpectedEntriesIDs(t: string): string[] {
  let matches = t.match(potentialEntryRe);
  if (matches === null) {
    return [];
  }
  return matches;
}

function checkNotFoundEntries(decrees: ParsedDecree[], expectedIDs: string[]) {
  let decreesIDsMap = decrees
    .reduce((acc: string[], currEl) => {
      currEl.entries.forEach((e) =>
        acc.push(`Dt. ${e.dt.DecreeID}/${e.dt.ID}`)
      );
      return acc;
    }, [])
    .reduce((acc, id) => {
      if (!acc.has(id)) {
        acc.set(id, 0);
      }
      acc.set(id, acc.get(id)! + 1);
      return acc;
    }, new Map<string, number>());
  console.log("decrees IDs Map: ", decreesIDsMap);
  console.log("expected IDs Map: ", expectedIDs);
  let expectedIDsMap = expectedIDs.reduce((acc, id) => {
    if (!acc.has(id)) {
      acc.set(id, 0);
    }
    acc.set(id, acc.get(id)! + 1);
    return acc;
  }, new Map<string, number>());
  decreesIDsMap.forEach((v, k) => {
    if (!expectedIDsMap.has(k)) {
      console.log(`got an unexpected ID ${k} (${v})`);
      return;
    }
    if (expectedIDsMap.get(k) !== v) {
      console.log(`got ${v} IDs ${k}, expected ${v}`);
    }
  });
  expectedIDsMap.forEach((v, k) => {
    if (!decreesIDsMap.has(k)) {
      console.log(`did not get an expected ID ${k} (${v})`);
      return;
    }
  });
}

function processDecreeText(t: string): ParsedDecree {
  let date = getDecreeDate(t);
  let entries = parseText(t);
  let lastNames = entries.map((e) => {
    return {
      lastName: e.name.lastName,
      mn: `${e.ministryNumber.year}X ${e.ministryNumber.series}${e.ministryNumber.idx}`,
    };
  });
  lastNames.sort((a, b) =>
    a.lastName > b.lastName ? 1 : a.lastName < b.lastName ? -1 : 0
  );
  let naturalised = entries.filter((e) => e.type !== entryType.EFF);
  return {
    date: date,
    number: getDecreeNumber(entries),
    departmentsStats: groupByDept(naturalised),
    ministryNumberStats: groupByMinistryNumber(naturalised),
    entries: entries,
  };
}
*/

/*
function getDecreeNumber(entries: entry[]): string {
  if (entries.length === 0) {
    console.log(
      "[WARN]: no entries found in the decree text, so no decree number was extracted"
    );
    return "-1";
  }
  return entries[0].dt.DecreeID;
}
 */

interface GroupStats<T> {
  entries: Entry[];
  group: T;
}

// TODO: change to class for more efficient toString() and fromString()
export interface MinistrySeries {
  year: string;
  series: string;
}

function groupByMinistryNumber(entries: Entry[]): GroupStats<MinistrySeries>[] {
  return groupStatsBy<MinistrySeries>(
    entries,
    (e) => ministryNumberToString(e.parsed.ministryNumber),
    (mnStr) => ministryNumberFromString(mnStr)
  );
}

function ministryNumberToString(s: MinistrySeries): string {
  return `${s.year}X${s.series}`;
}

function ministryNumberFromString(s: string): MinistrySeries {
  let parts = s.split("X");
  return {
    year: parts[0],
    series: parts[1],
  };
}

interface Department {
  name: string;
  number: string;
}

function groupByDept(entries: Entry[]): GroupStats<Department>[] {
  return groupStatsBy<Department>(
    entries,
    (e) => e.parsed.department,
    (deptNumber) => ({
      number: deptNumber,
      name: getDepartmentName(deptNumber),
    })
  ).sort((a, b) => b.entries.length - a.entries.length);
}

function groupStatsBy<T>(
  entries: Entry[],
  getKey: (e: Entry) => string,
  createGroup: (s: string) => T
): GroupStats<T>[] {
  let result = entries.reduce((acc: Map<string, Entry[]>, e) => {
    let key = getKey(e);
    if (!acc.has(key)) {
      acc.set(key, []);
    }
    acc.get(key)!.push(e);
    return acc;
  }, new Map<string, Entry[]>());
  return Array.from(result.entries()).map(([key, entries]) => {
    return {
      entries,
      group: createGroup(key),
    };
  });
}
