import React from "react";
import { parseFile, DecreesStats, getDecreesStats } from "../engine/engine";

export enum parserStatus {
  Success = 1,
  Failure,
  Loading,
}

interface parserPartialData {
  status?: parserStatus;
  decreesStats?: DecreesStats;
  e?: Error;
}

export interface parserData {
  status: parserStatus;
  decreesStats?: DecreesStats;
  e?: Error;
}

const useParser = (files: File[]) => {
  const [data, setData] = React.useState<parserData>({
    status: parserStatus.Loading,
  });

  const setPartialData = (p: parserPartialData) => setData({ ...data, ...p });

  React.useEffect(() => {
    async function parseFiles() {
      let parsedDecrees = await Promise.all(
        files.map(async (f) => await parseFile(f))
      );
      let mergedDecrees = ([] as any[]).concat.apply([], parsedDecrees);
      return getDecreesStats(mergedDecrees);
    }

    parseFiles()
      .then((r) =>
        setPartialData({
          status: parserStatus.Success,
          decreesStats: r,
        })
      )
      .catch((e) => {
        setPartialData({
          status: parserStatus.Failure,
          e: e,
        });
      });
  }, []);
  return data;
};

export default useParser;
