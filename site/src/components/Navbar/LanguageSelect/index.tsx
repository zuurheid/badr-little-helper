import React, { useState } from "react";
import FormControl from "@material-ui/core/FormControl";
import MUISelect from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { createMuiTheme } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

const LanguageSelect = () => {
  const { i18n } = useTranslation();
  let [locale, setLocale] = useState(i18n.language);
  const languages = [
    {
      language: "Français",
      locale: "fr",
    },
    {
      language: "English",
      locale: "en",
    },
    {
      language: "Русский",
      locale: "ru",
    },
  ];

  const onChange = (e: any) => {
    setLocale(e.target.value);
    i18n.changeLanguage(e.target.value);
  };

  return (
    <FormControl variant="outlined">
      <Select defaultValue={locale} onChange={onChange}>
        {languages.map((l) => {
          return (
            <MenuItem key={l.locale} value={l.locale}>
              {l.language}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

const Select = styled(MUISelect)`
  && {
    .MuiSelect-root {
      color: white;
      background: #009e9d;
    }
    .MuiSvgIcon-root {
      color: white;
    }
  }
`;

export default LanguageSelect;
