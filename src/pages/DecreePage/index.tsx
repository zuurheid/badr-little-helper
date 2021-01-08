import React, { useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import s from "./DecreePage.module.scss";
import ControlPanel, {
  controlPanelStatus,
} from "../../components/ControlPanel";
import StatsDisplay from "../../components/StatsDisplay";

const DecreePage = () => {
  let [controlPanelState, setControlPanelState] = useState<controlPanelStatus>(
    controlPanelStatus.Ready
  );
  let [files, setFiles] = useState<File[] | null>(null);

  useEffect(() => {
    if (files != null) {
      setControlPanelState(controlPanelStatus.Loading);
      return;
    }
    setControlPanelState(controlPanelStatus.Ready);
  }, [files]);

  const onStatsDisplayDone = (e: Error | null) => {
    if (e == null) {
      setControlPanelState(controlPanelStatus.Done);
      return;
    }
    console.log(e);
    setControlPanelState(controlPanelStatus.Ready);
  };

  const onParse = (files: File[] | null) => {
    setFiles(files);
  };

  const onReset = () => {
    setFiles(null);
  };

  return (
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
  );
};

export default DecreePage;
