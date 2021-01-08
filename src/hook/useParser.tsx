import React from "react";
import {
  ReadFile,
  PrepareStats,
  ParsedDecree,
  decreesStats,
} from "../engine/engine";

export enum parserStatus {
  Success = 1,
  Failure,
  Loading,
}

interface parserPartialData {
  status?: parserStatus;
  decreesStats?: decreesStats;
  e?: Error;
}

export interface parserData {
  status: parserStatus;
  decreesStats?: decreesStats;
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
        files.map(async (f) => await ReadFile(f))
      );
      let mergedDecrees = ([] as any[]).concat.apply([], parsedDecrees);
      return await PrepareStats(mergedDecrees);
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
