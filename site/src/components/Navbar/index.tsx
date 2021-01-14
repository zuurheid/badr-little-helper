import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import LanguageSelect from "./LanguageSelect";
import s from "./Navbar.module.scss";

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <div className={s.languageSelectButton}>
          <LanguageSelect />
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
