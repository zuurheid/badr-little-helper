import { GlobalWorkerOptions, version, getDocument } from "pdfjs-dist";
import {
  ParsedDecree,
  Entry,
  EntryName,
  EntryType,
  MinistryNumber,
} from "./types";

export function init(pdfJSWorkerSrc?: ((version: string) => string) | string) {
  if (pdfJSWorkerSrc == null) {
    GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.js`;
    return;
  }
  if (typeof pdfJSWorkerSrc === "string") {
    GlobalWorkerOptions.workerSrc = pdfJSWorkerSrc;
    return;
  }
  GlobalWorkerOptions.workerSrc = pdfJSWorkerSrc(version);
}

export async function parseDecreeFile(f: Uint8Array): Promise<ParsedDecree[]> {
  let doc = await getDocument(f).promise;
  let docText = await getText(doc);
  let decreesTexts = extractDecreesTexts(docText);
  return decreesTexts.map((t) => processDecreeText(t));
}

/*
export async function parseDecreeFileLog(f: Uint8Array): Promise<ParsedDecree[]> {
  let doc = await getDocument(f).promise;
  let docText = await getText(doc);
  let expectedEntriesIDs = getExpectedEntriesIDs(docText);
  let decreesTexts = extractDecreesTexts(docText);
  let parsedDecrees = decreesTexts.map((t) => processDecreeText(t));
  const actualNumberOfEntries = parsedDecrees.reduce(
    (acc, currEl) => acc + currEl.entries.length,
    0
  );
  console.log(
    `expected number of entries: ${
      expectedEntriesIDs.length
    }, actual number of entries: ${actualNumberOfEntries} (${parsedDecrees
      .map((d) => d.number)
      .join(", ")})`
  );
  if (expectedEntriesIDs.length != actualNumberOfEntries) {
    checkNotFoundEntries(parsedDecrees, expectedEntriesIDs);
  }
  return parsedDecrees;
}


function getExpectedEntriesIDs(docText: string): entryID[] {
  let matches = docText.match(entryIdxRe);
  if (matches == null) {
    return [];
  }
  return matches.map((m) => extractEntryID(m));
}

function checkNotFoundEntries(decrees: ParsedDecree[], expectedIDs: entryID[]) {
  let actualEntriesIDs = new Map<string, number>();
  decrees.forEach((d) => {
    d.entries.forEach((e) => {
      const id = `${e.parsed.dtNumber.DecreeID}/${e.parsed.dtNumber.ID}`;
      if (!actualEntriesIDs.has(id)) {
        actualEntriesIDs.set(id, 0);
      }
      actualEntriesIDs.set(id, actualEntriesIDs.get(id)! + 1);
    });
  });
  let expectedEntriesIDs = new Map<string, number>();
  expectedIDs.forEach((entryID) => {
    const id = `${entryID.DecreeID}/${entryID.ID}`;
    if (!expectedEntriesIDs.has(id)) {
      expectedEntriesIDs.set(id, 0);
    }
    expectedEntriesIDs.set(id, expectedEntriesIDs.get(id)! + 1);
  });
  actualEntriesIDs.forEach((actualCount, actualID) => {
    if (!expectedEntriesIDs.has(actualID)) {
      console.log(
        `[CHECK]: actual id ${actualID} not found among expected IDs`
      );
      return;
    }
    let expectedCount = expectedEntriesIDs.get(actualID);
    if (expectedCount !== actualCount) {
      console.log(
        `[CHECK]: id ${actualID}: expected count ${expectedCount}, got ${actualCount}`
      );
      return;
    }
  });
  expectedEntriesIDs.forEach((_, expectedID) => {
    if (!actualEntriesIDs.has(expectedID)) {
      console.log(
        `[CHECK]: expected id ${expectedID} not found among actual IDs`
      );
      return;
    }
  });
}
*/

async function getText(doc: any): Promise<string> {
  let pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    let p = await doc.getPage(i);
    let tc = await p.getTextContent();
    let pageText = tc.items.map((s: any) => s.str).join(" ");
    pages.push(pageText);
  }
  return pages.join(" ").replace(/  +/g, " ");
}

const decreePreambleRe = /Décret du \d{1,2} (janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre) \d{4} portant naturalisation, réintégration, mention d’enfants mineurs bénéficiant de l’effet collectif attaché à l’acquisition de la nationalité française par leurs parents/g;
const decreeEndSuffix = "Fait le";
const decreeEndPositionRe = new RegExp(decreeEndSuffix, "g");
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
    decreesEndPositions.push(reResult.index + decreeEndSuffix.length);
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

function processDecreeText(t: string): ParsedDecree {
  let date = getDecreeDate(t);
  let entries = parseText(t);
  return {
    date: date,
    number: getDecreeNumber(entries),
    entries: entries,
  };
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
    console.log(`[WARN]: failed to parse the date part ${p} as a number`);
    return null;
  }
  return n;
}

const entryRe = /(Mc|\p{Lu})(\p{Lu}| |-|’|\.)*?\(.*?\).*?née?.*?(NAT|EFF|REI|LIB).*?dép.*?Dt\..*?\./gu;
function parseText(text: string): Entry[] {
  text = text.replace("JOURNAL OFFICIEL DE LA RÉPUBLIQUE FRANÇAISE", "");
  text = extractPartOfDecreeWithEntries(text);
  let matches = text.match(entryRe);
  if (matches == null) {
    throw new Error("failed to extract entries");
  }
  return extractEntries(matches);
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
  let nextFindOfPos =
    text.indexOf(decreeEndSuffix, lastMatchInd) - lastMatchInd;
  nextFindOfPos = nextFindOfPos != -1 ? nextFindOfPos : 250;
  const safetyPaddingPos = lastMatchInd + nextFindOfPos;
  if (text.length <= safetyPaddingPos) {
    return text;
  }
  return text.substr(0, safetyPaddingPos);
}

function extractEntries(matches: RegExpMatchArray): Entry[] {
  function notEmpty(e: Entry | null): e is Entry {
    return e != null;
  }
  return matches.map((e) => extractEntry(e)).filter(notEmpty);
}

function extractEntry(s: string): Entry | null {
  try {
    let fields = extractEntryFields(s);
    return {
      raw: s,
      parsed: {
        name: getEntryName(fields.name),
        birthData: fields.birthDatePlaceData.birthData,
        sex: fields.birthDatePlaceData.sex,
        type: strToEntryType(fields.entryT),
        ministryNumber: parseMinistryNumber(fields.ministryNumber),
        department: extractDepartment(fields.depNum),
        dtNumber: extractEntryID(fields.entryIdx),
        rest: fields.rest,
      },
    };
  } catch (e) {
    console.log(`[WARN]: failed to process the entry ${s}: ${e}`);
    return null;
  }
}

const entryNameRe = /(Mc|\p{Lu})(\p{Lu}| |-|’|\.)*?\(.*?\)/gu;
const entryTypeRe = /NAT|EFF|REI|LIB/gu;
const ministryNumberRe = /\d{4}X \d{6}/g;
const depNumRe = /dép\. (02[AB]|\d{2,3})/g;
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
  let nameParenthPos = s.indexOf(")");
  let name = "";
  let nameIndex = 0;
  if (nameParenthPos === -1) {
    console.log("[WARN]: name parenthesis not found, name cannot be extracted");
  } else {
    let { match, index } = extractEntryField(
      s.substr(0, nameParenthPos + 1),
      entryNameRe,
      "name"
    );
    name = match;
    nameIndex = index;
  }
  s = s.substr(nameIndex + name.length);
  let { match: entryIdx, index: entryIdxIndex } = extractEntryField(
    s,
    entryIdxRe,
    "entryIdx"
  );
  let rest = s.substr(entryIdxIndex + entryIdx.length);
  if (rest === ".") {
    rest = "";
  }
  s = s.substr(0, entryIdxIndex);
  let { match: entryT, index: entryTIndex } = extractEntryField(
    s,
    entryTypeRe,
    "entryType"
  );
  let birthDatePlaceStr = s.substr(0, entryTIndex);
  s = s.substr(entryTIndex + entryT.length);
  let { match: ministryNumber, index: ministryNumberIndex } = extractEntryField(
    s,
    ministryNumberRe,
    "ministryNum"
  );
  s = s.substr(ministryNumberIndex + ministryNumber.length);
  let { match: depNum, index: _ } = extractEntryField(s, depNumRe, "depNum");
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
  let inLP = false;
  if (s.indexOf("auvallois-Perret") !== -1) {
    inLP = true;
  }
  if (inLP) {
    console.log(s);
  }
  // trim and remove leading and trailing commas
  s = s.trim().replace(/(^,)|(,$)/g, "");
  if (inLP) {
    console.log(s);
  }
  let [communeArticle, posAfterPrefix] = findEndOfBirthplacePrefix(s);
  if (posAfterPrefix === 0) {
    console.log(`[WARN]: birth place prefix not found in "${s}"`);
    return null;
  }
  let sCopy = s.substr(posAfterPrefix);
  let openningParenthPos = sCopy.indexOf("(");
  let country: string | null = null;
  if (openningParenthPos === -1) {
    if (sCopy.trim().toLowerCase() === "monaco") {
      country = "Monaco";
    } else {
      console.log(`[WARN]: birth country not found in "${s}"`);
    }
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

type communeArticle = "Le" | "La" | "Les" | "";

function findEndOfBirthplacePrefix(s: string): [communeArticle, number] {
  const possiblePrefixes: [string, communeArticle][] = [
    ["à ", ""],
    ["au ", "Le"],
    ["à la ", "La"],
    ["aux", "Les"],
  ];
  let prefixPos = 0;
  for (let i = 0; i < possiblePrefixes.length; i++) {
    let [prefix, article] = possiblePrefixes[i];
    if (s.length <= prefix.length) {
      continue;
    }
    if (s.substr(0, prefix.length) === prefix) {
      return [article, prefixPos + prefix.length];
    }
  }
  return ["", 0];
}

function getEntryName(name: string): EntryName {
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

function strToEntryType(t: string): EntryType {
  switch (t) {
    case "NAT":
      return EntryType.NAT;
    case "EFF":
      return EntryType.EFF;
    case "LIB":
      return EntryType.LIB;
    case "REI":
      return EntryType.REI;
    default:
      console.log(`[WARN]: an unknown entry type ${t} found`);
      return EntryType.UNKNOWN;
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

function parseMinistryNumber(mn: string): MinistryNumber {
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

function extractDepartment(department: string): string {
  return extractDepartmentIdx(department);
}

function getDecreeNumber(entries: Entry[]): string {
  if (entries.length === 0) {
    console.log(
      "[WARN]: no entries found in the decree text, so no decree number was extracted"
    );
    return "-1";
  }
  return entries[0].parsed.dtNumber.DecreeID;
}
