import React, { useEffect, useState } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import { useTranslation } from "react-i18next";
import s from "./FailedParsingAlert.module.scss";

interface FailedParsingAlertProps {
  failedFiles: string[];
  allFailed: boolean;
  severity: "warning" | "error";
}

const FailedParsingAlert: React.FC<FailedParsingAlertProps> = ({
  failedFiles,
  allFailed,
  severity,
}) => {
  const { t } = useTranslation();
  let [open, setOpen] = useState(false);

  useEffect(() => {
    if (failedFiles.length === 0) {
      setOpen(false);
      return;
    }
    setOpen(true);
  }, [failedFiles]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
        <Alert
          classes={{
            root: s.alertRoot,
            message: s.alertMessage,
            icon: s.alertIcon,
          }}
          variant="filled"
          onClick={handleClose}
          severity={severity}
        >
          {failedFiles.length === 1
            ? t("alerts.parseFileFailed", {
                fileName: failedFiles[0],
                count: failedFiles.length,
              })
            : allFailed
            ? t("alerts.parseAllFilesFailed")
            : t("alerts.parseFileFailed", {
                count: failedFiles.length,
              })}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default FailedParsingAlert;
