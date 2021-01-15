import React, { useEffect, useState } from "react";
import useParser, { parserStatus } from "../../../hook/useParser";
import Report from "../index";

interface StatsDisplayProps {
  files: File[] | null;
  onDone: (failedFiles: string[], showReport: boolean) => void;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ files, onDone }) => {
  if (files == null) {
    return <div>No data to show</div>;
  }

  let data = useParser(files);

  useEffect(() => {
    if (data.status === parserStatus.Loading) {
      return;
    }
    onDone(data.failedFiles!, data.decreesStats != null);
  }, [data]);

  switch (data.status) {
    case parserStatus.Loading: {
      return <></>;
    }
    case parserStatus.Done: {
      if (data.decreesStats == null) {
        return <></>;
      }
      return <Report decreesStats={data.decreesStats} />;
    }
  }
};

export default StatsDisplay;
