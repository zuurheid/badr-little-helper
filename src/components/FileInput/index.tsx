import React, { ChangeEvent } from "react";
import ButtonMUI from "@material-ui/core/Button";
import s from "./FileInput.module.scss";

export interface FileInputProps {
  buttonText: any;
  buttonColor: "primary" | "default";
  variant: "contained" | "outlined";
  onChange: (files: FileList | null) => void;
}

const FileInput: React.FC<FileInputProps> = (props) => {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    props.onChange(e.target.files);
  };
  return (
    <div>
      <input
        accept="application/pdf"
        style={{ display: "none" }}
        id="raised-button-file"
        multiple
        type="file"
        onChange={onChange}
      />
      <label htmlFor="raised-button-file">
        <div className={s.uploadButton}>
          <ButtonMUI
            color={props.buttonColor}
            variant={props.variant}
            component="span"
            fullWidth
          >
            <span>{props.buttonText}</span>
          </ButtonMUI>
        </div>
      </label>
    </div>
  );
};

export default FileInput;
