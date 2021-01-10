import React from "react";
import Box from "@material-ui/core/Box";
import DescriptionIcon from "@material-ui/icons/Description";
import IconButton from "@material-ui/core/IconButton";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import s from "./FileEntry.module.scss";

interface FileEntryProps {
  text: string;
  onRemoveFileClick: () => void;
}

const FileEntry: React.FC<FileEntryProps> = ({ text, onRemoveFileClick }) => {
  const maxLen = 61;
  if (text.length > maxLen) {
    text = `${text.substr(0, maxLen)}...`;
  }
  return (
    <div className={s.root}>
      <div className={s.innerSpace}>
        <DescriptionIcon className={s.fileIcon} />
        <div className={s.fileName}>
          <span>{text}</span>
        </div>
        <div className={s.removeFileButton} onClick={onRemoveFileClick}>
          <HighlightOffIcon />
          {/*<IconButton*/}
          {/*  color="secondary"*/}
          {/*  size="small"*/}
          {/*  onClick={onRemoveFileClick}*/}
          {/*>*/}
          {/*  <HighlightOffIcon />*/}
          {/*</IconButton>*/}
        </div>
      </div>
    </div>
  );
};

export default FileEntry;
