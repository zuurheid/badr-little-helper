import React from "react";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

interface LanguageSelectProps {}

const LanguageSelect: React.FC<LanguageSelectProps> = () => {
  return (
    <div>
      <FormControl variant="outlined">
        <InputLabel htmlFor="outlined-age-native-simple">Langage</InputLabel>
        <Select
          native
          value="Français"
          //onChange={handleChange}
          label="Langage"
          // inputProps={{
          //   name: "age",
          //   id: "outlined-age-native-simple",
          // }}
        >
          <option aria-label="None" value="" />
          <option value={10}>Anglais</option>
          <option value={20}>Russe</option>
        </Select>
      </FormControl>
    </div>
  );
};

export default LanguageSelect;
