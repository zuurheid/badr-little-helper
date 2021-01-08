import React from "react";
import "./App.scss";
import DecreePage from "./pages/DecreePage";
import s from "./App.scss";

const App = () => {
  return (
    <div className={s.root}>
      <DecreePage />
    </div>
  );
};

export default App;
