import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import LanguageSelect from "./LanguageSelect";
import s from "./Navbar.module.scss";
import { Typography } from "@material-ui/core";

const Navbar = () => {
  return (
    <AppBar
      position="static"
      style={{
        backgroundColor: "rgba(255, 250, 222, 0.25)",
        color: "rgba(0, 0, 0, 0.87)",
      }}
    >
      <Toolbar>
        <Typography variant="h4">Badr little helper</Typography>
        <div className={s.languageSelectButton}>
          <LanguageSelect />
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
