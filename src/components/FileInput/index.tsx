import React, { ChangeEvent } from "react";
import ButtonMUI from "@material-ui/core/Button";
import s from "./FileInput.module.scss";

type buttonType = "upload" | "add";

export interface FileInputProps {
  buttonText: any;
  buttonType: buttonType;
  onChange: (files: FileList | null) => void;
}

const FileInput: React.FC<FileInputProps> = (props) => {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    props.onChange(e.target.files);
  };
  const buttonAttrs = getButtonAttrs(props.buttonType);
  return (
    <div className={s.root}>
      <input
        accept="application/pdf"
        style={{ display: "none" }}
        id="raised-button-file"
        multiple
        type="file"
        onChange={onChange}
      />
      <div className={buttonAttrs.className}>
        <label htmlFor="raised-button-file">
          <div>
            <ButtonMUI
              color={buttonAttrs.color}
              variant={buttonAttrs.variant}
              component="span"
              fullWidth
            >
              <span className={s.buttonText}>{props.buttonText}</span>
            </ButtonMUI>
          </div>
        </label>
      </div>
    </div>
  );
};

interface buttonAttrs {
  color: "primary" | "default";
  variant: "contained" | "outlined";
  className: string;
}

function getButtonAttrs(t: buttonType): buttonAttrs {
  return {
    color: t === "upload" ? "primary" : "default",
    variant: t === "upload" ? "contained" : "outlined",
    className: t === "upload" ? s.uploadButton : s.addButton,
  };
}

export default FileInput;
