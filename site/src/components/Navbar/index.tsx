import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import LanguageSelect from "./LanguageSelect";

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <LanguageSelect />
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
