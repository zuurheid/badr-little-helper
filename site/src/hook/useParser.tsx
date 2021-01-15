import React from "react";
import { parseFile, DecreesStats, getDecreesStats } from "../engine/engine";

export enum parserStatus {
  Done = 1,
  Loading,
}

interface parserPartialData {
  status?: parserStatus;
  decreesStats?: DecreesStats | null;
  failedFiles?: string[];
}

export interface parserData {
  status: parserStatus;
  decreesStats?: DecreesStats | null;
  failedFiles?: string[];
}

const useParser = (files: File[]) => {
  const [data, setData] = React.useState<parserData>({
    status: parserStatus.Loading,
  });

  const setPartialData = (p: parserPartialData) => setData({ ...data, ...p });

  React.useEffect(() => {
    async function parseFiles() {
      let failedFiles: string[] = [];
      let parsedDecrees = (
        await Promise.all(
          files.map(async (f) => {
            try {
              return await parseFile(f);
            } catch (e) {
              failedFiles.push(f.name);
            }
          })
        )
      ).filter((el) => el != null);
      if (parsedDecrees.length === 0) {
        return {
          parsedDecrees: null,
          failedFiles,
        };
      }
      let mergedDecrees = ([] as any[]).concat.apply([], parsedDecrees);
      return {
        parsedDecrees: getDecreesStats(mergedDecrees),
        failedFiles,
      };
    }

    parseFiles().then((r) =>
      setPartialData({
        status: parserStatus.Done,
        decreesStats: r.parsedDecrees,
        failedFiles: r.failedFiles,
      })
    );
  }, []);
  return data;
};

export default useParser;
