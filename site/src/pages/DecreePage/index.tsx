import React, { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import s from "./DecreePage.module.scss";
import ControlPanel, {
  controlPanelStatus,
} from "../../components/ControlPanel";
import StatsDisplay from "../../components/Report/StatsDisplay";
import FailedParsingAlert from "../../components/FailedParsingAlert";

const DecreePage = () => {
  let [controlPanelState, setControlPanelState] = useState<controlPanelStatus>(
    controlPanelStatus.Ready
  );
  let [files, setFiles] = useState<File[] | null>(null);
  let [failedFiles, setFailedFiles] = useState<{
    files: string[];
    allFailed: boolean;
  } | null>(null);

  useEffect(() => {
    if (files != null) {
      setControlPanelState(controlPanelStatus.Loading);
      return;
    }
    setControlPanelState(controlPanelStatus.Ready);
  }, [files]);

  const onStatsDisplayDone = (failedFiles: string[], showReport: boolean) => {
    setFailedFiles({
      files: failedFiles,
      allFailed: files !== null && failedFiles.length === files.length,
    });
    if (!showReport) {
      setFiles(null);
      return;
    }
    setControlPanelState(controlPanelStatus.Done);
    return;
  };

  const onParse = (files: File[] | null) => {
    setFiles(files);
  };

  const onReset = () => {
    setFiles(null);
  };

  return (
    <>
      <Grid container>
        <Grid item xs={1} />
        <Grid item xs={10}>
          <div className={s.controlPanelBlock}>
            <ControlPanel
              onParse={onParse}
              status={controlPanelState}
              onReset={onReset}
            />
          </div>
        </Grid>
        {files != null && (
          <>
            <Grid item xs={1} />
            <Grid item xs={1} />
            <Grid item xs={10}>
              <div className={s.report}>
                <StatsDisplay files={files} onDone={onStatsDisplayDone} />
              </div>
            </Grid>
            <Grid item xs={1} />
          </>
        )}
      </Grid>
      {failedFiles != null && (
        <FailedParsingAlert
          failedFiles={failedFiles.files}
          allFailed={failedFiles.allFailed}
          severity={failedFiles.allFailed ? "error" : "warning"}
        />
      )}
    </>
  );
};

export default DecreePage;
