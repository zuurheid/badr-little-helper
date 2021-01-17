import React, { useState } from "react";
import FormControl from "@material-ui/core/FormControl";
import Select from "../../Select";
import MenuItem from "@material-ui/core/MenuItem";
import { useTranslation } from "react-i18next";

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

export default LanguageSelect;
