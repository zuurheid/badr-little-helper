import { getDocument } from "pdfjs-dist";
import { getDepartmentName } from "./departments";

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

export interface totalDeptStats {
  department: department;
  count: number;
}

export interface decreesStats {
  decrees: ParsedDecree[];
  totalEntries: number;
  totalMinistryNumberStats: [string, number][];
  totalDepartmentsStats: totalDeptStats[];
}

export async function PrepareStats(
  decrees: ParsedDecree[]
): Promise<decreesStats> {
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

function calculateTotalMinistryNumberStats(
  decrees: ParsedDecree[]
): [string, number][] {
  let m = new Map<string, number>();
  decrees.forEach((d) => {
    d.ministryNumberStats.forEach((s) => {
      if (!m.has(s.mn)) {
        m.set(s.mn, 0);
      }
      m.set(s.mn, m.get(s.mn)! + s.entriesKeys.length);
    });
  });
  return Array.from(m.entries());
}

function calculateTotalDepartmentsStats(
  decrees: ParsedDecree[]
): totalDeptStats[] {
  let m = new Map<string, totalDeptStats>();
  decrees.forEach((d) => {
    d.departmentsStats.forEach((s) => {
      if (!m.has(s.dept.idx)) {
        m.set(s.dept.idx, {
          count: 0,
          department: {
            idx: s.dept.idx,
            name: s.dept.name,
          },
        });
      }
      let prevDeptState = m.get(s.dept.idx)!;
      m.set(s.dept.idx, {
        ...prevDeptState,
        count: prevDeptState.count + s.entriesKeys.length,
      });
    });
  });
  return Array.from(m.values());
}

export interface ParsedDecree {
  number: string;
  date: Date | null;
  departmentsStats: departmentStats[];
  ministryNumberStats: ministryNumberStats[];
  entries: entry[];
}

export async function ReadFile(f: File): Promise<ParsedDecree[]> {
  let contents = await readPDF(f);
  let doc = await getDocument(contents).promise;
  let docText = await getText(doc);
  let decreesTexts = extractDecreesTexts(docText);
  return decreesTexts.map((t) => processDecreeText(t));
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

function getDecreeNumber(entries: entry[]): string {
  if (entries.length === 0) {
    console.log(
      "[WARN]: no entries found in the decree text, so no decree number was extracted"
    );
    return "-1";
  }
  return entries[0].dt.DecreeID;
}

export interface ministryNumberStats {
  mn: string;
  entriesKeys: number[];
}

// TODO: refactor and group with groupByDept
function groupByMinistryNumber(entries: entry[]): ministryNumberStats[] {
  let result = entries.reduce((acc: Map<string, entry[]>, e) => {
    let mn = `${e.ministryNumber.year}X${e.ministryNumber.series}`;
    if (!acc.has(mn)) {
      acc.set(mn, []);
    }
    acc.get(mn)!.push(e);
    return acc;
  }, new Map<string, entry[]>());
  let mapEntries: ministryNumberStats[] = [];
  for (let [mn, entries] of result.entries()) {
    mapEntries.push({ mn, entriesKeys: entries.map((e) => e.key) });
  }
  return mapEntries;
}

interface department {
  name: string;
  idx: string;
}

interface departmentStats {
  dept: department;
  entriesKeys: number[];
}

function groupByDept(entries: entry[]): departmentStats[] {
  let result = entries.reduce((acc: Map<string, [department, entry[]]>, e) => {
    if (!acc.has(e.department.idx)) {
      acc.set(e.department.idx, [e.department, []]);
    }
    acc.get(e.department.idx)![1].push(e);
    return acc;
  }, new Map<string, [department, entry[]]>());
  let mapEntries: departmentStats[] = [];
  for (let [dept, entries] of result.values()) {
    mapEntries.push({
      dept,
      entriesKeys: entries.map((e) => e.key),
    });
  }
  mapEntries.sort((a, b) => b.entriesKeys.length - a.entriesKeys.length);
  return mapEntries;
}

async function getText(doc: any): Promise<string> {
  let pages = [];
  for (let i = 1; i < doc.numPages; i++) {
    let p = await doc.getPage(i);
    let tc = await p.getTextContent();
    let pageText = tc.items.map((s: any) => s.str).join(" ");
    pages.push(pageText);
  }
  return pages.join(" ").replace(/  +/g, " ");
}

const decreePreambleRe = /Décret du \d{1,2} (janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre) \d{4} portant naturalisation, réintégration, mention d’enfants mineurs bénéficiant de l’effet collectif attaché à l’acquisition de la nationalité française par leurs parents/g;
const decreeEndPositionRe = /Fait le/g;
function extractDecreesTexts(docText: string): string[] {
  docText = removeSummaryPage(docText);
  let reResult: RegExpExecArray | null;
  let preambleIndexes: number[] = [];
  while ((reResult = decreePreambleRe.exec(docText)) != null) {
    preambleIndexes.push(reResult.index);
  }
  decreePreambleRe.lastIndex = 0;
  if (preambleIndexes.length == 0) {
    console.log("[WARN]: no decree preamble found");
    return [docText];
  }
  let decreesEndPositions: number[] = [];
  while ((reResult = decreeEndPositionRe.exec(docText)) != null) {
    decreesEndPositions.push(reResult.index);
  }
  decreeEndPositionRe.lastIndex = 0;
  if (decreesEndPositions.length == 0) {
    console.log("[WARN]: no decree ending found");
    return [docText];
  }
  let decreeIntervals: number[][] = [];
  for (const pIdx of preambleIndexes) {
    for (const eIdx of decreesEndPositions) {
      if (eIdx > pIdx) {
        decreeIntervals.push([pIdx, eIdx]);
        break;
      }
    }
  }
  if (decreeIntervals.length != preambleIndexes.length) {
    console.log(
      `[WARN]: number of found decree intervals (${decreeIntervals.length}) does not correspond to the number of found decrees preambles (${preambleIndexes.length})`
    );
    return [docText];
  }
  if (
    decreeIntervals.reduce((errorOccurred, _, idx, intervals) => {
      if (errorOccurred || idx === intervals.length - 1) {
        return errorOccurred;
      }
      return intervals[idx][1] > intervals[idx + 1][0];
    }, false)
  ) {
    console.log(`[WARN]: found intervals overlap`);
    return [docText];
  }
  return decreeIntervals.map((interval) =>
    docText.substr(interval[0], interval[1] - interval[0])
  );
}

const naturalisationSectionRe = /Naturalisations et réintégrations/g;
function removeSummaryPage(docText: string): string {
  let result: RegExpExecArray | null;
  let indexes: number[] = [];
  while ((result = naturalisationSectionRe.exec(docText)) != null) {
    indexes.push(result.index);
  }
  naturalisationSectionRe.lastIndex = 0;
  if (indexes.length < 2) {
    console.log(
      `[WARN]: only ${indexes.length} naturalisation section was found on the page`
    );
    return docText;
  }
  return docText.substr(indexes[1]);
}

export enum entryType {
  NAT = 1,
  EFF,
  REI,
  LIB,
  UNKNOWN,
}

interface entryName {
  firstNames: string[];
  lastName: string;
}

interface entryMinisterNumber {
  year: string;
  series: string;
  idx: string;
}

interface entry {
  key: number;
  name: entryName;
  birthData: birthData;
  sex: sexType;
  type: entryType;
  ministryNumber: entryMinisterNumber;
  department: department;
  dt: entryID;
  rest: string;
}

const entryRe = /(Mc|\p{Lu})(\p{Lu}| |-|’)*?\(.*?\).*?née?.*?(NAT|EFF|REI|LIB).*?dép.*?Dt\..*?\./gu;
function parseText(text: string): entry[] {
  text = text.replace("JOURNAL OFFICIEL DE LA RÉPUBLIQUE FRANÇAISE", "");
  text = extractPartOfDecreeWithEntries(text);
  let matches = text.match(entryRe);
  if (matches == null) {
    throw new Error("failed to extract entries");
  }
  return extractEntries(matches);
}

function extractEntries(matches: RegExpMatchArray): entry[] {
  function notEmpty(e: entry | null): e is entry {
    return e != null;
  }
  let counter = 0;
  return matches
    .map((e, idx) => {
      let entry = extractEntry(e, idx);
      if (counter < 10) {
        console.log("matched entry: ", e);
        console.log(entry);
        counter++;
      }
      return entry;
    })
    .filter(notEmpty);
}

const decreeFieldRe = /Dt\. \d{3}\/\d*./g;
function extractPartOfDecreeWithEntries(text: string): string {
  let lastMatchInd = -1;
  for (;;) {
    const match = decreeFieldRe.exec(text);
    if (match == null) {
      break;
    }
    lastMatchInd = match.index;
  }
  if (lastMatchInd === -1) {
    throw new Error(
      'the passed file does not look like decree: no "Dt. XXX/X" found in the text'
    );
  }
  const safetyPaddingPos = lastMatchInd + 50;
  if (text.length <= safetyPaddingPos) {
    return text;
  }
  return text.substr(0, safetyPaddingPos);
}

function extractEntry(s: string, idx: number): entry | null {
  try {
    let fields = extractEntryFields(s);
    return {
      key: idx,
      name: getEntryName(fields.name),
      birthData: fields.birthDatePlaceData.birthData,
      sex: fields.birthDatePlaceData.sex,
      type: strToEntryType(fields.entryT),
      ministryNumber: parseMinistryNumber(fields.ministryNumber),
      department: extractDepartment(fields.depNum),
      dt: extractEntryID(fields.entryIdx),
      rest: fields.rest,
    };
  } catch (e) {
    console.log(`[WARN]: failed to process the entry ${s}: ${e}`);
    return null;
  }
}

const entryNameRe = /(Mc|\p{Lu})(\p{Lu}| |-|’)*?\(.*?\)/gu;
//const entryBirthDatePlaceRe = /née?.*?\d{2}\/\d{2}\/\d{4}(\p{L}|\(|\)| )*/gu;
const entryTypeRe = /NAT|EFF|REI|LIB/gu;
const ministryNumberRe = /\d{4}X \d{6}/g;
const depNumRe = /dép\. (\d{2,3}|02A|02B)/g;
const entryIdxRe = /Dt\. \d*\/\d*/g;
function extractEntryFields(
  s: string
): {
  name: string;
  birthDatePlaceData: parsedBirthDatePlaceStr;
  entryT: string;
  ministryNumber: string;
  depNum: string;
  entryIdx: string;
  rest: string;
} {
  let sCopy = s;
  let { match: name, index: nameIndex } = extractEntryField(
    sCopy,
    entryNameRe,
    "name"
  );
  sCopy = sCopy.substr(nameIndex + name.length);
  let { match: entryIdx, index: entryIdxIndex } = extractEntryField(
    sCopy,
    entryIdxRe,
    "entryIdx"
  );
  let rest = sCopy.substr(entryIdxIndex + entryIdx.length);
  if (rest === ".") {
    rest = "";
  }
  sCopy = sCopy.substr(0, entryIdxIndex);
  let { match: entryT, index: entryTIndex } = extractEntryField(
    sCopy,
    entryTypeRe,
    "entryType"
  );
  let birthDatePlaceStr = sCopy.substr(0, entryTIndex);
  sCopy = sCopy.substr(entryTIndex + entryT.length);
  let { match: ministryNumber, index: ministryNumberIndex } = extractEntryField(
    sCopy,
    ministryNumberRe,
    "ministryNum"
  );
  sCopy = sCopy.substr(ministryNumberIndex + ministryNumber.length);
  let { match: depNum, index: _ } = extractEntryField(
    sCopy,
    depNumRe,
    "depNum"
  );

  return {
    name,
    birthDatePlaceData: parseBirthDatePlaceStr(birthDatePlaceStr),
    entryT,
    ministryNumber,
    depNum,
    entryIdx,
    rest,
  };
}

function extractEntryField(
  s: string,
  re: RegExp,
  fieldName: string
): {
  match: string;
  index: number;
} {
  let reResult: RegExpExecArray | null;
  let result: { match: string; index: number } | null = null;
  while ((reResult = re.exec(s)) != null) {
    if (result != null) {
      throw new Error(`found ${reResult.length} fields "${fieldName}"`);
    }
    result = {
      match: reResult[0],
      index: reResult.index,
    };
  }
  re.lastIndex = 0;
  return result!;
}

interface birthData {
  date: string;
  place: birthPlace | null;
}

interface birthPlace {
  commune: string | null;
  country: string | null;
}

type sexType = "M" | "F";

interface parsedBirthDatePlaceStr {
  birthData: birthData;
  sex: sexType;
}

let birthDateRe = /\d{2}\/\d{2}\/\d{4}/g;
let sexIndicatorRe = /née?/g;
function parseBirthDatePlaceStr(s: string): parsedBirthDatePlaceStr {
  let { match: birthDate, index: birthDateIdx } = extractEntryField(
    s,
    birthDateRe,
    "birthDate"
  );
  let { match: sexIndicator } = extractEntryField(
    s.substr(0, birthDateIdx),
    sexIndicatorRe,
    "sexIndicator"
  );
  let sex: sexType = sexIndicator === "né" ? "M" : "F";
  return {
    birthData: {
      date: birthDate,
      place: extractBirthPlace(s.substr(birthDateIdx + birthDate.length)),
    },
    sex,
  };
}

function extractBirthPlace(s: string): birthPlace | null {
  let prefixPos = s.indexOf("à");
  if (prefixPos === -1) {
    console.log(`[WARN]: birth place prefix not found in "${s}"`);
    return null;
  }
  let sCopy = s.substr(prefixPos + 1);
  let openningParenthPos = sCopy.indexOf("(");
  let country: string | null = null;
  if (openningParenthPos === -1) {
    if (sCopy.trim().toLowerCase() === "monaco") {
      country = "Monaco";
    }
    console.log(`[WARN]: birth country not found in "${s}"`);
  } else {
    let closingParenthPos = sCopy.indexOf(")");
    if (closingParenthPos === -1) {
      console.log(`[WARN]: closing parenthesis not found in ${s}`);
      country = sCopy.substr(openningParenthPos + 1);
    } else {
      country = sCopy.substr(
        openningParenthPos + 1,
        closingParenthPos - openningParenthPos - 1
      );
      if (/^\d+$/.test(country)) {
        country = "France";
      }
    }
    sCopy = sCopy.substr(0, openningParenthPos);
  }
  country = country === "" ? null : country;
  let commune: string | null = sCopy.trim();
  if (commune === "") {
    console.log(`[WARN]: commune not found in ${s}`);
    commune = null;
  }
  return {
    country,
    commune,
  };
}

function getEntryName(name: string): entryName {
  let openParenthPos = name.indexOf("(");
  let firstNamesStr = name.substr(
    openParenthPos + 1,
    name.length - 2 - openParenthPos
  );
  let firstNames = firstNamesStr.split(",").map((n) => n.trim());
  return {
    lastName: name.substr(0, openParenthPos).trim(),
    firstNames,
  };
}

function strToEntryType(t: string): entryType {
  switch (t) {
    case "NAT":
      return entryType.NAT;
    case "EFF":
      return entryType.EFF;
    case "LIB":
      return entryType.LIB;
    case "REI":
      return entryType.REI;
    default:
      console.log(`[WARN]: an unknown entry type ${t} found`);
      return entryType.UNKNOWN;
  }
}

function extractDepartmentIdx(depStr: string): string {
  let dep = depStr
    .substr(depStr.indexOf(".") + 2)
    .trim()
    .toLowerCase();
  if (dep[0] === "0") {
    return dep.substr(1);
  }
  return dep;
}

interface entryID {
  DecreeID: string;
  ID: string;
}

function extractEntryID(entryIdx: string): entryID {
  const parts = entryIdx.substr(4).split("/");
  if (parts.length != 2) {
    throw new Error(
      `splitting the entry index ${entryIdx} produces ${parts.length} part(s) instead of 2`
    );
  }
  return {
    DecreeID: parts[0],
    ID: parts[1],
  };
}

function parseMinistryNumber(mn: string): entryMinisterNumber {
  mn = mn.trim();
  let sepIdx = mn.indexOf("X");
  if (sepIdx == -1) {
    throw new Error(`ministry number ${mn} does not contain an "X" separator`);
  }
  return {
    year: mn.substr(0, sepIdx),
    series: mn.substr(sepIdx + 2, 3),
    idx: mn.substr(sepIdx + 5),
  };
}

function extractDepartment(department: string): department {
  let idx = extractDepartmentIdx(department);
  return {
    idx,
    name: getDepartmentName(idx),
  };
}

interface dmyDate {
  day: number;
  month: number;
  year: number;
}

function getDecreeDate(text: string): Date | null {
  let decreeDateStr = extractDecreeDateStr(text);
  if (decreeDateStr === null) {
    return null;
  }
  let dateParts = decreeDateStr.split(" ");
  if (dateParts.length !== 3) {
    console.log(`[WARN]: parsed decree date does not have three parts`);
    return null;
  }
  let month = monthNameToNumber(dateParts[1]);
  if (month === null) {
    console.log(`[WARN]: unknown month ${dateParts[1]} found`);
    return null;
  }
  const day = convertDatePartToNumber(dateParts[0]);
  const year = convertDatePartToNumber(dateParts[2]);
  if (day === null || year === null) {
    return null;
  }
  return new Date(year, month, day);
}

const dateRe = /\d{1,2} (janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre) \d{4}/g;
function extractDecreeDateStr(text: string): string | null {
  let m = text.match(decreePreambleRe);
  if (m === null || m.length === 0) {
    console.log("[WARN]: decree preamble not found, so no date was extracted");
    return null;
  }
  if (m.length !== 1) {
    console.log(
      `[WARN]: ${m.length} decree preambles found during the decree date extraction`
    );
  }
  let date = m[0].match(dateRe);
  if (date == null || date.length === 0) {
    console.log("[WARN]: failed to extract a date from the decree preamble");
    return null;
  }
  if (date.length !== 1) {
    console.log(
      `[WARN]: ${date.length} dates found in the decree preamble during the decree date extraction`
    );
  }
  return date[0];
}

const frenchMonthsNames = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];
function monthNameToNumber(m: string): number | null {
  const mLower = m.toLowerCase();
  let idx = frenchMonthsNames.findIndex((name) => mLower === name);
  return idx === -1 ? null : idx;
}

function convertDatePartToNumber(p: string): number | null {
  if (!/^\d+$/.test(p)) {
    console.log(
      `[WARN]: date part to parse as number ${p} contains non-digit characters`
    );
    return null;
  }
  let n = parseInt(p, 10);
  if (isNaN(n)) {
    console.log(`[WARN]: faile to parse the date part ${p} as a number`);
    return null;
  }
  return n;
}
