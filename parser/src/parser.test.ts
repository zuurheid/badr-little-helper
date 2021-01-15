import { Entry } from "./types";

var rewire = require("rewire");
let parserRewired = rewire("../lib/parser");

test("checks extractEntry function", () => {
  const extractEntry = parserRewired.__get__("extractEntry") as (
    s: string
  ) => Entry | null;
  let entry = extractEntry("");
  console.log(entry);
  expect(entry).toBeNull();
});
