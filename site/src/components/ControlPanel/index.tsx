import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Grid from "@material-ui/core/Grid";
import ButtonMUI from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import FileInput from "../FileInput";
import Button from "../Button";
import FilesList from "../FilesList";
import s from "./ControlPanel.module.scss";
import AddIcon from "@material-ui/icons/Add";

export enum controlPanelStatus {
  Loading = 1,
  Ready = 2,
  Done = 3,
}

interface controlPanelProps {
  onParse: (files: File[] | null) => void;
  onReset: () => void;
  status: controlPanelStatus;
}

export interface FileToParse {
  key: string;
  f: File;
}

const ControlPanel: React.FC<controlPanelProps> = ({
  onParse,
  onReset,
  status,
}) => {
  const { t } = useTranslation();
  let [files, setFiles] = useState<FileToParse[] | null>(null);

  const onChange = (files: FileList | null) => {
    if (files == null || files.length === 0) {
      setFiles(null);
      return;
    }

    setFiles((prevFiles) => {
      let newFiles: FileToParse[] = [];
      if (prevFiles !== null) {
        newFiles = [...prevFiles];
      }
      const generateRandStr = (l: number) => {
        let result = "";
        let alphabeth =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < l; i++) {
          result += alphabeth.charAt(
            Math.floor(Math.random() * alphabeth.length)
          );
        }
        return result;
      };
      const generateFileKey = (f: File) => {
        let date = new Date().getTime().toString();
        let nonce = generateRandStr(8);
        return `${f.name}_${date}_${nonce}`;
      };
      for (let f of files) {
        newFiles.push({
          f,
          key: generateFileKey(f),
        });
      }
      return newFiles;
    });
  };

  const onFileRemove = (key: string) => {
    setFiles((prevFiles) => {
      if (prevFiles == null) {
        return null;
      }
      let fileToRemoveInd = prevFiles.findIndex((f) => f.key === key);
      if (fileToRemoveInd === -1) {
        return prevFiles;
      }
      prevFiles.splice(fileToRemoveInd, 1);
      if (prevFiles?.length === 0) {
        return null;
      }
      return prevFiles!.slice();
    });
  };

  const onFilesReset = () => {
    setFiles(null);
  };

  const onFullReset = () => {
    setFiles(null);
    onReset();
  };

  const onParseClick = () => {
    onParse(files != null ? files.map((file) => file.f) : null);
    setFiles(null);
  };

  switch (status) {
    case controlPanelStatus.Ready:
      return (
        <div className={s.root}>
          <Grid container spacing={2}>
            {files == null && (
              <Grid item xs={12}>
                <FileInput
                  {...{
                    buttonText: t("uploadButton"),
                    buttonType: "upload",
                    onChange,
                  }}
                />
              </Grid>
            )}
            {files != null && (
              <>
                <FilesList
                  files={files.map((f) => ({ key: f.key, name: f.f.name }))}
                  onFileRemove={onFileRemove}
                />
                <Grid item xs={12}>
                  <FileInput
                    {...{
                      buttonText: <AddIcon />,
                      buttonType: "add",
                      onChange,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Button
                    text={t("analyseButton")}
                    color="primary"
                    variant="contained"
                    onClick={onParseClick}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Button
                    color="secondary"
                    text={t("resetButton")}
                    variant="outlined"
                    onClick={onFilesReset}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </div>
      );
    case controlPanelStatus.Loading:
      return (
        <div className={s.root}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <div className={s.loadingIcon}>
                <CircularProgress />
              </div>
            </Grid>
          </Grid>
        </div>
      );
    case controlPanelStatus.Done:
      return (
        <div className={s.root}>
          <Grid container spacing={2}>
            <Grid item xs={3} />
            <Grid item xs={6}>
              <ButtonMUI
                variant="contained"
                color="secondary"
                fullWidth
                onClick={onFullReset}
              >
                {t("resetButton")}
              </ButtonMUI>
            </Grid>
            <Grid item xs={3} />
          </Grid>
        </div>
      );
  }
};

export default ControlPanel;
