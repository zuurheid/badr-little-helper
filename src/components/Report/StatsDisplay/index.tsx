import React, { useEffect, useState } from "react";
import useParser, { parserStatus } from "../../../hook/useParser";
import Report from "../index";

interface StatsDisplayProps {
  files: File[] | null;
  onDone: (e: Error | null) => void;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ files, onDone }) => {
  let [error, setError] = useState<Error | null>(null);

  if (files == null) {
    return <div>No data to show</div>;
  }

  let data = useParser(files);

  useEffect(() => {
    if (data.status === parserStatus.Loading) {
      return;
    }
    onDone(error);
  }, [data]);

  switch (data.status) {
    case parserStatus.Loading: {
      return <></>;
    }
    case parserStatus.Success: {
      if (data.decreesStats == null) {
        throw new Error("parsed decrees stats are null");
      }
      return <Report decreesStats={data.decreesStats} />;
    }
    case parserStatus.Failure: {
      setError(data.e!);
      return <></>;
    }
  }
};

export default StatsDisplay;
