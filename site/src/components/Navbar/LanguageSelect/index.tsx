import React, { useState } from "react";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
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

  const getLanguageByLocale = (locale: string) => {
    console.log("Locale: ", locale);
    const filtered = languages.filter((l) => l.locale === locale);
    if (filtered.length !== 1) {
      return "???";
    }
    console.log("filtered: ", filtered);
    return filtered[0];
  };

  const onChange = (e: any) => {
    setLocale(e.target.value);
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div>
      <FormControl variant="outlined">
        <Select
          native
          defaultValue={locale}
          onChange={onChange}
          // inputProps={{
          //   name: "age",
          //   id: "outlined-age-native-simple",
          // }}
        >
          {languages.map((l) => {
            return (
              <option key={l.locale} value={l.locale}>
                {l.language}
              </option>
            );
          })}
        </Select>
      </FormControl>
    </div>
  );
};

interface LanguageOptionProps {
  text: string;
}

const LanguageOption: React.FC<LanguageOptionProps> = ({ text }) => {
  return (
    <>
      <span>{text}</span>
    </>
  );
};

export default LanguageSelect;
