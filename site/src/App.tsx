import React, { Suspense } from "react";
import Navbar from "./components/Navbar";
import "./App.module.scss";
import DecreePage from "./pages/DecreePage";
import s from "./App.module.scss";
import "./_variables.css";

const App = () => {
  return (
    <>
      <Suspense fallback="loading">
        <div className={s.navbar}>
          <Navbar />
        </div>
        <div className={s.root}>
          <DecreePage />
        </div>
      </Suspense>
    </>
  );
};

export default App;
