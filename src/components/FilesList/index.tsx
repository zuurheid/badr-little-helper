import React from "react";
import Grid from "@material-ui/core/Grid";
import FileEntry from "../FileEntry";

interface fileMeta {
  name: string;
  key: string;
}

interface FileListProps {
  files: fileMeta[];
  onFileRemove: (key: string) => void;
}

const FilesList: React.FC<FileListProps> = ({ files, onFileRemove }) => {
  const getOnFileRemoveFn = (key: string) => {
    return () => {
      onFileRemove(key);
    };
  };
  return (
    <>
      {files.map((f) => (
        <Grid key={f.key} item xs={12}>
          <FileEntry
            text={f.name}
            onRemoveFileClick={getOnFileRemoveFn(f.key)}
          />
        </Grid>
      ))}
    </>
  );
};
export default FilesList;
