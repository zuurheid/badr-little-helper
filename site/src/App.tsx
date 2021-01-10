import React from "react";
import "./App.module.scss";
import DecreePage from "./pages/DecreePage";
import s from "./App.module.scss";
import "./_variables.css";

const App = () => {
  return (
    <div className={s.root}>
      <DecreePage />
    </div>
  );
};

export default App;
